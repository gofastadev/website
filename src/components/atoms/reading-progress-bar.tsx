"use client";

import { useEffect, useState } from "react";

// 4px-tall progress bar pinned to the top of the viewport. Width
// scales from 0 → 100% as the reader scrolls from the first byte of
// the page to the last. Useful UX cue on long-form posts where the
// vertical scrollbar alone doesn't convey "how much is left."
//
// Why useEffect: this is one of the three legitimate cases per the
// website CLAUDE.md — DOM/event subscription to `window.scroll` that
// has no declarative equivalent. The handler is rAF-throttled so it
// doesn't pile up frames during fast scrolls.

function computeProgress(): number {
  const scrolled = window.scrollY;
  const max =
    document.documentElement.scrollHeight - document.documentElement.clientHeight;
  if (max <= 0) return 0;
  const ratio = scrolled / max;
  if (ratio < 0) return 0;
  if (ratio > 1) return 1;
  return ratio;
}

export function ReadingProgressBar() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let rafId = 0;
    const handler = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        setProgress(computeProgress());
      });
    };
    // Set the initial value so the bar shows the correct width on
    // first paint instead of always starting at 0.
    setProgress(computeProgress());
    window.addEventListener("scroll", handler, { passive: true });
    window.addEventListener("resize", handler);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handler);
      window.removeEventListener("resize", handler);
    };
  }, []);

  return (
    <div
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(progress * 100)}
      className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent"
    >
      <div
        className="h-full bg-primary transition-[width] duration-100 ease-out"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
