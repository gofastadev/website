import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BlogPrevNext } from "./blog-prev-next";
import type { BlogPost } from "@/lib/blog";

function post(slug: string, title: string): BlogPost {
  return {
    slug,
    title,
    description: "",
    publishedAt: "2026-05-01T10:00:00.000Z",
    author: "X",
    tags: [],
    cover: "x.svg",
    coverUrl: "/blog/covers/x.svg",
    body: "",
    readingTime: { text: "1 min read", minutes: 0.5, words: 0 },
  };
}

describe("BlogPrevNext", () => {
  it("renders nothing when neither prev nor next is given", () => {
    const { container } = render(<BlogPrevNext prev={null} next={null} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders the prev link with an 'Older post' label", () => {
    render(
      <BlogPrevNext
        prev={post("old", "Old Title")}
        next={post("new", "New Title")}
      />,
    );
    const prevLink = screen.getByRole("link", { name: /Old Title/ });
    expect(prevLink).toHaveAttribute("href", "/blog/old");
    expect(screen.getByText("Older post")).toBeInTheDocument();
  });

  it("renders the next link with a 'Newer post' label", () => {
    render(
      <BlogPrevNext
        prev={post("old", "Old Title")}
        next={post("new", "New Title")}
      />,
    );
    const nextLink = screen.getByRole("link", { name: /New Title/ });
    expect(nextLink).toHaveAttribute("href", "/blog/new");
    expect(screen.getByText("Newer post")).toBeInTheDocument();
  });

  it("renders a placeholder slot when prev is null but next exists", () => {
    render(<BlogPrevNext prev={null} next={post("new", "New Title")} />);
    expect(screen.queryByText("Older post")).not.toBeInTheDocument();
    expect(screen.getByText("Newer post")).toBeInTheDocument();
    // The nav remains a 2-slot grid so the next link stays in its column.
    expect(screen.getByRole("navigation", { name: "Adjacent posts" })).toBeInTheDocument();
  });

  it("renders a placeholder slot when next is null but prev exists", () => {
    render(<BlogPrevNext prev={post("old", "Old Title")} next={null} />);
    expect(screen.getByText("Older post")).toBeInTheDocument();
    expect(screen.queryByText("Newer post")).not.toBeInTheDocument();
  });
});
