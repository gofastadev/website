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
// folders, MDX files, and meta files. We only render MDX files.
interface MdxLikeItem {
  name: string;
  route: string;
  frontMatter?: { title?: string; [key: string]: unknown };
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
    }));

  if (siblings.length === 0 && extra.length === 0) {
    return null;
  }

  return (
    <nav
      aria-label="Related pages"
      className="not-prose mt-12 border-t border-gray-200 pt-6 dark:border-gray-800"
    >
      <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-gray-400">
        Related Pages
      </h3>
      <ul className="mt-4 grid gap-2 sm:grid-cols-2">
        {siblings.map((sibling) => (
          <li key={sibling.href}>
            <Link
              href={sibling.href}
              className="text-sm text-gray-700 transition-colors hover:text-foreground hover:underline dark:text-gray-300"
            >
              {sibling.label}
            </Link>
          </li>
        ))}
        {extra.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              className="text-sm text-gray-700 transition-colors hover:text-foreground hover:underline dark:text-gray-300"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
