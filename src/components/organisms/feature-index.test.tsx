import { describe, it, expect } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { FeatureIndex } from "./feature-index";

describe("FeatureIndex", () => {
  it("renders the section heading", () => {
    render(<FeatureIndex />);
    expect(
      screen.getByText("Everything a production backend needs")
    ).toBeInTheDocument();
  });

  it("renders exactly 12 listitems", () => {
    render(<FeatureIndex />);
    expect(screen.getAllByRole("listitem")).toHaveLength(12);
  });

  it("renders a mono keyword for every cell, in brief order, styled with font-mono", () => {
    render(<FeatureIndex />);
    const keywords = [
      "new",
      "ai",
      "auth",
      "db",
      "api",
      "jobs",
      "otel",
      "sec",
      "deploy",
      "trace",
      "sql",
      "replay",
    ];
    const listItems = screen.getAllByRole("listitem");
    expect(listItems).toHaveLength(keywords.length);
    listItems.forEach((li, index) => {
      const keywordEl = within(li).getByText(keywords[index]);
      expect(keywordEl.className).toMatch(/\bfont-mono\b/);
    });
  });

  it("renders the auth cell with title 'Auth and RBAC'", () => {
    render(<FeatureIndex />);
    expect(screen.getByText("Auth and RBAC")).toBeInTheDocument();
  });

  it("renders the grid ul with gap-px", () => {
    render(<FeatureIndex />);
    const list = screen.getByRole("list");
    expect(list.className).toMatch(/\bgap-px\b/);
  });

  it("does not render the old FeatureCard glow class anywhere", () => {
    const { container } = render(<FeatureIndex />);
    expect(container.querySelector(".gofasta-card-glow")).toBeNull();
    expect(
      container.querySelector('[data-testid="feature-card"]')
    ).toBeNull();
  });
});
