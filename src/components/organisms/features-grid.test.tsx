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
    // The agent-native description embeds a link, so its text is split
    // across nodes — match the fragments either side of the anchor
    // rather than the whole sentence.
    expect(screen.getByText(/Scaffolded AGENTS.md,/)).toBeInTheDocument();
    expect(
      screen.getByText(/editor rules for Claude \/ Cursor \/ Codex/)
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

  // The homepage is the most-crawled page on the site, so this anchor
  // is llms.txt's strongest inbound link. Regressing it back to plain
  // prose would silently undo the discovery fix — hence the assertion.
  it("links llms.txt from the agent-native card", () => {
    render(<FeaturesGrid />);
    expect(screen.getByText("llms.txt")).toHaveAttribute("href", "/llms.txt");
  });
});
