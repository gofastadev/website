import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import type { BlogPost } from "@/lib/blog";

// Card used in the blog index grid and the tag-filtered list. Shows
// cover, title, excerpt, publish date, reading time, and the first
// few tags. The whole card is wrapped in a single link to the post
// to maximize the clickable target on mobile.
//
// Tag pills inside the card are *visual* — they navigate to the post,
// not to the tag page, because nested links aren't valid HTML.
// Dedicated tag-page navigation lives in the article header instead.

const MAX_VISIBLE_TAGS = 3;

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export interface BlogPostCardProps {
  post: BlogPost;
  className?: string;
}

export function BlogPostCard({ post, className }: BlogPostCardProps) {
  const visibleTags = post.tags.slice(0, MAX_VISIBLE_TAGS);
  return (
    <article
      className={cn(
        "group overflow-hidden rounded-xl border border-gray-200 bg-white transition-colors hover:border-primary/40 dark:border-white/10 dark:bg-white/[0.02]",
        className,
      )}
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col"
        aria-label={post.title}
      >
        <div className="relative aspect-[1200/630] w-full overflow-hidden bg-gray-100 dark:bg-black/40">
          <Image
            src={post.coverUrl}
            alt=""
            fill
            sizes="(min-width: 1024px) 400px, (min-width: 640px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex items-center gap-3 text-xs text-gray-700 dark:text-gray-400">
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingTime.text}</span>
          </div>
          <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
            {post.title}
          </h3>
          <p className="line-clamp-2 text-sm text-gray-700 dark:text-gray-400">
            {post.description}
          </p>
          {visibleTags.length > 0 ? (
            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {visibleTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-2.5 py-0.5 text-[11px] font-medium text-primary"
                >
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>
      </Link>
    </article>
  );
}

