import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogTagPill } from "./blog-tag-pill";

describe("BlogTagPill", () => {
  it("renders the tag prefixed with # and links to the tag index", () => {
    render(<BlogTagPill tag="golang" />);
    const link = screen.getByRole("link", { name: "#golang" });
    expect(link).toHaveAttribute("href", "/blog/tags/golang");
  });

  it("supports an explicit href override", () => {
    render(<BlogTagPill tag="golang" href="/custom/path" />);
    expect(
      screen.getByRole("link", { name: "#golang" }),
    ).toHaveAttribute("href", "/custom/path");
  });

  it("merges an additional className into the rendered link", () => {
    render(<BlogTagPill tag="cli" className="extra-pill-class" />);
    const link = screen.getByRole("link", { name: "#cli" });
    expect(link.className).toMatch(/extra-pill-class/);
    expect(link.className).toMatch(/rounded-full/);
  });
});
