// Hard-fail at build time if any client component tries to import this
// module. RelatedPages depends on Nextra's `getPageMap()`, which reads
// the filesystem and only works server-side; pulling it into a client
// bundle silently breaks the page (the symptom is unrelated `metadata`
// export errors from sibling pages because Next mis-classifies the
// shared chunk). The `server-only` import enforces correctness.
import "server-only";
import Link from "next/link";
import { getPageMap } from "nextra/page-map";

// `path` is passed explicitly rather than auto-detected: a server
// component rendered through MDX has no clean handle on the current
// request path, and threading it through Context would turn the route
// into a client subtree, costing the server-rendered links that Google
// reads from the initial HTML.

/** A curated cross-section link rendered alongside the auto-generated siblings. */
export interface RelatedExtra {
  href: string;
  label: string;
  /** Rendered next to the link; the link is title-only without it. */
  description?: string;
}

interface RelatedPagesProps {
  /**
   * Page this is rendered on, relative to /docs, e.g.
   * "cli-reference/dev". Siblings of the final segment are listed.
   */
  path: string;

  /**
   * Curated links appended after the siblings, for cross-section
   * relationships the directory layout cannot infer.
   */
  extra?: RelatedExtra[];
}

// Nextra's page map mixes folders, MDX files, and meta files; only MDX
// leaves are rendered.
interface MdxLikeItem {
  name: string;
  route: string;
  frontMatter?: {
    title?: string;
    description?: string;
    [key: string]: unknown;
  };
  children?: unknown;
}

function isRenderableMdx(item: unknown): item is MdxLikeItem {
  if (typeof item !== "object" || item === null) return false;
  const obj = item as Record<string, unknown>;
  if (typeof obj.name !== "string") return false;
  if (typeof obj.route !== "string") return false;
  // Folders have a `children` array; we want only MDX leaves.
  if (Array.isArray(obj.children)) return false;
  // Meta JSON files don't have a route in the same sense; the route
  // check above already excludes most, but bail on hidden/system files
  // for safety.
  if (obj.name.startsWith("_") || obj.name === "index") return false;
  return true;
}

// Frontmatter descriptions are sized for the meta tag and run 2-3
// sentences, which is visually heavy in this footer. Trimming here is
// presentational only — the meta tag still carries the full text.
function trimSentence(s: string, max = 140): string {
  const trimmed = s.trim();
  if (trimmed.length === 0) return "";
  // Look for the first sentence-terminator within the budget.
  const slice = trimmed.slice(0, max + 60);
  const m = slice.match(/^[\s\S]+?[.!?](?=\s|$)/);
  if (m && m[0].length <= max + 30) {
    return m[0];
  }
  if (trimmed.length <= max) return trimmed;
  // No sentence break found in budget — hard-truncate on a word boundary.
  const hardCut = trimmed.slice(0, max);
  const lastSpace = hardCut.lastIndexOf(" ");
  return (lastSpace > 0 ? hardCut.slice(0, lastSpace) : hardCut) + "…";
}

export async function RelatedPages({ path, extra = [] }: RelatedPagesProps) {
  const segments = path.split("/").filter(Boolean);
  if (segments.length === 0) {
    return null;
  }
  const currentSlug = segments[segments.length - 1];
  const sectionRoute = "/docs" + (segments.length > 1 ? "/" + segments.slice(0, -1).join("/") : "");

  let pageMapItems: unknown[] = [];
  try {
    pageMapItems = (await getPageMap(sectionRoute)) as unknown[];
  } catch {
    // getPageMap throws when the route is unknown; treat as "no
    // siblings" rather than crashing the page.
    pageMapItems = [];
  }

  const siblings = pageMapItems
    .filter(isRenderableMdx)
    .filter((item) => item.name !== currentSlug)
    .map((item) => ({
      href: item.route,
      label: (item.frontMatter?.title as string | undefined) ?? item.name,
      description: trimSentence((item.frontMatter?.description as string | undefined) ?? ""),
    }));

  if (siblings.length === 0 && extra.length === 0) {
    return null;
  }

  // The description sits outside the <a> deliberately: anchor text stays
  // just the page title, while the surrounding prose still gives Google
  // context for the link.
  return (
    <nav
      aria-label="Related pages"
      className="not-prose mt-12 border-t border-gray-200 pt-6 dark:border-gray-800"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Related Pages
      </h3>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {siblings.map((sibling) => (
          <li key={sibling.href} className="leading-snug">
            <Link
              href={sibling.href}
              className="text-sm font-medium text-gray-800 transition-colors hover:text-foreground hover:underline dark:text-gray-200"
            >
              {sibling.label}
            </Link>
            {sibling.description ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {sibling.description}
              </p>
            ) : null}
          </li>
        ))}
        {extra.map((item) => (
          <li key={item.href} className="leading-snug">
            <Link
              href={item.href}
              className="text-sm font-medium text-gray-800 transition-colors hover:text-foreground hover:underline dark:text-gray-200"
            >
              {item.label}
            </Link>
            {item.description ? (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {trimSentence(item.description)}
              </p>
            ) : null}
          </li>
        ))}
      </ul>
    </nav>
  );
}
