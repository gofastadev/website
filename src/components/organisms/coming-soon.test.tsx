import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ComingSoon } from "./coming-soon";

describe("ComingSoon", () => {
  it("renders the Coming Soon badge", () => {
    render(<ComingSoon />);
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("renders the headline", () => {
    render(<ComingSoon />);
    expect(screen.getByText("almost here.")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<ComingSoon />);
    expect(
      screen.getByText(/composable packages, and zero magic/)
    ).toBeInTheDocument();
  });

  it("renders the Star on GitHub link", () => {
    render(<ComingSoon />);
    const link = screen.getByText("Star on GitHub");
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute(
      "href",
      "https://github.com/gofastadev/gofasta"
    );
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("renders the logo image", () => {
    render(<ComingSoon />);
    const logo = screen.getByAltText("Gofasta");
    expect(logo).toBeInTheDocument();
  });

  it("renders the copyright notice", () => {
    render(<ComingSoon />);
    expect(screen.getByText(/Gofasta Authors/)).toBeInTheDocument();
  });
});
