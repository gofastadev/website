"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import { Analytics, PageviewTracker } from "@/components/atoms";
import { CookieBanner } from "@/components/organisms";

// SiteChrome renders the analytics + cookie-banner + pageview-tracker
// stack on public routes only. The /keystatic admin runs its own SPA
// router — PageviewTracker would fire on every internal navigation
// (polluting GA), and the loaded analytics scripts attach global click
// handlers that can interfere with the editor toolbar. We render
// nothing under /keystatic/* so the admin is fully isolated.
export function SiteChrome() {
  const pathname = usePathname();
  if (pathname?.startsWith("/keystatic")) return null;
  return (
    <>
      <Analytics />
      <Suspense fallback={null}>
        <PageviewTracker />
      </Suspense>
      <CookieBanner />
    </>
  );
}
