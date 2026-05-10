import { describe, it, expect, vi, beforeEach } from "vitest";
import { render } from "@testing-library/react";

// useOnScreen is mocked so individual tests control the "visible"
// signal directly without driving real IntersectionObserver entries.
let mockVisible = false;
vi.mock("@/hooks/use-on-screen", () => ({
  useOnScreen: () => [{ current: null }, mockVisible],
}));

// trackEvent is the only thing we need to verify the tracker calls.
const trackEventSpy = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackEventSpy(...args),
}));

import { SectionTracker } from "./section-tracker";

describe("SectionTracker", () => {
  beforeEach(() => {
    trackEventSpy.mockReset();
    mockVisible = false;
  });

  it("does NOT fire section_view while the section is off-screen", () => {
    mockVisible = false;
    render(
      <SectionTracker name="hero">
        <p>content</p>
      </SectionTracker>,
    );
    expect(trackEventSpy).not.toHaveBeenCalled();
  });

  it("fires section_view exactly once the first time the section is visible", () => {
    mockVisible = true;
    const { rerender } = render(
      <SectionTracker name="features_grid">
        <p>content</p>
      </SectionTracker>,
    );
    expect(trackEventSpy).toHaveBeenCalledOnce();
    expect(trackEventSpy).toHaveBeenCalledWith("section_view", {
      section: "features_grid",
    });

    // Re-renders while still visible must not re-fire — the `firedRef`
    // latch protects against a React re-render mounting a fresh
    // observer and re-firing.
    rerender(
      <SectionTracker name="features_grid">
        <p>content</p>
      </SectionTracker>,
    );
    expect(trackEventSpy).toHaveBeenCalledOnce();
  });

  it("renders its children inside the tracked wrapper", () => {
    const { getByText } = render(
      <SectionTracker name="hero">
        <p>tracked content</p>
      </SectionTracker>,
    );
    expect(getByText("tracked content")).toBeInTheDocument();
  });
});
