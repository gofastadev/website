import { SectionHeading } from "@/components/molecules";

const AUDIENCES = [
  {
    title: "Solo engineers",
    description:
      "Skip the first two weeks of plumbing. Scaffold auth, database, jobs, and deploys in minutes, then focus on what only you can build.",
  },
  {
    title: "Indie hackers",
    description:
      "Launch your SaaS in an afternoon, not a month. One command ships a production backend that's ready for paying customers on day one.",
  },
  {
    title: "Startup CTOs",
    description:
      "Move at seed-stage speed on a foundation that holds at Series B. Standard Go, compile-time DI, every package independently swappable.",
  },
  {
    title: "Senior engineers",
    description:
      "No custom runtime, no annotations, no lock-in. Read every line end-to-end. Google Wire for DI, standard net/http for transport, plain Go everywhere.",
  },
  {
    title: "Agencies and consultancies",
    description:
      "Ship client projects in days, hand off in standard Go. No proprietary runtime to document. The code stands entirely on its own.",
  },
  {
    title: "Enterprise teams",
    description:
      "JWT + RBAC, structured errors, security headers, Prometheus, OpenTelemetry, and audit-ready logging, wired on day one. Deploy to any VPS or CI/CD.",
  },
];

export function AudienceTiles() {
  return (
    <section className="px-6 py-section">
      <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.6fr]">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading
            title="Built for people who ship"
            description="From a side project to a team codebase, the workflow stays the same."
          />
        </div>
        <ul className="grid gap-x-10 sm:grid-cols-2">
          {AUDIENCES.map((a) => (
            <li key={a.title} className="border-t border-gray-200 py-6 dark:border-gray-800">
              <h3 className="font-semibold">{a.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{a.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
