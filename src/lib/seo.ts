export const SITE_URL = "https://gofasta.dev";
export const SITE_NAME = "Gofasta";

// AGENT_DOC_FILES — the llmstxt.org surfaces generated at build time by
// scripts/generate-llms-txt.mjs and written into public/.
//
// Both files were reachable (HTTP 200) long before this list existed,
// but nothing pointed at them: they were absent from sitemap.xml and
// every mention across the site was prose, not a hyperlink. Search
// engines discover by link graph, so a file with zero inbound links and
// no sitemap entry stays uncrawled — which is exactly what happened.
//
// This is the single source that sitemap.xml, robots.txt, the <head>
// alternate hints, and the visible footer/sidebar links all read from,
// so a future third file can never be wired into three places and
// forgotten in the fourth.
export const AGENT_DOC_FILES = [
  {
    path: "/llms.txt",
    label: "llms.txt",
    // `title` lands in <link rel="alternate"> and the sidebar entry —
    // it's what a human or an agent sees when the raw filename isn't
    // self-explanatory.
    title: "Gofasta documentation index for LLMs",
  },
  {
    path: "/llms-full.txt",
    label: "llms-full.txt",
    title: "Complete Gofasta documentation as a single file for LLMs",
  },
] as const;

// AGENT_DOC_ALTERNATES — AGENT_DOC_FILES in the shape Next's Metadata
// API wants for `alternates.types`.
//
// Next merges metadata one top-level field at a time: a page that
// declares `alternates` REPLACES the root layout's `alternates` instead
// of extending it. So every page that sets a canonical URL has to
// restate the alternate types or silently lose them — which is exactly
// what the homepage was doing with the blog feed links before this
// existed. Sharing one constant is what keeps that fix from rotting.
export const AGENT_DOC_ALTERNATES = AGENT_DOC_FILES.map((file) => ({
  url: file.path,
  title: file.title,
}));

export const BASE_KEYWORDS = [
  "Go",
  "Golang",
  "Gofasta",
  "Go toolkit",
  "Go backend",
  "Go web services",
  "web framework",
  "backend",
] as const;

export function withBaseKeywords(...extra: readonly string[]): string[] {
  return [...new Set<string>([...BASE_KEYWORDS, ...extra])];
}
