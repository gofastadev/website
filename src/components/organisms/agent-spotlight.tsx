import { SectionHeading, TypewriterCode } from "@/components/molecules";

const statusJson = `{
  "checks": [
    { "name": "wire drift",                  "status": "ok",   "message": "in sync" },
    { "name": "swagger drift",               "status": "ok",   "message": "in sync" },
    { "name": "pending migrations",          "status": "ok",   "message": "no migrations defined" },
    { "name": "uncommitted generated files", "status": "ok",   "message": "generated files committed" },
    { "name": "go.sum freshness",            "status": "ok",   "message": "modules verified" }
  ],
  "ok": 5,
  "drift": 0,
  "warnings": 0,
  "skipped": 0
}`;

const capabilities = [
  {
    title: "Universal --json flag",
    description:
      "Every command emits structured output. Pipe it into jq, into an agent, into CI.",
  },
  {
    title: "Stable error codes",
    description:
      "ROUTES_DIR_MISSING, WIRE_MISSING_PROVIDER, GO_BUILD_FAILED — not opaque strings.",
  },
  {
    title: "Scaffolded AGENTS.md",
    description:
      "A ready-to-read briefing that teaches any AI coding agent how your project is laid out.",
  },
  {
    title: "One-command agent setup",
    description:
      "gofasta ai claude — or cursor, codex, aider, windsurf. Editor rules in seconds.",
  },
  {
    title: "High-level commands",
    description:
      "verify, status, inspect, do — multi-step workflows collapsed into a single call with structured output.",
  },
];

const iconProps = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function AgentSpotlight() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-transparent to-transparent py-20 sm:py-28 dark:from-primary/10">
      {/* Decorative animated stream lines — large SVG spanning the
          section, four dashed curves flowing left-to-right (the
          direction data moves from CLI output to consumer). Behind
          content, low-opacity, aria-hidden. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full opacity-50 dark:opacity-60"
      >
        <defs>
          <linearGradient id="gofasta-stream-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--primary)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--primary)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--primary)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path
          className="gofasta-stream-line"
          d="M0,90 C300,40 900,140 1200,80"
          fill="none"
          stroke="url(#gofasta-stream-grad)"
          strokeWidth="1.5"
        />
        <path
          className="gofasta-stream-line"
          style={{ animationDelay: "0.2s" }}
          d="M0,170 C320,120 880,230 1200,160"
          fill="none"
          stroke="url(#gofasta-stream-grad)"
          strokeWidth="1.5"
        />
        <path
          className="gofasta-stream-line"
          style={{ animationDelay: "0.5s" }}
          d="M0,240 C340,200 860,300 1200,230"
          fill="none"
          stroke="url(#gofasta-stream-grad)"
          strokeWidth="1.5"
        />
        <path
          className="gofasta-stream-line"
          style={{ animationDelay: "0.7s" }}
          d="M0,320 C300,280 900,370 1200,310"
          fill="none"
          stroke="url(#gofasta-stream-grad)"
          strokeWidth="1.5"
        />
      </svg>

      <div className="relative mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Agent-Native"
          title="A Go toolkit built for humans and AI agents."
          description="AI coding agents aren't afterthoughts — they're first-class users. Every surface of Gofasta is machine-readable so agents can scaffold, verify, inspect, and ship alongside you without losing context."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-center lg:gap-16">
          <ul className="space-y-6">
            {capabilities.map((c) => (
              <li key={c.title} className="flex gap-4">
                <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <svg {...iconProps}>
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-tight sm:text-lg">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {c.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <TypewriterCode
            label="gofasta status --json"
            language="json"
            code={statusJson}
          />
        </div>
      </div>
    </section>
  );
}
