import type { MetadataRoute } from "next";

const isProduction = process.env.NODE_ENV === "production";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: isProduction
          ? ["/", "/docs/white-paper"]
          : "/",
        disallow: isProduction
          ? ["/api/", "/_next/", "/docs/", "/sitemap"]
          : ["/api/", "/_next/"],
      },
    ],
    sitemap: "https://gofasta.dev/sitemap.xml",
  };
}
