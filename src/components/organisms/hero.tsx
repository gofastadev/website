import Link from "next/link";
import { TerminalBlock } from "@/components/molecules";

export function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pt-24 pb-16 text-center sm:pt-32 sm:pb-20">
      <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary sm:px-4 sm:py-1.5 sm:text-sm">
        Open Source Go Framework
      </div>

      <h1 className="max-w-4xl text-3xl font-bold leading-tight tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
        Build Go backends at{" "}
        <span className="text-primary">lightning speed</span>
      </h1>

      <p className="mt-4 max-w-2xl text-base text-gray-600 dark:text-gray-400 sm:mt-6 sm:text-lg md:text-xl">
        Production-ready scaffolding, code generation, and 27
        batteries-included packages for Go web services. Go from zero to CRUD
        in under a minute.
      </p>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/docs/getting-started/introduction"
          className="rounded-lg bg-primary px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary/25 hover:bg-primary-dark transition-colors"
        >
          Get Started
        </Link>
        <a
          href="https://github.com/gofastadev/gofasta"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg border border-gray-300 bg-surface px-6 py-3 text-base font-semibold text-foreground hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 transition-colors"
        >
          View on GitHub
        </a>
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
