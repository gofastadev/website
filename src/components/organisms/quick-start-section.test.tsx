import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { QuickStartSection } from "./quick-start-section";

describe("QuickStartSection", () => {
  it("renders the section heading", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("Up and running in 3 steps")).toBeInTheDocument();
  });

  it("renders all 3 steps", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("renders step titles", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("Install the CLI")).toBeInTheDocument();
    expect(screen.getByText("Create a project")).toBeInTheDocument();
    expect(screen.getByText("Start developing")).toBeInTheDocument();
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

  it("renders the start command", () => {
    render(<QuickStartSection />);
    expect(screen.getByText("cd myapp && make up")).toBeInTheDocument();
  });
});
