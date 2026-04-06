import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LandingTemplate } from "./landing-template";

describe("LandingTemplate", () => {
  it("renders children", () => {
    render(
      <LandingTemplate>
        <div data-testid="child">Hello</div>
      </LandingTemplate>
    );
    expect(screen.getByTestId("child")).toBeInTheDocument();
  });

  it("renders the navbar", () => {
    render(
      <LandingTemplate>
        <div>content</div>
      </LandingTemplate>
    );
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });

  it("renders the footer", () => {
    render(
      <LandingTemplate>
        <div>content</div>
      </LandingTemplate>
    );
    expect(screen.getByText(/Gofasta Authors/)).toBeInTheDocument();
  });

  it("wraps children in a main element", () => {
    render(
      <LandingTemplate>
        <div data-testid="child">content</div>
      </LandingTemplate>
    );
    const main = screen.getByRole("main");
    expect(main).toBeInTheDocument();
    expect(main).toContainElement(screen.getByTestId("child"));
  });
});
