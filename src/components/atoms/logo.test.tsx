import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Logo } from "./logo";

describe("Logo", () => {
  it("renders the logo image", () => {
    render(<Logo />);
    const img = screen.getByAltText("Gofasta");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/logo.png");
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
    render(<Logo />);
    const img = screen.getByAltText("Gofasta");
    expect(img).toHaveClass("rounded-lg");
  });
});
