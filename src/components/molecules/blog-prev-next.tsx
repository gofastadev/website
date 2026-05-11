import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

// Tiny inline arrow glyphs — avoids pulling lucide-react into the
// bundle just for two chevrons. The viewBox/path is the standard
// shape used across the design system.
function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

// Prev/Next pair rendered at the bottom of an article. `prev` is the
// post *older* than the current one, `next` is the post *newer*. If
// either side is null (the current post is the oldest or newest), we
// render just the side that exists and skip the other slot — no
// disabled placeholder, which would only add visual noise.

export interface BlogPrevNextProps {
  prev: BlogPost | null;
  next: BlogPost | null;
}

export function BlogPrevNext({ prev, next }: BlogPrevNextProps) {
  if (!prev && !next) return null;
  return (
    <nav
      aria-label="Adjacent posts"
      className="mt-12 grid grid-cols-1 gap-4 border-t border-gray-200 pt-8 dark:border-white/10 sm:grid-cols-2"
    >
      {prev ? (
        <Link
          href={`/blog/${prev.slug}`}
          className="group flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.02]"
        >
          <span className="flex items-center gap-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
            <ChevronLeft className="h-3 w-3" aria-hidden />
            Older post
          </span>
          <span className="font-medium text-foreground group-hover:text-primary">
            {prev.title}
          </span>
        </Link>
      ) : (
        <div aria-hidden />
      )}
      {next ? (
        <Link
          href={`/blog/${next.slug}`}
          className="group flex flex-col gap-1 rounded-lg border border-gray-200 bg-white p-4 text-right transition-colors hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.02] sm:items-end"
        >
          <span className="flex items-center justify-end gap-1 text-xs uppercase tracking-wide text-gray-500 dark:text-gray-500">
            Newer post
            <ChevronRight className="h-3 w-3" aria-hidden />
          </span>
          <span className="font-medium text-foreground group-hover:text-primary">
            {next.title}
          </span>
        </Link>
      ) : (
        <div aria-hidden />
      )}
    </nav>
  );
}
