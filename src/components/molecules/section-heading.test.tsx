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

  it("uses left-aligned classes when align=left is passed", () => {
    const { container } = render(
      <SectionHeading title="Left-aligned" align="left" />
    );
    // Covers the non-default align branch in the alignClasses ternary.
    expect(container.firstChild).toHaveClass("items-start");
    expect(container.firstChild).toHaveClass("text-left");
  });

  it("applies a custom className to the root element", () => {
    const { container } = render(
      <SectionHeading title="Customised" className="my-custom-class" />
    );
    expect(container.firstChild).toHaveClass("my-custom-class");
  });
});
