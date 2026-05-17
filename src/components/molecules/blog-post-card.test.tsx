import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogPostCard } from "./blog-post-card";
import type { BlogPost } from "@/lib/blog";

function post(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "hello",
    title: "Hello, World",
    description: "An intro post.",
    publishedAt: "2026-05-01T10:00:00.000Z",
    author: "Test Author",
    tags: ["intro", "meta"],
    cover: "hello.svg",
    coverUrl: "/blog/covers/hello.svg",
    body: "# Hello",
    readingTime: { text: "1 min read", minutes: 0.5, words: 4 },
    ...overrides,
  };
}

describe("BlogPostCard", () => {
  it("links the whole card to the post and labels the link with the title", () => {
    render(<BlogPostCard post={post()} />);
    const link = screen.getByRole("link", { name: "Hello, World" });
    expect(link).toHaveAttribute("href", "/blog/hello");
  });

  it("renders the cover image with the post's cover URL and empty alt", () => {
    render(<BlogPostCard post={post()} />);
    // Cover is decorative — empty alt removes it from a11y tree.
    const card = screen.getByRole("link", { name: "Hello, World" });
    const img = card.querySelector("img");
    expect(img).toHaveAttribute("src", "/blog/covers/hello.svg");
    expect(img).toHaveAttribute("alt", "");
  });

  it("renders a formatted publish date in a <time> with dateTime attr", () => {
    render(<BlogPostCard post={post()} />);
    const time = screen.getByText(/May 1, 2026/);
    expect(time.tagName.toLowerCase()).toBe("time");
    expect(time).toHaveAttribute("dateTime", "2026-05-01T10:00:00.000Z");
  });

  it("renders the reading time label as-is", () => {
    render(
      <BlogPostCard
        post={post({
          readingTime: { text: "7 min read", minutes: 7, words: 1400 },
        })}
      />,
    );
    expect(screen.getByText("7 min read")).toBeInTheDocument();
  });

  it("shows up to three tag chips and truncates the rest", () => {
    render(
      <BlogPostCard
        post={post({ tags: ["a", "b", "c", "d", "e"] })}
      />,
    );
    expect(screen.getByText("#a")).toBeInTheDocument();
    expect(screen.getByText("#b")).toBeInTheDocument();
    expect(screen.getByText("#c")).toBeInTheDocument();
    expect(screen.queryByText("#d")).not.toBeInTheDocument();
    expect(screen.queryByText("#e")).not.toBeInTheDocument();
  });

  it("omits the tag row entirely when the post has no tags", () => {
    const { container } = render(<BlogPostCard post={post({ tags: [] })} />);
    expect(container.querySelector("span.text-primary")).toBeNull();
  });

  it("merges an additional className onto the article wrapper", () => {
    const { container } = render(
      <BlogPostCard post={post()} className="extra-card-class" />,
    );
    expect(container.querySelector("article")?.className).toMatch(
      /extra-card-class/,
    );
  });
});
