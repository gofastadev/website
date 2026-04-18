import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ValuePillars } from "./value-pillars";

describe("ValuePillars", () => {
  it("renders the section heading", () => {
    render(<ValuePillars />);
    expect(
      screen.getByText("Fast to start. Yours to own. Ready for your AI.")
    ).toBeInTheDocument();
  });

  it("renders all 3 pillar numbers", () => {
    render(<ValuePillars />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
  });

  it("renders all 3 pillar titles", () => {
    render(<ValuePillars />);
    expect(screen.getByText("Standard Go. Zero lock-in.")).toBeInTheDocument();
    expect(screen.getByText("Agent-native by default.")).toBeInTheDocument();
    expect(screen.getByText("Production from minute one.")).toBeInTheDocument();
  });
});
