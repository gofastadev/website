import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeSlug from "rehype-slug";
import { createCssVariablesTheme } from "shiki";
import { LandingTemplate } from "@/components/templates";
import { ReadingProgressBar } from "@/components/atoms/reading-progress-bar";
import { BlogArticleHeader } from "@/components/molecules/blog-article-header";
import { BlogPrevNext } from "@/components/molecules/blog-prev-next";
import { ShareButtons } from "@/components/molecules/share-buttons";
import { BlogRelatedPosts } from "@/components/molecules/blog-related-posts";
import { Comments } from "@/components/molecules/comments";
import { TableOfContents } from "@/components/molecules/table-of-contents";
import { NewsletterSignup } from "@/components/organisms/newsletter-signup";
import { blogMdxComponents } from "@/lib/blog-mdx-components";
import { extractToc } from "@/lib/toc";
import {
  getAllPosts,
  getAdjacentPosts,
  getPost,
  getSeriesPosts,
  type BlogPost,
} from "@/lib/blog";
import {
  SeriesNavCard,
  type SeriesNavItem,
} from "@/components/molecules/series-nav-card";
import { SeriesNextLink } from "@/components/molecules/series-next-link";
import { SITE_URL, withBaseKeywords } from "@/lib/seo";
import {
  buildBlogPostingJsonLd,
  humanize,
  serializeJsonLd,
} from "@/lib/structured-data";
import { getLocalImageDim } from "@/lib/image-dim";
import "./code-theme.css";

// Emits token colors as `var(--shiki-token-*)` rather than hex, so one
// highlight pass repaints correctly in both themes through the CSS
// cascade. Shiki's fixed `--shiki-foreground` / `--shiki-background`
// names don't match this site's tokens; code-theme.css aliases them.
const shikiTheme = createCssVariablesTheme({
  name: "gofasta-css-variables",
  variablePrefix: "--shiki-",
  fontStyle: true,
});

// Pagefind indexes files on disk in the postbuild step, so the HTML has
// to exist there. Without `force-static`, next-mdx-remote's async render
// classifies the route dynamic and nothing is written for it to crawl.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

// Social-card consumers need an origin-qualified URL whether the cover
// was uploaded through Keystatic or points at a remote CDN. Keystatic
// requires `cover`, so the /api/og fallback is purely defensive.
function postOgImage(post: BlogPost): string {
  if (post.coverUrl) {
    return post.coverUrl.startsWith("http")
      ? post.coverUrl
      : `${SITE_URL}${post.coverUrl}`;
  }
  return `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&section=Blog`;
}

// The article header already renders the title, so a body that opens
// with the same `# Title` would show it twice.
function stripTitleH1(body: string, title: string): string {
  const match = body.match(/^\s*#\s+(.+?)\s*\n+/);
  if (!match) return body;
  if (match[1].trim().toLowerCase() !== title.trim().toLowerCase()) return body;
  return body.slice(match[0].length);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post)
    return {
      title: "Post not found — Gofasta Blog",
      robots: { index: false, follow: false },
    };

  const url = postUrl(slug);
  const ogImage = postOgImage(post);

  return {
    title: `${post.title} — Gofasta Blog`,
    description: post.description,
    keywords: withBaseKeywords("blog", ...post.tags),
    authors: post.authorUrl
      ? [{ name: post.author, url: post.authorUrl }]
      : [{ name: post.author }],
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": "/blog/rss.xml",
        "application/feed+json": "/blog/feed.json",
      },
    },
    openGraph: {
      type: "article",
      url,
      siteName: "Gofasta",
      locale: "en_US",
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt ?? post.publishedAt,
      authors: post.authorUrl ? [post.authorUrl] : [post.author],
      tags: post.tags,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.description,
      images: [ogImage],
    },
  };
}

// Google's Article guidance asks for 16:9, 4:3, and 1:1 variants, which
// the build derives next to each local cover. Dimensions are only ever
// measured, never invented, so remote covers pass through as bare URLs.
function coverImageSet(coverUrl: string) {
  if (coverUrl.startsWith("http")) {
    return [{ url: coverUrl }];
  }
  const dot = coverUrl.lastIndexOf(".");
  const stem = dot > 0 ? coverUrl.slice(0, dot) : coverUrl;
  const images: Array<{ url: string; width?: number; height?: number }> = [];
  for (const variant of [coverUrl, `${stem}-4x3.jpg`, `${stem}-1x1.jpg`]) {
    const dim = getLocalImageDim(variant);
    if (variant === coverUrl) {
      images.push({ url: `${SITE_URL}${variant}`, ...(dim ?? {}) });
    } else if (dim) {
      images.push({ url: `${SITE_URL}${variant}`, ...dim });
    }
  }
  return images;
}

