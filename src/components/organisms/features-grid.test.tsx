import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeaturesGrid } from "./features-grid";

describe("FeaturesGrid", () => {
  it("renders the section heading", () => {
    render(<FeaturesGrid />);
    expect(
      screen.getByText("What's in Gofasta")
    ).toBeInTheDocument();
  });

  it("renders the section subtitle", () => {
    render(<FeaturesGrid />);
    expect(screen.getByText(/composable Go packages/)).toBeInTheDocument();
  });

  it("renders all 9 feature cards", () => {
    render(<FeaturesGrid />);
    expect(screen.getByText("One-command scaffolding")).toBeInTheDocument();
    expect(screen.getByText("Agent-native tooling")).toBeInTheDocument();
    expect(screen.getByText("Auth & RBAC")).toBeInTheDocument();
    expect(screen.getByText("Multi-database")).toBeInTheDocument();
    expect(screen.getByText("REST + optional GraphQL")).toBeInTheDocument();
    expect(screen.getByText("Background jobs & tasks")).toBeInTheDocument();
    expect(screen.getByText("Observability")).toBeInTheDocument();
    expect(screen.getByText("Security & resilience")).toBeInTheDocument();
    expect(screen.getByText("Deploy to any VPS")).toBeInTheDocument();
  });

  it("renders descriptions for each feature", () => {
    render(<FeaturesGrid />);
    expect(
      screen.getByText(/gofasta g scaffold spins up a full CRUD resource/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Scaffolded AGENTS.md, llms.txt for the docs/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/JWT \(access \+ refresh\), role-based access control/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Cron scheduling via robfig\/cron/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/PostgreSQL, MySQL, SQLite, SQL Server, and ClickHouse/)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Prometheus metrics at \/metrics/)
    ).toBeInTheDocument();
  });
});
