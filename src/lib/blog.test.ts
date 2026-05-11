import { describe, it, expect, beforeEach, afterEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import {
  createBlogService,
  slugifyTag,
  type BlogService,
} from "./blog";

// Each test gets its own temp blog directory. Mutating one fixture
// doesn't leak across tests, and we exercise the real filesystem
// behavior the production code path uses — no fs mocking.
let fixtureDir: string;
let service: BlogService;

const FROZEN_NOW = new Date("2026-06-01T00:00:00.000Z");

function writePost(slug: string, body: string) {
  fs.writeFileSync(path.join(fixtureDir, `${slug}.mdx`), body, "utf8");
}

function validFrontmatter(overrides: string[] = []): string {
  const lines = [
    'title: "Sample Post"',
    'description: "A sample post used in tests."',
    "publishedAt: 2026-04-01T10:00:00.000Z",
    'author: "Test Author"',
    'authorUrl: "https://example.com/author"',
    "tags:",
    "  - golang",
    "  - testing",
    'cover: "sample.jpg"',
    ...overrides,
  ];
  return `---\n${lines.join("\n")}\n---\n\nBody text here.\n`;
}

beforeEach(() => {
  fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), "blog-test-"));
  service = createBlogService(fixtureDir, { now: () => FROZEN_NOW });
});

afterEach(() => {
  fs.rmSync(fixtureDir, { recursive: true, force: true });
});

describe("slugifyTag", () => {
  it("lowercases, trims, and collapses whitespace", () => {
    expect(slugifyTag("  Go Lang  ")).toBe("go-lang");
    expect(slugifyTag("Hello World")).toBe("hello-world");
    expect(slugifyTag("ALREADY-SLUG")).toBe("already-slug");
  });
});

