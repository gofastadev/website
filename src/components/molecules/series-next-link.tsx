import Link from "next/link";

// "Next in series" pointer rendered after the article body — the
// highest-intent moment to continue a multi-part read. Sits alongside
// the chronological BlogPrevNext, which orders by publish date across
// the whole blog; this one follows the series' explicit part order.
// Server component.

export interface SeriesNextLinkProps {
  seriesName: string;
  title: string;
  slug: string;
}

export function SeriesNextLink({
  seriesName,
  title,
  slug,
}: SeriesNextLinkProps) {
  return (
    <div className="my-8 rounded-xl border border-gray-200 p-5 dark:border-white/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-400">
        Next in {seriesName}
      </p>
      <Link
        href={`/blog/${slug}`}
        className="mt-1 inline-block font-medium text-foreground transition-colors hover:text-primary"
      >
        {title}
      </Link>
    </div>
  );
}
