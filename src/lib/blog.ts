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

// Reduced to `[a-z0-9-]` because the result is interpolated raw into
// hrefs, sitemap entries, and JSON-LD: a `#`, `/`, or `?` would turn
// `/blog/tags/c#` into a fragment link or a two-segment path that 404s.
// Diacritics fold to their base letter ("Café" -> "cafe"). A tag made of
// punctuation only slugifies to "" and is dropped by the parser.
export function slugifyTag(tag: string): string {
  return tag
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// The article header already renders the title, so a body that opens
// with the same `# Title` would show it twice — on the page and in feeds.
export function stripTitleH1(body: string, title: string): string {
  const match = body.match(/^\s*#\s+(.+?)\s*\n+/);
  if (!match) return body;
  if (match[1].trim().toLowerCase() !== title.trim().toLowerCase()) return body;
  return body.slice(match[0].length);
}

function resolveCoverUrl(cover: string): string {
  if (cover.startsWith("/") || cover.startsWith("http")) return cover;
  return `${COVER_PUBLIC_PATH}${cover}`;
}

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

type ParseResult =
  | { post: BlogPost }
  | { skip: "draft" | "scheduled" }
  | { error: string };

// Drafts and future-dated posts are skipped on purpose; anything else that
// stops a post from loading is an `error` with a reason an editor can act
// on. Errors used to vanish silently — a Keystatic save with an empty
// field just made the post disappear — so they are now logged at build
// time and fail CI through `blog-content.test.ts`.
//
// Future-dating hides a post from every surface. The date is evaluated at
// build time, so the post appears at the first rebuild after its date —
// the daily scheduled-publish workflow guarantees one within a day.
function parsePost(
  filename: string,
  source: string,
  now: Date,
  includeDrafts: boolean,
): ParseResult {
  const slug = filename.replace(/\.mdx$/, "");
  // Slugs are interpolated into hrefs, canonical URLs, RSS links, and
  // JSON-LD. Constraining the charset at this one boundary means no
  // downstream consumer has to reason about traversal sequences or URL
  // metacharacters coming out of a filename.
  if (!SLUG_PATTERN.test(slug)) {
    return {
      error: `filename "${filename}" must be lowercase letters, digits, and single hyphens`,
    };
  }

  const match = source
    .replace(/^\uFEFF/, "")
    .match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { error: "missing --- frontmatter block" };

  let raw: unknown;
  try {
    raw = parseYaml(match[1]);
  } catch (err) {
    return { error: `frontmatter is not valid YAML: ${(err as Error).message}` };
  }
  if (!raw || typeof raw !== "object") {
    return { error: "frontmatter is empty" };
  }
  const fm = raw as Record<string, unknown>;

  for (const field of ["title", "description", "author", "cover"] as const) {
    if (typeof fm[field] !== "string" || (fm[field] as string).trim() === "") {
      return { error: `"${field}" is required` };
    }
  }
  const title = fm.title as string;
  const description = fm.description as string;
  const author = fm.author as string;
  const cover = fm.cover as string;

  // Keystatic writes an empty tag row as `null`; drop it rather than the
  // whole post. Anything else that is not a string is malformed.
  if (fm.tags !== undefined && fm.tags !== null && !Array.isArray(fm.tags)) {
    return { error: '"tags" must be a list' };
  }
  const rawTags = (fm.tags ?? []) as unknown[];
  if (rawTags.some((t) => t !== null && typeof t !== "string")) {
    return { error: '"tags" must contain only text' };
  }
  const tags = [
    ...new Set(
      (rawTags.filter((t) => typeof t === "string") as string[])
        .map(slugifyTag)
        .filter((t) => t.length > 0),
    ),
  ];

  // YAML 1.2 has no timestamp type, so `yaml` v2 hands back ISO datetimes
  // as strings and Keystatic writes them quoted. Anything non-string here
  // is malformed input.
  const publishedAt = fm.publishedAt;
  if (typeof publishedAt !== "string") {
    return { error: '"publishedAt" is required' };
  }
  const publishDate = new Date(publishedAt);
  if (Number.isNaN(publishDate.getTime())) {
    return { error: `"publishedAt" is not a valid date: ${publishedAt}` };
  }

  let updatedAt: string | undefined;
  if (typeof fm.updatedAt === "string") {
    // A malformed date would surface as an Invalid Date in sitemap
    // lastModified, JSON-LD dateModified, and OpenGraph modifiedTime.
    if (Number.isNaN(new Date(fm.updatedAt).getTime())) {
      return { error: `"updatedAt" is not a valid date: ${fm.updatedAt}` };
    }
    updatedAt = fm.updatedAt;
  }

  const authorUrl =
    typeof fm.authorUrl === "string" && fm.authorUrl.length > 0
      ? fm.authorUrl
      : undefined;

  // Absent or empty means "not in a series"; any other non-string is
  // malformed.
  let series: string | undefined;
  if (fm.series !== undefined && fm.series !== null) {
    if (typeof fm.series !== "string") {
      return { error: '"series" must be text' };
    }
    const trimmed = fm.series.trim();
    if (trimmed.length > 0) series = trimmed;
  }

  let seriesPart: number | undefined;
  if (fm.seriesPart !== undefined && fm.seriesPart !== null) {
    if (
      typeof fm.seriesPart !== "number" ||
      !Number.isInteger(fm.seriesPart) ||
      fm.seriesPart < 1
    ) {
      return { error: '"seriesPart" must be a whole number of 1 or more' };
    }
    if (!series) {
      return { error: '"seriesPart" is set but "series" is empty' };
    }
    seriesPart = fm.seriesPart;
  }

  // Validation runs before these skips so a draft with a broken field
  // still fails CI while it is being reviewed.
  if (publishDate.getTime() > now.getTime()) return { skip: "scheduled" };
  // Strict `=== true` so a missing or non-boolean value reads as
  // published, matching Keystatic checkbox semantics.
  if (fm.draft === true && !includeDrafts) return { skip: "draft" };

  const body = match[2];
  return {
    post: {
      slug,
      title,
      description,
      publishedAt,
      updatedAt,
      author,
      authorUrl,
      tags,
      cover,
      coverUrl: resolveCoverUrl(cover),
      body,
      readingTime: computeReadingTime(body),
      // Surfaced so previews can badge the post as a draft.
      draft: fm.draft === true,
      series,
      seriesPart,
    },
  };
}

/**
 * Returns why a post file would fail to load, or null when it is valid.
 * Drafts and scheduled posts are valid. Used by the content test that
 * gates every Keystatic pull request.
 */
export function validatePostFile(
  filename: string,
  source: string,
): string | null {
  const result = parsePost(filename, source, new Date(0), true);
  return "error" in result ? result.error : null;
}

export interface BlogServiceOptions {
  now?: () => Date;
  /**
   * Defaults to the deploy context, failing closed: drafts render only on
   * Vercel preview deploys and under `next dev`, because Keystatic's PR
   * mode exists to review a post on its preview deploy. Every other build
   * — Vercel production, Docker, a local `next build` — hides them, so a
   * deploy that lacks VERCEL_ENV cannot publish drafts.
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
    opts.includeDrafts ??
    (process.env.VERCEL_ENV === "preview" ||
      process.env.NODE_ENV === "development");

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
      const result = parsePost(filename, source, now, includeDrafts);
      if ("post" in result) posts.push(result.post);
      else if ("error" in result) {
        console.warn(`[blog] skipping data/blog/${filename}: ${result.error}`);
      }
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
