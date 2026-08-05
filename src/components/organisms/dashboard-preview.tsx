"use client";

import { useEffect, useRef, useState } from "react";
import { SectionHeading, TerminalBlock } from "@/components/molecules";
import { useOnScreen } from "@/hooks/use-on-screen";
import { cn } from "@/lib/utils";

// ── Mocked state pool ───────────────────────────────────────────────
// The samples the ticker rotates through. Using concrete verbs/paths
// instead of abstract placeholders so the preview reads as "this is
// what live debugging looks like in a real app".

type MockRequest = {
  method: string;
  path: string;
  status: number;
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
  // Covers the 5xx tier — a server-side failure renders the err tone.
  { method: "POST", path: "/api/v1/reports", status: 503, duration: 210 },
  // HEAD exercises the "other" branch of the method column.
  { method: "HEAD", path: "/api/v1/users", status: 200, duration: 3 },
];

// Fixed seed data used for SSR. The ticker mutates this after mount,
// which keeps the server-rendered HTML and the first client render
// identical — avoids hydration mismatches. Each seeded row picks a
// different method + status tier so the first paint exercises every
// status class (ok / warn / err) and a non-GET method.
const seededRequests = [
  { id: "s1", time: "12:34:52", ...requestPool[0] }, // GET    200 (ok)
  { id: "s2", time: "12:34:50", ...requestPool[1] }, // POST   201 (ok)
  { id: "s3", time: "12:34:48", ...requestPool[3] }, // PATCH  200 (ok)
  { id: "s4", time: "12:34:45", ...requestPool[8] }, // DELETE 204 (ok)
  { id: "s5", time: "12:34:42", ...requestPool[7] }, // GET    401 (warn)
];

type RenderedRequest = (typeof seededRequests)[number];

function formatClockNow(): string {
  const d = new Date();
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  const ss = String(d.getSeconds()).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// Maps an HTTP status code to a terminal status tone. 2xx/3xx read as
// healthy, 4xx as a caller-side warning, 5xx as a genuine error — the
// same three-tier vocabulary `.term-ok` / `.term-warn` / `.term-err`
// use everywhere else in the terminal surfaces.
function statusTone(status: number): "term-ok" | "term-warn" | "term-err" {
  if (status < 400) return "term-ok";
  if (status < 500) return "term-warn";
  return "term-err";
}

function RequestLine({ request }: { request: RenderedRequest }) {
  const tone = statusTone(request.status);
  return (
    <span className="gofasta-dashboard-row grid grid-cols-[64px_44px_1fr_40px_48px] items-center gap-3 border-b border-white/5 py-1.5 last:border-0">
      <span className="text-gray-500">{request.time}</span>
      <span className="text-terminal-accent">{request.method}</span>
      <span className="truncate text-gray-100">{request.path}</span>
      <span className={cn("flex items-center gap-1.5", tone)}>
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          aria-hidden="true"
        />
        {request.status}
      </span>
      <span className="text-right text-gray-500">{request.duration}ms</span>
    </span>
  );
}

export function DashboardPreview() {
  // Gate the ticker on intersection — the preview only shifts when it's
  // actually visible, so a user scrolled past doesn't burn timers.
  const [ref, visible] = useOnScreen<HTMLDivElement>({
    rootMargin: "0px 0px -15% 0px",
  });

  const [requests, setRequests] =
    useState<RenderedRequest[]>(seededRequests);
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
    }, 2500);

    return () => {
      window.clearInterval(requestTimer);
    };
  }, [visible]);

  return (
    <section ref={ref} className="section-reveal px-6 py-section">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="See every request while you develop"
          description="gofasta dev --dashboard runs a self-contained debug panel on :9090 with live metrics, request logs, SQL, and trace waterfalls. No runtime agent, no cloud service."
        />

        <div className="mx-auto mt-12 max-w-5xl">
          <TerminalBlock title="gofasta debug watch">
            <span
              className="mb-3 flex items-center gap-2 text-[10px] font-medium uppercase tracking-widest text-gray-500"
              aria-hidden="true"
            >
              <span className="gofasta-dashboard-pulse h-1.5 w-1.5 rounded-full bg-primary" />
              watching http://localhost:8080
            </span>
            {requests.map((r) => (
              <RequestLine key={r.id} request={r} />
            ))}
          </TerminalBlock>
        </div>
      </div>
    </section>
  );
}
