import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { BlogSearch, scopeToBlogPosts } from "./blog-search";

function hit(url: string, title = url, excerpt = `<mark>x</mark>`) {
  return { url, title, excerpt };
}

describe("scopeToBlogPosts", () => {
  it("strips .html suffixes, keeps only /blog/ URLs, caps the count", () => {
    const hits = [
      hit("/blog/hello-gofasta.html"),
      hit("/docs/getting-started.html"),
      hit("/blog.html"),
      hit("/blog/tags/golang.html"),
      ...Array.from({ length: 12 }, (_, i) => hit(`/blog/post-${i}.html`)),
    ];
    const scoped = scopeToBlogPosts(hits);
    expect(scoped[0].url).toBe("/blog/hello-gofasta");
    expect(scoped.every((h) => h.url.startsWith("/blog/"))).toBe(true);
    expect(scoped.some((h) => h.url.endsWith(".html"))).toBe(false);
    expect(scoped).toHaveLength(10);
  });
});

describe("BlogSearch", () => {
  function fakePagefind(urls: string[]) {
    return {
      debouncedSearch: vi.fn().mockResolvedValue({
        results: urls.map((url) => ({
          data: () =>
            Promise.resolve({
              url,
              excerpt: `Matched <mark>term</mark> in ${url}`,
              meta: { title: `Title of ${url}` },
            }),
        })),
      }),
    };
  }

  it("renders blog-scoped results with clean hrefs and excerpt marks", async () => {
    const pagefind = fakePagefind([
      "/blog/first-post.html",
      "/docs/some-doc.html",
    ]);
    render(<BlogSearch loadPagefind={() => Promise.resolve(pagefind)} />);

    fireEvent.change(screen.getByLabelText("Search blog posts"), {
      target: { value: "term" },
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(pagefind.debouncedSearch).toHaveBeenCalledWith("term", {}, 250);
    const link = screen.getByRole("link", {
      name: "Title of /blog/first-post.html",
    });
    expect(link).toHaveAttribute("href", "/blog/first-post");
    expect(screen.queryByText(/some-doc/)).not.toBeInTheDocument();
    expect(document.querySelector("mark")).not.toBeNull();
  });

  it("shows the empty state when nothing in /blog matches", async () => {
    const pagefind = fakePagefind(["/docs/only-doc.html"]);
    render(<BlogSearch loadPagefind={() => Promise.resolve(pagefind)} />);

    fireEvent.change(screen.getByLabelText("Search blog posts"), {
      target: { value: "zzz" },
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByText(/No posts match/)).toBeInTheDocument();
  });

  it("degrades to a disabled input when the pagefind bundle cannot load", async () => {
    render(
      <BlogSearch
        loadPagefind={() => Promise.reject(new Error("404 in dev"))}
      />,
    );

    fireEvent.focus(screen.getByLabelText("Search blog posts"));
    await act(async () => {
      await Promise.resolve();
    });

    const input = screen.getByLabelText("Search blog posts");
    expect(input).toBeDisabled();
    expect(input).toHaveAttribute(
      "placeholder",
      "Search is available on the production build",
    );
  });

  it("discards superseded (null) debouncedSearch responses", async () => {
    const pagefind = {
      debouncedSearch: vi.fn().mockResolvedValue(null),
    };
    render(<BlogSearch loadPagefind={() => Promise.resolve(pagefind)} />);

    fireEvent.change(screen.getByLabelText("Search blog posts"), {
      target: { value: "fast typing" },
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
