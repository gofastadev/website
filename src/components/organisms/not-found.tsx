"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { TerminalBlock } from "@/components/molecules";

interface Destination {
  label: string;
  description: string;
  href: string;
  external?: boolean;
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
    description: "All 27 packages under pkg/* documented.",
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
    <section className="relative overflow-hidden px-6 pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Ambient background — same vocabulary as the hero so 404 still
          feels like home: dotted grid, radial glow, two slowly floating
          orbs. All decorative, aria-hidden, and disabled under
          prefers-reduced-motion via global rules. */}
      <div
        aria-hidden="true"
        className="gofasta-grid-bg pointer-events-none absolute inset-0 -z-20 opacity-60"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,theme(colors.primary/12),transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,theme(colors.primary/18),transparent_70%)]"
      />
      <div
        aria-hidden="true"
        className="gofasta-orb pointer-events-none absolute -top-24 -left-32 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,theme(colors.primary/30),transparent_70%)] blur-2xl sm:h-[28rem] sm:w-[28rem]"
      />
      <div
        aria-hidden="true"
        className="gofasta-orb-slow pointer-events-none absolute -top-10 -right-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,theme(colors.accent/25),transparent_70%)] blur-2xl sm:h-96 sm:w-96"
      />

      {/* Breathing Go fragments — lighter than the hero so they don't
          drown out the centerpiece numeral. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0 overflow-hidden text-muted"
      >
        <span
          className="gofasta-code-breath absolute left-[5%] top-[14%] font-mono text-xs whitespace-nowrap"
          style={{ animationDelay: "0s" }}
        >
          if err != nil &#123;
        </span>
        <span
          className="gofasta-code-breath absolute right-[6%] top-[12%] font-mono text-xs whitespace-nowrap"
          style={{ animationDelay: "1.4s" }}
        >
          return ErrNotFound
        </span>
        <span
          className="gofasta-code-breath absolute left-[8%] top-[30%] font-mono text-sm whitespace-nowrap"
          style={{ animationDelay: "2.8s" }}
        >
          router.Resolve(path)
        </span>
        <span
          className="gofasta-code-breath absolute right-[4%] top-[28%] font-mono text-sm whitespace-nowrap"
          style={{ animationDelay: "0.8s" }}
        >
          404: no route matched
        </span>
        <span
          className="gofasta-code-breath absolute left-[4%] top-[72%] font-mono text-xs whitespace-nowrap"
          style={{ animationDelay: "3.6s" }}
        >
          ctx.Abort(404)
        </span>
        <span
          className="gofasta-code-breath absolute right-[8%] top-[74%] font-mono text-xs whitespace-nowrap"
          style={{ animationDelay: "5.2s" }}
        >
          {"// page not found"}
        </span>
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        {/* Eyebrow — signals the HTTP status in a way that reinforces
            the Go/backend vibe without being cold. */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-medium text-primary sm:text-sm">
          <span
            aria-hidden="true"
            className="gofasta-pulse-dot h-2 w-2 rounded-full bg-primary"
          />
          HTTP 404 · route not found
        </div>

        {/* Giant 404 — reuses the hero's gradient shimmer so it reads as
            a brand moment, not a stock error page. */}
        <h1 className="gofasta-headline-shimmer bg-gradient-to-br from-primary to-primary/50 bg-clip-text font-mono text-[8rem] font-bold leading-none tracking-tight text-transparent sm:text-[12rem] md:text-[14rem]">
          404
        </h1>

        <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-tight sm:text-3xl md:text-4xl">
          This route didn&rsquo;t compile.
        </h2>

        <p className="mt-5 max-w-xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
          The page you&rsquo;re looking for doesn&rsquo;t exist, moved, or was
          never wired into the router. Don&rsquo;t worry &mdash; everything
          else is still here, and we can point you somewhere useful.
        </p>

        {/* Terminal — a Go-flavoured compile error is the wittiest,
            most on-brand way to say "not found" to this audience, and
            the suggestions double as real navigation. */}
        <TerminalBlock className="mt-12 max-w-2xl text-left">
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.1s" } as React.CSSProperties}
          >
            <span className="text-gray-500">$</span>{" "}
            <span className="text-terminal-accent">gofasta</span> resolve{" "}
            <span className="text-gray-400">&lt;requested-path&gt;</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.5s" } as React.CSSProperties}
          >
            <span className="text-red-400">./router.go:42:9: </span>
            <span className="text-gray-300">undefined: requested-path</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.9s" } as React.CSSProperties}
          >
            <span className="text-yellow-400">   note: </span>
            <span className="text-gray-400">these routes do resolve</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.3s" } as React.CSSProperties}
          >
            <span className="text-gray-500">        ├─ </span>
            <span className="text-terminal-accent">/</span>
            <span className="text-gray-400">                         → Home</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.6s" } as React.CSSProperties}
          >
            <span className="text-gray-500">        ├─ </span>
            <span className="text-terminal-accent">
              /docs/getting-started
            </span>
            <span className="text-gray-400">     → Quick start</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.9s" } as React.CSSProperties}
          >
            <span className="text-gray-500">        ├─ </span>
            <span className="text-terminal-accent">/docs/cli-reference</span>
            <span className="text-gray-400">       → CLI reference</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.2s" } as React.CSSProperties}
          >
            <span className="text-gray-500">        └─ </span>
            <span className="text-terminal-accent">/docs/white-paper</span>
            <span className="text-gray-400">         → White paper</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.8s" } as React.CSSProperties}
          >
            {"\n"}
            <span className="text-gray-500">$</span>{" "}
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

        {/* Popular destinations — gives users with a broken link four
            high-value next steps, each visually distinct enough to pick
            out at a glance. Same card-glow vocabulary as feature cards. */}
        <div className="mt-16 w-full">
          <p className="mb-6 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Or jump to a popular destination
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {destinations.map((dest) => (
              <Link
                key={dest.href}
                href={dest.href}
                target={dest.external ? "_blank" : undefined}
                rel={dest.external ? "noopener noreferrer" : undefined}
                className="gofasta-card-glow group relative block rounded-xl border border-gray-200 bg-surface p-5 text-left transition-colors hover:border-primary/40 dark:border-gray-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-mono text-sm text-primary">
                      {dest.href}
                    </div>
                    <div className="mt-1 text-base font-semibold text-foreground">
                      {dest.label}
                    </div>
                    <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                      {dest.description}
                    </p>
                  </div>
                  <span
                    aria-hidden="true"
                    className="mt-1 text-lg text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                  >
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Soft off-ramp — lowers the emotional cost of hitting a 404 by
            making it trivial to file a broken-link report. */}
        <p className="mt-12 text-sm text-muted">
          Think this page should exist?{" "}
          <Link
            href="https://github.com/gofastadev/website/issues/new"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            Let us know on GitHub
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
