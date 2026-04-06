import Link from "next/link";

export function Hero() {
  return (
    <section className="flex flex-col items-center px-6 pt-32 pb-20 text-center">
      <div className="mb-6 inline-flex items-center rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
        Open Source Go Framework
      </div>

      <h1 className="max-w-4xl text-5xl font-bold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
        Build Go backends at{" "}
        <span className="text-primary">lightning speed</span>
      </h1>

      <p className="mt-6 max-w-2xl text-lg text-muted sm:text-xl">
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

      <div className="mt-16 w-full max-w-2xl overflow-hidden rounded-xl border border-gray-200 bg-[#1e293b] shadow-2xl dark:border-gray-700">
        <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-3">
          <div className="h-3 w-3 rounded-full bg-red-500" />
          <div className="h-3 w-3 rounded-full bg-yellow-500" />
          <div className="h-3 w-3 rounded-full bg-green-500" />
          <span className="ml-2 text-xs text-gray-400">Terminal</span>
        </div>
        <pre className="overflow-x-auto p-6 text-left font-mono text-sm leading-relaxed text-gray-300">
          <code>
            <span className="text-gray-500">$</span>{" "}
            <span className="text-green-400">gofasta</span> new myapp{"\n"}
            <span className="text-gray-500">Creating project...</span>
            {"\n"}
            <span className="text-gray-500">
              Running go mod init...
            </span>
            {"\n"}
            <span className="text-gray-500">
              Copying 78 template files...
            </span>
            {"\n"}
            <span className="text-gray-500">
              Installing dependencies...
            </span>
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
            <span className="text-gray-500">$</span> cd myapp && make up
            {"\n"}
            <span className="text-green-400">
              Server running at http://localhost:8080
            </span>
          </code>
        </pre>
      </div>
    </section>
  );
}
