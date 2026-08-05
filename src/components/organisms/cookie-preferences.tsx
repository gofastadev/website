"use client";

import { Button } from "@/components/atoms/button";
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
      <div className="rounded-xl border border-gray-200 bg-surface p-6 shadow-e3 dark:border-gray-800">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Loading current preference…
        </p>
      </div>
    );
  }

  if (consent.analytics === true) {
    return (
      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-surface shadow-e3 dark:divide-gray-800 dark:border-gray-800">
        <div className="space-y-3 p-6 text-sm">
          <p className="font-semibold text-primary">
            Analytics is currently <span className="underline">accepted</span>.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated:{" "}
            {consent.decidedAt
              ? new Date(consent.decidedAt).toLocaleString()
              : "—"}
          </p>
        </div>
        <div className="p-6">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setAnalyticsConsent(false)}
          >
            Revoke consent
          </Button>
        </div>
      </div>
    );
  }

  if (consent.analytics === false) {
    return (
      <div className="divide-y divide-gray-200 rounded-xl border border-gray-200 bg-surface shadow-e3 dark:divide-gray-800 dark:border-gray-800">
        <div className="space-y-3 p-6 text-sm">
          <p className="font-semibold text-foreground">
            Analytics is currently <span className="underline">rejected</span>.
          </p>
          <p className="text-gray-600 dark:text-gray-400">
            Last updated:{" "}
            {consent.decidedAt
              ? new Date(consent.decidedAt).toLocaleString()
              : "—"}
          </p>
        </div>
        <div className="p-6">
          <Button
            type="button"
            variant="primary"
            onClick={() => setAnalyticsConsent(true)}
          >
            Accept analytics
          </Button>
        </div>
      </div>
    );
  }

  // Undecided — show the same accept/reject pair as the banner.
  return (
    <div className="flex flex-wrap gap-3 rounded-xl border border-gray-200 bg-surface p-6 shadow-e3 dark:border-gray-800">
      <Button
        type="button"
        variant="secondary"
        onClick={() => setAnalyticsConsent(false)}
      >
        Reject
      </Button>
      <Button
        type="button"
        variant="primary"
        onClick={() => setAnalyticsConsent(true)}
      >
        Accept
      </Button>
    </div>
  );
}
