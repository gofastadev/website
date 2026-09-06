import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { computeReadingTime, type ReadingTimeResult } from "./reading-time";

// One `.mdx` file per post; the filename becomes the slug, matching what
// Keystatic's `slugField: "title"` produces. Bodies are rendered at the
// route layer so this module stays pure data.
//
// Tags are lowercased and whitespace-collapsed here at the boundary, so
// `/blog/tags/Go` and `/blog/tags/go` can't become two pages with the
// same content under different cache keys.

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
  /**
   * Hidden from every production surface, but still rendered on preview
   * deploys and in dev so Keystatic's PR-mode review can see the post.
   * Missing means published, so posts predating the field stay live.
   */
  draft?: boolean;
  /**
   * Posts sharing an exact name form one series. Keystatic emits "" for
   * an untouched field, which means "no series" rather than an error.
   */
  series?: string;
  /**
   * 1-based position, explicit rather than derived from publishedAt so
   * parts can be backfilled without renumbering siblings.
   */
  seriesPart?: number;
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

// Returns null for malformed frontmatter, a missing or misshapen
// required field, or a publishedAt in the future.
//
// Future-dating hides a post from every surface, but it is not a
// scheduler: the date is evaluated at build time and nothing rebuilds on
// a timer, so a future-dated post appears at the next deploy after its
// date, not on the date itself.
function parsePost(
  filename: string,
  source: string,
  now: Date,
  includeDrafts: boolean,
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

  // YAML 1.2 has no timestamp type, so `yaml` v2 hands back ISO datetimes
  // as strings and Keystatic writes them quoted. Anything non-string here
  // is malformed input.
  if (typeof publishedAt !== "string") return null;
  const publishDate = new Date(publishedAt);
  if (Number.isNaN(publishDate.getTime())) return null;
  if (publishDate.getTime() > now.getTime()) return null;

  // Strict `=== true` so a missing or non-boolean value reads as
  // published, matching Keystatic checkbox semantics.
  if (fm.draft === true && !includeDrafts) return null;

  let updatedAt: string | undefined;
  if (typeof fm.updatedAt === "string") {
    // A malformed date would surface as an Invalid Date in sitemap
    // lastModified, JSON-LD dateModified, and OpenGraph modifiedTime.
    if (Number.isNaN(new Date(fm.updatedAt).getTime())) return null;
    updatedAt = fm.updatedAt;
  }

  const authorUrl =
    typeof fm.authorUrl === "string" && fm.authorUrl.length > 0
      ? fm.authorUrl
      : undefined;

  // Absent or empty means "not in a series"; any other non-string is
  // malformed.
  let series: string | undefined;
  if (fm.series !== undefined) {
    if (typeof fm.series !== "string") return null;
    const trimmed = fm.series.trim();
    if (trimmed.length > 0) series = trimmed;
  }

  // Rejecting a part without a series surfaces a half-filled Keystatic
  // form at build time rather than as broken nav in production.
  let seriesPart: number | undefined;
  if (fm.seriesPart !== undefined && fm.seriesPart !== null) {
    if (
      typeof fm.seriesPart !== "number" ||
      !Number.isInteger(fm.seriesPart) ||
      fm.seriesPart < 1
    ) {
      return null;
    }
    if (!series) return null;
    seriesPart = fm.seriesPart;
  }

  // Slugs are interpolated into hrefs, canonical URLs, RSS links, and
  // JSON-LD. Constraining the charset at this one boundary means no
  // downstream consumer has to reason about traversal sequences or URL
  // metacharacters coming out of a filename.
  const slug = filename.replace(/\.mdx$/, "");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return null;
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
    // Surfaced so previews can badge the post as a draft.
    draft: fm.draft === true,
    series,
    seriesPart,
  };
}

export interface BlogServiceOptions {
  now?: () => Date;
  /**
   * Defaults to the deploy context. Drafts render on previews and in dev
   * because Keystatic's PR mode exists to review a post on its preview
   * deploy, which the flag would otherwise prevent. Vercel noindexes
   * previews, so nothing leaks into search.
   */
  includeDrafts?: boolean;
}

export interface BlogService {
  getAllPosts(): BlogPost[];
  getPost(slug: string): BlogPost | null;
  getPostsByTag(tag: string): BlogPost[];
  getAdjacentPosts(slug: string): AdjacentPosts;
  getAllTags(): TagSummary[];
  getSeriesPosts(series: string): BlogPost[];
}

export function createBlogService(
  dir: string,
  opts: BlogServiceOptions = {},
): BlogService {
  const nowFn = opts.now ?? (() => new Date());
  const includeDrafts =
    opts.includeDrafts ?? process.env.VERCEL_ENV !== "production";

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
      const post = parsePost(filename, source, now, includeDrafts);
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
      // Newest-first, so "prev" is older and "next" is newer.
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
    getSeriesPosts(series: string) {
      // publishedAt breaks ties between posts claiming the same part;
      // posts with no part sort last.
      return loadAll()
        .filter((p) => p.series === series)
        .sort(
          (a, b) =>
            (a.seriesPart ?? Number.MAX_SAFE_INTEGER) -
              (b.seriesPart ?? Number.MAX_SAFE_INTEGER) ||
            Date.parse(a.publishedAt) - Date.parse(b.publishedAt),
        );
    },
  };
}

// Captured lazily, not at import: Next's build pipeline evaluates modules
// during analysis under a working directory that is not the project root,
// so binding at import time would freeze a stale path.
export function getDefaultBlogDir(): string {
  return path.join(process.cwd(), "data", "blog");
}

function getDefaultService(): BlogService {
  return createBlogService(getDefaultBlogDir());
}

export function getAllPosts(): BlogPost[] {
  return getDefaultService().getAllPosts();
}
export function getPost(slug: string): BlogPost | null {
  return getDefaultService().getPost(slug);
}
export function getPostsByTag(tag: string): BlogPost[] {
  return getDefaultService().getPostsByTag(tag);
}
export function getAdjacentPosts(slug: string): AdjacentPosts {
  return getDefaultService().getAdjacentPosts(slug);
}
export function getAllTags(): TagSummary[] {
  return getDefaultService().getAllTags();
}
export function getSeriesPosts(series: string): BlogPost[] {
  return getDefaultService().getSeriesPosts(series);
}
