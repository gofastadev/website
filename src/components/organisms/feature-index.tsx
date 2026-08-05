import { SectionHeading } from "@/components/molecules";

const FEATURES = [
  {
    keyword: "new",
    title: "One-command scaffolding",
    body: "One command generates model, repository, service, controller, routes, and DTOs.",
  },
  {
    keyword: "ai",
    title: "Agent-native tooling",
    body: "Scaffolds AGENTS.md, llms.txt, editor rules, and --json on every command.",
  },
  {
    keyword: "auth",
    title: "Auth and RBAC",
    body: "JWT access and refresh tokens, role-based access control via Casbin, drop-in middleware.",
  },
  {
    keyword: "db",
    title: "Multi-database",
    body: "PostgreSQL, MySQL, SQLite, SQL Server, and ClickHouse behind one GORM interface.",
  },
  {
    keyword: "api",
    title: "REST plus optional GraphQL",
    body: "REST out of the box; add --graphql and gqlgen wires GraphQL onto the same service layer.",
  },
  {
    keyword: "jobs",
    title: "Background jobs and tasks",
    body: "Cron scheduling via robfig/cron and async task queues backed by Redis and Asynq.",
  },
  {
    keyword: "otel",
    title: "Observability",
    body: "Prometheus metrics, OpenTelemetry tracing, and structured slog logging as middleware.",
  },
  {
    keyword: "sec",
    title: "Security and resilience",
    body: "Rate limiting, CORS, CSP, HSTS, panic recovery, retries, and circuit breakers.",
  },
  {
    keyword: "deploy",
    title: "Deploy to any VPS",
    body: "Scaffolded Docker, systemd, GitHub Actions, and gofasta deploy ship to any VPS.",
  },
  {
    keyword: "trace",
    title: "Request tracing",
    body: "Per-request spans across controller, service, repository, and SQL with stack snapshots.",
  },
  {
    keyword: "sql",
    title: "N+1 detection",
    body: "Duplicate SQL templates firing in one trace get flagged automatically as they happen.",
  },
  {
    keyword: "replay",
    title: "Edit and replay",
    body: "Edit a captured request's JSON body, fire it again, and watch the trace update live.",
  },
];

export function FeatureIndex() {
  return (
    <section className="px-6 py-section">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Everything a production backend needs"
          description="Generated into your project as plain Go, backed by independent packages you can swap out."
        />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-800 dark:bg-gray-800">
          {FEATURES.map((f) => (
            <li
              key={f.keyword}
              className="group bg-surface p-6 transition-colors duration-(--duration-base) ease-(--ease-brand) hover:bg-primary-800"
            >
              <span className="font-mono text-xs text-primary group-hover:text-primary-200">{f.keyword}</span>
              <h3 className="mt-2 font-semibold group-hover:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600 group-hover:text-primary-100 dark:text-gray-400">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
