import { AGENT_DOC_FILES, SITE_URL } from "@/lib/seo";

// robots.txt for the Gofasta documentation site.
//
// WHY A ROUTE HANDLER INSTEAD OF `robots.ts`:
// This file replaces the previous `src/app/robots.ts`, which used Next's
// `MetadataRoute.Robots` helper. That helper's type is exactly
// `{ rules, sitemap, host }` — it has no field for a comment line, and
// we want the llms.txt URLs advertised at the top of the file where an
// operator (or an agent fetching robots.txt as its first request) sees
// them. Emitting the document ourselves is the only way to include them.
//
// Note honestly what this does and doesn't buy: the `# llms.txt:` lines
// are COMMENTS. No crawler parses them, and there is no standardized
// robots.txt directive for llms.txt. They are documentation for humans
// and for agents that read the file as text. The load-bearing discovery
// work is done by sitemap.xml and the real hyperlinks — not by this.
//
// The crawl rules themselves are unchanged from the previous version:
//
//   - `/api/`           — Next.js API routes, internal-only.
//   - `/_next/`         — bundler output, not content.
//   - `/keystatic/`     — Keystatic admin UI; auth-gated but no value to
//                         search engines and we don't want it indexed.
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

const ALLOW = ["/", "/api/og"];
const DISALLOW = ["/api/", "/_next/", "/keystatic/", "/api/keystatic/"];

export function buildRobotsTxt(): string {
  const lines = [
    `# ${SITE_URL}`,
    "#",
    "# Documentation for LLMs and AI coding agents (llmstxt.org):",
    ...AGENT_DOC_FILES.map((file) => `#   ${SITE_URL}${file.path}`),
    "",
    "User-Agent: *",
    ...ALLOW.map((path) => `Allow: ${path}`),
    ...DISALLOW.map((path) => `Disallow: ${path}`),
    "",
    `Sitemap: ${SITE_URL}/sitemap.xml`,
    "",
  ];

  return lines.join("\n");
}

// force-static: the document has no request-dependent content, so it is
// rendered once at build time and served from the CDN exactly as the
// `robots.ts` version was.
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildRobotsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
