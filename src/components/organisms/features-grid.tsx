import { FeatureCard, SectionHeading } from "@/components/molecules";

const iconProps = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const features = [
  {
    title: "One-command scaffolding",
    description:
      "gofasta g scaffold spins up a full CRUD resource — model, repository, service, controller, routes, DTOs, and Wire provider — in one call.",
    icon: (
      <svg {...iconProps}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Agent-native tooling",
    description:
      "Scaffolded AGENTS.md, llms.txt for the docs, editor rules for Claude / Cursor / Codex / Aider / Windsurf, and --json on every command.",
    icon: (
      <svg {...iconProps}>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </svg>
    ),
  },
  {
    title: "Auth & RBAC",
    description:
      "JWT (access + refresh), role-based access control via Casbin, and drop-in middleware. Ready the moment your project boots.",
    icon: (
      <svg {...iconProps}>
        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
  },
  {
    title: "Multi-database",
    description:
      "PostgreSQL, MySQL, SQLite, SQL Server, and ClickHouse through a single GORM interface. Switch drivers with one config change.",
    icon: (
      <svg {...iconProps}>
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M3 5V19A9 3 0 0 0 21 19V5" />
        <path d="M3 12A9 3 0 0 0 21 12" />
      </svg>
    ),
  },
  {
    title: "REST + optional GraphQL",
    description:
      "REST out of the box; add --graphql and gqlgen wires GraphQL alongside REST sharing the same service layer. No duplicate logic.",
    icon: (
      <svg {...iconProps}>
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" x2="4" y1="22" y2="15" />
      </svg>
    ),
  },
  {
    title: "Background jobs & tasks",
    description:
      "Cron scheduling via robfig/cron and async task queues powered by Redis + Asynq. Generate jobs and tasks from the CLI.",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    title: "Observability",
    description:
      "Prometheus metrics at /metrics, OpenTelemetry distributed tracing, structured slog logging — all composable HTTP middleware.",
    icon: (
      <svg {...iconProps}>
        <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
      </svg>
    ),
  },
  {
    title: "Security & resilience",
    description:
      "Rate limiting, CORS, CSP, HSTS, panic recovery, request IDs, retry policies, and circuit breakers — all composable middleware.",
    icon: (
      <svg {...iconProps}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
  {
    title: "Deploy to any VPS",
    description:
      "Scaffold Docker, systemd, GitHub Actions, and gofasta deploy to ship to any VPS. No proprietary cloud, no vendor lock-in.",
    icon: (
      <svg {...iconProps}>
        <rect width="20" height="8" x="2" y="2" rx="2" ry="2" />
        <rect width="20" height="8" x="2" y="14" rx="2" ry="2" />
        <line x1="6" x2="6.01" y1="6" y2="6" />
        <line x1="6" x2="6.01" y1="18" y2="18" />
      </svg>
    ),
  },
];

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="What you get"
        title="What's in Gofasta"
        description="A CLI that scaffolds your project, and a curated library of composable Go packages that handle the rest — every one of them independently swappable."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
        {features.map((feature) => (
          <FeatureCard
            key={feature.title}
            icon={feature.icon}
            title={feature.title}
            description={feature.description}
          />
        ))}
      </div>
    </section>
  );
}
