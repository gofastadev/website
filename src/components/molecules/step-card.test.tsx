import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepCard } from "./step-card";

describe("StepCard", () => {
  it("renders the step number", () => {
    render(<StepCard step={1} title="Install" code="npm install" />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders the title", () => {
    render(<StepCard step={1} title="Install the CLI" code="npm install" />);
    expect(screen.getByText("Install the CLI")).toBeInTheDocument();
  });

  it("renders the code", () => {
    render(<StepCard step={1} title="Install" code="go install gofasta" />);
    expect(screen.getByText("go install gofasta")).toBeInTheDocument();
  });

  it("renders the code in a pre/code block", () => {
    render(<StepCard step={2} title="Create" code="gofasta new myapp" />);
    const codeEl = screen.getByText("gofasta new myapp");
    expect(codeEl.tagName).toBe("CODE");
    expect(codeEl.parentElement?.tagName).toBe("PRE");
  });
});
