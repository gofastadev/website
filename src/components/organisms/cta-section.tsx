"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";

export function CtaSection() {
  const router = useRouter();

  return (
    <section className="px-6 py-20 sm:py-28">
      <div className="gofasta-cta-ring relative mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/30 bg-gradient-to-br from-primary/10 via-transparent to-primary/5 p-10 text-center sm:p-16 dark:from-primary/20 dark:to-primary/10">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,theme(colors.primary/20),transparent_60%)]"
        />
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Try <span className="text-primary">Gofasta</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 dark:text-gray-400 sm:text-lg">
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
      </div>
    </section>
  );
}
