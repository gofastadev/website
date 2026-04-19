"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading, FeatureCard } from "@/components/molecules";
import { useOnScreen } from "@/hooks/use-on-screen";

// Curated tiles for the capability grid. Keep this list tight — the
// docs page (cli-reference/dev.mdx) is the enumeration; the landing is
// the pitch. Six tiles fit a 3×2 desktop grid and read cleanly on
// mobile (single column). Order matters: we open with the two most
// Go-distinctive features (trace waterfall, N+1), then pair
// interactive tools (replay, logs), and close with runtime-profiler
// and the trust signal (zero prod cost).
const capabilities = [
  {
    title: "Trace waterfall",
    description:
      "Per-request spans — controller, service, repository, SQL — with call-stack snapshots so you see exactly where each span was opened.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M3 12h4l3-9 4 18 3-9h4" />
      </svg>
    ),
  },
  {
    title: "N+1 detection",
    description:
      "Duplicate SQL templates firing inside one trace get flagged automatically — with a link to the offending request.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    title: "Edit & replay",
    description:
      "Click replay on any captured request, tweak the JSON body inline, fire it again against the live app, and watch the trace update.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <polyline points="21 3 21 9 15 9" />
      </svg>
    ),
  },
  {
    title: "Per-request logs",
    description:
      "Every slog record is tagged with its trace ID. Expand a request, switch to the Logs tab, and see only that request's log lines.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2" />
        <path d="M19 17V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2Z" />
        <line x1="6" y1="8" x2="13" y2="8" />
        <line x1="6" y1="12" x2="13" y2="12" />
      </svg>
    ),
  },
  {
    title: "Profiles + goroutines",
    description:
      "One-click links to CPU, heap, mutex, and block profiles from net/http/pprof. Goroutines grouped by top-of-stack so leaks jump out.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 2v4" />
        <path d="M12 22a10 10 0 1 1 10-10" />
        <path d="m16.2 7.8 2.8-2.8" />
        <circle cx="12" cy="12" r="2" />
      </svg>
    ),
  },
  {
    title: "Zero production cost",
    description:
      "Every surface above is gated by the `devtools` build tag. `go build` without it compiles the stub — pass-through middleware, no-op plugins.",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <polyline points="9 12 11 14 15 10" />
      </svg>
    ),
  },
];

// ── Mocked state pools ──────────────────────────────────────────────
// These are the samples the ticker rotates through. Using concrete
// verbs/paths/SQL instead of abstract placeholders so the preview reads
// as "this is what live debugging looks like in a real app".

type MockRequest = {
  method: string;
  path: string;
  status: number;
  duration: number;
};

type MockQuery = {
  sql: string;
  rows: number;
  duration: number;
};

const requestPool: MockRequest[] = [
  { method: "GET", path: "/api/v1/users", status: 200, duration: 12 },
  { method: "POST", path: "/api/v1/users", status: 201, duration: 45 },
  { method: "GET", path: "/api/v1/users/42", status: 200, duration: 8 },
  { method: "PATCH", path: "/api/v1/users/42", status: 200, duration: 18 },
  { method: "GET", path: "/api/v1/orders?limit=20", status: 200, duration: 22 },
  { method: "POST", path: "/api/v1/orders", status: 201, duration: 68 },
  { method: "GET", path: "/health", status: 200, duration: 2 },
  { method: "GET", path: "/api/v1/admin", status: 401, duration: 6 },
  { method: "DELETE", path: "/api/v1/tokens/abc", status: 204, duration: 14 },
  { method: "GET", path: "/api/v1/search?q=go", status: 200, duration: 35 },
  // Covers the 3xx status tier — shows a redirect from the old path.
  { method: "GET", path: "/api/v1/legacy", status: 302, duration: 4 },
  // Covers the 5xx tier — a server-side failure renders the red pill.
  { method: "POST", path: "/api/v1/reports", status: 503, duration: 210 },
  // HEAD exercises the "other" branch of MethodBadge.
  { method: "HEAD", path: "/api/v1/users", status: 200, duration: 3 },
];

