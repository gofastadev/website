import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TerminalBlock } from "./terminal-block";

describe("TerminalBlock", () => {
  it("renders children inside the code block", () => {
    render(<TerminalBlock>gofasta new myapp</TerminalBlock>);
    expect(screen.getByText("gofasta new myapp")).toBeInTheDocument();
  });

  it("renders the Terminal label", () => {
    render(<TerminalBlock>content</TerminalBlock>);
    expect(screen.getByText("Terminal")).toBeInTheDocument();
  });

  it("renders the three window dots", () => {
    const { container } = render(<TerminalBlock>content</TerminalBlock>);
    expect(container.querySelector(".bg-red-500")).toBeInTheDocument();
    expect(container.querySelector(".bg-yellow-500")).toBeInTheDocument();
    expect(container.querySelector(".bg-green-500")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <TerminalBlock className="max-w-2xl">content</TerminalBlock>
    );
    expect(container.firstChild).toHaveClass("max-w-2xl");
  });
});
