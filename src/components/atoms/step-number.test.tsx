import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { StepNumber } from "./step-number";

describe("StepNumber", () => {
  it("renders the step number", () => {
    render(<StepNumber step={1} />);
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders different step numbers", () => {
    render(<StepNumber step={3} />);
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<StepNumber step={1} className="mb-4" />);
    expect(screen.getByText("1")).toHaveClass("mb-4");
  });

  it("has the primary background styling", () => {
    render(<StepNumber step={1} />);
    expect(screen.getByText("1")).toHaveClass("bg-primary");
  });
});
