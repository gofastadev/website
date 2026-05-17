import { getAllPosts } from "@/lib/blog";
import { buildJsonFeed, type SiteMeta } from "@/lib/feed";

// /blog/feed.json — JSON Feed 1.1 alternative to the RSS feed. Some
// modern readers (NetNewsWire, Feedbin) prefer JSON Feed; some
// aggregators only know RSS. Publishing both maximizes compat at no
// real cost. `force-static` materializes the feed at build time.
export const dynamic = "force-static";

const META: SiteMeta = {
  siteUrl: "https://gofasta.dev",
  title: "Gofasta Blog",
  description:
    "Engineering notes on the Gofasta toolkit — CLI changes, library updates, and longer-form posts on Go backend topics.",
  language: "en-US",
};

export async function GET() {
  const feed = buildJsonFeed(getAllPosts(), META);
  return new Response(JSON.stringify(feed, null, 2), {
    headers: {
      "Content-Type": "application/feed+json; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
