import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";

const trackEventSpy = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackEventSpy(...args),
}));

import { ScrollDepthTracker } from "./scroll-depth-tracker";

// Helpers: mutate the scroll geometry jsdom would otherwise leave at
// zero, then dispatch a scroll event. requestAnimationFrame is
// polyfilled with a synchronous flush so we don't have to await
// raf timing.

function setScroll(scrollY: number, innerHeight: number, scrollHeight: number) {
  Object.defineProperty(window, "scrollY", { configurable: true, value: scrollY });
  Object.defineProperty(window, "innerHeight", { configurable: true, value: innerHeight });
  Object.defineProperty(document.documentElement, "scrollHeight", {
    configurable: true,
    value: scrollHeight,
  });
}

describe("ScrollDepthTracker", () => {
  let originalRAF: typeof window.requestAnimationFrame;

  beforeEach(() => {
    trackEventSpy.mockReset();
    originalRAF = window.requestAnimationFrame;
    // Force rAF to run synchronously so the spy is observable right
    // after dispatching a scroll event.
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      cb(0);
      return 0;
    }) as typeof window.requestAnimationFrame;
    setScroll(0, 0, 0);
  });

  afterEach(() => {
    window.requestAnimationFrame = originalRAF;
  });

  it("fires nothing on a zero-height document (degenerate page)", () => {
    setScroll(0, 0, 0);
    render(<ScrollDepthTracker />);
    expect(trackEventSpy).not.toHaveBeenCalled();
  });

  it("fires the 25% milestone exactly once when scrolled past 25%", () => {
    setScroll(0, 250, 1000); // initial 25% covered → 25% milestone fires on mount
    render(<ScrollDepthTracker />);
    expect(trackEventSpy).toHaveBeenCalledWith("scroll_depth", { percent: 25 });
  });

  it("fires each milestone independently as the user scrolls down", () => {
    // Render with a viewport that only covers the top 10% (no milestones).
    setScroll(0, 100, 1000);
    render(<ScrollDepthTracker />);
    expect(trackEventSpy).not.toHaveBeenCalled();

    // Scroll past 25%.
    setScroll(150, 100, 1000); // 250 / 1000 = 25%
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(trackEventSpy).toHaveBeenCalledWith("scroll_depth", { percent: 25 });

    // Scroll past 50% AND 75% in one jump.
    setScroll(700, 100, 1000); // 800 / 1000 = 80%
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    const calls = trackEventSpy.mock.calls.map((c) => (c[1] as { percent: number }).percent);
    expect(calls).toContain(50);
    expect(calls).toContain(75);

    // Reach the bottom — 100% milestone.
    setScroll(900, 100, 1000);
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(trackEventSpy.mock.calls.some((c) => (c[1] as { percent: number }).percent === 100)).toBe(true);
  });

  it("does NOT re-fire the same milestone on repeated scrolls", () => {
    setScroll(0, 250, 1000);
    render(<ScrollDepthTracker />);
    // Initial mount fires 25%.
    expect(trackEventSpy.mock.calls.length).toBe(1);

    // Same scroll position → no new fire.
    act(() => {
      window.dispatchEvent(new Event("scroll"));
    });
    expect(trackEventSpy.mock.calls.length).toBe(1);
  });

  it("throttles rapid scroll events via requestAnimationFrame (only checks once per frame)", () => {
    // Replace rAF with a one-shot capturer so a second dispatch
    // within the same frame is dropped — mimics real rAF behavior.
    let frameQueued = false;
    let queued: FrameRequestCallback | null = null;
    window.requestAnimationFrame = ((cb: FrameRequestCallback) => {
      if (frameQueued) return 0;
      frameQueued = true;
      queued = cb;
      return 1;
    }) as typeof window.requestAnimationFrame;

    setScroll(0, 100, 1000);
    render(<ScrollDepthTracker />);
    trackEventSpy.mockReset();

    setScroll(300, 100, 1000); // 40%
    act(() => {
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));
    });
    // The second + third dispatches were throttled — only one rAF
    // pending. Flush it.
    act(() => {
      queued?.(0);
    });
    // 25% milestone fired exactly once despite three scroll events.
    expect(
      trackEventSpy.mock.calls.filter(
        (c) => (c[1] as { percent: number }).percent === 25,
      ),
    ).toHaveLength(1);
  });
});
