import { describe, it, expect, vi, afterEach } from "vitest";
import {
  buildJsonFeed,
  buildRssFeed,
  renderMdxToHtml,
  type SiteMeta,
} from "./feed";
import type { BlogPost } from "./blog";

const META: SiteMeta = {
  siteUrl: "https://gofasta.dev",
  title: "Gofasta Blog",
  description: "Notes on the Gofasta toolkit.",
  language: "en-US",
};

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
    body: "# Heading\n\nA paragraph.",
    readingTime: { text: "1 min read", minutes: 0.5, words: 4 },
    ...overrides,
  };
}

describe("renderMdxToHtml", () => {
  it("converts heading + paragraph markdown to HTML", () => {
    const html = renderMdxToHtml("# Title\n\nFirst paragraph.");
    expect(html).toContain("<h1>Title</h1>");
    expect(html).toContain("<p>First paragraph.</p>");
  });

  it("renders code fences as <pre><code>", () => {
    const html = renderMdxToHtml("```go\nfunc Foo() {}\n```");
    expect(html).toContain("<pre>");
    expect(html).toContain("<code");
    expect(html).toContain("func Foo()");
  });

  it("returns an empty string for an empty input", () => {
    expect(renderMdxToHtml("")).toBe("");
  });
});

describe("buildRssFeed", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("declares dc + content + atom namespaces and the self link", () => {
    const xml = buildRssFeed([post()], META);
    expect(xml).toContain('xmlns:dc="http://purl.org/dc/elements/1.1/"');
    expect(xml).toContain(
      'xmlns:content="http://purl.org/rss/1.0/modules/content/"',
    );
    expect(xml).toContain('xmlns:atom="http://www.w3.org/2005/Atom"');
    expect(xml).toContain(
      '<atom:link href="https://gofasta.dev/blog/rss.xml" rel="self" type="application/rss+xml" />',
    );
  });

  it("emits a <dc:creator> per item (no email required)", () => {
    const xml = buildRssFeed([post({ author: "Jane Doe" })], META);
    expect(xml).toContain("<dc:creator>Jane Doe</dc:creator>");
    expect(xml).not.toMatch(/<author>.*<\/author>/);
  });

  it("includes one <category> per normalized tag", () => {
    const xml = buildRssFeed(
      [post({ tags: ["go", "open-source", "release-notes"] })],
      META,
    );
    expect(xml).toContain("<category>go</category>");
    expect(xml).toContain("<category>open-source</category>");
    expect(xml).toContain("<category>release-notes</category>");
  });

  it("uses the newest post's publishedAt as channel <lastBuildDate>", () => {
    const xml = buildRssFeed(
      [
        post({ slug: "newer", publishedAt: "2026-05-02T00:00:00.000Z" }),
        post({ slug: "older", publishedAt: "2026-04-01T00:00:00.000Z" }),
      ],
      META,
    );
    const expected = new Date("2026-05-02T00:00:00.000Z").toUTCString();
    expect(xml).toContain(`<lastBuildDate>${expected}</lastBuildDate>`);
  });

  it("falls back to current wall time when there are no posts", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-06-15T12:00:00.000Z"));
    const xml = buildRssFeed([], META);
    const expected = new Date("2026-06-15T12:00:00.000Z").toUTCString();
    expect(xml).toContain(`<lastBuildDate>${expected}</lastBuildDate>`);
    // Channel renders even with zero items
    expect(xml).toContain("<channel>");
    expect(xml).toContain("</channel>");
  });

  it("escapes XML-special characters in titles, descriptions, and authors", () => {
    const xml = buildRssFeed(
      [
        post({
          title: "Tags & <script> escape",
          description: "Has \"quotes\" and 'apostrophes'.",
          author: "Bobby <Tables>",
        }),
      ],
      META,
    );
    expect(xml).toContain("Tags &amp; &lt;script&gt; escape");
    expect(xml).toContain("&quot;quotes&quot;");
    expect(xml).toContain("&apos;apostrophes&apos;");
    expect(xml).toContain("Bobby &lt;Tables&gt;");
  });

  it("wraps the rendered HTML body in <content:encoded> CDATA", () => {
    const xml = buildRssFeed(
      [post({ body: "# Hello\n\nWorld." })],
      META,
    );
    expect(xml).toMatch(
      /<content:encoded><!\[CDATA\[[\s\S]*?<h1>Hello<\/h1>[\s\S]*?\]\]><\/content:encoded>/,
    );
  });
});

describe("buildJsonFeed", () => {
  it("emits a JSON Feed 1.1 envelope with feed metadata", () => {
    const feed = buildJsonFeed([post()], META);
    expect(feed.version).toBe("https://jsonfeed.org/version/1.1");
    expect(feed.title).toBe("Gofasta Blog");
    expect(feed.home_page_url).toBe("https://gofasta.dev/blog");
    expect(feed.feed_url).toBe("https://gofasta.dev/blog/feed.json");
    expect(feed.language).toBe("en-US");
    expect(feed.items).toHaveLength(1);
  });

  it("includes date_modified only when the post has updatedAt", () => {
    const withUpdate = buildJsonFeed(
      [
        post({
          slug: "with",
          updatedAt: "2026-05-15T00:00:00.000Z",
        }),
      ],
      META,
    );
    const withoutUpdate = buildJsonFeed([post({ slug: "without" })], META);
    expect(withUpdate.items[0].date_modified).toBe("2026-05-15T00:00:00.000Z");
    expect(withoutUpdate.items[0].date_modified).toBeUndefined();
  });

  it("renders an author with url when authorUrl is set, name-only otherwise", () => {
    const withUrl = buildJsonFeed(
      [post({ author: "Jane", authorUrl: "https://jane.example" })],
      META,
    );
    const nameOnly = buildJsonFeed(
      [post({ author: "Anonymous" })],
      META,
    );
    expect(withUrl.items[0].authors[0]).toEqual({
      name: "Jane",
      url: "https://jane.example",
    });
    expect(nameOnly.items[0].authors[0]).toEqual({ name: "Anonymous" });
  });

  it("makes the cover image URL absolute relative to siteUrl", () => {
    const relative = buildJsonFeed([post({ coverUrl: "/blog/covers/foo.svg" })], META);
    expect(relative.items[0].image).toBe(
      "https://gofasta.dev/blog/covers/foo.svg",
    );
  });

  it("passes an already-absolute cover URL through unchanged", () => {
    const absolute = buildJsonFeed(
      [post({ coverUrl: "https://cdn.example.com/foo.jpg" })],
      META,
    );
    expect(absolute.items[0].image).toBe("https://cdn.example.com/foo.jpg");
  });

  it("renders content_html from the post body", () => {
    const feed = buildJsonFeed(
      [post({ body: "# Hi\n\nbody" })],
      META,
    );
    expect(feed.items[0].content_html).toContain("<h1>Hi</h1>");
    expect(feed.items[0].content_html).toContain("<p>body</p>");
  });

  it("uses the post URL as both id and url", () => {
    const feed = buildJsonFeed([post({ slug: "my-post" })], META);
    expect(feed.items[0].id).toBe("https://gofasta.dev/blog/my-post");
    expect(feed.items[0].url).toBe("https://gofasta.dev/blog/my-post");
  });

  it("returns an empty items array for an empty post list", () => {
    expect(buildJsonFeed([], META).items).toEqual([]);
  });
});
