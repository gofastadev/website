import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { NavLinks } from "./nav-links";

describe("NavLinks", () => {
  it("renders Docs and GitHub links in header variant", () => {
    render(<NavLinks variant="header" />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
  });

  it("does not render License link in header variant", () => {
    render(<NavLinks variant="header" />);
    expect(screen.queryByText("License")).not.toBeInTheDocument();
  });

  it("renders Docs, GitHub, and License links in footer variant", () => {
    render(<NavLinks variant="footer" />);
    expect(screen.getByText("Docs")).toBeInTheDocument();
    expect(screen.getByText("GitHub")).toBeInTheDocument();
    expect(screen.getByText("License")).toBeInTheDocument();
  });

  it("defaults to header variant", () => {
    render(<NavLinks />);
    expect(screen.queryByText("License")).not.toBeInTheDocument();
  });

  it("Docs link points to getting started", () => {
    render(<NavLinks />);
    expect(screen.getByText("Docs")).toHaveAttribute(
      "href",
      "/docs/getting-started/introduction"
    );
  });

  it("GitHub link opens in new tab", () => {
    render(<NavLinks />);
    const github = screen.getByText("GitHub");
    expect(github).toHaveAttribute("target", "_blank");
    expect(github).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("applies custom className", () => {
    const { container } = render(<NavLinks className="my-class" />);
    expect(container.firstChild).toHaveClass("my-class");
  });
});
