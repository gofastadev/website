"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { TerminalBlock } from "@/components/molecules";

interface Destination {
  label: string;
  description: string;
  href: string;
}

const destinations: Destination[] = [
  {
    label: "Getting Started",
    description: "Install the CLI and scaffold your first project.",
    href: "/docs/getting-started/introduction",
  },
  {
    label: "CLI Reference",
    description: "Every gofasta command, flag, and generator.",
    href: "/docs/cli-reference",
  },
  {
    label: "API Reference",
    description: "Every package under pkg/* documented.",
    href: "/docs/api-reference",
  },
  {
    label: "White Paper",
    description: "The philosophy and architecture, end to end.",
    href: "/docs/white-paper",
  },
];

export function NotFound() {
  const router = useRouter();

  return (
    <section className="px-6 pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* Giant 404, flat background-scale type. No gradient, no
            shimmer; the terminal below is the centerpiece. */}
        <h1 className="font-mono text-[7rem] font-bold leading-none text-gray-200 sm:text-[10rem] dark:text-gray-800">
          404
        </h1>

        <h2 className="font-display mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
          This route didn&apos;t compile.
        </h2>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
          The page you&apos;re looking for doesn&apos;t exist, moved, or was
          never wired into the router. Don&apos;t worry, everything else is
          still here, and we can point you somewhere useful.
        </p>

        {/* Terminal: a Go-flavoured compile error is the wittiest,
            most on-brand way to say "not found" to this audience, and
            the suggestions double as real navigation. */}
        <TerminalBlock title="gofasta routes" className="mt-12 max-w-2xl text-left">
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.1s" } as React.CSSProperties}
          >
            <span className="text-gray-400">$</span>{" "}
            <span className="text-terminal-accent">gofasta</span> resolve{" "}
            <span className="text-gray-400">&lt;requested-path&gt;</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.5s" } as React.CSSProperties}
          >
            <span className="term-err">./router.go:42:9: </span>
            <span className="text-gray-300">undefined: requested-path</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.9s" } as React.CSSProperties}
          >
            <span className="term-warn">   note: </span>
            <span className="text-gray-400">these routes do resolve</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.3s" } as React.CSSProperties}
          >
            <span className="text-gray-400">        |-- </span>
            <span className="text-terminal-accent">/</span>
            <span className="text-gray-400">                         -&gt; Home</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.6s" } as React.CSSProperties}
          >
            <span className="text-gray-400">        |-- </span>
            <span className="text-terminal-accent">
              /docs/getting-started
            </span>
            <span className="text-gray-400">     -&gt; Quick start</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.9s" } as React.CSSProperties}
          >
            <span className="text-gray-400">        |-- </span>
            <span className="text-terminal-accent">/docs/cli-reference</span>
            <span className="text-gray-400">       -&gt; CLI reference</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.2s" } as React.CSSProperties}
          >
            <span className="text-gray-400">        `-- </span>
            <span className="text-terminal-accent">/docs/white-paper</span>
            <span className="text-gray-400">         -&gt; White paper</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.8s" } as React.CSSProperties}
          >
            {"\n"}
            <span className="text-gray-400">$</span>{" "}
            <span className="text-terminal-accent">gofasta</span> home{" "}
            <span className="gofasta-cursor" aria-hidden="true" />
          </span>
        </TerminalBlock>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button variant="primary" size="lg" onClick={() => router.push("/")}>
            Take me home
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() => router.push("/docs/getting-started/introduction")}
          >
            Browse the docs
          </Button>
        </div>

        {/* Popular destinations: gives users with a broken link four
            high-value next steps. Seam-grid language: gap-px seams,
            full-cell hover fill, no per-card borders. */}
        <div className="mt-16 w-full">
          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Or jump to a popular destination
          </p>
          <ul className="grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 dark:border-gray-800 dark:bg-gray-800">
            {destinations.map((dest) => (
              <li
                key={dest.href}
                className="group bg-surface p-6 transition-colors duration-(--duration-base) ease-(--ease-brand) hover:bg-primary-800"
              >
                <Link href={dest.href} className="block text-left">
                  <span className="font-mono text-sm text-primary group-hover:text-primary-200">
                    {dest.href}
                  </span>
                  <div className="mt-1 text-base font-semibold text-foreground group-hover:text-white">
                    {dest.label}
                  </div>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 group-hover:text-primary-100 dark:text-gray-400">
                    {dest.description}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Soft off-ramp: lowers the emotional cost of hitting a 404 by
            making it trivial to file a broken-link report. */}
        <p className="mt-12 text-sm text-muted">
          Think this page should exist?{" "}
          <Link
            href="https://github.com/gofastadev/website/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline underline-offset-4"
          >
            Let us know on GitHub
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
