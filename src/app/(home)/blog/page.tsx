import type { Metadata } from "next";
import { BlogIndexView } from "./blog-index-view";
import { withBaseKeywords } from "@/lib/seo";

// /blog — page 1 of the paginated index. Older pages live at
// /blog/page/[num] (path-based, NOT ?page=N: this route is
// `force-static`, and static routes render with empty searchParams —
// a query-string page number would silently serve page-1 HTML for
// every value). `force-static` pre-renders the page to flat HTML at
// build time so Pagefind can index it via the postbuild step.
export const dynamic = "force-static";

const CANONICAL = "https://gofasta.dev/blog";

export const metadata: Metadata = {
  title: "Blog - Gofasta",
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
    title: "Blog - Gofasta",
    description:
      "Engineering notes on the Gofasta toolkit: CLI changes, library updates, and longer-form posts on Go backend topics.",
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
    title: "Blog - Gofasta",
    description:
      "Engineering notes on the Gofasta toolkit: CLI changes, library updates, and longer-form posts on Go backend topics.",
    images: ["/api/og?title=Blog&section=Blog"],
  },
};

export default function BlogIndexPage() {
  return <BlogIndexView page={1} />;
}
