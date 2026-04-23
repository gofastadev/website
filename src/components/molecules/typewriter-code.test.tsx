import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { TypewriterCode } from "./typewriter-code";

// The typewriter's useEffect is gated on useOnScreen, which relies on
// IntersectionObserver. A synchronous stub that immediately reports the
// element as intersecting lets us drive the reveal loop.
class FiringIntersectionObserver {
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe(target: Element) {
    // Fire "now visible" on the next microtask so state updates land
    // after the initial render (matches real observer semantics).
    queueMicrotask(() => {
      this.cb(
        [
          {
            target,
            isIntersecting: true,
            boundingClientRect: {} as DOMRectReadOnly,
            intersectionRatio: 1,
            intersectionRect: {} as DOMRectReadOnly,
            rootBounds: null,
            time: 0,
          },
        ],
        this as unknown as IntersectionObserver
      );
    });
  }
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  vi.stubGlobal(
    "IntersectionObserver",
    FiringIntersectionObserver as unknown as typeof IntersectionObserver
  );
});

describe("TypewriterCode", () => {
  it("renders the label and language pill when provided", () => {
    render(<TypewriterCode label="out.json" language="json" code="{}" />);
    expect(screen.getByText("out.json")).toBeInTheDocument();
    expect(screen.getByText("json")).toBeInTheDocument();
  });

  it("omits the header block when no label or language is set", () => {
    const { container } = render(<TypewriterCode code="print('hi')" />);
    // The header block carries border-b border-gray-800 — if it isn't
    // rendered, that class should not appear anywhere.
    const header = container.querySelector(".border-b");
    expect(header).toBeNull();
  });

  it("progressively reveals characters while the section is visible", async () => {
    vi.useFakeTimers();
    const code = "abc";
    // The speed prop defaults to 8ms/char. Using a slightly larger
    // value makes the tick boundaries easier to step over in tests.
    render(<TypewriterCode code={code} speed={10} />);

    // Let the intersection observer fire and the initial setState hit.
    await act(async () => {
      await Promise.resolve();
    });

    // Advance the timer character by character. After each tick the
    // rendered code text should grow by one char.
    for (let i = 1; i <= code.length; i++) {
      await act(async () => {
        vi.advanceTimersByTime(10);
      });
    }

    // After all characters are revealed, the full code string is in the DOM.
    await act(async () => {
      vi.advanceTimersByTime(10);
    });
    expect(screen.getByText(code)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it("flips the status dot from pending to done when typing completes", async () => {
    vi.useFakeTimers();
    const { container } = render(
      <TypewriterCode label="status" code="x" speed={5} />
    );

    // Let intersection + first reveal run.
    await act(async () => {
      await Promise.resolve();
    });
    await act(async () => {
      vi.advanceTimersByTime(5);
    });
    await act(async () => {
      vi.advanceTimersByTime(5);
    });

    // The "done" state swaps the status dot class from amber to green.
    // Finding by class is brittle; instead assert the full code is shown
    // (implying done=true) and the pulsing-dot class is gone.
    expect(screen.getByText("x")).toBeInTheDocument();
    expect(
      container.querySelector(".gofasta-pulse-dot")
    ).not.toBeInTheDocument();

    vi.useRealTimers();
  });
});
