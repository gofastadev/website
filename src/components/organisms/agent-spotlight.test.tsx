import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AgentSpotlight } from "./agent-spotlight";

describe("AgentSpotlight", () => {
  it("renders the section heading", () => {
    render(<AgentSpotlight />);
    expect(
      screen.getByText("A Go toolkit built for humans and AI agents.")
    ).toBeInTheDocument();
  });

  it("renders all 5 capabilities", () => {
    render(<AgentSpotlight />);
    expect(screen.getByText("Universal --json flag")).toBeInTheDocument();
    expect(screen.getByText("Stable error codes")).toBeInTheDocument();
    expect(screen.getByText("Scaffolded AGENTS.md")).toBeInTheDocument();
    expect(screen.getByText("One-command agent setup")).toBeInTheDocument();
    expect(screen.getByText("High-level commands")).toBeInTheDocument();
  });

  it("renders the status --json label", () => {
    render(<AgentSpotlight />);
    expect(screen.getByText("gofasta status --json")).toBeInTheDocument();
  });

  it("does not render an eyebrow label", () => {
    render(<AgentSpotlight />);
    expect(screen.queryByText("Agent-Native")).not.toBeInTheDocument();
  });

  it("does not render the section-level gradient wash", () => {
    const { container } = render(<AgentSpotlight />);
    expect(container.innerHTML).not.toContain("bg-gradient-to-b");
    expect(container.innerHTML).not.toContain("from-primary/5");
  });

  it("does not render the decorative data-stream SVG or its gradient defs", () => {
    const { container } = render(<AgentSpotlight />);
    expect(container.querySelector("linearGradient")).not.toBeInTheDocument();
    expect(container.querySelector("defs")).not.toBeInTheDocument();
    expect(container.querySelector(".gofasta-stream-line")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("gofasta-flow-dash");
    expect(container.innerHTML).not.toContain("gofasta-dot-travel");
  });

  it("renders a plain check glyph per capability instead of a decorated circle", () => {
    const { container } = render(<AgentSpotlight />);
    expect(container.innerHTML).not.toContain("bg-primary/15");
    const checkGlyphs = container.querySelectorAll("svg polyline");
    expect(checkGlyphs).toHaveLength(5);
  });

  it("does not contain em-dashes in rendered content", () => {
    const { container } = render(<AgentSpotlight />);
    expect(container.textContent).not.toContain("—");
  });
});
