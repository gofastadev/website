import Link from "next/link";
import { cn } from "@/lib/utils";

// Single tag chip linking to that tag's index page. Pure server
// component — no client interactivity. Pill styling tracks the
// site's design tokens (Go cyan accent) and adapts to dark mode via
// the existing `dark:` Tailwind variants.

export interface BlogTagPillProps {
  tag: string;
  href?: string;
  className?: string;
}

export function BlogTagPill({ tag, href, className }: BlogTagPillProps) {
  const target = href ?? `/blog/tags/${tag}`;
  return (
    <Link
      href={target}
      className={cn(
        "inline-flex items-center rounded-lg border border-gray-200 px-3 py-1 font-mono text-xs text-primary transition-colors duration-(--duration-base) ease-(--ease-brand) hover:border-primary-800 hover:bg-primary-800 hover:text-white dark:border-gray-800",
        className,
      )}
    >
      #{tag}
    </Link>
  );
}
