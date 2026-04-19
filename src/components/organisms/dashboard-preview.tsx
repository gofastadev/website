import { SectionHeading } from "@/components/molecules";

const capabilities = [
  {
    title: "App health at a glance",
    description:
      "Polls /health every 5s with a 2s client-side timeout. Pill flips between ok / unhealthy / unreachable so you see outages the moment they happen.",
  },
  {
    title: "Live compose service status",
    description:
      "Pulls `docker compose ps` and shows every service (db, cache, queue) with its current state and healthcheck result.",
  },
  {
    title: "Every REST route you've defined",
    description:
      "Scrapes docs/swagger.json into a method+path table so you can see what the server exposes without reading the codebase.",
  },
  {
    title: "One-click jumps to the ancillary endpoints",
    description:
      "Direct links to /swagger, /graphql, /metrics — only shown when the project actually publishes them.",
  },
  {
    title: "Zero runtime coupling",
    description:
      "A separate HTTP server on its own debug port. Scrapes from the outside — doesn't embed into your app. Turn it on with --dashboard; it dies with the pipeline on Ctrl+C.",
  },
];

const mockedServices = [
  { name: "db", image: "postgres:16-alpine", status: "healthy" as const },
  { name: "cache", image: "redis:7-alpine", status: "healthy" as const },
  { name: "queue", image: "asynqmon:latest", status: "running" as const },
];

const mockedRoutes = [
  { method: "GET", path: "/users" },
  { method: "POST", path: "/users" },
  { method: "GET", path: "/users/{id}" },
  { method: "PATCH", path: "/users/{id}" },
  { method: "DELETE", path: "/users/{id}" },
];

export function DashboardPreview() {
  return (
    <section className="relative overflow-hidden py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Local dev dashboard"
          title="Debug visually, not through log greps."
          description="Run `gofasta dev --dashboard` and the CLI stands up a self-contained HTML debug panel on :9090 — live app health, service state, and a scraped route table. Uses html/template + Server-Sent Events; no runtime agent, no cloud service."
        />

        <div className="mt-14 grid gap-10 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-16">
          <ul className="space-y-6">
            {capabilities.map((c) => (
              <li key={c.title} className="flex gap-4">
                <span className="mt-1 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </span>
                <div>
                  <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                    {c.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
                    {c.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          {/* Dashboard mockup — reproduces the real dashboard layout
              served by `gofasta dev --dashboard`, including browser
              chrome, the section hierarchy, the live "updated" line,
              and the health-pill pulse. Every value is static; the
              pulsing dot + "updated" timestamp animation give the
              illusion of live data. */}
          <div
            aria-hidden="true"
            className="overflow-hidden rounded-xl border border-gray-200 bg-terminal-surface shadow-2xl dark:border-gray-800"
          >
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-gray-800 bg-terminal-bg px-3 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
              <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
              <div className="ml-3 flex-1 rounded-md bg-gray-900 px-3 py-1 font-mono text-[11px] text-gray-400">
                localhost:9090
              </div>
            </div>

            {/* Dashboard body */}
            <div className="px-5 py-5 font-sans text-gray-200 sm:px-6 sm:py-6">
              <div className="text-sm font-bold text-primary sm:text-base">
                Gofasta dev dashboard
              </div>
              <div className="mt-0.5 text-[11px] text-gray-500">
                Live debug view for the project running on{" "}
                <span className="text-gray-300">http://localhost:8080</span>
              </div>

              {/* APP row */}
              <div className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                App
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatCard label="Health">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2 py-0.5 text-[11px] font-medium text-green-400">
                    <span className="gofasta-dashboard-pulse h-1.5 w-1.5 rounded-full bg-green-400" />
                    ok
                  </span>
                </StatCard>
                <StatCard label="Port">
                  <span className="font-mono text-sm">8080</span>
                </StatCard>
                <StatCard label="Swagger">
                  <span className="truncate font-mono text-[11px] text-primary">
                    /swagger/index.html
                  </span>
                </StatCard>
                <StatCard label="Metrics">
                  <span className="truncate font-mono text-[11px] text-primary">
                    /metrics
                  </span>
                </StatCard>
              </div>

              {/* SERVICES row */}
              <div className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Services
              </div>
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-800">
                <table className="w-full text-left font-mono text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] font-medium uppercase tracking-widest text-gray-500">
                      <th className="px-3 py-1.5">Service</th>
                      <th className="px-3 py-1.5">Image</th>
                      <th className="px-3 py-1.5">State</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockedServices.map((s) => (
                      <tr
                        key={s.name}
                        className="border-b border-gray-900 last:border-0"
                      >
                        <td className="px-3 py-1.5 text-gray-200">{s.name}</td>
                        <td className="px-3 py-1.5 text-gray-500">
                          {s.image}
                        </td>
                        <td className="px-3 py-1.5">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-500/15 px-2 py-0.5 text-[10px] font-medium text-green-400">
                            <span className="gofasta-dashboard-pulse h-1 w-1 rounded-full bg-green-400" />
                            {s.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* ROUTES row */}
              <div className="mt-5 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                Routes
              </div>
              <div className="mt-2 overflow-hidden rounded-lg border border-gray-800">
                <table className="w-full text-left font-mono text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] font-medium uppercase tracking-widest text-gray-500">
                      <th className="px-3 py-1.5">Method</th>
                      <th className="px-3 py-1.5">Path</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockedRoutes.map((r) => (
                      <tr
                        key={r.method + r.path}
                        className="border-b border-gray-900 last:border-0"
                      >
                        <td className="px-3 py-1.5">
                          <span className="inline-block rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                            {r.method}
                          </span>
                        </td>
                        <td className="px-3 py-1.5 text-gray-300">{r.path}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 text-[10px] text-gray-500">
                Updated{" "}
                <span className="gofasta-dashboard-updated font-mono text-gray-400">
                  just now
                </span>{" "}
                · refreshes every 5s via SSE
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** One of the four stat cards in the "App" row of the mockup. */
function StatCard({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-900/50 px-3 py-2">
      <div className="text-[9px] font-semibold uppercase tracking-widest text-gray-500">
        {label}
      </div>
      <div className="mt-1 truncate">{children}</div>
    </div>
  );
}
