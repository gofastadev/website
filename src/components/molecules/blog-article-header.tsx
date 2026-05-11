import Image from "next/image";
import Link from "next/link";
import { BlogTagPill } from "@/components/atoms/blog-tag-pill";
import type { BlogPost } from "@/lib/blog";

// Top-of-article header: tag pills, title, byline (author + date +
// reading time), and cover image. Renders on the post detail route
// and stays in document order so a print stylesheet or RSS preview
// gets the same surface a reader sees.

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export interface BlogArticleHeaderProps {
  post: BlogPost;
}

export function BlogArticleHeader({ post }: BlogArticleHeaderProps) {
  return (
    <header className="mb-10 flex flex-col gap-6">
      {post.tags.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <BlogTagPill key={tag} tag={tag} />
          ))}
        </div>
      ) : null}

      <h1 className="text-4xl font-bold leading-tight text-foreground sm:text-5xl">
        {post.title}
      </h1>

      <p className="text-lg text-gray-800 dark:text-gray-300">
        {post.description}
      </p>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-gray-700 dark:text-gray-400">
        {post.authorUrl ? (
          <Link
            href={post.authorUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-gray-900 hover:text-primary dark:text-gray-200"
          >
            {post.author}
          </Link>
        ) : (
          <span className="font-medium text-gray-900 dark:text-gray-200">
            {post.author}
          </span>
        )}
        <span aria-hidden>·</span>
        <time dateTime={post.publishedAt}>{formatDate(post.publishedAt)}</time>
        <span aria-hidden>·</span>
        <span>{post.readingTime.text}</span>
        {post.updatedAt ? (
          <>
            <span aria-hidden>·</span>
            <span>
              Updated{" "}
              <time dateTime={post.updatedAt}>{formatDate(post.updatedAt)}</time>
            </span>
          </>
        ) : null}
      </div>

      <div className="relative aspect-[1200/630] w-full overflow-hidden rounded-xl border border-gray-200 bg-gray-100 dark:border-white/10 dark:bg-black/40">
        <Image
          src={post.coverUrl}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 800px, 100vw"
          className="object-cover"
        />
      </div>
    </header>
  );
}
