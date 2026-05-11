import { describe, it, expect, vi } from "vitest";

// Mock seo-keywords so we have predictable keyword output regardless
// of which production paths are configured.
const keywordsByPath: Record<string, string[]> = {
  "/docs": ["docs", "kw1"],
  "/docs/cli-reference/dev": ["cli", "dev"],
  "/blog/wire-explained": ["wire", "di", "go"],
  "/blog/no-keywords-post": [],
};
vi.mock("./seo-keywords", () => ({
  getKeywordsForPath: (path: string) => keywordsByPath[path] ?? [],
}));

import {
  buildBreadcrumbJsonLd,
  buildTechArticleJsonLd,
  buildBlogPostingJsonLd,
} from "./structured-data";

describe("buildBreadcrumbJsonLd", () => {
  it("emits a Home → root breadcrumb for an empty segments array", () => {
    const out = buildBreadcrumbJsonLd({
      rootPath: "/docs",
      rootName: "Docs",
      segments: [],
    });
    expect(out["@type"]).toBe("BreadcrumbList");
    expect(out.mainEntity["@id"]).toBe("https://gofasta.dev/docs");
    expect(out.itemListElement).toHaveLength(2);
    expect(out.itemListElement[0]).toMatchObject({
      position: 1,
      name: "Home",
      item: "https://gofasta.dev",
    });
    expect(out.itemListElement[1]).toMatchObject({
      position: 2,
      name: "Docs",
      item: "https://gofasta.dev/docs",
    });
  });

  it("title-cases segment names + builds the nested URLs correctly", () => {
    const out = buildBreadcrumbJsonLd({
      rootPath: "/docs",
      rootName: "Docs",
      segments: ["cli-reference", "dev"],
    });
    expect(out.itemListElement).toHaveLength(4);
    expect(out.itemListElement[2]).toMatchObject({
      position: 3,
      name: "Cli Reference",
      item: "https://gofasta.dev/docs/cli-reference",
    });
    expect(out.itemListElement[3]).toMatchObject({
      position: 4,
      name: "Dev",
      item: "https://gofasta.dev/docs/cli-reference/dev",
    });
    expect(out.mainEntity["@id"]).toBe(
      "https://gofasta.dev/docs/cli-reference/dev",
    );
  });

  it("works for the /blog root with a different rootName", () => {
    const out = buildBreadcrumbJsonLd({
      rootPath: "/blog",
      rootName: "Blog",
      segments: ["my-post"],
    });
    expect(out.itemListElement).toHaveLength(3);
    expect(out.itemListElement[1].name).toBe("Blog");
    expect(out.itemListElement[2].item).toBe("https://gofasta.dev/blog/my-post");
  });
});

describe("buildTechArticleJsonLd", () => {
  it("builds a /docs root payload", () => {
    const out = buildTechArticleJsonLd({
      segments: [],
      title: "Documentation",
      description: "Gofasta documentation.",
    });
    expect(out["@graph"]).toHaveLength(2);
    const article = out["@graph"][1] as Record<string, unknown>;
    expect(article["@type"]).toBe("TechArticle");
    expect(article.headline).toBe("Documentation");
    expect(article.url).toBe("https://gofasta.dev/docs");
    expect(article.articleSection).toBe("Docs");
    expect(article.image).toContain(
      "https://gofasta.dev/api/og?title=Documentation&section=Docs",
    );
    expect(article.keywords).toBe("docs, kw1");
  });

  it("builds a nested /docs/cli-reference/dev payload with the right section", () => {
    const out = buildTechArticleJsonLd({
      segments: ["cli-reference", "dev"],
      title: "gofasta dev",
      description: "Bring the full local environment up.",
    });
    const article = out["@graph"][1] as Record<string, unknown>;
    expect(article.url).toBe("https://gofasta.dev/docs/cli-reference/dev");
    expect(article.articleSection).toBe("Cli Reference");
    expect(article.keywords).toBe("cli, dev");
    // OG image URL must encode the title properly (space → %20).
    expect(article.image).toBe(
      "https://gofasta.dev/api/og?title=gofasta%20dev&section=Cli%20Reference",
    );
  });

  it("omits keywords field when getKeywordsForPath returns []", () => {
    const out = buildTechArticleJsonLd({
      segments: ["unknown-doc"],
      title: "Unknown",
      description: "Has no keywords mapping.",
    });
    const article = out["@graph"][1] as Record<string, unknown>;
    expect(article.keywords).toBeUndefined();
  });
});

describe("buildBlogPostingJsonLd", () => {
  it("builds a full payload with author URL + updatedAt", () => {
    const out = buildBlogPostingJsonLd({
      slug: "wire-explained",
      title: "Wire Explained",
      description: "Why we generate DI at compile time.",
      authorName: "Jane Doe",
      authorUrl: "https://gofasta.dev/about/jane",
      publishedAt: "2026-05-12T09:00:00.000Z",
      updatedAt: "2026-05-13T10:00:00.000Z",
      coverImageUrl: "https://gofasta.dev/api/og?title=Wire&section=Blog",
    });
    expect(out["@graph"]).toHaveLength(2);
    const post = out["@graph"][1] as Record<string, unknown>;
    expect(post["@type"]).toBe("BlogPosting");
    expect(post.headline).toBe("Wire Explained");
    expect(post.url).toBe("https://gofasta.dev/blog/wire-explained");
    expect(post.datePublished).toBe("2026-05-12T09:00:00.000Z");
    expect(post.dateModified).toBe("2026-05-13T10:00:00.000Z");
    expect(post.author).toMatchObject({
      "@type": "Person",
      name: "Jane Doe",
      url: "https://gofasta.dev/about/jane",
    });
    expect(post.image).toMatchObject({
      "@type": "ImageObject",
      url: "https://gofasta.dev/api/og?title=Wire&section=Blog",
      width: 1200,
      height: 630,
    });
    expect(post.keywords).toBe("wire, di, go");
    expect((post.mainEntityOfPage as Record<string, string>)["@id"]).toBe(
      "https://gofasta.dev/blog/wire-explained",
    );
  });

  it("omits author.url when not provided + falls back updatedAt to publishedAt", () => {
    const out = buildBlogPostingJsonLd({
      slug: "no-keywords-post",
      title: "Untitled",
      description: "—",
      authorName: "Gofasta Team",
      publishedAt: "2026-01-01T00:00:00.000Z",
      coverImageUrl: "https://gofasta.dev/api/og?title=Untitled&section=Blog",
    });
    const post = out["@graph"][1] as Record<string, unknown>;
    expect(post.dateModified).toBe(post.datePublished);
    expect(post.author).toEqual({
      "@type": "Person",
      name: "Gofasta Team",
    });
    expect((post.author as Record<string, unknown>).url).toBeUndefined();
    // Empty keywords → field omitted entirely.
    expect(post.keywords).toBeUndefined();
  });

  it("includes a typed WebPage mainEntityOfPage", () => {
    const out = buildBlogPostingJsonLd({
      slug: "x",
      title: "x",
      description: "x",
      authorName: "x",
      publishedAt: "2026-01-01",
      coverImageUrl: "https://gofasta.dev/api/og?title=x&section=Blog",
    });
    const post = out["@graph"][1] as Record<string, unknown>;
    expect(post.mainEntityOfPage).toMatchObject({
      "@type": "WebPage",
      "@id": "https://gofasta.dev/blog/x",
    });
  });
});
