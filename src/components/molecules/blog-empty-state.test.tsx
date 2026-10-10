import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogEmptyState } from "./blog-empty-state";

describe("BlogEmptyState", () => {
  it("explains that nothing is published yet", () => {
    render(<BlogEmptyState />);
    expect(
      screen.getByRole("heading", { name: /first post is being written/i }),
    ).toBeInTheDocument();
    expect(screen.getByText(/nothing published yet/i)).toBeInTheDocument();
  });

  it("links to the docs, the feed and the repo", () => {
    render(<BlogEmptyState />);
    expect(screen.getByRole("link", { name: /read the docs/i })).toHaveAttribute(
      "href",
      "/docs",
    );
    expect(
      screen.getByRole("link", { name: /subscribe via rss/i }),
    ).toHaveAttribute("href", "/blog/rss.xml");
    const repo = screen.getByRole("link", { name: /follow the toolkit/i });
    expect(repo).toHaveAttribute("href", "https://github.com/gofastadev");
    expect(repo).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders the terminal with a blinking cursor on the last line", () => {
    const { container } = render(<BlogEmptyState />);
    expect(screen.getByText("~/blog")).toBeInTheDocument();
    expect(screen.getByText("total 0")).toBeInTheDocument();
    const lines = container.querySelectorAll(".gofasta-term-line");
    expect(lines).toHaveLength(5);
    expect(lines[0].querySelector(".gofasta-cursor")).toBeNull();
    expect(lines[4].querySelector(".gofasta-cursor")).not.toBeNull();
    expect(lines[4].querySelector(".text-terminal-accent")).not.toBeNull();
  });

  it("is excluded from the search index", () => {
    const { container } = render(<BlogEmptyState />);
    expect(container.querySelector("[data-pagefind-ignore]")).not.toBeNull();
  });
});
