import { getAllPosts } from "@/lib/blog";
import { buildRssFeed, type SiteMeta } from "@/lib/feed";

// /blog/rss.xml — RSS 2.0 feed of every published post.
//
// `force-static` materializes the feed at build time, so it's served
// from the CDN edge alongside HTML. The build re-runs whenever the
// repo changes (PR merge from Keystatic publishes a new post), which
// is the trigger we want. The cache header is a belt-and-braces guard
// in case the route ever flips back to dynamic.
export const dynamic = "force-static";
export const revalidate = false;

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
