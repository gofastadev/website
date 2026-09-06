import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnchoredHeading } from "./anchored-heading";

describe("AnchoredHeading", () => {
  it.each(["h2", "h3", "h4", "h5", "h6"] as const)(
    "renders a %s element",
    (tag) => {
      render(
        <AnchoredHeading as={tag} id="section">
          Section
        </AnchoredHeading>,
      );
      const heading = screen.getByRole("heading", { name: /Section/ });
      expect(heading.tagName.toLowerCase()).toBe(tag);
    },
  );

  it("renders a fragment anchor when id is present", () => {
    render(
      <AnchoredHeading as="h2" id="install-the-cli">
        Install the CLI
      </AnchoredHeading>,
    );
    const anchor = screen.getByRole("link", { name: "Link to this section" });
    expect(anchor).toHaveAttribute("href", "#install-the-cli");
  });

  it("is hover-revealed: hidden by default, shown on group hover/focus", () => {
    render(
      <AnchoredHeading as="h2" id="s">
        S
      </AnchoredHeading>,
    );
    const anchor = screen.getByRole("link", { name: "Link to this section" });
    expect(anchor.className).toContain("opacity-0");
    expect(anchor.className).toContain("group-hover:opacity-100");
    expect(anchor.className).toContain("focus-visible:opacity-100");
    expect(
      screen.getByRole("heading", { name: /S/ }).className,
    ).toContain("group");
  });

  it("renders no anchor when id is absent", () => {
    render(<AnchoredHeading as="h3">No id</AnchoredHeading>);
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("forwards id and className to the heading element", () => {
    render(
      <AnchoredHeading as="h4" id="x" className="custom">
        X
      </AnchoredHeading>,
    );
    const heading = screen.getByRole("heading", { name: /X/ });
    expect(heading).toHaveAttribute("id", "x");
    expect(heading.className).toContain("custom");
  });
});
