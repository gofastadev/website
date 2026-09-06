import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { ReadingProgressBar } from "./reading-progress-bar";

// jsdom doesn't ship requestAnimationFrame in a useful form for
// tests; stub it to invoke the callback synchronously so we can
// observe state transitions deterministically.
const originalRAF = global.requestAnimationFrame;
const originalCAF = global.cancelAnimationFrame;

beforeEach(() => {
  global.requestAnimationFrame = ((cb: FrameRequestCallback) => {
    cb(0);
    return 0;
  }) as typeof requestAnimationFrame;
  global.cancelAnimationFrame = (() => {}) as typeof cancelAnimationFrame;
});

afterEach(() => {
  global.requestAnimationFrame = originalRAF;
  global.cancelAnimationFrame = originalCAF;
});

function setScroll({
  scrollY,
  scrollHeight,
  clientHeight,
}: {
  scrollY: number;
  scrollHeight: number;
  clientHeight: number;
}) {
  Object.defineProperty(window, "scrollY", {
    value: scrollY,
    configurable: true,
    writable: true,
  });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    value: scrollHeight,
    configurable: true,
  });
  Object.defineProperty(document.documentElement, "clientHeight", {
    value: clientHeight,
    configurable: true,
  });
}

describe("ReadingProgressBar", () => {
  it("renders as a progressbar with reading-progress label", () => {
    setScroll({ scrollY: 0, scrollHeight: 1000, clientHeight: 500 });
    render(<ReadingProgressBar />);
    expect(
      screen.getByRole("progressbar", { name: "Reading progress" }),
    ).toBeInTheDocument();
  });

  it("starts at 0% when the page has not been scrolled", () => {
    setScroll({ scrollY: 0, scrollHeight: 1000, clientHeight: 500 });
    render(<ReadingProgressBar />);
    expect(
      screen.getByRole("progressbar", { name: "Reading progress" }),
    ).toHaveAttribute("aria-valuenow", "0");
  });

  it("computes ratio from scrollY / (scrollHeight - clientHeight)", () => {
    setScroll({ scrollY: 250, scrollHeight: 1000, clientHeight: 500 });
    render(<ReadingProgressBar />);
    // scrollable distance = 500; scrolled = 250 → 50%
    expect(
      screen.getByRole("progressbar", { name: "Reading progress" }),
    ).toHaveAttribute("aria-valuenow", "50");
  });

  it("reports 0 when the document is not scrollable (scrollHeight <= clientHeight)", () => {
    setScroll({ scrollY: 0, scrollHeight: 400, clientHeight: 500 });
    render(<ReadingProgressBar />);
    expect(
      screen.getByRole("progressbar", { name: "Reading progress" }),
    ).toHaveAttribute("aria-valuenow", "0");
  });

  it("clamps negative scroll (overscroll bounce) to 0", () => {
    setScroll({ scrollY: -50, scrollHeight: 1000, clientHeight: 500 });
    render(<ReadingProgressBar />);
    expect(
      screen.getByRole("progressbar", { name: "Reading progress" }),
    ).toHaveAttribute("aria-valuenow", "0");
  });

  it("clamps scroll beyond the end (overscroll past bottom) to 100", () => {
    setScroll({ scrollY: 9999, scrollHeight: 1000, clientHeight: 500 });
    render(<ReadingProgressBar />);
    expect(
      screen.getByRole("progressbar", { name: "Reading progress" }),
    ).toHaveAttribute("aria-valuenow", "100");
  });

  it("updates progress when the window emits a scroll event", () => {
    setScroll({ scrollY: 0, scrollHeight: 1000, clientHeight: 500 });
    render(<ReadingProgressBar />);
    act(() => {
      setScroll({ scrollY: 500, scrollHeight: 1000, clientHeight: 500 });
      window.dispatchEvent(new Event("scroll"));
    });
    expect(
      screen.getByRole("progressbar", { name: "Reading progress" }),
    ).toHaveAttribute("aria-valuenow", "100");
  });

  it("updates progress when the window emits a resize event", () => {
    setScroll({ scrollY: 250, scrollHeight: 1000, clientHeight: 500 });
    render(<ReadingProgressBar />);
    act(() => {
      setScroll({ scrollY: 250, scrollHeight: 2000, clientHeight: 500 });
      window.dispatchEvent(new Event("resize"));
    });
    // scrollable distance = 1500; scrolled = 250 → 17% (rounded)
    expect(
      screen.getByRole("progressbar", { name: "Reading progress" }),
    ).toHaveAttribute("aria-valuenow", "17");
  });

  it("removes its event listeners on unmount", () => {
    setScroll({ scrollY: 0, scrollHeight: 1000, clientHeight: 500 });
    const removeSpy = vi.spyOn(window, "removeEventListener");
    const { unmount } = render(<ReadingProgressBar />);
    unmount();
    expect(removeSpy).toHaveBeenCalledWith("scroll", expect.any(Function));
    expect(removeSpy).toHaveBeenCalledWith("resize", expect.any(Function));
    removeSpy.mockRestore();
  });
});
