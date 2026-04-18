"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { CopyableCommand, TerminalBlock } from "@/components/molecules";

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden px-6 pt-28 pb-20 sm:pt-36 sm:pb-28">
      {/* Ambient background layers — dotted grid, radial glow, and two
          slowly floating orbs. All aria-hidden, all pointer-events-none,
          all disabled when the user prefers reduced motion. */}
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
        className="gofasta-orb pointer-events-none absolute -top-20 -left-28 -z-10 h-80 w-80 rounded-full bg-[radial-gradient(circle,theme(colors.primary/30),transparent_70%)] blur-2xl sm:h-[28rem] sm:w-[28rem]"
      />
      <div
        aria-hidden="true"
        className="gofasta-orb-slow pointer-events-none absolute -top-10 -right-24 -z-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,theme(colors.accent/25),transparent_70%)] blur-2xl sm:h-96 sm:w-96"
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          A Go backend you&rsquo;d write yourself —{" "}
          <span className="gofasta-headline-shimmer bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
            scaffolded.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg md:text-xl">
          Gofasta is a CLI and library for Go backend services. It scaffolds
          a project in one command — standard Go, compile-time DI, every
          package swappable — with first-class tooling for AI coding agents.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => router.push("/docs/getting-started/introduction")}
          >
            Get Started
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={() =>
              window.open("https://github.com/gofastadev/cli", "_blank", "noopener,noreferrer")
            }
          >
            View on GitHub
          </Button>
        </div>

        <CopyableCommand
          className="mt-6 max-w-xl"
          size="sm"
          command="go install github.com/gofastadev/cli/cmd/gofasta@latest"
        />

        <TerminalBlock className="mt-14 max-w-2xl">
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.1s" } as React.CSSProperties}
          >
            <span className="text-gray-500">$</span>{" "}
            <span className="text-terminal-accent">gofasta</span> new myapp
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.5s" } as React.CSSProperties}
          >
            <span className="text-gray-500">→ Creating project...</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.8s" } as React.CSSProperties}
          >
            <span className="text-gray-500">→ Copying 78 template files...</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.1s" } as React.CSSProperties}
          >
            <span className="text-gray-500">→ Generating Wire DI code...</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.5s" } as React.CSSProperties}
          >
            <span className="text-green-400">
              ✓ Ready — standard Go, zero lock-in, AGENTS.md scaffolded.
            </span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.0s" } as React.CSSProperties}
          >
            {"\n"}
            <span className="text-gray-500">$</span> cd myapp &&{" "}
            <span className="text-terminal-accent">gofasta</span> dev
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.5s" } as React.CSSProperties}
          >
            <span className="text-green-400">
              ✓ Listening on :8080 — /health, /metrics, /swagger live.
            </span>
            {" "}
            <span className="gofasta-cursor" aria-hidden="true" />
          </span>
        </TerminalBlock>
      </div>
    </section>
  );
}
