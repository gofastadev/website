"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { CopyableCommand } from "@/components/molecules";

export function CtaSection() {
  const router = useRouter();

  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-surface p-10 text-center shadow-sm sm:p-16">
        {/* Single subtle brand accent — a soft radial glow at the top of
            the box. No stacked gradients, no rotating conic ring — the
            bg stays predictable so the text contrast is stable in both
            themes. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,theme(colors.primary/10),transparent_70%)] dark:bg-[radial-gradient(ellipse_55%_40%_at_50%_0%,theme(colors.primary/15),transparent_70%)]"
        />
        <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Try{" "}
          <span className="text-primary-700 dark:text-primary">Gofasta</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300">
          Install with{" "}
          <span className="font-mono text-sm text-foreground">go install</span>.
          Scaffold with{" "}
          <span className="font-mono text-sm text-foreground">gofasta new</span>.
          Run with{" "}
          <span className="font-mono text-sm text-foreground">gofasta dev</span>.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
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
            onClick={() => router.push("/docs/white-paper")}
          >
            Read the Whitepaper
          </Button>
        </div>
        <CopyableCommand
          className="mx-auto mt-8 max-w-xl"
          size="sm"
          command="go install github.com/gofastadev/cli/cmd/gofasta@latest"
        />
      </div>
    </section>
  );
}
