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
      className="rounded-xl border border-gray-200 bg-surface p-5 shadow-e1 dark:border-gray-800"
    >
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-400">
        Tags
      </h2>
      <ul className="flex flex-wrap gap-2">
        {tags.map(({ tag, count }) => (
          <li key={tag}>
            <Link
              href={`/blog/tags/${tag}`}
              className="group inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1 font-mono text-xs text-primary transition-colors duration-(--duration-base) ease-(--ease-brand) hover:border-primary-800 hover:bg-primary-800 hover:text-white dark:border-gray-800"
            >
              <span>#{tag}</span>
              <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold text-primary/80 transition-colors duration-(--duration-base) ease-(--ease-brand) group-hover:bg-white/20 group-hover:text-white">
                {count}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </aside>
  );
}
