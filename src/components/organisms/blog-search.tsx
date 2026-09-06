"use client";

import { useRef, useState } from "react";
import { Input } from "@/components/atoms";

// Full-text search over blog posts, backed by the Pagefind index the
// postbuild step writes to public/_pagefind. The runtime bundle is a
// static asset, not an npm module — it can only be loaded with a
// bundler-ignored dynamic import. In `next dev` the asset doesn't
// exist (the index is produced by `yarn build`), so the import 404s
// and the component degrades to a disabled input with a hint.
//
// The index covers the whole site (docs + blog); results are scoped
// here by URL prefix. Pagefind serves fragment URLs with the `.html`
// suffix (its crawl root is .next/server/app), so normalization strips
// it before filtering and rendering.

interface PagefindResultData {
  url: string;
  excerpt: string;
  meta?: { title?: string };
}

interface PagefindResult {
  data: () => Promise<PagefindResultData>;
}

interface Pagefind {
  debouncedSearch: (
    query: string,
    options?: object,
    debounceMs?: number,
  ) => Promise<{ results: PagefindResult[] } | null>;
}

export interface BlogSearchHit {
  url: string;
  title: string;
  excerpt: string;
}

// Exported for tests and as the single place Pagefind's URL shape is
// known: strip the .html suffix, keep only blog post pages.
export function scopeToBlogPosts(
  hits: Array<{ url: string; title: string; excerpt: string }>,
  limit = 10,
): BlogSearchHit[] {
  return hits
    .map((hit) => ({ ...hit, url: hit.url.replace(/\.html$/, "") }))
    .filter((hit) => hit.url.startsWith("/blog/"))
    .slice(0, limit);
}

// Exported for tests. The specifier is passed through a variable so
// neither bundler (Turbopack building the site, Vite running vitest)
// tries to resolve a /public asset at compile time — it's fetched by
// the browser at runtime, after the postbuild step has produced it.
// The importer is injectable so the baseUrl/options contract is
// testable without a real asset on disk.
export async function defaultLoadPagefind(
  importAsset: (specifier: string) => Promise<unknown> = (specifier) =>
    import(/* webpackIgnore: true */ /* @vite-ignore */ specifier),
): Promise<Pagefind> {
  const pagefind = (await importAsset("/_pagefind/pagefind.js")) as Pagefind & {
    options?: (opts: object) => Promise<void>;
  };
  await pagefind.options?.({ baseUrl: "/" });
  return pagefind;
}

export interface BlogSearchProps {
  placeholder?: string;
  /** Test seam — production uses the bundler-ignored dynamic import. */
  loadPagefind?: () => Promise<Pagefind>;
}

export function BlogSearch({
  placeholder = "Search posts...",
  loadPagefind = defaultLoadPagefind,
}: BlogSearchProps) {
  const pagefindRef = useRef<Pagefind | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [query, setQuery] = useState("");
  const [hits, setHits] = useState<BlogSearchHit[]>([]);
  const [searching, setSearching] = useState(false);

  const ensurePagefind = async (): Promise<Pagefind | null> => {
    if (pagefindRef.current) return pagefindRef.current;
    try {
      pagefindRef.current = await loadPagefind();
      return pagefindRef.current;
    } catch {
      // next dev — the index only exists on the production build.
      setUnavailable(true);
      return null;
    }
  };

  const runSearch = async (value: string) => {
    setQuery(value);
    if (!value.trim()) {
      setHits([]);
      return;
    }
    const pagefind = await ensurePagefind();
    if (!pagefind) return;

    setSearching(true);
    // debouncedSearch resolves null for calls superseded by newer input.
    const response = await pagefind.debouncedSearch(value, {}, 250);
    if (response === null) return;

    const data = await Promise.all(
      response.results.slice(0, 30).map((result) => result.data()),
    );
    setHits(
      scopeToBlogPosts(
        data.map((d) => ({
          url: d.url,
          title: d.meta?.title ?? d.url,
          excerpt: d.excerpt,
        })),
      ),
    );
    setSearching(false);
  };

  return (
    <div data-pagefind-ignore className="mb-10">
      <Input
        type="search"
        aria-label="Search blog posts"
        placeholder={
          unavailable ? "Search is available on the production build" : placeholder
        }
        disabled={unavailable}
        value={query}
        onFocus={() => {
          void ensurePagefind();
        }}
        onChange={(event) => {
          void runSearch(event.target.value);
        }}
        className="max-w-md"
      />
      {query.trim() && !unavailable ? (
        <div className="mt-4">
          {hits.length > 0 ? (
            <ul className="flex flex-col gap-4">
              {hits.map((hit) => (
                <li key={hit.url}>
                  <a
                    href={hit.url}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {hit.title}
                  </a>
                  <p
                    className="mt-1 text-sm text-gray-600 [&_mark]:bg-primary/20 [&_mark]:text-inherit dark:text-gray-400"
                    // Pagefind escapes page content and wraps matches in
                    // <mark>; this is its documented excerpt contract.
                    dangerouslySetInnerHTML={{ __html: hit.excerpt }}
                  />
                </li>
              ))}
            </ul>
          ) : searching ? (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Searching…
            </p>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No posts match &quot;{query}&quot;.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
