import Link from "next/link";
import type { TagSummary } from "@/lib/blog";

// Sidebar / footer tag index. Each entry links to the tag page and
// shows the post count for that tag in a small muted chip. Empty
// state renders nothing so we don't ship a section with no entries.

export interface BlogTagCloudProps {
  tags: TagSummary[];
}

export function BlogTagCloud({ tags }: BlogTagCloudProps) {
  if (tags.length === 0) return null;
  return (
    <aside
      aria-label="All tags"
      className="rounded-xl border border-gray-200 bg-white p-5 dark:border-white/10 dark:bg-white/[0.02]"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
        Tags
      </h2>
      <ul className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/blog/tags/${tag}`}
              className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs font-medium text-primary transition-colors hover:border-primary/60 hover:bg-primary/10"
            >
              <span>#{tag}</span>
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary/80">
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
