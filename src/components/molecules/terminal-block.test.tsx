import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { TerminalBlock } from "./terminal-block";

describe("TerminalBlock", () => {
  it("renders children inside the code block", () => {
    render(<TerminalBlock>gofasta new myapp</TerminalBlock>);
    expect(screen.getByText("gofasta new myapp")).toBeInTheDocument();
  });

  it("renders the default title", () => {
    render(<TerminalBlock>content</TerminalBlock>);
    expect(screen.getByText("~/dev")).toBeInTheDocument();
  });

  it("renders a custom title when provided", () => {
    render(<TerminalBlock title="~/projects/myapp">content</TerminalBlock>);
    expect(screen.getByText("~/projects/myapp")).toBeInTheDocument();
  });

  it("does not render traffic-light dots", () => {
    const { container } = render(<TerminalBlock>content</TerminalBlock>);
    expect(container.querySelector(".bg-red-500")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-yellow-500")).not.toBeInTheDocument();
    expect(container.querySelector(".bg-green-500")).not.toBeInTheDocument();
  });

  it("applies custom className", () => {
    const { container } = render(
      <TerminalBlock className="max-w-2xl">content</TerminalBlock>
    );
    expect(container.firstChild).toHaveClass("max-w-2xl");
  });
});
