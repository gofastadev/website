import { PillarCard, SectionHeading } from "@/components/molecules";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const pillars = [
  {
    number: "01",
    title: "Standard Go. Zero lock-in.",
    description:
      "Every file is idiomatic Go. No custom compiler, no annotations, no runtime wrapper. Every project builds with go build, tests with go test, deploys with any CI/CD. Every pkg/* package is deletable — keep what fits, replace what doesn't.",
    icon: (
      <svg {...iconProps}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    number: "02",
    title: "Agent-native by default.",
    description:
      "Every command accepts --json. Every error carries a stable code. A scaffolded AGENTS.md briefs any AI coding agent on your project's conventions. One command — gofasta ai claude — configures Claude Code, Cursor, Codex, Aider, or Windsurf. Humans and agents work the same way.",
    icon: (
      <svg {...iconProps}>
        <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
      </svg>
    ),
  },
  {
    number: "03",
    title: "Production from minute one.",
    description:
      "JWT + RBAC, rate limiting, CORS, security headers, Prometheus metrics, OpenTelemetry tracing, email, file storage, background jobs, and deploy-to-VPS — scaffolded as importable packages. No stubs. No TODOs. Real production code on day one.",
    icon: (
      <svg {...iconProps}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
      </svg>
    ),
  },
];

export function ValuePillars() {
  return (
    <section className="relative mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="Three promises"
        title="Fast to start. Yours to own. Ready for your AI."
        description="Every design decision in Gofasta optimizes for one of these three outcomes. Nothing is bundled that doesn't serve one of them."
      />
      <div className="mt-14 grid gap-6 lg:grid-cols-3 lg:gap-7">
        {pillars.map((p) => (
          <PillarCard
            key={p.number}
            number={p.number}
            icon={p.icon}
            title={p.title}
            description={p.description}
          />
        ))}
      </div>
    </section>
  );
}
