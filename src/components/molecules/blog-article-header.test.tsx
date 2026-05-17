import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogArticleHeader } from "./blog-article-header";
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
    readingTime: { text: "3 min read", minutes: 3, words: 600 },
    ...overrides,
  };
}

describe("BlogArticleHeader", () => {
  it("renders the title, description, and reading time", () => {
    render(<BlogArticleHeader post={post()} />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Hello, World" }),
    ).toBeInTheDocument();
    expect(screen.getByText("An intro post.")).toBeInTheDocument();
    expect(screen.getByText("3 min read")).toBeInTheDocument();
  });

  it("renders the author as plain text when authorUrl is missing", () => {
    render(<BlogArticleHeader post={post()} />);
    expect(
      screen.queryByRole("link", { name: "Test Author" }),
    ).not.toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
  });

  it("renders the author as an external link when authorUrl is set", () => {
    render(
      <BlogArticleHeader
        post={post({ authorUrl: "https://author.example" })}
      />,
    );
    const link = screen.getByRole("link", { name: "Test Author" });
    expect(link).toHaveAttribute("href", "https://author.example");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders one tag pill per tag", () => {
    render(<BlogArticleHeader post={post({ tags: ["a", "b", "c"] })} />);
    expect(screen.getByRole("link", { name: "#a" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "#b" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "#c" })).toBeInTheDocument();
  });

  it("omits the tag row entirely when the post has no tags", () => {
    const { container } = render(
      <BlogArticleHeader post={post({ tags: [] })} />,
    );
    expect(container.querySelectorAll('a[href^="/blog/tags/"]')).toHaveLength(0);
  });

  it("renders an 'Updated' timestamp only when updatedAt is set", () => {
    const { rerender } = render(<BlogArticleHeader post={post()} />);
    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument();
    rerender(
      <BlogArticleHeader
        post={post({ updatedAt: "2026-06-01T10:00:00.000Z" })}
      />,
    );
    expect(screen.getByText(/Updated/)).toBeInTheDocument();
    expect(screen.getByText("June 1, 2026")).toBeInTheDocument();
  });

  it("formats the publish date in long form", () => {
    render(<BlogArticleHeader post={post()} />);
    expect(screen.getByText("May 1, 2026")).toBeInTheDocument();
  });

  it("renders the cover image with empty alt (decorative)", () => {
    const { container } = render(<BlogArticleHeader post={post()} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/blog/covers/hello.svg");
    expect(img).toHaveAttribute("alt", "");
  });
});
