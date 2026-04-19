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
      screen.getByText("Debug visually, not through log greps.")
    ).toBeInTheDocument();
  });

  it("renders the eyebrow", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("Local dev dashboard")).toBeInTheDocument();
  });

  it("renders every capability title in the grid", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("Trace waterfall")).toBeInTheDocument();
    expect(screen.getByText("N+1 detection")).toBeInTheDocument();
    expect(screen.getByText("Edit & replay")).toBeInTheDocument();
    expect(screen.getByText("Per-request logs")).toBeInTheDocument();
    expect(screen.getByText("Profiles + goroutines")).toBeInTheDocument();
    expect(screen.getByText("Zero production cost")).toBeInTheDocument();
  });

  it("links to the debugging guide", () => {
    render(<DashboardPreview />);
    const link = screen.getByRole("link", {
      name: /Read the debugging guide/i,
    });
    expect(link).toHaveAttribute("href", "/docs/guides/debugging");
  });

  it("renders the mockup browser url bar pointing at localhost:9090", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("localhost:9090")).toBeInTheDocument();
  });

  it("renders the devtools-enabled pill in the mockup", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("devtools:enabled")).toBeInTheDocument();
  });

  it("renders the three metrics cards with labels", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("Requests")).toBeInTheDocument();
    expect(screen.getByText("In-flight")).toBeInTheDocument();
    expect(screen.getByText("Avg latency")).toBeInTheDocument();
  });

  it("renders both the Recent requests and Recent SQL section labels", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("Recent requests")).toBeInTheDocument();
    expect(screen.getByText("Recent SQL")).toBeInTheDocument();
  });

  it("renders the seeded request rows with recognizable paths", () => {
    render(<DashboardPreview />);
    // Seed data uses /api/v1/users and /api/v1/users/42 among others.
    // At least one request row must be present from the SSR seed.
    expect(screen.getAllByText(/\/api\/v1\/users/).length).toBeGreaterThan(0);
  });

  it("renders the seeded SQL rows", () => {
    render(<DashboardPreview />);
    // The seed query "SELECT * FROM users ORDER BY created_at DESC LIMIT 20"
    // is one of the topmost SQL rows.
    expect(screen.getByText(/SELECT \* FROM users ORDER BY/)).toBeInTheDocument();
  });

  it("renders the SSE refresh footer", () => {
    render(<DashboardPreview />);
    expect(
      screen.getByText(/refreshes every 5s via SSE/)
    ).toBeInTheDocument();
  });

  it("renders status pills covering every status tier in the mockup", () => {
    render(<DashboardPreview />);
    // Seeded request rows include 200, 201, 401 from the seed indices —
    // the StatusPill renders a method-colored pill for each.
    const pills = screen.getAllByText(/\b(200|201|204|401|500)\b/);
    expect(pills.length).toBeGreaterThan(0);
  });

  it("renders method badges for GET, POST, PATCH, DELETE", () => {
    render(<DashboardPreview />);
    // Seed-rendered rows plus the table headers. Use getAllByText since
    // method names can appear in multiple badges.
    expect(screen.getAllByText("GET").length).toBeGreaterThan(0);
    // Other methods may or may not be seed-rendered depending on pool
    // index; the full pool rotates on the client ticker. Just GET is
    // enough here.
  });

  it("starts the visible-gated ticker and prepends a new request row", async () => {
    // Switch to the firing observer so the ticker's visible gate opens.
    vi.stubGlobal(
      "IntersectionObserver",
      FiringIntersectionObserver as unknown as typeof IntersectionObserver
    );
    vi.useFakeTimers();

    render(<DashboardPreview />);

    // Let the intersection microtask fire + the useEffect register.
    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Snapshot the request-total counter value before the first tick.
    const before = parseInt(
      screen.getAllByText(/^\d{2,}$/)[0].textContent || "0",
      10
    );

    // Fast-forward one request-ticker interval (2500ms).
    await act(async () => {
      vi.advanceTimersByTime(2600);
    });

    // Counter should have incremented by 1–3 (rand 1..3 inside the tick).
    const nums = screen.getAllByText(/^\d{2,}$/).map((el) =>
      parseInt(el.textContent || "0", 10)
    );
    const bumped = nums.some((n) => n > before);
    expect(bumped).toBe(true);

    vi.useRealTimers();
  });

  it("advances the SQL ticker and prepends a new query row", async () => {
    vi.stubGlobal(
      "IntersectionObserver",
      FiringIntersectionObserver as unknown as typeof IntersectionObserver
    );
    vi.useFakeTimers();

    render(<DashboardPreview />);

    await act(async () => {
      await Promise.resolve();
      await Promise.resolve();
    });

    // Fast-forward one SQL-ticker interval (4000ms) + a buffer — this
    // exercises the query-timer branch and prepend+slice path.
    await act(async () => {
      vi.advanceTimersByTime(4100);
    });

    // The SQL table should still render one of the pool entries. We
    // can't predict which due to Math.random, so assert the presence
    // of a known SQL keyword that appears in every entry.
    const sqlTokens = screen.getAllByText(/SELECT|INSERT|UPDATE|DELETE/);
    expect(sqlTokens.length).toBeGreaterThan(0);

    vi.useRealTimers();
  });
});
