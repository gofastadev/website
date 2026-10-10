import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogTagCloud } from "./blog-tag-cloud";

describe("BlogTagCloud", () => {
  it("renders nothing when the tag list is empty", () => {
    const { container } = render(<BlogTagCloud tags={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders one entry per tag, each linking to /blog/tags/<slug>", () => {
    render(
      <BlogTagCloud
        tags={[
          { tag: "go", count: 4 },
          { tag: "cli", count: 2 },
        ]}
      />,
    );
    expect(screen.getByRole("link", { name: /#go/ })).toHaveAttribute(
      "href",
      "/blog/tags/go",
    );
    expect(screen.getByRole("link", { name: /#cli/ })).toHaveAttribute(
      "href",
      "/blog/tags/cli",
    );
  });

  it("shows the post count alongside each tag", () => {
    render(
      <BlogTagCloud
        tags={[
          { tag: "go", count: 4 },
          { tag: "cli", count: 2 },
        ]}
      />,
    );
    const goLink = screen.getByRole("link", { name: /#go/ });
    expect(goLink).toHaveTextContent("4");
    const cliLink = screen.getByRole("link", { name: /#cli/ });
    expect(cliLink).toHaveTextContent("2");
  });

  it("labels the section so assistive tech can locate it", () => {
    render(<BlogTagCloud tags={[{ tag: "go", count: 1 }]} />);
    expect(
      screen.getByRole("complementary", { name: "All tags" }),
    ).toBeInTheDocument();
  });
});
