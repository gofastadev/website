import type { MetadataRoute } from "next";

// robots.txt for the Gofasta documentation site.
//
// Allow the full site so search engines can index every guide, CLI
// reference, API reference, and blog page. The paths we hide are:
//
//   - `/api/`         — Next.js API routes, internal-only.
//   - `/_next/`       — bundler output, not content.
//   - `/keystatic/`   — Keystatic admin UI; auth-gated but no value to
//                       search engines and we don't want it indexed.
//   - `/api/keystatic/` — Keystatic's server route handlers; same reason.
//
// `/api/og` is the one API route that MUST stay crawlable. Every docs
// page points `og:image` / `twitter:image` at it, and a blanket
// `Disallow: /api/` made Google report those image URLs as "Blocked by
// robots.txt" in the page-indexing report — meaning no social preview
// image could be fetched for any doc. The explicit Allow is longer than
// the `/api/` Disallow, and longest-match wins in the robots spec
// (RFC 9309 §2.2.2), so it takes precedence for that one prefix while
// the rest of `/api/` stays blocked.
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/api/og"],
        disallow: ["/api/", "/_next/", "/keystatic/", "/api/keystatic/"],
      },
    ],
    sitemap: "https://gofasta.dev/sitemap.xml",
  };
}
