import Link from "next/link";
import { cn } from "@/lib/utils";

// Series navigation card rendered between the article header and the
// body: "Part N of M in: <series>" plus the full part list so a
// reader landing mid-series can orient and jump anywhere. The current
// post is highlighted and deliberately NOT a link (aria-current
// carries the semantics). Server component — plain links, no JS.
//
// Props are plain shapes, not BlogPost: the page maps the server-only
// blog service's results down to what the card needs.

export interface SeriesNavItem {
  slug: string;
  title: string;
  part: number;
}

export interface SeriesNavCardProps {
  seriesName: string;
  items: SeriesNavItem[];
  currentSlug: string;
}

export function SeriesNavCard({
  seriesName,
  items,
  currentSlug,
}: SeriesNavCardProps) {
  if (items.length < 2) return null;
  const currentIndex = items.findIndex((item) => item.slug === currentSlug);
  if (currentIndex === -1) return null;

  return (
    <nav
      aria-label={`Series: ${seriesName}`}
      data-pagefind-ignore
      className="mb-8 rounded-xl border border-primary/25 bg-primary/[0.04] p-5 dark:bg-primary/[0.08]"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-primary">
        Part {items[currentIndex].part} of {items.length} in: {seriesName}
      </p>
      <ol className="mt-3 flex flex-col gap-1.5 text-sm">
        {items.map((item) => {
          const isCurrent = item.slug === currentSlug;
          return (
            <li key={item.slug} className="flex items-baseline gap-2">
              <span
                aria-hidden
                className="font-mono text-xs text-gray-500 dark:text-gray-500"
              >
                {item.part}.
              </span>
              {isCurrent ? (
                <span
                  aria-current="page"
                  className={cn("font-medium text-foreground")}
                >
                  {item.title}
                </span>
              ) : (
                <Link
                  href={`/blog/${item.slug}`}
                  className="text-gray-700 transition-colors hover:text-primary dark:text-gray-300"
                >
                  {item.title}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
