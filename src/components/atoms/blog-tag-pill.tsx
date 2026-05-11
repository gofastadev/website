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
        "inline-flex items-center rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/10",
        className,
      )}
    >
      #{tag}
    </Link>
  );
}
