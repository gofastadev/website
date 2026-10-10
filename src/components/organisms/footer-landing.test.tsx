import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { FooterLanding } from "./footer-landing";

// NavLinks (rendered inside the footer) reads usePathname() for its
// active-link state — stub it so this file stays focused on chrome
// rendering, not routing behavior (covered in nav-links.test.tsx).
vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("FooterLanding", () => {
  it("renders the copyright text", () => {
    render(<FooterLanding />);
    expect(screen.getByText(/Gofasta Authors/)).toBeInTheDocument();
  });

  it("renders the current year", () => {
    render(<FooterLanding />);
    const year = new Date().getFullYear().toString();
    expect(screen.getByText(new RegExp(year))).toBeInTheDocument();
  });

  it("renders footer navigation links", () => {
    render(<FooterLanding />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("License")).toBeInTheDocument();
  });

  it("renders as a footer element", () => {
    const { container } = render(<FooterLanding />);
    expect(container.querySelector("footer")).toBeInTheDocument();
  });
});
