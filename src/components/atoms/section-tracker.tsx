"use client";

import { useEffect, useRef } from "react";
import { useOnScreen } from "@/hooks/use-on-screen";
import { trackEvent } from "@/lib/analytics";

interface SectionTrackerProps {
  /** Stable identifier for this section — appears as `section` param in GA4. */
  name: string;
  /** Optional sub-component that gets the section wrapper. Defaults to <div>. */
  children: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────
// <SectionTracker /> — fires one `section_view` event the first time
// this section's content scrolls into view. Used to wrap each landing
// organism so we can answer questions like:
//
//   - "What percent of visitors scroll past the Hero?"
//   - "Does anyone actually see the FeaturesGrid?"
//   - "Is the AgentSpotlight reaching the audience it's pitched to?"
//
// Implementation note — fires exactly once per page load via
// `useOnScreen({ once: true })` + a `firedRef` latch. Without the
// latch a scroll-out-and-back would re-fire (the hook's `once`
// behavior covers IntersectionObserver, but a React re-render could
// otherwise mount a fresh observer).
// ─────────────────────────────────────────────────────────────────────

export function SectionTracker({ name, children }: SectionTrackerProps) {
  const [ref, visible] = useOnScreen<HTMLDivElement>({ once: true });
  const firedRef = useRef(false);

  useEffect(() => {
    if (visible && !firedRef.current) {
      firedRef.current = true;
      trackEvent("section_view", { section: name });
    }
  }, [visible, name]);

  return <div ref={ref}>{children}</div>;
}
