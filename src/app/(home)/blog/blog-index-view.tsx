import { LandingTemplate } from "@/components/templates";
import { BlogIndexHero, BlogTagCloud } from "@/components/organisms";
import { BlogPostCard } from "@/components/molecules/blog-post-card";
import { BlogPagination } from "@/components/molecules/blog-pagination";
import { getAllPosts, getAllTags } from "@/lib/blog";
import { buildBlogIndexJsonLd } from "@/lib/structured-data";
import { SITE_URL } from "@/lib/seo";

// Shared server-side view for the blog index: `/blog` renders page 1,
// `/blog/page/[num]` renders the rest. Pagination is PATH-based because
// both routes are `force-static` — with a static route Next.js renders
// `searchParams` as empty at build time, so a `?page=N` query string
// would serve identical page-1 HTML for every N. Distinct paths give
// each page its own prerendered file (and its own canonical URL).

export const POSTS_PER_PAGE = 12;

// Cap the BlogPosting summaries embedded in the index JSON-LD. Google
// recommends keeping structured-data payloads compact; the most recent
// posts are the highest-signal items for the hub-page schema.
const BLOG_INDEX_JSONLD_MAX = 50;

export function blogTotalPages(): number {
  return Math.max(1, Math.ceil(getAllPosts().length / POSTS_PER_PAGE));
}

export function BlogIndexView({ page }: { page: number }) {
  const allPosts = getAllPosts();
  const allTags = getAllTags();

  const totalPages = Math.max(1, Math.ceil(allPosts.length / POSTS_PER_PAGE));
  const clampedPage = Math.min(Math.max(page, 1), totalPages);
  const start = (clampedPage - 1) * POSTS_PER_PAGE;
  const pagePosts = allPosts.slice(start, start + POSTS_PER_PAGE);

  // The hero only shows on page 1 — the most recent post. Subsequent
  // pages just render the grid so the layout reads as "next chunk of
  // older posts" rather than "another featured pick."
  const showHero = clampedPage === 1 && pagePosts.length > 0;
  const gridPosts = showHero ? pagePosts.slice(1) : pagePosts;
  const featured = showHero ? pagePosts[0] : null;

  // Blog + Breadcrumb JSON-LD for the hub page only — page 1 is the
  // canonical blog entry point; deeper pages don't need to re-assert
  // the hub schema. Capped because the per-post page has its own full
  // BlogPosting graph.
  const jsonLd =
    clampedPage === 1
      ? buildBlogIndexJsonLd({
          posts: allPosts.slice(0, BLOG_INDEX_JSONLD_MAX).map((post) => ({
            slug: post.slug,
            title: post.title,
            description: post.description,
            publishedAt: post.publishedAt,
            updatedAt: post.updatedAt,
            image: post.coverUrl.startsWith("http")
              ? post.coverUrl
              : `${SITE_URL}${post.coverUrl}`,
          })),
        })
      : null;

  return (
    <LandingTemplate>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}
      <main className="mx-auto max-w-6xl px-6 pt-32 pb-24" data-pagefind-body>
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
