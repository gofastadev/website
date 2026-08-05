const PILLARS = [
  {
    title: "Standard Go. Zero lock-in.",
    description:
      "Every file is idiomatic Go. No custom compiler, no annotations, no runtime wrapper. Every project builds with go build, tests with go test, deploys with any CI/CD. Every pkg/* package is deletable, so keep what fits and replace what doesn't.",
  },
  {
    title: "Agent-native by default.",
    description:
      "Every command accepts --json. Every error carries a stable code. A scaffolded AGENTS.md briefs any AI coding agent on your project's conventions. One command, gofasta ai claude, configures Claude Code, Cursor, Codex, Aider, or Windsurf. Humans and agents work the same way.",
  },
  {
    title: "Production from minute one.",
    description:
      "JWT + RBAC, rate limiting, CORS, security headers, Prometheus metrics, OpenTelemetry tracing, email, file storage, background jobs, and deploy-to-VPS, all scaffolded as importable packages. No stubs. No TODOs. Real production code on day one.",
  },
];

export function ValuePillars() {
  return (
    <section className="px-6 py-section-lg">
      <div className="mx-auto max-w-4xl divide-y divide-gray-200 dark:divide-gray-800">
        {PILLARS.map((p) => (
          <div key={p.title} className="grid gap-3 py-10 sm:grid-cols-[1fr_1.2fr] sm:gap-10 first:pt-0 last:pb-0">
            <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h3>
            <p className="max-w-[55ch] self-center leading-relaxed text-gray-600 dark:text-gray-400">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
