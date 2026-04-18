import { AudienceCard, SectionHeading } from "@/components/molecules";

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

const audiences = [
  {
    title: "Solo Engineers",
    description:
      "Skip the first two weeks of plumbing. Scaffold auth, database, jobs, and deploys in minutes — then focus on what only you can build.",
    icon: (
      <svg {...iconProps}>
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    ),
  },
  {
    title: "Indie Hackers",
    description:
      "Launch your SaaS in an afternoon, not a month. One command ships a production backend that's ready for paying customers on day one.",
    icon: (
      <svg {...iconProps}>
        <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
        <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
        <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0" />
        <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
      </svg>
    ),
  },
  {
    title: "Startup CTOs",
    description:
      "Move at seed-stage speed on a foundation that holds at Series B. Standard Go, compile-time DI, every package independently swappable.",
    icon: (
      <svg {...iconProps}>
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-3 3" />
      </svg>
    ),
  },
  {
    title: "Senior Engineers",
    description:
      "No custom runtime, no annotations, no lock-in. Read every line end-to-end. Google Wire for DI, standard net/http for transport, plain Go everywhere.",
    icon: (
      <svg {...iconProps}>
        <polyline points="16 18 22 12 16 6" />
        <polyline points="8 6 2 12 8 18" />
      </svg>
    ),
  },
  {
    title: "Agencies & Consultancies",
    description:
      "Ship client projects in days, hand off in standard Go. No proprietary runtime to document — the code stands entirely on its own.",
    icon: (
      <svg {...iconProps}>
        <polygon points="12 2 2 7 12 12 22 7 12 2" />
        <polyline points="2 17 12 22 22 17" />
        <polyline points="2 12 12 17 22 12" />
      </svg>
    ),
  },
  {
    title: "Enterprise Teams",
    description:
      "JWT + RBAC, structured errors, security headers, Prometheus, OpenTelemetry, and audit-ready logging — wired on day one. Deploy to any VPS or CI/CD.",
    icon: (
      <svg {...iconProps}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
  },
];

export function AudienceTiles() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="Who it's for"
        title="Who uses Gofasta"
        description="One toolkit, six kinds of teams. Gofasta generates standard Go so the code fits every workflow — solo founder to regulated enterprise."
      />
      <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-3">
        {audiences.map((a) => (
          <AudienceCard
            key={a.title}
            icon={a.icon}
            title={a.title}
            description={a.description}
          />
        ))}
      </div>
    </section>
  );
}
