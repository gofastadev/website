import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { LandingTemplate } from "@/components/templates";
import { BlogPostCard } from "@/components/molecules/blog-post-card";
import { getAllTags, getPostsByTag, slugifyTag } from "@/lib/blog";
import { getKeywordsForPath } from "@/lib/seo-keywords";

// See the [slug] route for rationale — Pagefind only indexes static
// routes, and prerendering at build time keeps the tag page on the
// CDN edge.
export const dynamic = "force-static";
export const dynamicParams = false;

export async function generateStaticParams() {
  return getAllTags().map(({ tag }) => ({ tag }));
}

const SITE_URL = "https://gofasta.dev";

function tagUrl(tag: string): string {
  return `${SITE_URL}/blog/tags/${tag}`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ tag: string }>;
}): Promise<Metadata> {
  const { tag } = await params;
  const normalized = slugifyTag(tag);
  const posts = getPostsByTag(normalized);
  if (posts.length === 0) return { title: "Tag not found — Gofasta Blog" };

  const title = `#${normalized} — Gofasta Blog`;
  const description = `Posts tagged ${normalized} on the Gofasta blog.`;
  const url = tagUrl(normalized);
  const ogImage = `/api/og?title=${encodeURIComponent(`#${normalized}`)}&section=Blog`;

  return {
    title,
    description,
    keywords: getKeywordsForPath(`/blog/tags/${normalized}`),
    alternates: {
      canonical: url,
      types: {
        "application/rss+xml": "/blog/rss.xml",
        "application/feed+json": "/blog/feed.json",
      },
    },
    openGraph: {
      type: "website",
      url,
      siteName: "Gofasta",
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
  };
}

function buildTagJsonLd(tag: string, postCount: number) {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `#${tag} — Gofasta Blog`,
        url: tagUrl(tag),
        inLanguage: "en",
        // numberOfItems is a recommended property for CollectionPage —
        // helps Google understand the size of the collection.
        numberOfItems: postCount,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE_URL}/blog` },
          { "@type": "ListItem", position: 3, name: `#${tag}`, item: tagUrl(tag) },
        ],
      },
    ],
  };
}

export default async function BlogTagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const normalized = slugifyTag(tag);
  const posts = getPostsByTag(normalized);
  if (posts.length === 0) notFound();

  const jsonLd = buildTagJsonLd(normalized, posts.length);

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
          <Link
            href="/blog"
            className="mb-4 inline-block text-sm text-gray-400 hover:text-primary"
          >
            ← All posts
          </Link>
          <h1 className="text-4xl font-bold text-white sm:text-5xl">
            #{normalized}
          </h1>
          <p className="mt-3 text-lg text-gray-300">
            {posts.length} {posts.length === 1 ? "post" : "posts"} tagged
            {" "}<span className="font-medium text-primary">{normalized}</span>.
          </p>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <BlogPostCard key={post.slug} post={post} />
          ))}
        </div>
      </main>
    </LandingTemplate>
  );
}
