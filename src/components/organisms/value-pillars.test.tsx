import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValuePillars } from "./value-pillars";

describe("ValuePillars", () => {
  it("renders all 3 pillar statements as headings", () => {
    render(<ValuePillars />);
    expect(
      screen.getByRole("heading", { name: "Standard Go. Zero lock-in." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Agent-native by default." })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Production from minute one." })
    ).toBeInTheDocument();
  });

  it("does not render the old card chrome (glow or floating numerals)", () => {
    const { container } = render(<ValuePillars />);
    expect(container.querySelector(".gofasta-card-glow")).not.toBeInTheDocument();
    expect(container.querySelector(".gofasta-number-float")).not.toBeInTheDocument();
  });

  it("renders a divide-y wrapper around the statements", () => {
    const { container } = render(<ValuePillars />);
    expect(container.querySelector(".divide-y")).toBeInTheDocument();
  });
});
