"use client";

import { useConsent } from "@/contexts/consent-context";

// CookiePreferences — the interactive control surfaced on /cookies.
// Three states: undecided (Accept + Reject buttons), accepted (status +
// Revoke), rejected (status + Re-accept). Reading the live consent
// state lets a user see their current setting without re-prompting.

export function CookiePreferences() {
  const { consent, hydrated, setAnalyticsConsent } = useConsent();

  // Avoid hydration mismatch — wait until the client has loaded the
  // persisted decision before rendering anything that depends on it.
  if (!hydrated) {
    return (
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Loading current preference…
      </p>
    );
  }

  if (consent.analytics === true) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-semibold text-primary">
          Analytics is currently <span className="underline">accepted</span>.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Last updated:{" "}
          {consent.decidedAt
            ? new Date(consent.decidedAt).toLocaleString()
            : "—"}
        </p>
        <button
          type="button"
          onClick={() => setAnalyticsConsent(false)}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Revoke consent
        </button>
      </div>
    );
  }

  if (consent.analytics === false) {
    return (
      <div className="space-y-3 text-sm">
        <p className="font-semibold text-foreground">
          Analytics is currently <span className="underline">rejected</span>.
        </p>
        <p className="text-gray-600 dark:text-gray-400">
          Last updated:{" "}
          {consent.decidedAt
            ? new Date(consent.decidedAt).toLocaleString()
            : "—"}
        </p>
        <button
          type="button"
          onClick={() => setAnalyticsConsent(true)}
          className="inline-flex cursor-pointer items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-[#00283A] transition-colors hover:opacity-90"
        >
          Accept analytics
        </button>
      </div>
    );
  }

  // Undecided — show the same accept/reject pair as the banner.
  return (
    <div className="flex flex-wrap gap-3">
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
  );
}
