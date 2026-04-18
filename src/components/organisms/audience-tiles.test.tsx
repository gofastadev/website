import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AudienceTiles } from "./audience-tiles";

describe("AudienceTiles", () => {
  it("renders the section heading", () => {
    render(<AudienceTiles />);
    expect(
      screen.getByText("Built for the way you already build.")
    ).toBeInTheDocument();
  });

  it("renders all 6 audience tiles", () => {
    render(<AudienceTiles />);
    expect(screen.getByText("Solo Engineers")).toBeInTheDocument();
    expect(screen.getByText("Indie Hackers")).toBeInTheDocument();
    expect(screen.getByText("Startup CTOs")).toBeInTheDocument();
    expect(screen.getByText("Senior Engineers")).toBeInTheDocument();
    expect(screen.getByText("Agencies & Consultancies")).toBeInTheDocument();
    expect(screen.getByText("Enterprise Teams")).toBeInTheDocument();
  });
});
