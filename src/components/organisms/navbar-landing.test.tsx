import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavbarLanding } from "./navbar-landing";

describe("NavbarLanding", () => {
  it("renders the logo", () => {
    render(<NavbarLanding />);
    expect(screen.getByAltText("Gofasta")).toBeInTheDocument();
  });

  it("renders navigation links", () => {
    render(<NavbarLanding />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("renders the theme toggle", () => {
    render(<NavbarLanding />);
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("renders as a nav element", () => {
    render(<NavbarLanding />);
    expect(screen.getByRole("navigation")).toBeInTheDocument();
  });
});
