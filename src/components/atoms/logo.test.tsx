import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./logo";

describe("Logo", () => {
  it("renders the logo image", () => {
    const { container } = render(<Logo />);
    // The image is decorative (alt="") because the visible "Gofasta"
    // text label beside it provides the same name to assistive tech.
    // Look it up by src instead of alt — alt="" is the correct value
    // and getByAltText("") is unreliable across testing-library
    // versions.
    const img = container.querySelector('img[src="/logo.png"]');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("alt", "");
  });

  it("renders the brand name", () => {
    render(<Logo />);
    expect(screen.getByText("Gofasta")).toBeInTheDocument();
  });

  it("links to the homepage", () => {
    render(<Logo />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/");
  });

  it("applies custom className", () => {
    render(<Logo className="my-custom-class" />);
    const link = screen.getByRole("link");
    expect(link).toHaveClass("my-custom-class");
  });

  it("applies rounded corners to the image", () => {
    const { container } = render(<Logo />);
    const img = container.querySelector('img[src="/logo.png"]');
    expect(img).toHaveClass("rounded-lg");
  });
});
