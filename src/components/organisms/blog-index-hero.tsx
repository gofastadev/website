import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/lib/blog";

// Featured-post hero rendered at the top of `/blog`. Bigger than a
// regular card, two-column on desktop (cover on the left, text on
// the right). Falls back to a centered single-column on mobile.

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface BlogIndexHeroProps {
  post: BlogPost;
}

export function BlogIndexHero({ post }: BlogIndexHeroProps) {
  return (
    <section
      aria-label="Featured post"
      className="mb-12 overflow-hidden rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/[0.02]"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 lg:grid-cols-2"
      >
        <div className="relative aspect-[1200/630] w-full overflow-hidden bg-gray-100 dark:bg-black/40 lg:aspect-auto">
          <Image
            src={post.coverUrl}
            alt=""
            fill
            priority
            sizes="(min-width: 1024px) 600px, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
          />
        </div>
        <div className="flex flex-col justify-center gap-4 p-8">
          <div className="text-xs font-medium uppercase tracking-widest text-primary">
            Latest post
          </div>
          <h2 className="text-3xl font-bold leading-tight text-foreground group-hover:text-primary sm:text-4xl">
            {post.title}
          </h2>
          <p className="text-base text-gray-800 dark:text-gray-300">
            {post.description}
          </p>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-700 dark:text-gray-400">
            <span className="font-medium text-gray-900 dark:text-gray-200">
              {post.author}
            </span>
            <span aria-hidden>·</span>
            <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
            <span aria-hidden>·</span>
            <span>{post.readingTime.text}</span>
          </div>
        </div>
      </Link>
    </section>
  );
}
