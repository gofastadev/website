import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogRelatedPosts } from "./blog-related-posts";
import type { BlogPost } from "@/lib/blog";

function post(slug: string, tags: string[], publishedAt: string): BlogPost {
  return {
    slug,
    title: slug,
    description: "",
    publishedAt,
    author: "X",
    tags,
    cover: "x.svg",
    coverUrl: "/blog/covers/x.svg",
    body: "",
    readingTime: { text: "1 min read", minutes: 0.5, words: 0 },
  };
}

describe("BlogRelatedPosts", () => {
  it("renders nothing when the current slug is not in the post list", () => {
    const { container } = render(
      <BlogRelatedPosts
        currentSlug="missing"
        allPosts={[post("a", ["go"], "2026-05-01T00:00:00.000Z")]}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when there are no other posts", () => {
    const { container } = render(
      <BlogRelatedPosts
        currentSlug="only"
        allPosts={[post("only", ["go"], "2026-05-01T00:00:00.000Z")]}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("ranks candidates by tag overlap with the current post", () => {
    const current = post("current", ["go", "cli"], "2026-05-01T00:00:00.000Z");
    const candidates = [
      post("c-noshare", ["docs"], "2026-04-01T00:00:00.000Z"),
      post("c-one", ["go"], "2026-03-01T00:00:00.000Z"),
      post("c-both", ["go", "cli"], "2026-02-01T00:00:00.000Z"),
    ];
    render(
      <BlogRelatedPosts
        currentSlug="current"
        allPosts={[current, ...candidates]}
      />,
    );
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    // Highest-overlap first ("c-both" shares 2 tags), then "c-one" (1 tag),
    // then "c-noshare" (0 tags).
    expect(links).toEqual([
      "/blog/c-both",
      "/blog/c-one",
      "/blog/c-noshare",
    ]);
  });

  it("breaks ties by publish date (newest first)", () => {
    const current = post("current", ["go"], "2026-05-01T00:00:00.000Z");
    const candidates = [
      post("older-1tag", ["go"], "2026-01-01T00:00:00.000Z"),
      post("newer-1tag", ["go"], "2026-04-01T00:00:00.000Z"),
    ];
    render(
      <BlogRelatedPosts
        currentSlug="current"
        allPosts={[current, ...candidates]}
      />,
    );
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/blog/newer-1tag", "/blog/older-1tag"]);
  });

  it("honors the limit parameter (default 3)", () => {
    const current = post("current", ["go"], "2026-05-01T00:00:00.000Z");
    const candidates = Array.from({ length: 6 }, (_, i) =>
      post(`c${i}`, ["go"], `2026-04-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`),
    );
    render(
      <BlogRelatedPosts
        currentSlug="current"
        allPosts={[current, ...candidates]}
      />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("honors an explicit limit value", () => {
    const current = post("current", ["go"], "2026-05-01T00:00:00.000Z");
    const candidates = Array.from({ length: 6 }, (_, i) =>
      post(`c${i}`, ["go"], `2026-04-${String(i + 1).padStart(2, "0")}T00:00:00.000Z`),
    );
    render(
      <BlogRelatedPosts
        currentSlug="current"
        allPosts={[current, ...candidates]}
        limit={2}
      />,
    );
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("falls back to most-recent when nothing shares a tag", () => {
    const current = post("current", ["go"], "2026-05-01T00:00:00.000Z");
    const candidates = [
      post("old-other", ["docs"], "2026-01-01T00:00:00.000Z"),
      post("new-other", ["rust"], "2026-04-01T00:00:00.000Z"),
    ];
    render(
      <BlogRelatedPosts
        currentSlug="current"
        allPosts={[current, ...candidates]}
      />,
    );
    const links = screen.getAllByRole("link").map((a) => a.getAttribute("href"));
    expect(links).toEqual(["/blog/new-other", "/blog/old-other"]);
  });

  it("renders reading time alongside the related post titles", () => {
    const current = post("current", ["go"], "2026-05-01T00:00:00.000Z");
    const candidate: BlogPost = {
      ...post("c", ["go"], "2026-04-01T00:00:00.000Z"),
      readingTime: { text: "5 min read", minutes: 5, words: 1000 },
    };
    render(
      <BlogRelatedPosts
        currentSlug="current"
        allPosts={[current, candidate]}
      />,
    );
    expect(screen.getByText("5 min read")).toBeInTheDocument();
  });
});
