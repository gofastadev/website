import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AudienceTiles } from "./audience-tiles";

describe("AudienceTiles", () => {
  it("renders the section heading", () => {
    render(<AudienceTiles />);
    expect(screen.getByText("Built for people who ship")).toBeInTheDocument();
    expect(
      screen.getByText("From a side project to a team codebase, the workflow stays the same.")
    ).toBeInTheDocument();
  });

  it("renders all 6 audiences as list items", () => {
    render(<AudienceTiles />);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(6);
  });

  it("renders sentence-case audience titles", () => {
    render(<AudienceTiles />);
    expect(screen.getByText("Solo engineers")).toBeInTheDocument();
    expect(screen.getByText("Indie hackers")).toBeInTheDocument();
    expect(screen.getByText("Startup CTOs")).toBeInTheDocument();
    expect(screen.getByText("Senior engineers")).toBeInTheDocument();
    expect(screen.getByText("Agencies and consultancies")).toBeInTheDocument();
    expect(screen.getByText("Enterprise teams")).toBeInTheDocument();
  });

  it("renders a sticky left rail for the section heading", () => {
    render(<AudienceTiles />);
    const heading = screen.getByText("Built for people who ship");
    const rail = heading.closest("div")?.parentElement;
    expect(rail?.className).toMatch(/lg:sticky/);
  });

  it("does not use card or glow classes on list items", () => {
    render(<AudienceTiles />);
    const items = screen.getAllByRole("listitem");
    for (const item of items) {
      expect(item.className).not.toMatch(/gofasta-card-glow/);
      expect(item.className).not.toMatch(/rounded-2xl/);
      expect(item.className).not.toMatch(/shadow-xl/);
    }
  });
});
