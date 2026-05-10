"use client";

import { useEffect } from "react";
import { trackEvent } from "@/lib/analytics";

// ─────────────────────────────────────────────────────────────────────
// <ScrollDepthTracker /> — fires `scroll_depth` events at 25%, 50%,
// 75%, and 100% milestones (computed against full document height).
//
// GA4's Enhanced Measurement includes a "scroll" event at the 90%
// milestone, but only one milestone. Knowing how far users actually
// go on the landing is more useful than a binary "did they reach the
// bottom?", so we add 25/50/75/100 explicitly. Each milestone fires
// at most once per page load.
//
// Listener is `passive: true` so it doesn't interfere with scroll
// performance. The handler is rAF-throttled — the underlying
// scrollTop reads are cheap but tracking analytics on every pixel
// would be wasteful and noisy.
// ─────────────────────────────────────────────────────────────────────

const MILESTONES = [25, 50, 75, 100] as const;

export function ScrollDepthTracker() {
  useEffect(() => {
    // No `typeof window === "undefined"` guard — useEffect never runs
    // server-side, so this block is client-only by construction.
    const fired = new Set<number>();
    let rafScheduled = false;

    const check = () => {
      rafScheduled = false;
      const doc = document.documentElement;
      const scrolled = window.scrollY + window.innerHeight;
      const max = doc.scrollHeight;
      if (max <= 0) return;
      const percent = (scrolled / max) * 100;

      for (const milestone of MILESTONES) {
        if (percent >= milestone && !fired.has(milestone)) {
          fired.add(milestone);
          trackEvent("scroll_depth", { percent: milestone });
        }
      }
    };

    const onScroll = () => {
      if (rafScheduled) return;
      rafScheduled = true;
      window.requestAnimationFrame(check);
    };

    // Run once on mount in case the page is short enough that the
    // initial viewport already covers 100%.
    check();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
