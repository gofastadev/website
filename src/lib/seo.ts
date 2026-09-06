export const SITE_URL = "https://gofasta.dev";
export const SITE_NAME = "Gofasta";

// The llmstxt.org surfaces generated into public/ at build time.
//
// Serving them is not enough: search engines discover by link graph, so
// before this list existed both files returned 200 and stayed uncrawled,
// missing from the sitemap with no hyperlink anywhere. sitemap.xml,
// robots.txt, the <head> alternate hints, and the footer links all read
// from here, so a third file can't be wired into three places and
// forgotten in the fourth.
export const AGENT_DOC_FILES = [
  {
    path: "/llms.txt",
    label: "llms.txt",
    // Shown in <link rel="alternate"> and the sidebar, where the raw
    // filename isn't self-explanatory.
    title: "Gofasta documentation index for LLMs",
  },
  {
    path: "/llms-full.txt",
    label: "llms-full.txt",
    title: "Complete Gofasta documentation as a single file for LLMs",
  },
] as const;

// Next merges metadata one top-level field at a time, so a page
// declaring `alternates` REPLACES the root layout's rather than
// extending it. Any page setting a canonical URL must restate the
// alternate types or silently drop them; sharing one constant is what
// stops that from rotting.
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
