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
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/", "/keystatic/", "/api/keystatic/"],
      },
    ],
    sitemap: "https://gofasta.dev/sitemap.xml",
  };
}
