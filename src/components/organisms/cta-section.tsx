"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { CopyableCommand } from "@/components/molecules";
import { trackEvent } from "@/lib/analytics";

export function CtaSection() {
  const router = useRouter();

  return (
    <section className="section-reveal border-t border-gray-200 px-6 py-section-lg dark:border-gray-800">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <h2 className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Try <span className="text-primary">Gofasta</span>
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg dark:text-gray-300">
          Install with{" "}
          <span className="font-mono text-sm text-foreground">go install</span>.
          Scaffold with{" "}
          <span className="font-mono text-sm text-foreground">gofasta new</span>.
          Run with{" "}
          <span className="font-mono text-sm text-foreground">gofasta dev</span>.
        </p>
        <Button
          variant="primary"
          size="lg"
          className="mt-10"
          onClick={() => {
            trackEvent("cta_get_started", {
              location: "cta_section",
              destination: "/docs/getting-started/introduction",
            });
            router.push("/docs/getting-started/introduction");
          }}
        >
          Get started
        </Button>
        <CopyableCommand
          className="mt-8 max-w-xl"
          size="sm"
          command="go install github.com/gofastadev/cli/cmd/gofasta@latest"
        />
      </div>
    </section>
  );
}