function buildPostJsonLd(post: BlogPost) {
  const coverImage = post.coverUrl.startsWith("http")
    ? post.coverUrl
    : `${SITE_URL}${post.coverUrl}`;
  // wordCount, timeRequired, and articleSection reuse values the page
  // already computes, so these Article-eligibility signals are free.
  const minutes = Math.max(1, Math.round(post.readingTime.minutes));
  return buildBlogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    description: post.description,
    authorName: post.author,
    // "Gofasta Team" is an organization, not a person — schema type
    // must match reality per Google's author best practices.
    authorType: /\bteam$/i.test(post.author) ? "Organization" : "Person",
    authorUrl: post.authorUrl,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    coverImageUrl: coverImage,
    images: coverImageSet(post.coverUrl),
    keywords: withBaseKeywords("blog", ...post.tags),
    wordCount: post.readingTime.words,
    timeRequired: `PT${minutes}M`,
    articleSection: post.tags[0] ? humanize(post.tags[0]) : "Blog",
    seriesName: post.series,
    seriesPosition: post.seriesPart,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const { prev, next } = getAdjacentPosts(slug);
  const allPosts = getAllPosts();
  const jsonLd = buildPostJsonLd(post);
  const toc = extractToc(post.body);

  // Mapped to plain props so the nav components stay presentational and
  // never reach into the server-only blog service.
  const seriesItems: SeriesNavItem[] = post.series
    ? getSeriesPosts(post.series).map((p, index) => ({
        slug: p.slug,
        title: p.title,
        part: p.seriesPart ?? index + 1,
      }))
    : [];
  const currentSeriesIndex = seriesItems.findIndex(
    (item) => item.slug === slug,
  );
  const nextInSeries =
    currentSeriesIndex >= 0
      ? (seriesItems[currentSeriesIndex + 1] ?? null)
      : null;

  return (
    <LandingTemplate>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      {/* On xl the article gets a companion sticky TOC rail; the grid
          wrapper is page-local so LandingTemplate (shared by the blog
          index, tags, cookies, …) stays full-bleed. data-pagefind-body
          stays on the article — the aside is navigation, not content. */}
      <div className="mx-auto max-w-6xl xl:grid xl:grid-cols-[minmax(0,1fr)_16rem] xl:gap-12">
        <article
          className="mx-auto w-full max-w-3xl px-6 pt-28 pb-24"
          data-pagefind-body
        >
          <BlogArticleHeader post={post} shareUrl={postUrl(slug)} />
          {post.series ? (
            <SeriesNavCard
              seriesName={post.series}
              items={seriesItems}
              currentSlug={slug}
            />
          ) : null}
          <TableOfContents items={toc} variant="inline" />
          <div className="prose max-w-none prose-headings:font-display prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-primary prose-a:underline prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200 prose-pre:bg-code-bg prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none dark:prose-invert dark:prose-pre:border-gray-800 dark:prose-code:bg-white/[0.08]">
            <MDXRemote
              source={stripTitleH1(post.body, post.title)}
              components={blogMdxComponents}
              options={{
                mdxOptions: {
                  rehypePlugins: [
                    rehypeSlug,
                    [rehypePrettyCode, { theme: shikiTheme }],
                  ],
                },
              }}
            />
          </div>
          <ShareButtons
            url={postUrl(slug)}
            title={post.title}
            placement="footer"
          />
          {post.series && nextInSeries ? (
            <SeriesNextLink
              seriesName={post.series}
              title={nextInSeries.title}
              slug={nextInSeries.slug}
            />
          ) : null}
          <BlogPrevNext prev={prev} next={next} />
          <NewsletterSignup location="article_footer" />
          <BlogRelatedPosts currentSlug={slug} allPosts={allPosts} />
          <Comments />
        </article>
        <aside
          className="hidden xl:block sticky top-28 self-start pt-28 pr-6"
          data-pagefind-ignore
        >
          <TableOfContents items={toc} variant="sidebar" />
        </aside>
      </div>
    </LandingTemplate>
  );
}
