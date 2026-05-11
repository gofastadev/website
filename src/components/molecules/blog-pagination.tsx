import Link from "next/link";
import { cn } from "@/lib/utils";

// Numeric pagination for the blog index. Page 1 lives at `/blog`,
// every subsequent page lives at `/blog?page=N`. We render page
// numbers plus prev/next arrows. No ellipsis collapsing for now —
// at 12 posts/page the toolkit would need 100+ posts before any
// reasonable layout overflowed, which is years away.

export interface BlogPaginationProps {
  currentPage: number;
  totalPages: number;
  basePath?: string;
}

function pageHref(base: string, page: number): string {
  if (page <= 1) return base;
  return `${base}?page=${page}`;
}

export function BlogPagination({
  currentPage,
  totalPages,
  basePath = "/blog",
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const hasPrev = currentPage > 1;
  const hasNext = currentPage < totalPages;

  return (
    <nav
      aria-label="Pagination"
      className="mt-10 flex items-center justify-center gap-2"
    >
      {hasPrev ? (
        <Link
          href={pageHref(basePath, currentPage - 1)}
          rel="prev"
          className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:border-primary/40 hover:text-primary"
        >
          Previous
        </Link>
      ) : null}

      {pages.map((page) => {
        const isCurrent = page === currentPage;
        return (
          <Link
            key={page}
            href={pageHref(basePath, page)}
            aria-current={isCurrent ? "page" : undefined}
            className={cn(
              "min-w-[2.25rem] rounded-md border px-3 py-1.5 text-center text-sm transition-colors",
              isCurrent
                ? "border-primary bg-primary/10 font-semibold text-primary"
                : "border-white/10 text-gray-300 hover:border-primary/40 hover:text-primary",
            )}
          >
            {page}
          </Link>
        );
      })}

      {hasNext ? (
        <Link
          href={pageHref(basePath, currentPage + 1)}
          rel="next"
          className="rounded-md border border-white/10 px-3 py-1.5 text-sm text-gray-300 hover:border-primary/40 hover:text-primary"
        >
          Next
        </Link>
      ) : null}
    </nav>
  );
}
