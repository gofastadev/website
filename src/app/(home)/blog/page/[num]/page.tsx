import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndexView, blogTotalPages } from "../../blog-index-view";
import { SITE_URL, withBaseKeywords } from "@/lib/seo";

// /blog/page/[num] — pages 2..N of the blog index. Page 1 is /blog
// (this route never generates a "1" param, so /blog/page/1 404s
// instead of duplicating the index URL). Path-based pagination keeps
// every page `force-static`: each one is prerendered to its own flat
// HTML file with its own canonical URL — see blog-index-view.tsx for
// why ?page=N cannot work on a static route.
export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  const total = blogTotalPages();
  return Array.from({ length: Math.max(0, total - 1) }, (_, i) => ({
    num: String(i + 2),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ num: string }>;
}): Promise<Metadata> {
  const { num } = await params;
  const title = `Blog - Page ${num} - Gofasta`;
  const description = `Page ${num} of the Gofasta engineering blog: CLI changes, library updates, and longer-form posts on Go backend topics.`;
  const url = `${SITE_URL}/blog/page/${num}`;

  return {
    title,
    description,
    keywords: withBaseKeywords("blog", "engineering blog", "Gofasta blog"),
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
      locale: "en_US",
      title,
      description,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(`Blog - Page ${num}`)}&section=Blog`,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [
        `/api/og?title=${encodeURIComponent(`Blog - Page ${num}`)}&section=Blog`,
      ],
    },
  };
}

export default async function BlogIndexPageN({
  params,
}: {
  params: Promise<{ num: string }>;
}) {
  const { num } = await params;
  const page = Number.parseInt(num, 10);
  // dynamicParams=false means only generated params reach here, but the
  // guard keeps the route honest if that ever changes.
  if (!Number.isFinite(page) || page < 2 || page > blogTotalPages()) {
    notFound();
  }
  return <BlogIndexView page={page} />;
}
