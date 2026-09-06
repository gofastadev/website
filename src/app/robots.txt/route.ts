import { AGENT_DOC_FILES, SITE_URL } from "@/lib/seo";

// A route handler rather than `robots.ts`: Next's `MetadataRoute.Robots`
// type is exactly `{ rules, sitemap, host }` with no field for a comment
// line, and the llms.txt URLs are advertised at the top of the file where
// an operator, or an agent fetching robots.txt first, will see them.
//
// Those `# llms.txt:` lines are only comments. No crawler parses them and
// there is no robots.txt directive for llms.txt — sitemap.xml and real
// hyperlinks do the actual discovery work.
//
// `/api/og` must stay crawlable while the rest of `/api/` does not: every
// page points og:image at it, and a blanket `Disallow: /api/` made Google
// report those images as "Blocked by robots.txt", killing social previews
// site-wide. The Allow is the longer pattern and longest-match wins
// (RFC 9309 §2.2.2), so it takes precedence for that prefix alone.

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

// No request-dependent content, so render once at build time.
export const dynamic = "force-static";

export function GET(): Response {
  return new Response(buildRobotsTxt(), {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
