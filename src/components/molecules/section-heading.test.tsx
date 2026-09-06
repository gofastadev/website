import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionHeading } from "./section-heading";

describe("SectionHeading", () => {
  it("renders title only", () => {
    render(<SectionHeading title="Hello" />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("renders eyebrow, title, and description", () => {
    render(
      <SectionHeading
        eyebrow="Category"
        title="Headline"
        description="A supporting paragraph."
      />
    );
    expect(screen.getByText("Category")).toBeInTheDocument();
    expect(screen.getByText("Headline")).toBeInTheDocument();
    expect(screen.getByText("A supporting paragraph.")).toBeInTheDocument();
  });

  it("renders the eyebrow as a plain mono span without pill styling", () => {
    render(<SectionHeading eyebrow="Category" title="Headline" />);
    const eyebrow = screen.getByText("Category");
    expect(eyebrow.tagName).toBe("SPAN");
    expect(eyebrow).toHaveClass("font-mono");
    expect(eyebrow).toHaveClass("text-xs");
    expect(eyebrow).toHaveClass("uppercase");
    expect(eyebrow).toHaveClass("tracking-widest");
    expect(eyebrow).toHaveClass("text-primary");
    expect(eyebrow).not.toHaveClass("rounded-full");
    expect(eyebrow).not.toHaveClass("border");
    expect(eyebrow).not.toHaveClass("bg-primary/10");
  });

  it("renders the title as an h2 with the display font", () => {
    render(<SectionHeading title="Headline" />);
    expect(screen.getByText("Headline").tagName).toBe("H2");
    expect(screen.getByText("Headline")).toHaveClass("font-display");
  });

  it("defaults to left alignment", () => {
    const { container } = render(<SectionHeading title="Default align" />);
    expect(container.firstChild).toHaveClass("items-start");
    expect(container.firstChild).toHaveClass("text-left");
  });

  it("uses left-aligned classes when align=left is passed", () => {
    const { container } = render(
      <SectionHeading title="Left-aligned" align="left" />
    );
    // Covers the non-default align branch in the alignClasses ternary.
    expect(container.firstChild).toHaveClass("items-start");
    expect(container.firstChild).toHaveClass("text-left");
  });

  it("uses center-aligned classes when align=center is passed", () => {
    const { container } = render(<SectionHeading title="Centered" align="center" />);
    expect(container.firstChild).toHaveClass("mx-auto");
    expect(container.firstChild).toHaveClass("items-center");
    expect(container.firstChild).toHaveClass("text-center");
  });

  it("applies a custom className to the root element", () => {
    const { container } = render(
      <SectionHeading title="Customised" className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass("my-custom-class");
  });
});
