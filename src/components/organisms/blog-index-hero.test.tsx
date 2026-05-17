import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogIndexHero } from "./blog-index-hero";
import type { BlogPost } from "@/lib/blog";

function post(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    slug: "hello",
    title: "Hello, World",
    description: "An intro post.",
    publishedAt: "2026-05-01T10:00:00.000Z",
    author: "Test Author",
    tags: ["intro"],
    cover: "hello.svg",
    coverUrl: "/blog/covers/hello.svg",
    body: "# Hello",
    readingTime: { text: "4 min read", minutes: 4, words: 800 },
    ...overrides,
  };
}

describe("BlogIndexHero", () => {
  it("labels the section 'Featured post' for assistive tech", () => {
    render(<BlogIndexHero post={post()} />);
    expect(
      screen.getByRole("region", { name: "Featured post" }),
    ).toBeInTheDocument();
  });

  it("renders the latest-post badge, title, description, author, and reading time", () => {
    render(<BlogIndexHero post={post()} />);
    expect(screen.getByText("Latest post")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Hello, World" }),
    ).toBeInTheDocument();
    expect(screen.getByText("An intro post.")).toBeInTheDocument();
    expect(screen.getByText("Test Author")).toBeInTheDocument();
    expect(screen.getByText("4 min read")).toBeInTheDocument();
  });

  it("links the whole hero block to the post", () => {
    render(<BlogIndexHero post={post()} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/blog/hello");
  });

  it("formats the publish date in long form with a <time> element", () => {
    render(<BlogIndexHero post={post()} />);
    const time = screen.getByText("May 1, 2026");
    expect(time.tagName.toLowerCase()).toBe("time");
    expect(time).toHaveAttribute("dateTime", "2026-05-01T10:00:00.000Z");
  });

  it("renders the cover image with empty alt (decorative)", () => {
    const { container } = render(<BlogIndexHero post={post()} />);
    const img = container.querySelector("img");
    expect(img).toHaveAttribute("src", "/blog/covers/hello.svg");
    expect(img).toHaveAttribute("alt", "");
  });
});
