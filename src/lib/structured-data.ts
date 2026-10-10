// JSON-LD builders shared by the /docs and /blog routes, so both
// schemas move together when Google's recommendations change.

import { SITE_URL } from "./seo";

// One canonical Organization node, referenced by @id from every
// publisher/author field, so Google merges the entity across pages
// instead of seeing disconnected inline copies. The logo is a typed
// ImageObject at 512×512, above Google's 112×112 minimum.
export const ORG_ID = `${SITE_URL}/#organization`;

export function buildOrganizationNode() {
  return {
    "@type": "Organization" as const,
    "@id": ORG_ID,
    name: "Gofasta",
    url: SITE_URL,
    logo: {
      "@type": "ImageObject" as const,
      url: `${SITE_URL}/logo.png`,
      width: 512,
      height: 512,
    },
    sameAs: ["https://github.com/gofastadev"],
  };
}

// "cli-reference" → "Cli Reference". Shared with the OG image and
// article section so on-page text and structured data agree.
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
    "@id": `${fullUrl}#breadcrumb`,
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

/** The `@graph` (BreadcrumbList + TechArticle) payload for a /docs page. */
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
        author: buildOrganizationNode(),
        publisher: buildOrganizationNode(),
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
  /**
   * Optional additional image variants. Google's Article guidance asks
   * for multiple high-resolution images in 16:9, 4:3, and 1:1 aspect
   * ratios — the build derives 4:3 and 1:1 crops next to each cover.
   * Width/height are included only when actually measured; a remote
   * cover whose dimensions are unknown is emitted as a bare URL rather
   * than with invented numbers.
   */
  images?: ReadonlyArray<{ url: string; width?: number; height?: number }>;
  /**
   * Schema type for the author. "Gofasta Team" is an organization, not
   * a person — Google's author best practices say to use the type that
   * matches reality. Defaults to Person.
   */
  authorType?: "Person" | "Organization";
  /** Fully-resolved keyword list (base + per-post tags). Omitted/empty → no keywords field in the schema. */
  keywords?: readonly string[];
  /** Word count of the body — Google reads `wordCount` as an Article-eligibility signal. Omitted when undefined. */
  wordCount?: number;
  /** ISO 8601 duration ("PT5M") covering reading time. Omitted when undefined. */
  timeRequired?: string;
  /** Section / category label for the post (typically a humanized first tag). Omitted when undefined. */
  articleSection?: string;
  /** Multi-part series name — adds a CreativeWorkSeries to isPartOf. Omitted when undefined. */
  seriesName?: string;
  /** 1-based position within the series — emitted as `position`. Omitted when undefined. */
  seriesPosition?: number;
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
    images,
    authorType = "Person",
    keywords = [],
    wordCount,
    timeRequired,
    articleSection,
    seriesName,
    seriesPosition,
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
          "@type": authorType,
          name: authorName,
          // Google's Article guidelines recommend including author.url
          // when one exists — improves entity-linking in search.
          ...(authorUrl ? { url: authorUrl } : {}),
        },
        publisher: buildOrganizationNode(),
        // Multiple aspect-ratio variants when the caller measured them
        // (Google's recommended 16:9 / 4:3 / 1:1 set); otherwise the
        // cover URL alone. Dimensions are never invented.
        image:
          images && images.length > 0
            ? images.map((img) => ({
                "@type": "ImageObject",
                url: img.url,
                ...(img.width && img.height
                  ? { width: img.width, height: img.height }
                  : {}),
              }))
            : coverImageUrl,
        keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
        // Optional Article-eligibility signals. Each is omitted when
        // undefined so the emitted JSON-LD stays tidy and the existing
        // "absent ≡ default" tests keep their meaning.
        wordCount,
        timeRequired,
        articleSection,
        // A series post belongs to both the blog and its
        // CreativeWorkSeries; `position` is the schema.org signal for
        // "Part N".
        isPartOf: seriesName
          ? [
              { "@type": "Blog", "@id": `${SITE_URL}/blog` },
              { "@type": "CreativeWorkSeries", name: seriesName },
            ]
          : { "@type": "Blog", "@id": `${SITE_URL}/blog` },
        position: seriesPosition,
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
  /** Absolute cover-image URL for the summary node. Omitted when absent. */
  image?: string;
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
          "Engineering notes on the Gofasta toolkit: CLI changes, library updates, and longer-form posts on Go backend topics.",
        url: indexUrl,
        inLanguage: "en",
        publisher: buildOrganizationNode(),
        blogPost: input.posts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          description: p.description,
          url: `${SITE_URL}/blog/${p.slug}`,
          datePublished: p.publishedAt,
          dateModified: p.updatedAt ?? p.publishedAt,
          ...(p.image ? { image: p.image } : {}),
        })),
      },
    ],
  };
}

// ── CollectionPage (for /blog/tags/<tag>) ─────────────────────────────

export interface TagPageInput {
  /** Normalized tag slug, e.g. "golang". */
  tag: string;
  /** Posts carrying the tag, newest first. */
  posts: ReadonlyArray<{ slug: string; title: string }>;
}

/**
 * The `@graph` (BreadcrumbList + CollectionPage) payload for a tag
 * archive. Posts go in an `ItemList` under `mainEntity` because
 * `numberOfItems` is an ItemList property, not a CollectionPage one.
 */
export function buildTagPageJsonLd(input: TagPageInput) {
  const { tag, posts } = input;
  const url = `${SITE_URL}/blog/tags/${tag}`;
  const breadcrumb = buildBreadcrumbJsonLd({
    rootPath: "/blog",
    rootName: "Blog",
    segments: ["tags", tag],
  });

  return {
    "@context": "https://schema.org",
    "@graph": [
      breadcrumb,
      {
        "@type": "CollectionPage",
        "@id": url,
        name: `#${tag} - Gofasta Blog`,
        url,
        inLanguage: "en",
        isPartOf: { "@type": "Blog", "@id": `${SITE_URL}/blog` },
        publisher: buildOrganizationNode(),
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: posts.length,
          itemListElement: posts.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            url: `${SITE_URL}/blog/${p.slug}`,
          })),
        },
      },
    ],
  };
}

/**
 * Serialize a JSON-LD payload for injection into a <script> tag.
 *
 * `JSON.stringify` does not escape `<`, so a `</script>` sequence inside
 * any authored string — a post title, an author name, a tag — would
 * close the tag early and let the rest execute as markup. Escaping the
 * `<` is what Next's own JSON-LD guide prescribes.
 */
export function serializeJsonLd(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}
