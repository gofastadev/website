"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";

export function ComingSoon() {
  const router = useRouter();

  return (
    <section className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <Image
        src="/logo.png"
        alt="Gofasta"
        width={80}
        height={80}
        className="mb-8 rounded-2xl"
        priority
      />

      <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
        Coming Soon
      </div>

      <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl">
        The Go backend toolkit is{" "}
        <span className="text-primary">almost here.</span>
      </h1>

      <p className="mt-6 max-w-xl text-base text-muted sm:text-lg">
        Production-ready scaffolding, composable packages, and zero magic.
        We&apos;re putting the finishing touches on something useful.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button
          variant="primary"
          size="lg"
          onClick={() => router.push("/docs/white-paper")}
        >
          Read the White Paper
        </Button>
        <Button
          variant="secondary"
          size="lg"
          onClick={() => window.open("https://github.com/gofastadev/gofasta", "_blank")}
        >
          Star on GitHub
        </Button>
      </div>

      <p className="mt-16 text-sm text-muted">
        &copy; 2025&ndash;{new Date().getFullYear()} Gofasta Authors &mdash;
        MIT License
      </p>
    </section>
  );
}
