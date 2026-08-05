import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { DashboardPreview } from "./dashboard-preview";

// FiringIntersectionObserver reports the target as intersecting on the
// next microtask. Used in the ticker test so useOnScreen flips to
// visible=true and the timers register.
class FiringIntersectionObserver {
  private cb: IntersectionObserverCallback;
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb;
  }
  observe(target: Element) {
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

// Default stub: never fires intersection. Used by the non-ticker tests
// that only assert SSR-seeded content.
class StaticIntersectionObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

beforeEach(() => {
  // Stub IntersectionObserver — DashboardPreview uses useOnScreen to
  // gate the ticker, so tests need a working stub to render anything.
  vi.stubGlobal(
    "IntersectionObserver",
    StaticIntersectionObserver as unknown as typeof IntersectionObserver
  );
});

describe("DashboardPreview", () => {
  it("renders the section heading", () => {
    render(<DashboardPreview />);
    expect(
      screen.getByText("See every request while you develop")
    ).toBeInTheDocument();
  });

  it("does not render an eyebrow", () => {
    render(<DashboardPreview />);
    expect(screen.queryByText("Local dev dashboard")).not.toBeInTheDocument();
  });

  it("renders the terminal block with the gofasta debug watch title", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("gofasta debug watch")).toBeInTheDocument();
  });

  it("renders the seeded request rows with recognizable paths", () => {
    render(<DashboardPreview />);
    expect(screen.getAllByText(/\/api\/v1\/users/).length).toBeGreaterThan(0);
  });

  it("does not render the fake browser traffic-light chrome", () => {
    const { container } = render(<DashboardPreview />);
    expect(container.querySelector(".bg-red-500")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-yellow-500")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-green-500")).not.toBeInTheDocument();
    expect(screen.queryByText("localhost:9090")).not.toBeInTheDocument();
  });

  it("does not render the capability FeatureCard tiles", () => {
    render(<DashboardPreview />);
    expect(screen.queryByText("Trace waterfall")).not.toBeInTheDocument();
    expect(screen.queryByText("N+1 detection")).not.toBeInTheDocument();
    expect(screen.queryByText("Zero production cost")).not.toBeInTheDocument();
  });

  it("does not use hardcoded status-tier color classes", () => {
    const { container } = render(<DashboardPreview />);
    expect(container.querySelector(".text-green-400")).not.toBeInTheDocument();
    expect(container.querySelector(".text-amber-400")).not.toBeInTheDocument();
    expect(container.querySelector(".text-red-400")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-green-500")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-amber-500")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-red-500")).not.toBeInTheDocument();
  });

  it("renders at least one .term-ok status row from the seeded data", () => {
    const { container } = render(<DashboardPreview />);
    expect(container.querySelector(".term-ok")).toBeInTheDocument();
  });

  it("advances the visible-gated ticker: the oldest seeded row is evicted once a tick actually fires", async () => {
    // Switch to the firing observer so the ticker's visible gate opens.
    vi.stubGlobal(
      "IntersectionObserver",
      FiringIntersectionObserver as unknown as typeof IntersectionObserver
    );
    vi.useFakeTimers();

    const { container } = render(<DashboardPreview />);

    // Let the intersection microtask fire + the useEffect register.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // The row list is seeded with exactly 5 rows and the ticker prepends
    // a fresh row then slices back to 5 (`[fresh, ...prev].slice(0, 5)`).
    // The oldest seeded row — s5, timestamped "12:34:42", the one and
    // only row carrying that exact fixed timestamp string — is
    // therefore the row evicted by the first tick. If setInterval never
    // fired, this timestamp would remain in the document forever, so
    // its disappearance is direct proof the ticker ran (not just that
    // the row count stayed non-decreasing, which holds trivially at a
    // constant cap of 5 either way).
    expect(screen.getByText("12:34:42")).toBeInTheDocument();

    // Fast-forward one request-ticker interval (2500ms).
    await act(async () => {
      vi.advanceTimersByTime(2600);
    });

    expect(screen.queryByText("12:34:42")).not.toBeInTheDocument();
    // The list stays capped at 5 rows — a genuine prepend+slice, not a
    // growing list.
    expect(container.querySelectorAll(".gofasta-dashboard-row").length).toBe(
      5
    );
    expect(container.querySelector(".term-ok")).toBeInTheDocument();

    vi.useRealTimers();
  });
});
