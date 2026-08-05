import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Input } from "./input";

describe("Input", () => {
  it("renders an input and forwards standard props", () => {
    render(
      <Input
        type="email"
        name="email"
        placeholder="you@example.com"
        required
      />,
    );
    const input = screen.getByPlaceholderText("you@example.com");
    expect(input).toHaveAttribute("type", "email");
    expect(input).toHaveAttribute("name", "email");
    expect(input).toBeRequired();
  });

  it("carries the shared focus-ring styling and merges className", () => {
    render(<Input placeholder="x" className="max-w-xs" />);
    const input = screen.getByPlaceholderText("x");
    expect(input.className).toContain("focus-visible:ring-primary");
    expect(input.className).toContain("max-w-xs");
  });

  it("supports the disabled state", () => {
    render(<Input placeholder="d" disabled />);
    expect(screen.getByPlaceholderText("d")).toBeDisabled();
  });
});
