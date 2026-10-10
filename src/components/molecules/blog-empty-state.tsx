import Link from "next/link";
import { TerminalBlock } from "./terminal-block";

// Blog index with zero published posts. Instead of a lone gray box,
// this reads as a deliberate "coming soon" page: the copy sets
// expectations, the terminal reuses the hero's idiom so the page still
// feels like Gofasta, and the links give the visitor something to do
// (docs, feed, repo) while the first post is written.

const termLines: Array<{ prompt?: boolean; text: string; accent?: boolean }> =
  [
    { prompt: true, text: "ls -la posts/" },
    { text: "total 0" },
    { prompt: true, text: "git log --oneline -- posts/" },
    { text: "(no commits yet)" },
    { prompt: true, text: "# writing the first one", accent: true },
  ];

export function BlogEmptyState() {
  return (
    <section
      aria-labelledby="blog-empty-heading"
      data-pagefind-ignore
      className="grid items-center gap-10 rounded-2xl border border-gray-200 bg-surface p-8 shadow-e1 sm:p-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14 lg:p-12 dark:border-gray-800"
    >
      <div>
        <p className="inline-flex items-center gap-2 font-mono text-xs font-medium uppercase tracking-wider text-primary">
          <span
            aria-hidden="true"
            className="gofasta-pulse-dot size-2 rounded-full bg-primary"
          />
          Nothing published yet
        </p>
        <h2
          id="blog-empty-heading"
          className="mt-4 font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
        >
          The first post is being written.
        </h2>
        <p className="mt-4 max-w-[48ch] text-base text-gray-700 dark:text-gray-300">
          Release notes, CLI changes and longer pieces on building Go
          backends will land here. Until then, the docs are the best place
          to start, and the feed will tell you the moment something ships.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/docs"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-contrast transition-[background-color,transform] duration-(--duration-fast) ease-(--ease-brand) hover:bg-primary-400 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background dark:hover:bg-primary-300"
          >
            Read the docs
          </Link>
          <a
            href="/blog/rss.xml"
            className="inline-flex items-center justify-center rounded-lg border border-primary px-5 py-2.5 text-sm font-semibold text-primary transition-[background-color,color,transform] duration-(--duration-fast) ease-(--ease-brand) hover:bg-primary hover:text-primary-contrast active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            Subscribe via RSS
          </a>
        </div>
        <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
          Prefer commits to prose?{" "}
          <a
            href="https://github.com/gofastadev"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Follow the toolkit on GitHub
          </a>
          .
        </p>
      </div>

      <TerminalBlock title="~/blog" className="min-w-0">
        {termLines.map((line, index) => (
          <span
            key={line.text}
            className="gofasta-term-line"
            style={
              {
                "--gofasta-term-delay": `${index * 0.17}s`,
              } as React.CSSProperties
            }
          >
            {line.prompt ? <span className="text-gray-400">$ </span> : null}
            <span className={line.accent ? "text-terminal-accent" : undefined}>
              {line.text}
            </span>
            {index === termLines.length - 1 ? (
              <>
                {" "}
                <span className="gofasta-cursor" aria-hidden="true" />
              </>
            ) : null}
          </span>
        ))}
      </TerminalBlock>
    </section>
  );
}
