import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import rehypePrettyCode from "rehype-pretty-code";
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
import { getKeywordsForPath } from "@/lib/seo-keywords";
import { buildBlogPostingJsonLd } from "@/lib/structured-data";

// All blog routes are statically generated at build time so:
//   - Pagefind (postbuild) can index every post,
//   - first byte is CDN-cached on Vercel's edge,
//   - the build output is auditable (one HTML file per post on disk).
export const dynamic = "force-static";
export const revalidate = false;
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

const SITE_URL = "https://gofasta.dev";

function postUrl(slug: string): string {
  return `${SITE_URL}/blog/${slug}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found — Gofasta Blog" };

  const url = postUrl(slug);
  const ogImage = `/api/og?title=${encodeURIComponent(post.title)}&section=Blog`;

  return {
    title: `${post.title} — Gofasta Blog`,
    description: post.description,
    keywords: getKeywordsForPath(`/blog/${slug}`),
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

function buildPostJsonLd(post: BlogPost) {
  const coverImage = post.coverUrl.startsWith("http")
    ? post.coverUrl
    : `${SITE_URL}${post.coverUrl}`;
  // The builder already emits a `@graph` containing BlogPosting +
  // BreadcrumbList, so this thin wrapper just forwards.
  return buildBlogPostingJsonLd({
    slug: post.slug,
    title: post.title,
    description: post.description,
    authorName: post.author,
    authorUrl: post.authorUrl,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    coverImageUrl: coverImage,
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
      <article className="mx-auto max-w-3xl px-6 pt-28 pb-24">
        <BlogArticleHeader post={post} />
        <div className="prose prose-invert max-w-none prose-headings:scroll-mt-24 prose-a:text-primary prose-pre:rounded-lg prose-pre:border prose-pre:border-white/10">
          <MDXRemote
            source={post.body}
            components={blogMdxComponents}
            options={{
              mdxOptions: {
                rehypePlugins: [
                  [rehypePrettyCode, { theme: "github-dark" }],
                ],
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
