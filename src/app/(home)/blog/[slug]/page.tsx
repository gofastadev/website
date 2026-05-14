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
import { SITE_URL, withBaseKeywords } from "@/lib/seo";
import { buildBlogPostingJsonLd } from "@/lib/structured-data";

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
    keywords: withBaseKeywords("blog", ...post.tags),
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
        <div className="prose max-w-none prose-headings:scroll-mt-24 prose-a:text-primary prose-pre:rounded-lg prose-pre:border prose-pre:border-gray-200 dark:prose-invert dark:prose-pre:border-white/10">
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
