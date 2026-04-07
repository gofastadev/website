import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturesGrid } from "./features-grid";

describe("FeaturesGrid", () => {
  it("renders the section heading", () => {
    render(<FeaturesGrid />);
    expect(screen.getByText("What you get out of the box")).toBeInTheDocument();
  });

  it("renders the section subtitle", () => {
    render(<FeaturesGrid />);
    expect(screen.getByText(/composable packages/)).toBeInTheDocument();
  });

  it("renders all 6 feature cards", () => {
    render(<FeaturesGrid />);
    expect(screen.getByText("Code Generation")).toBeInTheDocument();
    expect(screen.getByText("REST + Optional GraphQL")).toBeInTheDocument();
    expect(screen.getByText("Auth & RBAC")).toBeInTheDocument();
    expect(screen.getByText("Background Jobs")).toBeInTheDocument();
    expect(screen.getByText("Multi-Database")).toBeInTheDocument();
    expect(screen.getByText("Observability")).toBeInTheDocument();
  });

  it("renders descriptions for each feature", () => {
    render(<FeaturesGrid />);
    expect(screen.getByText(/Scaffold a full CRUD resource/)).toBeInTheDocument();
    expect(screen.getByText(/REST by default/)).toBeInTheDocument();
    expect(screen.getByText(/JWT authentication and role-based/)).toBeInTheDocument();
    expect(screen.getByText(/Cron scheduling and async task/)).toBeInTheDocument();
    expect(screen.getByText(/PostgreSQL, MySQL, SQLite/)).toBeInTheDocument();
    expect(screen.getByText(/Prometheus metrics and OpenTelemetry/)).toBeInTheDocument();
  });
});
