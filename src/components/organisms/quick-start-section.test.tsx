import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickStartSection } from "./quick-start-section";

describe("QuickStartSection", () => {
  it("renders the section heading", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("Install and run")).toBeInTheDocument();
  });

  it("renders all 3 steps", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("4")).not.toBeInTheDocument();
  });

  it("renders step titles", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("Install the CLI")).toBeInTheDocument();
    expect(screen.getByText("Create a project")).toBeInTheDocument();
    expect(screen.getByText("Start developing")).toBeInTheDocument();
    expect(
      screen.queryByText("Configure your AI (optional)")
    ).not.toBeInTheDocument();
  });

  it("renders the install command", () => {
    render(<QuickStartSection />);
    expect(
      screen.getByText("go install github.com/gofastadev/cli/cmd/gofasta@latest")
    ).toBeInTheDocument();
  });

  it("renders the new command", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("gofasta new myapp")).toBeInTheDocument();
  });

  it("does not surface per-agent AI installers in the quickstart", () => {
    // The AI installer (`gofasta ai <agent>`) is opt-in — the quickstart
    // should stay focused on the minimum path to a running server, so
    // agent-specific commands like `gofasta ai claude` don't belong here.
    render(<QuickStartSection />);
    expect(screen.queryByText("gofasta ai claude")).not.toBeInTheDocument();
  });

  it("renders the start command", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("cd myapp && gofasta dev")).toBeInTheDocument();
  });
});
