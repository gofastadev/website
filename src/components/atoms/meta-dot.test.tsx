import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { MetaDot } from "./meta-dot";

describe("MetaDot", () => {
  it("renders a CSS-drawn separator with no text content", () => {
    const { container } = render(<MetaDot />);
    const dot = container.firstElementChild as HTMLElement;

    expect(dot.tagName).toBe("SPAN");
    expect(dot.textContent).toBe("");
    expect(dot.className).toContain("rounded-full");
  });

  it("is hidden from assistive technology", () => {
    const { container } = render(<MetaDot />);
    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("merges a caller-supplied className", () => {
    const { container } = render(<MetaDot className="mx-3" />);
    expect(container.firstElementChild?.className).toContain("mx-3");
  });
});
