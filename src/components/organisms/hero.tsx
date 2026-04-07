"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { TerminalBlock } from "@/components/molecules";

export function Hero() {
  const router = useRouter();

  return (
    <section className="flex flex-col items-center px-6 pt-24 pb-16 text-center sm:pt-32 sm:pb-20">
      <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:px-4 sm:py-1.5 sm:text-sm">
        Open Source Go Toolkit
      </div>

      <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        Stop wiring plumbing.{" "}
        <span className="text-primary">Start shipping.</span>
      </h1>

      <p className="mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:mt-6 sm:text-lg md:text-xl">
        Gofasta generates production-ready Go backends — models, services,
        controllers, migrations, auth, jobs, and deployment configs — so you
        can focus on what makes your project different.
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
          onClick={() => window.open("https://github.com/gofastadev/gofasta", "_blank")}
        >
          View on GitHub
        </Button>
      </div>

      <TerminalBlock className="mt-16 max-w-2xl">
        <span className="text-gray-500">$</span>{" "}
        <span className="text-green-400">gofasta</span> new myapp{"\n"}
        <span className="text-gray-500">Creating project...</span>
        {"\n"}
        <span className="text-gray-500">Running go mod init...</span>
        {"\n"}
        <span className="text-gray-500">Copying 78 template files...</span>
        {"\n"}
        <span className="text-gray-500">Installing dependencies...</span>
        {"\n"}
        <span className="text-gray-500">Generating Wire DI code...</span>
        {"\n"}
        <span className="text-gray-500">
          Generating GraphQL resolvers...
        </span>
        {"\n"}
        <span className="text-green-400">
          Done! Project created at ./myapp
        </span>
        {"\n\n"}
        <span className="text-gray-500">$</span> cd myapp && make up{"\n"}
        <span className="text-green-400">
          Server running at http://localhost:8080
        </span>
      </TerminalBlock>
    </section>
  );
}
