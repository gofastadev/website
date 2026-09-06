import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import {
  BlogSearch,
  defaultLoadPagefind,
  scopeToBlogPosts,
} from "./blog-search";

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

  it("loads the pagefind bundle once and reuses it across searches", async () => {
    const pagefind = fakePagefind(["/blog/first-post.html"]);
    const loadPagefind = vi.fn().mockResolvedValue(pagefind);
    render(<BlogSearch loadPagefind={loadPagefind} />);
    const input = screen.getByLabelText("Search blog posts");

    fireEvent.change(input, { target: { value: "one" } });
    await act(async () => {
      await Promise.resolve();
    });
    fireEvent.change(input, { target: { value: "two" } });
    await act(async () => {
      await Promise.resolve();
    });

    expect(loadPagefind).toHaveBeenCalledTimes(1);
    expect(pagefind.debouncedSearch).toHaveBeenCalledTimes(2);
  });

  it("abandons the search when typing while the bundle cannot load", async () => {
    render(
      <BlogSearch
        loadPagefind={() => Promise.reject(new Error("404 in dev"))}
      />,
    );

    fireEvent.change(screen.getByLabelText("Search blog posts"), {
      target: { value: "term" },
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(screen.getByLabelText("Search blog posts")).toBeDisabled();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("falls back to the URL as title when a result has no meta", async () => {
    const pagefind = {
      debouncedSearch: vi.fn().mockResolvedValue({
        results: [
          {
            data: () =>
              Promise.resolve({
                url: "/blog/untitled-post.html",
                excerpt: "An <mark>excerpt</mark>",
              }),
          },
        ],
      }),
    };
    render(<BlogSearch loadPagefind={() => Promise.resolve(pagefind)} />);

    fireEvent.change(screen.getByLabelText("Search blog posts"), {
      target: { value: "excerpt" },
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(
      screen.getByRole("link", { name: "/blog/untitled-post.html" }),
    ).toHaveAttribute("href", "/blog/untitled-post");
  });

  it("clears results without searching when the query is cleared", async () => {
    const pagefind = fakePagefind(["/blog/first-post.html"]);
    render(<BlogSearch loadPagefind={() => Promise.resolve(pagefind)} />);
    const input = screen.getByLabelText("Search blog posts");

    fireEvent.change(input, { target: { value: "term" } });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.getByRole("link")).toBeInTheDocument();

    fireEvent.change(input, { target: { value: "   " } });
    await act(async () => {
      await Promise.resolve();
    });
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    // Only the first change searched; whitespace short-circuits.
    expect(pagefind.debouncedSearch).toHaveBeenCalledTimes(1);
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

describe("defaultLoadPagefind", () => {
  it("imports the pagefind asset and applies the baseUrl option", async () => {
    const options = vi.fn().mockResolvedValue(undefined);
    const bundle = { debouncedSearch: vi.fn(), options };
    const importAsset = vi.fn().mockResolvedValue(bundle);

    const pagefind = await defaultLoadPagefind(importAsset);

    expect(importAsset).toHaveBeenCalledWith("/_pagefind/pagefind.js");
    expect(options).toHaveBeenCalledWith({ baseUrl: "/" });
    expect(pagefind).toBe(bundle);
  });

  it("tolerates a bundle without an options export", async () => {
    const bundle = { debouncedSearch: vi.fn() };
    await expect(
      defaultLoadPagefind(() => Promise.resolve(bundle)),
    ).resolves.toBe(bundle);
  });

  it("rejects through the real dynamic import when the asset is absent", async () => {
    // Outside a production build there is no /_pagefind asset to
    // resolve — the same failure BlogSearch degrades on in `next dev`.
    await expect(defaultLoadPagefind()).rejects.toBeDefined();
  });
});
