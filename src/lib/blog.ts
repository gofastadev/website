import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { computeReadingTime, type ReadingTimeResult } from "./reading-time";

// ─────────────────────────────────────────────────────────────────────
// src/lib/blog.ts
//
// Filesystem-backed reader over MDX posts in `src/content/blog/`. The
// reader is exposed via a factory (`createBlogService(dir)`) so tests
// can point at a fixture directory, and the project's default surface
// (used by routes) is constructed once from `process.cwd()`.
//
// Authoring model: each post is one `.mdx` file at the blog directory
// root. The filename (without extension) becomes the slug, which is
// what Keystatic's `slugField: "title"` produces too. Frontmatter is
// YAML; the body after the closing `---` is rendered with
// `next-mdx-remote/rsc` at the route layer (not here — this module
// stays pure data).
//
// Tag normalization happens at the lib boundary: every tag is
// lowercased + whitespace-collapsed to a slug. This prevents
// `/blog/tags/Go` and `/blog/tags/go` from rendering two pages with
// the same content but different cache keys.
// ─────────────────────────────────────────────────────────────────────

const COVER_PUBLIC_PATH = "/blog/covers/";

export interface BlogPostFrontmatter {
  title: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  author: string;
  authorUrl?: string;
  tags: string[];
  cover: string;
}

export interface BlogPost extends BlogPostFrontmatter {
  slug: string;
  body: string;
  coverUrl: string;
  readingTime: ReadingTimeResult;
}

export interface TagSummary {
  tag: string;
  count: number;
}

export interface AdjacentPosts {
  prev: BlogPost | null;
  next: BlogPost | null;
}

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/\s+/g, "-");
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function resolveCoverUrl(cover: string): string {
  if (cover.startsWith("/") || cover.startsWith("http")) return cover;
  return `${COVER_PUBLIC_PATH}${cover}`;
}

// parsePost returns null when:
//   - the file isn't valid MDX with YAML frontmatter,
//   - any required field is missing or the wrong shape, or
//   - the post's publishedAt is in the future (relative to `now`).
//
// Future-dating is the project's de-facto scheduling primitive: an
// editor can land a PR ahead of time and the post stays hidden from
// `/blog`, `/blog/[slug]`, RSS, JSON Feed, sitemap, and tag pages
// until the scheduled date arrives and the next build runs.
function parsePost(
  filename: string,
  source: string,
  now: Date,
): BlogPost | null {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;

  let raw: unknown;
  try {
    raw = parseYaml(match[1]);
  } catch {
    return null;
  }
  if (!raw || typeof raw !== "object") return null;
  const fm = raw as Record<string, unknown>;

  const title = fm.title;
  const description = fm.description;
  const publishedAt = fm.publishedAt;
  const author = fm.author;
  const tags = fm.tags;
  const cover = fm.cover;

  if (
    typeof title !== "string" ||
    typeof description !== "string" ||
    typeof author !== "string" ||
    typeof cover !== "string" ||
    !isStringArray(tags)
  ) {
    return null;
  }

  // `yaml` v2 parses ISO datetime scalars as strings by default (YAML
  // 1.2 doesn't recognize the timestamp type), and Keystatic emits
  // datetime fields as quoted ISO strings. So treat `publishedAt` and
  // `updatedAt` strictly as strings — anything else is invalid input.
  if (typeof publishedAt !== "string") return null;
  const publishDate = new Date(publishedAt);
  if (Number.isNaN(publishDate.getTime())) return null;
  if (publishDate.getTime() > now.getTime()) return null;

  const updatedAt =
    typeof fm.updatedAt === "string" ? fm.updatedAt : undefined;

  const authorUrl =
    typeof fm.authorUrl === "string" && fm.authorUrl.length > 0
      ? fm.authorUrl
      : undefined;

  const slug = filename.replace(/\.mdx$/, "");
  const body = match[2];

  return {
    slug,
    title,
    description,
    publishedAt,
    updatedAt,
    author,
    authorUrl,
    tags: tags.map(slugifyTag),
    cover,
    coverUrl: resolveCoverUrl(cover),
    body,
    readingTime: computeReadingTime(body),
  };
}

export interface BlogServiceOptions {
  now?: () => Date;
}

export interface BlogService {
  getAllPosts(): BlogPost[];
  getPost(slug: string): BlogPost | null;
  getPostsByTag(tag: string): BlogPost[];
  getAdjacentPosts(slug: string): AdjacentPosts;
  getAllTags(): TagSummary[];
}

export function createBlogService(
  dir: string,
  opts: BlogServiceOptions = {},
): BlogService {
  const nowFn = opts.now ?? (() => new Date());

  function listFiles(): string[] {
    if (!fs.existsSync(dir)) return [];
    return fs
      .readdirSync(dir)
      .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));
  }

  function loadAll(): BlogPost[] {
    const now = nowFn();
    const posts: BlogPost[] = [];
    for (const filename of listFiles()) {
      const source = fs.readFileSync(path.join(dir, filename), "utf8");
      const post = parsePost(filename, source, now);
      if (post) posts.push(post);
    }
    return posts.sort(
      (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
    );
  }

  return {
    getAllPosts: loadAll,
    getPost(slug: string) {
      return loadAll().find((p) => p.slug === slug) ?? null;
    },
    getPostsByTag(tag: string) {
      const normalized = slugifyTag(tag);
      return loadAll().filter((p) => p.tags.includes(normalized));
    },
    getAdjacentPosts(slug: string) {
      const posts = loadAll();
      const index = posts.findIndex((p) => p.slug === slug);
      if (index === -1) return { prev: null, next: null };
      // posts are newest-first → "prev" reads older, "next" reads newer.
      return {
        prev: posts[index + 1] ?? null,
        next: posts[index - 1] ?? null,
      };
    },
    getAllTags() {
      const counts = new Map<string, number>();
      for (const post of loadAll()) {
        for (const tag of post.tags) {
          counts.set(tag, (counts.get(tag) ?? 0) + 1);
        }
      }
      return [...counts.entries()]
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
    },
  };
}

export const DEFAULT_BLOG_DIR = path.join(
  process.cwd(),
  "src",
  "content",
  "blog",
);

const defaultService = createBlogService(DEFAULT_BLOG_DIR);

export const getAllPosts = defaultService.getAllPosts;
export const getPost = defaultService.getPost;
export const getPostsByTag = defaultService.getPostsByTag;
export const getAdjacentPosts = defaultService.getAdjacentPosts;
export const getAllTags = defaultService.getAllTags;
