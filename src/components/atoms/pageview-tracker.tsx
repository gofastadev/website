"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// ─────────────────────────────────────────────────────────────────────
// <PageviewTracker /> — SPA-aware page_view firing for GA4.
//
// GA4's automatic page_view event only fires on the initial document
// load. Next.js App Router transitions (`router.push`, `<Link>` clicks)
// are client-side route changes that don't trigger a fresh document
// load — so without this component, GA4 sees one pageview per session
// regardless of how many pages the user actually visits.
//
// We listen to `usePathname()` + `useSearchParams()` and re-fire
// `gtag('event','page_view', ...)` on every route change. The first
// render is intentionally skipped: GA4's auto page_view (from
// `gtag('config', ...)` in <Analytics />) already counts the landing
// hit. Firing again here would double-count.
//
// Implementation note — `useSearchParams()` returns a *new object*
// every render in some Next versions, which would cause the effect
// to re-fire on identical URLs. We stringify it before adding to the
// dep array so we only re-run when the actual querystring changes.
// ─────────────────────────────────────────────────────────────────────

export function PageviewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const searchString = searchParams?.toString() ?? "";

  // Skip the first mount — gtag('config', { send_page_view: true })
  // from the Analytics component already fires the initial page_view.
  // We exist to cover client-side route changes only.
  const isFirstMount = useRef(true);

  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    if (typeof window.gtag !== "function") return;

    const url = pathname + (searchString ? `?${searchString}` : "");
    window.gtag("event", "page_view", {
      page_path: url,
      page_location: window.location.href,
      page_title: document.title,
    });
  }, [pathname, searchString]);

  return null;
}