const sqlPool: MockQuery[] = [
  {
    sql: "SELECT * FROM users ORDER BY created_at DESC LIMIT 20",
    rows: 20,
    duration: 4,
  },
  {
    sql: "INSERT INTO users (id, email, created_at) VALUES (?, ?, ?)",
    rows: 1,
    duration: 12,
  },
  {
    sql: "UPDATE users SET updated_at = NOW() WHERE id = ?",
    rows: 1,
    duration: 3,
  },
  {
    sql: "SELECT COUNT(*) FROM sessions WHERE user_id = ?",
    rows: 1,
    duration: 2,
  },
  {
    sql: "DELETE FROM tokens WHERE expires_at < NOW()",
    rows: 7,
    duration: 8,
  },
  {
    sql: "SELECT o.* FROM orders o JOIN users u ON o.user_id = u.id",
    rows: 42,
    duration: 15,
  },
];

// Fixed seed data used for SSR. The ticker mutates these after mount,
// which keeps the server-rendered HTML and the first client render
// identical — avoids hydration mismatches. Each seeded row picks a
// different method + status tier so the first paint exercises every
// branch of MethodBadge / StatusPill (GET / POST / PATCH / DELETE /
// HEAD; 2xx / 3xx / 4xx / 5xx).
const seededRequests = [
  { id: "s1", time: "12:34:52", ...requestPool[0] },  // GET   200 (2xx)
  { id: "s2", time: "12:34:50", ...requestPool[1] },  // POST  201 (2xx)
  { id: "s3", time: "12:34:48", ...requestPool[3] },  // PATCH 200 (2xx)
  { id: "s4", time: "12:34:45", ...requestPool[8] },  // DELETE 204 (2xx)
  { id: "s5", time: "12:34:42", ...requestPool[7] },  // GET  401 (4xx)
  { id: "s6", time: "12:34:40", ...requestPool[10] }, // GET  302 (3xx)
  { id: "s7", time: "12:34:38", ...requestPool[11] }, // POST 503 (5xx)
  { id: "s8", time: "12:34:36", ...requestPool[12] }, // HEAD 200 (other method)
];

const seededQueries = [
  { id: "q1", time: "12:34:52", ...sqlPool[0] },
  { id: "q2", time: "12:34:48", ...sqlPool[3] },
  { id: "q3", time: "12:34:44", ...sqlPool[1] },
  { id: "q4", time: "12:34:40", ...sqlPool[2] },
];

type RenderedRequest = (typeof seededRequests)[number];
type RenderedQuery = (typeof seededQueries)[number];

