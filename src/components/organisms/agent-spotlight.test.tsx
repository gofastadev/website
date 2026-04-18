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
});
