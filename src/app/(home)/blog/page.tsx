import type { Metadata } from "next";
import { LandingTemplate } from "@/components/templates";
import { BlogIndexHero, BlogTagCloud } from "@/components/organisms";
import { BlogPostCard } from "@/components/molecules/blog-post-card";
import { BlogPagination } from "@/components/molecules/blog-pagination";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { withBaseKeywords } from "@/lib/seo";
import { buildBlogIndexJsonLd } from "@/lib/structured-data";

// Cap the BlogPosting summaries embedded in the index JSON-LD. Google
// recommends keeping structured-data payloads compact; the most recent
// posts are the highest-signal items for the hub-page schema.
const BLOG_INDEX_JSONLD_MAX = 50;

// /blog — paginated index of every published post. `force-static`
// pre-renders the page to flat HTML at build time so Pagefind can
// index it via the postbuild step. searchParams still works at the
// edge (Next.js falls back to client-side reading when the route is
// static), so ?page=N pagination is unaffected.
export const dynamic = "force-static";

const POSTS_PER_PAGE = 12;
const CANONICAL = "https://gofasta.dev/blog";

export const metadata: Metadata = {
  title: "Blog — Gofasta",
  description:
    "Engineering notes on the Gofasta toolkit: CLI changes, library updates, and longer-form posts on Go backend topics.",
  keywords: withBaseKeywords(
    "blog",
    "engineering blog",
    "developer blog",
    "Go blog",
    "release notes",
    "changelog",
    "Gofasta blog",
  ),
  alternates: {
    canonical: CANONICAL,
    types: {
      "application/rss+xml": "/blog/rss.xml",
      "application/feed+json": "/blog/feed.json",
    },
  },
  openGraph: {
    type: "website",
    url: CANONICAL,
    siteName: "Gofasta",
    title: "Blog — Gofasta",
    description:
      "Engineering notes on the Gofasta toolkit — CLI changes, library updates, and longer-form posts on Go backend topics.",
    images: [
      {
        url: "/api/og?title=Blog&section=Blog",
        width: 1200,
        height: 630,
        alt: "Gofasta Blog",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Blog — Gofasta",
    description:
      "Engineering notes on the Gofasta toolkit — CLI changes, library updates, and longer-form posts on Go backend topics.",
    images: ["/api/og?title=Blog&section=Blog"],
  },
};

export default async function BlogIndexPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const requested = Number.parseInt(params.page ?? "1", 10);
  const currentPage =
    Number.isFinite(requested) && requested >= 1 ? requested : 1;

  const allPosts = getAllPosts();
  const allTags = getAllTags();

  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const clampedPage = Math.min(currentPage, totalPages);
  const start = (clampedPage - 1) * POSTS_PER_PAGE;
  const pagePosts = allPosts.slice(start, start + POSTS_PER_PAGE);

  // The hero only shows on page 1 — the most recent post. Subsequent
  // pages just render the grid so the layout reads as "next chunk of
  // older posts" rather than "another featured pick."
  const showHero = clampedPage === 1 && pagePosts.length > 0;
  const gridPosts = showHero ? pagePosts.slice(1) : pagePosts;
  const featured = showHero ? pagePosts[0] : null;

  // Blog + Breadcrumb JSON-LD for the index page. Cap the embedded post
  // summaries — the per-post page has its own full BlogPosting graph,
  // so the index only needs enough to establish this URL as a blog hub.
  const jsonLd = buildBlogIndexJsonLd({
    posts: allPosts.slice(0, BLOG_INDEX_JSONLD_MAX).map((post) => ({
      slug: post.slug,
      title: post.title,
      description: post.description,
      publishedAt: post.publishedAt,
      updatedAt: post.updatedAt,
    })),
  });

  return (
    <LandingTemplate>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main
        className="mx-auto max-w-6xl px-6 pt-32 pb-24"
        data-pagefind-body
      >
        <header className="mb-10">
          <h1 className="text-4xl font-bold text-foreground sm:text-5xl">
            Blog
          </h1>
          <p className="mt-3 max-w-2xl text-lg text-gray-800 dark:text-gray-300">
            Engineering notes on the Gofasta toolkit — CLI changes, library
            updates, and longer-form posts on Go backend topics.
          </p>
        </header>

        {featured ? <BlogIndexHero post={featured} /> : null}

        {gridPosts.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post) => (
              <BlogPostCard key={post.slug} post={post} />
            ))}
          </div>
        ) : !featured ? (
          <p className="rounded-lg border border-gray-200 bg-white p-8 text-center text-gray-700 dark:border-white/10 dark:bg-white/[0.02] dark:text-gray-400">
            No posts yet. The first one is on its way.
          </p>
        ) : null}

        <BlogPagination currentPage={clampedPage} totalPages={totalPages} />

        <div className="mt-16">
          <BlogTagCloud tags={allTags} />
        </div>
      </main>
    </LandingTemplate>
  );
}
