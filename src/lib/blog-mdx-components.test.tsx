import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Callout,
  BlogImage,
  blogMdxComponents,
} from "./blog-mdx-components";

describe("Callout", () => {
  it("renders as a note with default info styling when no type is given", () => {
    render(<Callout>Hello body</Callout>);
    const note = screen.getByRole("note");
    expect(note).toHaveAttribute("aria-label", "Note");
    expect(note.className).toMatch(/border-primary/);
    expect(note).toHaveTextContent("Hello body");
  });

  it("renders the warning variant with the warning palette", () => {
    render(<Callout type="warning">Be careful</Callout>);
    const note = screen.getByRole("note");
    expect(note).toHaveAttribute("aria-label", "Warning");
    expect(note.className).toMatch(/border-amber/);
  });

  it("renders the tip variant with the tip palette", () => {
    render(<Callout type="tip">Try this</Callout>);
    const note = screen.getByRole("note");
    expect(note).toHaveAttribute("aria-label", "Tip");
    expect(note.className).toMatch(/border-emerald/);
  });
});

describe("BlogImage", () => {
  it("renders nothing when src is missing", () => {
    const { container } = render(<BlogImage />);
    expect(container.firstChild).toBeNull();
  });

  it("renders a lazy-loaded figure with the alt text as caption", () => {
    render(<BlogImage src="/blog/inline/foo.png" alt="A diagram" />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/blog/inline/foo.png");
    expect(img).toHaveAttribute("alt", "A diagram");
    expect(img).toHaveAttribute("loading", "lazy");
    expect(img).toHaveAttribute("decoding", "async");
    expect(screen.getByText("A diagram", { selector: "figcaption" })).toBeInTheDocument();
  });

  it("prefers title over alt when both are present", () => {
    render(<BlogImage src="/x.png" alt="alt text" title="title caption" />);
    expect(
      screen.getByText("title caption", { selector: "figcaption" }),
    ).toBeInTheDocument();
  });

  it("omits the figcaption when neither alt nor title is given", () => {
    const { container } = render(<BlogImage src="/x.png" />);
    expect(container.querySelector("figcaption")).toBeNull();
  });

  it("defaults alt to an empty string when omitted", () => {
    // Empty-alt images have role="presentation" (decorative), so they
    // disappear from the accessibility tree — we query the DOM directly.
    const { container } = render(<BlogImage src="/x.png" />);
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("alt", "");
  });
});

describe("blogMdxComponents map", () => {
  it("wires Callout and BlogImage by name (Callout) and tag (img)", () => {
    expect(blogMdxComponents.Callout).toBe(Callout);
    expect(blogMdxComponents.img).toBe(BlogImage);
  });
});
