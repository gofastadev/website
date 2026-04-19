import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPreview } from "./dashboard-preview";

beforeEach(() => {
  // Stub IntersectionObserver — DashboardPreview uses useOnScreen to
  // gate the ticker, so tests need a working stub to render anything.
  class IO {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  vi.stubGlobal("IntersectionObserver", IO as unknown as typeof IntersectionObserver);
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

  it("renders every capability title", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("Live metrics from /metrics")).toBeInTheDocument();
    expect(
      screen.getByText("Request log, in-memory ring")
    ).toBeInTheDocument();
    expect(screen.getByText("SQL queries with timings")).toBeInTheDocument();
    expect(
      screen.getByText("App health + compose services")
    ).toBeInTheDocument();
    expect(screen.getByText("Zero production cost")).toBeInTheDocument();
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
});
