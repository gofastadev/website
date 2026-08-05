import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
import { createCssVariablesTheme } from "shiki";
import { LandingTemplate } from "@/components/templates";
import { ReadingProgressBar } from "@/components/atoms/reading-progress-bar";
import { BlogArticleHeader } from "@/components/molecules/blog-article-header";
import { BlogPrevNext } from "@/components/molecules/blog-prev-next";
import { ShareButtons } from "@/components/molecules/share-buttons";
import { BlogRelatedPosts } from "@/components/molecules/blog-related-posts";
import { Comments } from "@/components/molecules/comments";
import { blogMdxComponents } from "@/lib/blog-mdx-components";
import {
  getAllPosts,
  getAdjacentPosts,
  getPost,
  type BlogPost,
} from "@/lib/blog";
import { SITE_URL, withBaseKeywords } from "@/lib/seo";
import { buildBlogPostingJsonLd, humanize } from "@/lib/structured-data";
import { getLocalImageDim } from "@/lib/image-dim";
import "./code-theme.css";

// Shiki's `createCssVariablesTheme()` emits a theme whose token colors
// are `var(--shiki-token-*)` references instead of literal hex values,
// so the SAME highlighted HTML repaints correctly in both light and
// dark mode purely via CSS custom-property cascade — no `data-theme`
// attribute or duplicate highlight pass needed. The `--shiki-token-*`
// variables (keyword/string/function/comment/constant/punctuation) are
// defined for :root and .dark in globals.css (Task 2). Shiki's own
// fixed names for the base text/background pair (`--shiki-foreground`
// / `--shiki-background`) don't match this site's `--shiki-color-text`
// / `--code-bg` tokens, so `code-theme.css` aliases them — see that
// file for the full explanation.
const shikiTheme = createCssVariablesTheme({
  name: "gofasta-css-variables",
  variablePrefix: "--shiki-",
  fontStyle: true,
});

// `force-static` + `generateStaticParams` + `dynamicParams = false`
// guarantees each post is prerendered to flat HTML at build time —
// required for Pagefind to find them via the postbuild step, and
// good for LCP since the first byte comes from the edge CDN.
// Without `force-static`, `next-mdx-remote/rsc`'s async render path
// gets the route classified as dynamic and the HTML never lands on
// disk for Pagefind to crawl.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

// Absolutize a cover URL the same way the JSON-LD builder does so that
// social-card consumers (Facebook / LinkedIn / Slack / Twitter) get an
// origin-qualified URL regardless of whether the author uploaded the
// cover through Keystatic (relative `/blog/covers/...`) or pointed at a
// remote CDN (`https://...`). Falls back to the generated /api/og card
// only when no cover exists — Keystatic enforces `cover` as required,
// so the fallback is defensive (e.g. legacy posts authored before the
// requirement was added, or a malformed frontmatter that still managed
// to parse).
function postOgImage(post: BlogPost): string {
  if (post.coverUrl) {
    return post.coverUrl.startsWith("http")
      ? post.coverUrl
      : `${SITE_URL}${post.coverUrl}`;
  }
  return `${SITE_URL}/api/og?title=${encodeURIComponent(post.title)}&section=Blog`;
}

// Medium and Hashnode both render the post title exactly once — in the
// article header — and start the body at H2. If an author duplicates
// the title as a leading `# Title` heading in the body (Keystatic
// allows it on legacy posts), strip it so the page doesn't show two
// identical titles. Match is case-insensitive on text only.
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

// Google's Article guidance asks for multiple high-resolution images in
// 16:9, 4:3, and 1:1 — the build derives -4x3/-1x1 crops next to every
// local cover (scripts/generate-seo-assets.mjs). Collect whichever
// variants exist with their MEASURED dimensions; remote covers are
// passed through as a bare URL (no invented numbers).
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
      // The cover itself is always listed — dimensions when measurable.
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
  // The builder already emits a `@graph` containing BlogPosting +
  // BreadcrumbList, so this thin wrapper just forwards. `wordCount` /
  // `timeRequired` / `articleSection` come from data we already compute
  // for the page (reading-time + first slugged tag) so they cost nothing
  // extra to surface as Article-eligibility signals.
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

  return (
    <LandingTemplate>
      <ReadingProgressBar />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <article
        className="mx-auto max-w-3xl px-6 pt-28 pb-24"
        data-pagefind-body
      >
        <BlogArticleHeader post={post} />
        <div className="prose max-w-none prose-headings:font-display prose-headings:scroll-mt-24 prose-headings:tracking-tight prose-a:text-primary prose-a:underline prose-pre:rounded-xl prose-pre:border prose-pre:border-gray-200 prose-pre:bg-code-bg prose-code:rounded prose-code:bg-gray-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:font-normal prose-code:before:content-none prose-code:after:content-none dark:prose-invert dark:prose-pre:border-gray-800 dark:prose-code:bg-white/[0.08]">
          <MDXRemote
            source={stripTitleH1(post.body, post.title)}
            components={blogMdxComponents}
            options={{
              mdxOptions: {
                rehypePlugins: [[rehypePrettyCode, { theme: shikiTheme }]],
              },
            }}
          />
        </div>
        <ShareButtons url={postUrl(slug)} title={post.title} />
        <BlogPrevNext prev={prev} next={next} />
        <BlogRelatedPosts currentSlug={slug} allPosts={allPosts} />
        <Comments />
      </article>
    </LandingTemplate>
  );
}
