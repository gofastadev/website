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
});
