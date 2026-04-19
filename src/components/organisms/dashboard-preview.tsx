"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading } from "@/components/molecules";
import { useOnScreen } from "@/hooks/use-on-screen";

const capabilities = [
  {
    title: "Live metrics from /metrics",
    description:
      "Parses the Prometheus output your app already emits — request totals, in-flight gauges, average latency — and keeps the cards fresh every 5s.",
  },
  {
    title: "Request log, in-memory ring",
    description:
      "Chi middleware (gated by the `devtools` build tag) captures every request with method, path, status, and duration. See the last 200 without touching stdout.",
  },
  {
    title: "SQL queries with timings",
    description:
      "GORM callbacks record every SELECT / INSERT / UPDATE / DELETE with rows affected and wall-clock duration. Instant answer to \"why is this request slow?\".",
  },
  {
    title: "App health + compose services",
    description:
      "Polls /health every 5s, queries `docker compose ps` for service states, and surfaces both alongside routes scraped from docs/swagger.json.",
  },
  {
    title: "Zero production cost",
    description:
      "`go build` without `-tags devtools` compiles the stub (pass-through middleware, no-op GORM plugin). Production binaries carry zero debug surface.",
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
// identical — avoids hydration mismatches.
const seededRequests = [
  { id: "s1", time: "12:34:52", ...requestPool[0] },
  { id: "s2", time: "12:34:50", ...requestPool[1] },
  { id: "s3", time: "12:34:48", ...requestPool[2] },
  { id: "s4", time: "12:34:45", ...requestPool[4] },
  { id: "s5", time: "12:34:42", ...requestPool[6] },
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
          description="Run `gofasta dev --dashboard` and the CLI stands up a self-contained HTML debug panel on :9090 — live metrics, request log, SQL queries, app health. Uses html/template + Server-Sent Events; no runtime agent, no cloud service."
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

          {/* Dashboard mockup — a live-animated reproduction of what the
              real `gofasta dev --dashboard` renders. A ticker rotates
              new entries into the Recent Requests / Recent SQL tables
              every few seconds, metrics counters bump with each tick,
              and a "devtools" pill flips between enabled / stub. */}
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
