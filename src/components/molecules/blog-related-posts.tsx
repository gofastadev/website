import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

// Picks the most-related posts for an article footer. "Related" is
// scored by tag overlap — count of tags the candidate shares with
// the current post — with a recency tie-breaker. If no candidate
// shares any tag we fall back to the most recent N other posts so
// the section is never empty when there's content to surface.

export interface BlogRelatedPostsProps {
  currentSlug: string;
  allPosts: BlogPost[];
  limit?: number;
}

function rankCandidates(
  current: BlogPost,
  candidates: BlogPost[],
): BlogPost[] {
  const currentTags = new Set(current.tags);
  return candidates
    .map((post) => {
      let shared = 0;
      for (const tag of post.tags) {
        if (currentTags.has(tag)) shared++;
      }
      return { post, shared };
    })
    .sort((a, b) => {
      if (b.shared !== a.shared) return b.shared - a.shared;
      return Date.parse(b.post.publishedAt) - Date.parse(a.post.publishedAt);
    })
    .map((entry) => entry.post);
}

export function BlogRelatedPosts({
  currentSlug,
  allPosts,
  limit = 3,
}: BlogRelatedPostsProps) {
  const current = allPosts.find((p) => p.slug === currentSlug);
  if (!current) return null;

  const candidates = allPosts.filter((p) => p.slug !== currentSlug);
  if (candidates.length === 0) return null;

  const related = rankCandidates(current, candidates).slice(0, limit);

  return (
    <section
      aria-label="Related posts"
      className="mt-12 border-t border-white/10 pt-8"
    >
      <h2 className="mb-4 text-lg font-semibold text-white">Related posts</h2>
      <ul className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {related.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="block rounded-lg border border-white/10 bg-white/[0.02] p-4 transition-colors hover:border-primary/40"
            >
              <span className="text-sm font-medium text-white">
                {post.title}
              </span>
              <span className="mt-1 block text-xs text-gray-400">
                {post.readingTime.text}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
