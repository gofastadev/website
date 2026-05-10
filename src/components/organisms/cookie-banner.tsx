"use client";

import Link from "next/link";
import { useConsent } from "@/contexts/consent-context";

// ─────────────────────────────────────────────────────────────────────
// CookieBanner — GDPR / CPRA-compliant consent prompt.
//
// Visibility rules:
//
//   - Hidden until the consent context has hydrated from localStorage
//     (`hydrated === false`). Avoids a hydration mismatch and a flash
//     of banner on every navigation.
//
//   - Hidden once `analytics` is a boolean (true OR false — both count
//     as "decided"). The user's choice is respected; they see the
//     banner again only by clicking "Manage cookies" in the footer
//     (which calls resetConsent).
//
// Two equally-prominent buttons. GDPR Article 7 + EDPB Guidelines
// 05/2020 require Reject to be as accessible as Accept — no hiding it
// behind "Customize", no smaller text, no muted colors.
// ─────────────────────────────────────────────────────────────────────

export function CookieBanner() {
  const { consent, hydrated, setAnalyticsConsent } = useConsent();

  if (!hydrated) return null;
  if (consent.analytics !== null) return null;

  return (
    <div
      role="region"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:border-gray-800 dark:bg-gray-950/95 dark:supports-[backdrop-filter]:bg-gray-950/80"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <p>
            We use Google Analytics and Microsoft Clarity to understand how the
            site is used. They&rsquo;re only loaded if you accept. See our{" "}
            <Link
              href="/cookies"
              className="text-primary underline underline-offset-4"
            >
              cookie policy
            </Link>
            {" "}for details.
          </p>
        </div>

        <div className="flex flex-shrink-0 gap-3">
          <button
            type="button"
            onClick={() => setAnalyticsConsent(false)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => setAnalyticsConsent(true)}
            className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-[#00283A] transition-colors hover:opacity-90"
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
