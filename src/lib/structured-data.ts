// ─────────────────────────────────────────────────────────────────────
// JSON-LD builders for every long-form content surface on the site.
//
// One module, two callers:
//
//   - The dynamic /docs route (Nextra MDX) → buildBreadcrumbJsonLd +
//     buildTechArticleJsonLd.
//   - The dynamic /blog routes (Keystatic-backed MDX) →
//     buildBreadcrumbJsonLd + buildBlogPostingJsonLd.
//
// Pulling the helpers out of the docs route page lets the blog route
// reuse the same breadcrumb logic and gives both schemas a single
// place to evolve when Google's recommendations change.
//
// Coverage note: this module is in the vitest 100%-threshold include
// set. Every branch below has matching test coverage in
// structured-data.test.ts.
// ─────────────────────────────────────────────────────────────────────

import { SITE_URL } from "./seo";

// Title-cases a kebab-case slug for display: "cli-reference" → "Cli Reference".
// Used both for breadcrumb item names and for the OG-image / article
// `section` so the on-page text and the structured data agree. Exported
// because callers outside this file (the blog [slug] route) derive
// `articleSection` from a slugged tag with the same casing rules.
export function humanize(slug: string): string {
  return slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── BreadcrumbList ────────────────────────────────────────────────────

export interface BreadcrumbInput {
  /** URL-space root for this surface, e.g. "/docs" or "/blog". */
  rootPath: string;
  /** Display name of the root (e.g. "Docs", "Blog"). */
  rootName: string;
  /** Path segments AFTER the root. Empty array means we're on the root itself. */
  segments: string[];
}

/**
 * Build a BreadcrumbList JSON-LD object for any path under a section
 * root. The returned object can be merged into a `@graph` array.
 */
export function buildBreadcrumbJsonLd(input: BreadcrumbInput) {
  const { rootPath, rootName, segments } = input;
  const fullUrl = `${SITE_URL}${rootPath}${
    segments.length > 0 ? `/${segments.join("/")}` : ""
  }`;

  const items = [
    { name: "Home", url: SITE_URL },
    { name: rootName, url: `${SITE_URL}${rootPath}` },
    ...segments.map((seg, i) => ({
      name: humanize(seg),
      url: `${SITE_URL}${rootPath}/${segments.slice(0, i + 1).join("/")}`,
    })),
  ];

  return {
    "@type": "BreadcrumbList" as const,
    // The breadcrumb's parent: Google groups sitelinks better when
    // BreadcrumbList nests under a WebPage with the current URL.
    mainEntity: { "@type": "WebPage" as const, "@id": fullUrl },
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem" as const,
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// ── TechArticle (for /docs) ───────────────────────────────────────────

export interface TechArticleInput {
  /** Path segments after /docs/, e.g. ["cli-reference", "dev"]. Empty for the index. */
  segments: string[];
  /** Page title from MDX frontmatter. */
  title: string;
  /** Page description from MDX frontmatter. */
  description: string;
  /** Fully-resolved keyword list (base + page-specific). Omitted/empty → no keywords field in the schema. */
  keywords?: readonly string[];
}

/**
 * Build the `@graph` (BreadcrumbList + TechArticle) JSON-LD payload
 * for any /docs page. Same contract as the legacy
 * buildStructuredData() that used to live in the docs page.
 */
export function buildTechArticleJsonLd(input: TechArticleInput) {
  const { segments, title, description, keywords = [] } = input;
  const urlPath = `/docs${segments.length > 0 ? `/${segments.join("/")}` : ""}`;
  const fullUrl = `${SITE_URL}${urlPath}`;
  const articleSection = segments[0] ? humanize(segments[0]) : "Docs";
  const ogImageUrl = `${SITE_URL}/api/og?title=${encodeURIComponent(
    title,
  )}&section=${encodeURIComponent(articleSection)}`;

  const breadcrumb = buildBreadcrumbJsonLd({
    rootPath: "/docs",
    rootName: "Docs",
    segments,
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumb,
      {
        "@type": "TechArticle",
        headline: title,
        description,
        url: fullUrl,
        inLanguage: "en",
        articleSection,
        keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
        image: ogImageUrl,
        author: { "@type": "Organization", name: "Gofasta" },
        publisher: {
          "@type": "Organization",
          name: "Gofasta",
          url: SITE_URL,
          logo: `${SITE_URL}/logo.png`,
        },
        mainEntityOfPage: fullUrl,
      },
    ],
  };
}

// ── BlogPosting (for /blog) ───────────────────────────────────────────

export interface BlogPostingInput {
  /** URL slug of the post, e.g. "wire-explained". */
  slug: string;
  /** Post title from frontmatter. */
  title: string;
  /** One-line description / excerpt from frontmatter. */
  description: string;
  /** Author name as displayed in the byline. */
  authorName: string;
  /** Optional URL for the author (links the @type:Person to a page). */
  authorUrl?: string;
  /** ISO 8601 datetime the post was first published. */
  publishedAt: string;
  /** ISO 8601 datetime of the most recent edit. Defaults to publishedAt when not given. */
  updatedAt?: string;
  /**
   * Cover-image URL — usually the per-post auto-generated OG image
   * (1200×630). Google requires W×H ≥ 50,000 pixels for Article rich
   * results; the OG dimensions give us ~756,000 px which passes.
   */
  coverImageUrl: string;
  /** Fully-resolved keyword list (base + per-post tags). Omitted/empty → no keywords field in the schema. */
  keywords?: readonly string[];
  /** Word count of the body — Google reads `wordCount` as an Article-eligibility signal. Omitted when undefined. */
  wordCount?: number;
  /** ISO 8601 duration ("PT5M") covering reading time. Omitted when undefined. */
  timeRequired?: string;
  /** Section / category label for the post (typically a humanized first tag). Omitted when undefined. */
  articleSection?: string;
}

/**
 * Build the `@graph` (BreadcrumbList + BlogPosting) JSON-LD payload
 * for any /blog/<slug> page. Schema.org BlogPosting is the right
 * @type for tech blogs per Google's Article rich-result docs.
 */
export function buildBlogPostingJsonLd(input: BlogPostingInput) {
  const {
    slug,
    title,
    description,
    authorName,
    authorUrl,
    publishedAt,
    updatedAt,
    coverImageUrl,
    keywords = [],
    wordCount,
    timeRequired,
    articleSection,
  } = input;
  const fullUrl = `${SITE_URL}/blog/${slug}`;

  const breadcrumb = buildBreadcrumbJsonLd({
    rootPath: "/blog",
    rootName: "Blog",
    segments: [slug],
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumb,
      {
        "@type": "BlogPosting",
        headline: title,
        description,
        url: fullUrl,
        inLanguage: "en",
        datePublished: publishedAt,
        dateModified: updatedAt ?? publishedAt,
        author: {
          "@type": "Person",
          name: authorName,
          // Google's Article guidelines recommend including author.url
          // when one exists — improves entity-linking in search.
          ...(authorUrl ? { url: authorUrl } : {}),
        },
        publisher: {
          "@type": "Organization",
          name: "Gofasta",
          url: SITE_URL,
          logo: `${SITE_URL}/logo.png`,
        },
        // Typed ImageObject is the recommended form for blog hero
        // images — Google uses width + height as eligibility signals
        // for Article rich results.
        image: {
          "@type": "ImageObject",
          url: coverImageUrl,
          width: 1200,
          height: 630,
        },
        keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
        // Optional Article-eligibility signals. Each is omitted when
        // undefined so the emitted JSON-LD stays tidy and the existing
        // "absent ≡ default" tests keep their meaning.
        wordCount,
        timeRequired,
        articleSection,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": fullUrl,
        },
      },
    ],
  };
}

// ── Blog (for the /blog index page) ───────────────────────────────────

export interface BlogIndexSummary {
  /** URL slug of the post. */
  slug: string;
  /** Post title. */
  title: string;
  /** Short description / dek used as the post summary in the Blog graph. */
  description: string;
  /** ISO 8601 datetime the post was first published. */
  publishedAt: string;
  /** ISO 8601 datetime of the most recent edit. Defaults to publishedAt when not given. */
  updatedAt?: string;
}

export interface BlogIndexInput {
  /** Posts to embed as summary `BlogPosting` nodes in the index graph. */
  posts: readonly BlogIndexSummary[];
}

/**
 * Build the `@graph` (Blog + BreadcrumbList) JSON-LD payload for the
 * /blog index page. The Blog node names the publication and embeds a
 * lightweight list of `BlogPosting` summaries (headline + URL + dates)
 * so crawlers can use the index as a hub even before they reach each
 * individual post page (where the full BlogPosting lives).
 */
export function buildBlogIndexJsonLd(input: BlogIndexInput) {
  const indexUrl = `${SITE_URL}/blog`;
  const breadcrumb = buildBreadcrumbJsonLd({
    rootPath: "/blog",
    rootName: "Blog",
    segments: [],
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumb,
      {
        "@type": "Blog",
        "@id": indexUrl,
        name: "Gofasta Blog",
        description:
          "Engineering notes on the Gofasta toolkit — CLI changes, library updates, and longer-form posts on Go backend topics.",
        url: indexUrl,
        inLanguage: "en",
        publisher: {
          "@type": "Organization",
          name: "Gofasta",
          url: SITE_URL,
          logo: `${SITE_URL}/logo.png`,
        },
        blogPost: input.posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.publishedAt,
          dateModified: p.updatedAt ?? p.publishedAt,
        })),
      },
    ],
  };
}
