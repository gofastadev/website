export function QuickStartSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">
        Up and running in 3 steps
      </h2>

      <div className="mt-16 grid gap-8 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-surface p-6 dark:border-gray-800">
          <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            1
          </div>
          <h3 className="text-lg font-semibold">Install the CLI</h3>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-[#1e293b] p-4 font-mono text-sm text-gray-300">
            <code>go install github.com/gofastadev/cli/cmd/gofasta@latest</code>
          </pre>
        </div>

        <div className="rounded-xl border border-gray-200 bg-surface p-6 dark:border-gray-800">
          <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            2
          </div>
          <h3 className="text-lg font-semibold">Create a project</h3>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-[#1e293b] p-4 font-mono text-sm text-gray-300">
            <code>gofasta new myapp</code>
          </pre>
        </div>

        <div className="rounded-xl border border-gray-200 bg-surface p-6 dark:border-gray-800">
          <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            3
          </div>
          <h3 className="text-lg font-semibold">Start developing</h3>
          <pre className="mt-4 overflow-x-auto rounded-lg bg-[#1e293b] p-4 font-mono text-sm text-gray-300">
            <code>cd myapp && make up</code>
          </pre>
        </div>
      </div>
    </section>
  );
}
