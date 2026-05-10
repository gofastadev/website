import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavbarLanding } from "./navbar-landing";

describe("NavbarLanding", () => {
  it("renders the logo", () => {
    const { container } = render(<NavbarLanding />);
    // Logo image is intentionally decorative (alt="" — see logo.tsx);
    // the brand-name text label beside it is what conveys identity.
    const img = container.querySelector('img[src="/logo.png"]');
    expect(img).toBeInTheDocument();
    expect(screen.getByText("Gofasta")).toBeInTheDocument();
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
