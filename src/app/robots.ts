import type { MetadataRoute } from "next";

// robots.txt for the Gofasta documentation site.
//
// Allow the full site so search engines can index every guide, CLI
// reference, and API reference page. The only paths we hide are
// internal Next.js bundles and any private API routes (the OG-image
// renderer at /api/og is fine for crawlers to skip — it's a derived
// asset).
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://gofasta.dev/sitemap.xml",
  };
}
