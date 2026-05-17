import { describe, it, expect } from "vitest";
import {
  buildBreadcrumbJsonLd,
  buildTechArticleJsonLd,
  buildBlogPostingJsonLd,
  buildBlogIndexJsonLd,
  humanize,
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
  it("builds a /docs root payload with passed-in keywords", () => {
    const out = buildTechArticleJsonLd({
      segments: [],
      title: "Documentation",
      description: "Gofasta documentation.",
      keywords: ["docs", "kw1"],
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
      keywords: ["cli", "dev"],
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

  it("omits the keywords field when keywords is omitted from the input", () => {
    const out = buildTechArticleJsonLd({
      segments: ["unknown-doc"],
      title: "Unknown",
      description: "Has no keywords passed.",
    });
    const article = out["@graph"][1] as Record<string, unknown>;
    expect(article.keywords).toBeUndefined();
  });

  it("omits the keywords field when keywords is an empty array", () => {
    const out = buildTechArticleJsonLd({
      segments: ["empty"],
      title: "Empty",
      description: "Empty keyword list.",
      keywords: [],
    });
    const article = out["@graph"][1] as Record<string, unknown>;
    expect(article.keywords).toBeUndefined();
  });
});

describe("buildBlogPostingJsonLd", () => {
  it("builds a full payload with author URL + updatedAt + keywords", () => {
    const out = buildBlogPostingJsonLd({
      slug: "wire-explained",
      title: "Wire Explained",
      description: "Why we generate DI at compile time.",
      authorName: "Jane Doe",
      authorUrl: "https://gofasta.dev/about/jane",
      publishedAt: "2026-05-12T09:00:00.000Z",
      updatedAt: "2026-05-13T10:00:00.000Z",
      coverImageUrl: "https://gofasta.dev/api/og?title=Wire&section=Blog",
      keywords: ["wire", "di", "go"],
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

  it("omits author.url when not provided + falls back updatedAt to publishedAt + omits keywords when absent", () => {
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
    // Empty/missing keywords → field omitted entirely.
    expect(post.keywords).toBeUndefined();
  });

  it("omits the keywords field when keywords is an empty array", () => {
    const out = buildBlogPostingJsonLd({
      slug: "empty-keywords",
      title: "Empty",
      description: "Empty list.",
      authorName: "Gofasta Team",
      publishedAt: "2026-01-01T00:00:00.000Z",
      coverImageUrl: "https://gofasta.dev/api/og?title=Empty&section=Blog",
      keywords: [],
    });
    const post = out["@graph"][1] as Record<string, unknown>;
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

  it("includes wordCount / timeRequired / articleSection when provided", () => {
    const out = buildBlogPostingJsonLd({
      slug: "rich",
      title: "Rich",
      description: "All optionals set.",
      authorName: "Gofasta Team",
      publishedAt: "2026-01-01T00:00:00.000Z",
      coverImageUrl: "https://gofasta.dev/api/og?title=Rich&section=Blog",
      wordCount: 1200,
      timeRequired: "PT6M",
      articleSection: "Golang",
    });
    const post = out["@graph"][1] as Record<string, unknown>;
    expect(post.wordCount).toBe(1200);
    expect(post.timeRequired).toBe("PT6M");
    expect(post.articleSection).toBe("Golang");
  });

  it("omits wordCount / timeRequired / articleSection when undefined", () => {
    const out = buildBlogPostingJsonLd({
      slug: "lean",
      title: "Lean",
      description: "Defaults only.",
      authorName: "Gofasta Team",
      publishedAt: "2026-01-01T00:00:00.000Z",
      coverImageUrl: "https://gofasta.dev/api/og?title=Lean&section=Blog",
    });
    const post = out["@graph"][1] as Record<string, unknown>;
    expect(post.wordCount).toBeUndefined();
    expect(post.timeRequired).toBeUndefined();
    expect(post.articleSection).toBeUndefined();
  });
});

describe("buildBlogIndexJsonLd", () => {
  it("emits a Blog node with breadcrumb and summary BlogPosting items", () => {
    const out = buildBlogIndexJsonLd({
      posts: [
        {
          slug: "a",
          title: "A",
          description: "First.",
          publishedAt: "2026-05-01T00:00:00.000Z",
          updatedAt: "2026-05-02T00:00:00.000Z",
        },
        {
          slug: "b",
          title: "B",
          description: "Second.",
          publishedAt: "2026-04-01T00:00:00.000Z",
        },
      ],
    });
    expect(out["@graph"]).toHaveLength(2);

    const breadcrumb = out["@graph"][0] as Record<string, unknown>;
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect((breadcrumb.itemListElement as unknown[])).toHaveLength(2);

    const blog = out["@graph"][1] as Record<string, unknown>;
    expect(blog["@type"]).toBe("Blog");
    expect(blog["@id"]).toBe("https://gofasta.dev/blog");
    expect(blog.url).toBe("https://gofasta.dev/blog");
    expect(blog.inLanguage).toBe("en");
    expect(blog.publisher).toMatchObject({
      "@type": "Organization",
      name: "Gofasta",
      url: "https://gofasta.dev",
      logo: "https://gofasta.dev/logo.png",
    });

    const items = blog.blogPost as Array<Record<string, unknown>>;
    expect(items).toHaveLength(2);
    expect(items[0]).toMatchObject({
      "@type": "BlogPosting",
      headline: "A",
      description: "First.",
      url: "https://gofasta.dev/blog/a",
      datePublished: "2026-05-01T00:00:00.000Z",
      dateModified: "2026-05-02T00:00:00.000Z",
    });
    // updatedAt falls back to publishedAt when missing.
    expect(items[1]).toMatchObject({
      "@type": "BlogPosting",
      headline: "B",
      url: "https://gofasta.dev/blog/b",
      datePublished: "2026-04-01T00:00:00.000Z",
      dateModified: "2026-04-01T00:00:00.000Z",
    });
  });

  it("works with an empty post list", () => {
    const out = buildBlogIndexJsonLd({ posts: [] });
    const blog = out["@graph"][1] as Record<string, unknown>;
    expect(blog.blogPost).toEqual([]);
  });
});

describe("humanize export", () => {
  it("title-cases a kebab-case slug", () => {
    expect(humanize("cli-reference")).toBe("Cli Reference");
    expect(humanize("go")).toBe("Go");
    expect(humanize("multi-word-tag")).toBe("Multi Word Tag");
  });
});