describe("createBlogService", () => {
  it("returns an empty list when the directory does not exist", () => {
    const missing = path.join(fixtureDir, "does-not-exist");
    const s = createBlogService(missing, { now: () => FROZEN_NOW });
    expect(s.getAllPosts()).toEqual([]);
    expect(s.getAllTags()).toEqual([]);
  });

  it("uses real wall-clock now() when no opts.now is given", () => {
    // Just constructing the service with default opts and calling
    // getAllPosts on an empty dir exercises the default-now branch
    // without coupling the test to wall time.
    const s = createBlogService(fixtureDir);
    expect(s.getAllPosts()).toEqual([]);
  });

  it("ignores non-mdx files and files starting with underscore", () => {
    writePost("real-post", validFrontmatter());
    fs.writeFileSync(path.join(fixtureDir, "_draft.mdx"), validFrontmatter());
    fs.writeFileSync(path.join(fixtureDir, "notes.md"), validFrontmatter());
    const posts = service.getAllPosts();
    expect(posts.map((p) => p.slug)).toEqual(["real-post"]);
  });

  it("sorts published posts newest-first by publishedAt", () => {
    writePost(
      "old",
      validFrontmatter(["publishedAt: 2026-01-01T10:00:00.000Z"]).replace(
        "publishedAt: 2026-04-01T10:00:00.000Z\n",
        "",
      ),
    );
    writePost(
      "new",
      validFrontmatter(["publishedAt: 2026-03-01T10:00:00.000Z"]).replace(
        "publishedAt: 2026-04-01T10:00:00.000Z\n",
        "",
      ),
    );
    writePost(
      "newest",
      validFrontmatter(["publishedAt: 2026-05-01T10:00:00.000Z"]).replace(
        "publishedAt: 2026-04-01T10:00:00.000Z\n",
        "",
      ),
    );
    expect(service.getAllPosts().map((p) => p.slug)).toEqual([
      "newest",
      "new",
      "old",
    ]);
  });

  it("hides posts whose publishedAt is in the future", () => {
    writePost(
      "published",
      validFrontmatter(["publishedAt: 2026-04-01T10:00:00.000Z"]).replace(
        "publishedAt: 2026-04-01T10:00:00.000Z\n",
        "",
      ),
    );
    writePost(
      "scheduled",
      validFrontmatter(["publishedAt: 2099-01-01T10:00:00.000Z"]).replace(
        "publishedAt: 2026-04-01T10:00:00.000Z\n",
        "",
      ),
    );
    expect(service.getAllPosts().map((p) => p.slug)).toEqual(["published"]);
  });

  it("parses a fully-populated post into the expected shape", () => {
    writePost("full", validFrontmatter());
    const post = service.getPost("full");
    expect(post).not.toBeNull();
    if (!post) return;
    expect(post.slug).toBe("full");
    expect(post.title).toBe("Sample Post");
    expect(post.description).toBe("A sample post used in tests.");
    expect(post.author).toBe("Test Author");
    expect(post.authorUrl).toBe("https://example.com/author");
    expect(post.tags).toEqual(["golang", "testing"]);
    expect(post.cover).toBe("sample.jpg");
    expect(post.coverUrl).toBe("/blog/covers/sample.jpg");
    expect(post.publishedAt).toBe("2026-04-01T10:00:00.000Z");
    expect(post.updatedAt).toBeUndefined();
    expect(post.body.trim()).toBe("Body text here.");
    expect(post.readingTime.text).toMatch(/min read/);
  });

  it("normalizes a cover path that already starts with `/` (no prefix)", () => {
    writePost(
      "abs-cover",
      validFrontmatter().replace(
        'cover: "sample.jpg"',
        'cover: "/custom/path/cover.jpg"',
      ),
    );
    expect(service.getPost("abs-cover")?.coverUrl).toBe(
      "/custom/path/cover.jpg",
    );
  });

  it("normalizes a cover URL with scheme (http/https) as a passthrough", () => {
    writePost(
      "remote-cover",
      validFrontmatter().replace(
        'cover: "sample.jpg"',
        'cover: "https://cdn.example.com/cover.jpg"',
      ),
    );
    expect(service.getPost("remote-cover")?.coverUrl).toBe(
      "https://cdn.example.com/cover.jpg",
    );
  });

  it("normalizes tags to lowercase slugs at the lib boundary", () => {
    writePost(
      "tagged",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags:\n  - GoLang\n  - Web Servers\n  - testing",
      ),
    );
    expect(service.getPost("tagged")?.tags).toEqual([
      "golang",
      "web-servers",
      "testing",
    ]);
  });

  it("preserves authorUrl when present, returns undefined when missing or empty", () => {
    writePost("with-url", validFrontmatter());
    writePost(
      "without-url",
      validFrontmatter().replace(
        'authorUrl: "https://example.com/author"\n',
        "",
      ),
    );
    writePost(
      "empty-url",
      validFrontmatter().replace(
        'authorUrl: "https://example.com/author"',
        'authorUrl: ""',
      ),
    );
    expect(service.getPost("with-url")?.authorUrl).toBe(
      "https://example.com/author",
    );
    expect(service.getPost("without-url")?.authorUrl).toBeUndefined();
    expect(service.getPost("empty-url")?.authorUrl).toBeUndefined();
  });

  it("parses updatedAt from string scalars (quoted or unquoted) and ignores non-strings", () => {
    // yaml v2 returns both quoted and unquoted ISO scalars as JS
    // strings, so both shapes round-trip through the post.
    writePost(
      "updated-unquoted",
      validFrontmatter(["updatedAt: 2026-04-15T10:00:00.000Z"]),
    );
    writePost(
      "updated-quoted",
      validFrontmatter(['updatedAt: "2026-04-20T10:00:00.000Z"']),
    );
    writePost(
      "updated-garbage",
      validFrontmatter(["updatedAt: 12345"]),
    );

    expect(service.getPost("updated-unquoted")?.updatedAt).toBe(
      "2026-04-15T10:00:00.000Z",
    );
    expect(service.getPost("updated-quoted")?.updatedAt).toBe(
      "2026-04-20T10:00:00.000Z",
    );
    expect(service.getPost("updated-garbage")?.updatedAt).toBeUndefined();
  });

  it("parses publishedAt from a quoted string and normalizes to ISO", () => {
    writePost(
      "quoted-date",
      validFrontmatter().replace(
        "publishedAt: 2026-04-01T10:00:00.000Z",
        'publishedAt: "2026-04-01T10:00:00.000Z"',
      ),
    );
    expect(service.getPost("quoted-date")?.publishedAt).toBe(
      "2026-04-01T10:00:00.000Z",
    );
  });

  it("rejects a post with no frontmatter at all", () => {
    fs.writeFileSync(
      path.join(fixtureDir, "no-frontmatter.mdx"),
      "Just a body, no fences.",
      "utf8",
    );
    expect(service.getPost("no-frontmatter")).toBeNull();
    expect(service.getAllPosts()).toEqual([]);
  });

  it("rejects a post with invalid YAML in the frontmatter", () => {
    fs.writeFileSync(
      path.join(fixtureDir, "broken-yaml.mdx"),
      "---\ntitle: \"unterminated\nfoo: [bar\n---\nBody",
      "utf8",
    );
    expect(service.getPost("broken-yaml")).toBeNull();
  });

  it("rejects a post whose frontmatter parses to a non-object scalar", () => {
    fs.writeFileSync(
      path.join(fixtureDir, "scalar.mdx"),
      "---\njust-a-string\n---\nBody",
      "utf8",
    );
    expect(service.getPost("scalar")).toBeNull();
  });

  it("rejects posts with missing required string fields", () => {
    for (const [name, mutation] of [
      ["no-title", (s: string) => s.replace('title: "Sample Post"\n', "")],
      [
        "no-desc",
        (s: string) =>
          s.replace('description: "A sample post used in tests."\n', ""),
      ],
      ["no-author", (s: string) => s.replace('author: "Test Author"\n', "")],
      ["no-cover", (s: string) => s.replace('cover: "sample.jpg"\n', "")],
    ] as const) {
      writePost(name, mutation(validFrontmatter()));
      expect(service.getPost(name)).toBeNull();
    }
  });

  it("rejects posts with non-string-array tags", () => {
    writePost(
      "tags-not-array",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags: not-an-array",
      ),
    );
    writePost(
      "tags-mixed",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags:\n  - golang\n  - 42",
      ),
    );
    expect(service.getPost("tags-not-array")).toBeNull();
    expect(service.getPost("tags-mixed")).toBeNull();
  });

  it("rejects posts with missing or invalid publishedAt", () => {
    // publishedAt as a number
    writePost(
      "pa-number",
      validFrontmatter().replace(
        "publishedAt: 2026-04-01T10:00:00.000Z",
        "publishedAt: 12345",
      ),
    );
    // publishedAt as an unparseable string
    writePost(
      "pa-garbage",
      validFrontmatter().replace(
        "publishedAt: 2026-04-01T10:00:00.000Z",
        'publishedAt: "not-a-date"',
      ),
    );
    expect(service.getPost("pa-number")).toBeNull();
    expect(service.getPost("pa-garbage")).toBeNull();
  });
});

