import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ArchitectureStrip } from "./architecture-strip";

describe("ArchitectureStrip", () => {
  it("renders the section heading", () => {
    render(<ArchitectureStrip />);
    expect(
      screen.getByText("Four things Gofasta will never do to your code.")
    ).toBeInTheDocument();
  });

  it("renders all 4 principles", () => {
    render(<ArchitectureStrip />);
    expect(screen.getByText("Compile-time DI")).toBeInTheDocument();
    expect(screen.getByText("Zero init-time side effects")).toBeInTheDocument();
    expect(screen.getByText("Every package swappable")).toBeInTheDocument();
    expect(screen.getByText("Full eject anytime")).toBeInTheDocument();
  });
});
