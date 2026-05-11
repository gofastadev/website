import { getAllPosts } from "@/lib/blog";
import { buildRssFeed, type SiteMeta } from "@/lib/feed";

// /blog/rss.xml — RSS 2.0 feed of every published post.
//
// `force-static` materializes the feed at build time. Next deploy =
// fresh feed. The cache header below is belt-and-braces in case the
// route ever flips back to dynamic.
export const dynamic = "force-static";

const META: SiteMeta = {
  siteUrl: "https://gofasta.dev",
  title: "Gofasta Blog",
  description:
    "Engineering notes on the Gofasta toolkit — CLI changes, library updates, and longer-form posts on Go backend topics.",
  language: "en-US",
};

export async function GET() {
  const xml = buildRssFeed(getAllPosts(), META);
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