describe("getPostsByTag", () => {
  beforeEach(() => {
    writePost(
      "a",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags:\n  - golang",
      ),
    );
    writePost(
      "b",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags:\n  - golang\n  - cli",
      ),
    );
    writePost(
      "c",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags:\n  - rust",
      ),
    );
  });

  it("returns posts whose tags include the normalized query", () => {
    expect(service.getPostsByTag("golang").map((p) => p.slug).sort()).toEqual([
      "a",
      "b",
    ]);
    expect(service.getPostsByTag("rust").map((p) => p.slug)).toEqual(["c"]);
  });

  it("matches regardless of case or whitespace in the query", () => {
    expect(service.getPostsByTag("  GoLang ").map((p) => p.slug).sort()).toEqual(
      ["a", "b"],
    );
  });

  it("returns an empty list when no post has the tag", () => {
    expect(service.getPostsByTag("nonexistent")).toEqual([]);
  });
});

describe("getAdjacentPosts", () => {
  beforeEach(() => {
    writePost(
      "oldest",
      validFrontmatter().replace(
        "publishedAt: 2026-04-01T10:00:00.000Z",
        "publishedAt: 2026-01-01T10:00:00.000Z",
      ),
    );
    writePost(
      "middle",
      validFrontmatter().replace(
        "publishedAt: 2026-04-01T10:00:00.000Z",
        "publishedAt: 2026-02-01T10:00:00.000Z",
      ),
    );
    writePost(
      "newest",
      validFrontmatter().replace(
        "publishedAt: 2026-04-01T10:00:00.000Z",
        "publishedAt: 2026-03-01T10:00:00.000Z",
      ),
    );
  });

  it("returns prev=older, next=newer for a middle post", () => {
    const { prev, next } = service.getAdjacentPosts("middle");
    expect(prev?.slug).toBe("oldest");
    expect(next?.slug).toBe("newest");
  });

  it("returns prev=null for the oldest post", () => {
    const { prev, next } = service.getAdjacentPosts("oldest");
    expect(prev).toBeNull();
    expect(next?.slug).toBe("middle");
  });

  it("returns next=null for the newest post", () => {
    const { prev, next } = service.getAdjacentPosts("newest");
    expect(prev?.slug).toBe("middle");
    expect(next).toBeNull();
  });

  it("returns both null when the slug is unknown", () => {
    expect(service.getAdjacentPosts("ghost")).toEqual({
      prev: null,
      next: null,
    });
  });
});

describe("getAllTags", () => {
  it("aggregates tag counts and sorts by count desc, then alpha asc", () => {
    writePost(
      "a",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags:\n  - golang\n  - cli",
      ),
    );
    writePost(
      "b",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags:\n  - golang\n  - api",
      ),
    );
    writePost(
      "c",
      validFrontmatter().replace(
        "tags:\n  - golang\n  - testing",
        "tags:\n  - golang",
      ),
    );
    const tags = service.getAllTags();
    expect(tags).toEqual([
      { tag: "golang", count: 3 },
      { tag: "api", count: 1 },
      { tag: "cli", count: 1 },
    ]);
  });

  it("returns an empty list when there are no posts", () => {
    expect(service.getAllTags()).toEqual([]);
  });
});

describe("default service exports", () => {
  it("are callable and return arrays / null for missing slugs", async () => {
    // Importing the module already constructs the default service
    // against `process.cwd()/src/content/blog`. We just call each
    // exported function once to exercise the binding line; we don't
    // assert on the content (it depends on the real repo state).
    const blog = await import("./blog");
    expect(Array.isArray(blog.getAllPosts())).toBe(true);
    expect(Array.isArray(blog.getAllTags())).toBe(true);
    expect(Array.isArray(blog.getPostsByTag("anything"))).toBe(true);
    expect(blog.getPost("__definitely_not_a_real_slug__")).toBeNull();
    expect(blog.getAdjacentPosts("__nope__")).toEqual({
      prev: null,
      next: null,
    });
  });
});