function formatClockNow(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

export function DashboardPreview() {
  // Gate the ticker on intersection — the preview only shifts when it's
  // actually visible, so a user scrolled past doesn't burn timers.
  const [ref, visible] = useOnScreen<HTMLDivElement>({
    rootMargin: "0px 0px -15% 0px",
  });

  const [requestsTotal, setRequestsTotal] = useState(487);
  const [inFlight, setInFlight] = useState(2);
  const [avgLatency, setAvgLatency] = useState(18.3);
  const [requests, setRequests] =
    useState<RenderedRequest[]>(seededRequests);
  const [queries, setQueries] = useState<RenderedQuery[]>(seededQueries);
  const idRef = useRef(0);

  useEffect(() => {
    if (!visible) return;

    const requestTimer = window.setInterval(() => {
      const pick = requestPool[Math.floor(Math.random() * requestPool.length)];
      idRef.current += 1;
      const fresh: RenderedRequest = {
        id: `req-${idRef.current}`,
        time: formatClockNow(),
        method: pick.method,
        path: pick.path,
        status: pick.status,
        duration: Math.max(
          1,
          pick.duration + Math.floor(Math.random() * 10) - 5
        ),
      };
      setRequests((prev) => [fresh, ...prev].slice(0, 5));
      setRequestsTotal((n) => n + 1 + Math.floor(Math.random() * 3));
      setInFlight(Math.floor(Math.random() * 4));
      setAvgLatency((l) => {
        const next = l + (Math.random() - 0.5) * 1.6;
        // Clamp to a plausible range so the number doesn't drift forever.
        return +Math.max(5, Math.min(45, next)).toFixed(1);
      });
    }, 2500);

    const queryTimer = window.setInterval(() => {
      const pick = sqlPool[Math.floor(Math.random() * sqlPool.length)];
      idRef.current += 1;
      const fresh: RenderedQuery = {
        id: `sql-${idRef.current}`,
        time: formatClockNow(),
        sql: pick.sql,
        rows: pick.rows,
        duration: Math.max(1, pick.duration + Math.floor(Math.random() * 6)),
      };
      setQueries((prev) => [fresh, ...prev].slice(0, 4));
    }, 4000);

    return () => {
      window.clearInterval(requestTimer);
      window.clearInterval(queryTimer);
    };
  }, [visible]);

  return (
    <section
      ref={ref}
      className="relative overflow-hidden py-20 sm:py-28"
    >
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeading
          eyebrow="Local dev dashboard"
          title="Debug visually, not through log greps."
          description="`gofasta dev --dashboard` stands up a self-contained HTML debug panel on :9090 — live metrics, request log, SQL, trace waterfall. Zero runtime agent, zero cloud service."
        />

        {/* Dashboard mockup — promoted to hero role. Centered with a
            moderate max width so it reads as "this is the thing you get"
            rather than a sidekick to a wall of bullet points.
            Live-animated via the ticker: the Recent Requests / Recent
            SQL tables rotate new rows every few seconds, metrics
            counters bump, and a "devtools" pill holds steady. */}
        <div className="mx-auto mt-14 max-w-4xl">
          <div
            aria-hidden="true"
            className="overflow-hidden rounded-xl border border-gray-200 bg-terminal-surface shadow-2xl dark:border-gray-800"
          >
            <BrowserChrome />
            <div className="px-4 py-4 font-sans text-gray-200 sm:px-5 sm:py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-primary sm:text-base">
                    Gofasta dev dashboard
                  </div>
                  <div className="mt-0.5 text-[11px] text-gray-500">
                    Live debug view —{" "}
                    <span className="text-gray-300">http://localhost:8080</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-mono font-medium text-primary">
                  <span className="gofasta-dashboard-pulse h-1 w-1 rounded-full bg-primary" />
                  devtools:enabled
                </span>
              </div>

              {/* Metrics */}
              <SectionLabel>Metrics</SectionLabel>
              <div className="grid grid-cols-3 gap-2">
                <MetricCard label="Requests">
                  <span className="font-mono text-sm tabular-nums">
                    {requestsTotal.toLocaleString()}
                  </span>
                </MetricCard>
                <MetricCard label="In-flight">
                  <span className="font-mono text-sm tabular-nums">
                    {inFlight}
                  </span>
                </MetricCard>
                <MetricCard label="Avg latency">
                  <span className="font-mono text-sm tabular-nums">
                    {avgLatency.toFixed(1)} ms
                  </span>
                </MetricCard>
              </div>

              {/* Recent requests */}
              <SectionLabel>Recent requests</SectionLabel>
              <TableFrame>
                <table className="w-full text-left font-mono text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] font-medium uppercase tracking-widest text-gray-500">
                      <th className="w-20 px-3 py-1.5">Time</th>
                      <th className="w-14 px-3 py-1.5">Method</th>
                      <th className="px-3 py-1.5">Path</th>
                      <th className="w-12 px-3 py-1.5">Status</th>
                      <th className="w-12 px-3 py-1.5 text-right">Dur</th>
                    </tr>
                  </thead>
                  <tbody>
                    {requests.map((r) => (
                      <tr
                        key={r.id}
                        className="gofasta-dashboard-row border-b border-gray-900 last:border-0"
                      >
                        <td className="px-3 py-1.5 text-gray-500">{r.time}</td>
                        <td className="px-3 py-1.5">
                          <MethodBadge method={r.method} />
                        </td>
                        <td className="truncate px-3 py-1.5 text-gray-300">
                          {r.path}
                        </td>
                        <td className="px-3 py-1.5">
                          <StatusPill status={r.status} />
                        </td>
                        <td className="px-3 py-1.5 text-right text-gray-400">
                          {r.duration}ms
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableFrame>

              {/* Recent SQL */}
              <SectionLabel>Recent SQL</SectionLabel>
              <TableFrame>
                <table className="w-full text-left font-mono text-[11px] sm:text-xs">
                  <thead>
                    <tr className="border-b border-gray-800 text-[10px] font-medium uppercase tracking-widest text-gray-500">
                      <th className="w-20 px-3 py-1.5">Time</th>
                      <th className="w-10 px-3 py-1.5 text-right">Rows</th>
                      <th className="w-12 px-3 py-1.5 text-right">Dur</th>
                      <th className="px-3 py-1.5">SQL</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queries.map((q) => (
                      <tr
                        key={q.id}
                        className="gofasta-dashboard-row border-b border-gray-900 last:border-0"
                      >
                        <td className="px-3 py-1.5 text-gray-500">{q.time}</td>
                        <td className="px-3 py-1.5 text-right text-gray-400">
                          {q.rows}
                        </td>
                        <td className="px-3 py-1.5 text-right text-gray-400">
                          {q.duration}ms
                        </td>
                        <td className="truncate px-3 py-1.5 text-gray-300">
                          {q.sql}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </TableFrame>

              {/* Trace waterfall — one expanded trace showing the
                  controller → service → repo nesting. Mirrors what the
                  real /api/trace/{id} endpoint returns, with the stack
                  snapshot visible on the selected span so developers
                  see the "click to see where the span was opened"
                  affordance at a glance. */}
              <SectionLabel>Trace · POST /api/v1/orders · 68ms</SectionLabel>
              <TableFrame>
                <div className="divide-y divide-gray-900 px-3 py-2">
                  {traceSpans.map((sp, i) => (
                    <TraceRow
                      key={sp.name}
                      span={sp}
                      total={68}
                      highlighted={i === 2}
                    />
                  ))}
                </div>
              </TableFrame>

              <div className="mt-3 text-[10px] text-gray-500">
                Updated{" "}
                <span className="gofasta-dashboard-updated font-mono text-gray-400">
                  just now
                </span>{" "}
                · refreshes every 5s via SSE
              </div>
            </div>
          </div>
        </div>

        {/* Capability grid — six scannable tiles below the mockup.
            Three columns on desktop, two on tablet, one on mobile. A
            tighter spacing than the standard features grid so the
            grid reads as a secondary layer under the hero mockup
            rather than a full separate section. */}
        <div className="mt-16 grid gap-4 sm:mt-20 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {capabilities.map((c) => (
            <FeatureCard
              key={c.title}
              icon={c.icon}
              title={c.title}
              description={c.description}
            />
          ))}
        </div>

        {/* Footnote — a subtle pointer to the full enumeration without
            cluttering the grid. The landing is the pitch; docs is the
            catalog. */}
        <p className="mt-10 text-center text-sm text-gray-600 dark:text-gray-400">
          Plus panic history, cache hit/miss, EXPLAIN plans, HAR export, and
          more.{" "}
          <a
            href="/docs/cli-reference/dev"
            className="text-primary underline-offset-4 hover:underline"
          >
            See every debug surface →
          </a>
        </p>
      </div>
    </section>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function BrowserChrome() {
  return (
    <div className="flex items-center gap-2 border-b border-gray-800 bg-terminal-bg px-3 py-2.5">
      <span className="h-2.5 w-2.5 rounded-full bg-red-500" />
      <span className="h-2.5 w-2.5 rounded-full bg-yellow-500" />
      <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
      <div className="ml-3 flex-1 rounded-md bg-gray-900 px-3 py-1 font-mono text-[11px] text-gray-400">
        localhost:9090
      </div>
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-5 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400">
      {children}
    </div>
  );
}

function MetricCard({
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

function TableFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-800">
      {children}
    </div>
  );
}

function MethodBadge({ method }: { method: string }) {
  const color =
    method === "GET"
      ? "text-primary"
      : method === "POST"
        ? "text-green-400"
        : method === "PATCH"
          ? "text-amber-400"
          : method === "DELETE"
            ? "text-red-400"
            : "text-gray-300";
  return (
    <span
      className={`inline-block rounded bg-gray-900 px-1.5 py-0.5 text-[10px] font-medium ${color}`}
    >
      {method}
    </span>
  );
}

// ── Trace waterfall mock ────────────────────────────────────────────
//
// Fixed span tree describing a typical POST /api/v1/orders request.
// Offsets + durations are in milliseconds, relative to the root span.
// depth controls the indent of the span name.

type TraceSpan = {
  name: string;
  kind: string;
  offset: number;
  duration: number;
  depth: number;
  stack?: string[];
};

const traceSpans: TraceSpan[] = [
  {
    name: "HTTP POST /api/v1/orders",
    kind: "server",
    offset: 0,
    duration: 68,
    depth: 0,
  },
  {
    name: "OrderController.Create",
    kind: "internal",
    offset: 3,
    duration: 62,
    depth: 1,
  },
  {
    name: "OrderService.Create",
    kind: "internal",
    offset: 7,
    duration: 56,
    depth: 2,
    stack: [
      "app/services/order.service.go:42 (*OrderService).Create",
      "app/controllers/order.controller.go:91 (*OrderController).Create",
      "app/rest/routes/order.go:28 InitOrderRoutes.func1",
    ],
  },
  {
    name: "OrderRepository.Create",
    kind: "internal",
    offset: 14,
    duration: 38,
    depth: 3,
  },
  {
    name: "INSERT INTO orders",
    kind: "client",
    offset: 18,
    duration: 31,
    depth: 4,
  },
  {
    name: "UserRepository.FindByID",
    kind: "internal",
    offset: 54,
    duration: 6,
    depth: 3,
  },
];

function TraceRow({
  span,
  total,
  highlighted,
}: {
  span: TraceSpan;
  total: number;
  highlighted?: boolean;
}) {
  const left = (span.offset / total) * 100;
  const width = Math.max(1.2, (span.duration / total) * 100);
  return (
    <div
      className={`py-1.5 ${
        highlighted ? "rounded-md bg-primary/5 px-2 -mx-2" : ""
      }`}
    >
      <div className="grid grid-cols-[minmax(0,1fr)_120px] items-center gap-3">
        <div
          className="truncate font-mono text-[11px] text-gray-300"
          style={{ paddingLeft: `${span.depth * 10}px` }}
        >
          <span className="text-gray-500">
            {span.depth > 0 ? "└─ " : ""}
          </span>
          {span.name}
          <span className="ml-1.5 text-[9px] uppercase tracking-widest text-gray-600">
            {span.kind}
          </span>
        </div>
        <div className="relative h-3.5 overflow-hidden rounded-sm bg-gray-900/50">
          <div
            className="absolute top-0 bottom-0 rounded-sm bg-primary/70"
            style={{ left: `${left}%`, width: `${width}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-end pr-1 font-mono text-[9px] text-gray-300">
            {span.duration}ms
          </div>
        </div>
      </div>
      {highlighted && span.stack ? (
        <pre className="mt-1.5 ml-3 overflow-auto rounded-sm bg-gray-900/80 p-2 font-mono text-[9.5px] leading-relaxed text-gray-500">
          {span.stack.join("\n")}
        </pre>
      ) : null}
    </div>
  );
}

function StatusPill({ status }: { status: number }) {
  const tone =
    status < 300
      ? "bg-green-500/15 text-green-400"
      : status < 400
        ? "bg-primary/15 text-primary"
        : status < 500
          ? "bg-amber-500/15 text-amber-400"
          : "bg-red-500/15 text-red-400";
  return (
    <span
      className={`inline-block rounded-full px-1.5 py-0.5 text-[10px] font-medium ${tone}`}
    >
      {status}
    </span>
  );
}
