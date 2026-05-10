import type { Metadata } from "next";
import { LandingTemplate } from "@/components/templates";
import { CookiePreferences } from "@/components/organisms/cookie-preferences";

// /cookies — the canonical destination for "Manage cookies" footer
// links and the GDPR / CPRA "withdraw consent" route. Lists every
// tracker the site uses, what it does, and an interactive control to
// grant or revoke consent without leaving the page.

export const metadata: Metadata = {
  title: "Cookie preferences",
  description:
    "Manage cookie and analytics preferences for gofasta.dev. We use Google Analytics and Microsoft Clarity only with consent — both are off by default.",
  alternates: {
    canonical: "https://gofasta.dev/cookies",
  },
  // No-index: this is a utility page; it adds nothing to search and
  // shouldn't compete with primary content for ranking.
  robots: { index: false, follow: true },
};

export default function CookiesPage() {
  return (
    <LandingTemplate>
      <section className="mx-auto max-w-3xl px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Cookie preferences
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          We collect anonymous analytics to understand how the documentation
          gets used and to fix issues we can&rsquo;t see from logs alone. Both
          tools are opt-in and only run after you accept below.
        </p>

        <div className="mt-10 space-y-6 text-gray-700 dark:text-gray-300">
          <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-foreground">
              Google Analytics 4
            </h2>
            <p className="mt-2 text-sm">
              Aggregate page views, traffic sources, and conversion funnels.
              We use{" "}
              <a
                href="https://support.google.com/analytics/answer/13802165"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline underline-offset-4"
              >
                Google Consent Mode v2
              </a>
              {" "}with default-denied analytics storage, so even before you
              decide GA4 receives only cookieless aggregate pings; nothing
              identifying. With consent it sets a first-party cookie
              (<code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">_ga</code>)
              that lasts up to 2 years.
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-foreground">
              Microsoft Clarity
            </h2>
            <p className="mt-2 text-sm">
              Session replay, heatmaps, and rage-click detection. We use this
              to find pages where users get stuck. Clarity is loaded only
              after you accept below — it does not contact{" "}
              <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">
                clarity.ms
              </code>{" "}
              before consent. Sets first-party cookies prefixed{" "}
              <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">
                _clck
              </code>{" "}
              and{" "}
              <code className="rounded bg-gray-100 px-1 text-xs dark:bg-gray-800">
                _clsk
              </code>
              .
            </p>
          </section>

          <section className="rounded-lg border border-gray-200 p-6 dark:border-gray-800">
            <h2 className="text-lg font-semibold text-foreground">
              Your choice
            </h2>
            <p className="mt-2 text-sm">
              You can change your mind at any time. Revoking consent stops
              GA4 from collecting identifiers and removes the Clarity script
              from the DOM going forward; previously-collected data stays in
              the respective dashboards. To request deletion of any
              already-collected data, contact us via the GitHub
              organisation linked in the site footer.
            </p>
            <div className="mt-6">
              <CookiePreferences />
            </div>
          </section>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            For California residents under CPRA: this page is the
            &ldquo;Do Not Sell or Share My Personal Information&rdquo;
            destination. We do not sell or share personal information; the
            controls above let you opt out of the analytics that exists.
          </p>
        </div>
      </section>
    </LandingTemplate>
  );
}
