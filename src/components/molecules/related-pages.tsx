// Hard-fail at build time if any client component tries to import this
// module. RelatedPages depends on Nextra's `getPageMap()`, which reads
// the filesystem and only works server-side; pulling it into a client
// bundle silently breaks the page (the symptom is unrelated `metadata`
// export errors from sibling pages because Next mis-classifies the
// shared chunk). The `server-only` import enforces correctness.
import "server-only";
import Link from "next/link";
import { getPageMap } from "nextra/page-map";

// ─────────────────────────────────────────────────────────────────────
// <RelatedPages /> — the docs-site "Related" footer.
//
// Renders an auto-generated list of sibling pages from the same section
// (sourced from Nextra's page map at request time, so adding a new
// MDX file under e.g. cli-reference/ automatically appears in every
// other cli-reference page's Related list — zero per-page edits).
//
// Authors pass `path` to anchor the component to the current page, and
// optionally `extra` to add curated cross-section links. The component
// is a server component — no client JS — so the link list lands in the
// initial HTML where Google's crawler reads it.
//
// Why an explicit `path` prop and not auto-detection?
//
//   Server components rendered through MDX don't have a clean handle
//   on the current request path (no useRouter, headers() doesn't carry
//   it by default). Threading the path through React Context would
//   require turning the dynamic route into a client subtree, which we
//   don't want for SEO. A one-line `path="cli-reference/dev"` from the
//   author is the cheapest robust answer.
// ─────────────────────────────────────────────────────────────────────

/** A curated cross-section link rendered alongside the auto-generated siblings. */
export interface RelatedExtra {
  href: string;
  label: string;
  /**
   * Optional one-sentence description rendered next to the link.
   * Adds keyword-rich context that helps Google's topical relevance
   * scoring on internal links — the same way the manual `## Related`
   * bullets used to. When omitted, the link renders as title-only.
   */
  description?: string;
}

interface RelatedPagesProps {
  /**
   * Path of the page this component is rendered on, relative to /docs.
   * Examples: "cli-reference/dev", "api-reference/cache",
   * "guides/debugging/architecture". The component lists siblings of
   * the final segment.
   */
  path: string;

  /**
   * Optional curated cross-section links rendered AFTER the
   * auto-generated sibling list. Use for "this CLI command relates to
   * this API package" — the kind of cross-link the directory-based
   * auto-list cannot infer.
   */
  extra?: RelatedExtra[];
}

// PageMapItem shape we need — Nextra's exported type tree includes
// folders, MDX files, and meta files. We only render MDX files. The
// frontMatter shape pulls `description` alongside `title` because the
// description is rendered next to each link for SEO keyword context.
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

// trimSentence picks the first sentence of a description (or the first
// ~140 chars when there's no sentence break). The full frontmatter
// description is often 2-3 sentences sized for the page meta tag;
// inside the Related-Pages footer that's too heavy visually, so we
// summarize. The full text remains in the page's <meta name="description">
// so SEO indexes the whole thing — this trim is purely for the
// in-page rendering.
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

  // Each <li> renders the link followed by an inline description (in
  // dim text), if one is available. The description sits OUTSIDE the
  // <a> on purpose: anchor text stays clean (the page title) while
  // the surrounding text feeds Google's contextual relevance scoring —
  // every internal link carries keyword-rich context just like the
  // pre-normalization manual bullets did.
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
