import GithubSlugger from "github-slugger";

// Table-of-contents extraction for blog posts. Line-scans the raw MDX
// body (no unified pipeline — the payload is one string and the only
// consumers are the [slug] route's TOC components).
//
// The ids MUST match what rehype-slug assigns to the rendered
// headings, or every TOC link is dead. rehype-slug runs github-slugger
// over each heading's text content in document order; we reproduce
// that by running the same slugger over the same visible text in the
// same order — including the `-1`/`-2` suffixes it appends to
// duplicate headings. Headings whose text contains JSX components can
// still diverge (their rendered text content isn't recoverable from a
// line scan); accepted risk — the worst case is one dead TOC link.
//
// No `server-only` import so the module stays unit-testable; in
// production only the server page imports it.

export interface TocItem {
  id: string;
  text: string;
  depth: 2 | 3 | 4 | 5 | 6;
}

// Strip the inline-markdown syntax that rehype renders away, leaving
// the visible text github-slugger would see: images (before links, the
// syntax nests), links → their label, code spans, emphasis markers.
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/(\*\*|__)(.+?)\1/g, "$2")
    .replace(/(\*|_)(.+?)\1/g, "$2")
    .trim();
}

export function extractToc(body: string): TocItem[] {
  const slugger = new GithubSlugger();
  const items: TocItem[] = [];
  let inFence = false;
  let fenceMarker: "```" | "~~~" | null = null;

  for (const line of body.split("\n")) {
    const fenceMatch = line.match(/^\s*(```|~~~)/);
    if (fenceMatch) {
      const marker = fenceMatch[1] as "```" | "~~~";
      if (!inFence) {
        inFence = true;
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        inFence = false;
        fenceMarker = null;
      }
      continue;
    }
    if (inFence) continue;

    const heading = line.match(/^(#{2,6})\s+(.+?)\s*#*\s*$/);
    if (!heading) continue;

    const text = stripInlineMarkdown(heading[2]);
    if (!text) continue;

    items.push({
      id: slugger.slug(text),
      text,
      depth: heading[1].length as TocItem["depth"],
    });
  }

  return items;
}
