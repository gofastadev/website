"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { TerminalBlock } from "@/components/molecules";

export function Hero() {
  const router = useRouter();

  return (
    <section className="relative overflow-hidden px-6 pt-28 pb-20 sm:pt-36 sm:pb-28">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,theme(colors.primary/12),transparent_70%)] dark:bg-[radial-gradient(ellipse_70%_55%_at_50%_0%,theme(colors.primary/18),transparent_70%)]"
      />

      <div className="mx-auto flex max-w-5xl flex-col items-center text-center">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Open Source · Go Toolkit · Agent-Native
        </div>

        <h1 className="max-w-4xl text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
          Ship a production Go backend{" "}
          <span className="bg-gradient-to-br from-primary to-primary/60 bg-clip-text text-transparent">
            this afternoon.
          </span>
        </h1>

        <p className="mt-6 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg md:text-xl">
          Gofasta scaffolds a complete backend in one command — auth,
          databases, background jobs, observability, and deployment wired on
          day one. Standard Go code you own. Built for humans and AI coding
          agents to work on as peers.
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

        <p className="mt-6 font-mono text-xs text-gray-500 dark:text-gray-500">
          go install github.com/gofastadev/cli/cmd/gofasta@latest
        </p>

        <TerminalBlock className="mt-14 max-w-2xl">
          <span className="text-gray-500">$</span>{" "}
          <span className="text-[#4FD1E5]">gofasta</span> new myapp
          {"\n"}
          <span className="text-gray-500">→ Creating project...</span>
          {"\n"}
          <span className="text-gray-500">→ Copying 78 template files...</span>
          {"\n"}
          <span className="text-gray-500">→ Generating Wire DI code...</span>
          {"\n"}
          <span className="text-gray-500">→ Generating GraphQL resolvers...</span>
          {"\n"}
          <span className="text-green-400">
            ✓ Ready — standard Go, zero lock-in, AGENTS.md scaffolded.
          </span>
          {"\n\n"}
          <span className="text-gray-500">$</span> cd myapp && make up
          {"\n"}
          <span className="text-green-400">
            ✓ Server running at http://localhost:8080
          </span>
        </TerminalBlock>
      </div>
    </section>
  );
}
