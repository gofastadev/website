import Script from "next/script";

// ─────────────────────────────────────────────────────────────────────
// <Analytics /> — GA4 + Microsoft Clarity, side by side.
//
// Both trackers load via next/script with `strategy="afterInteractive"`
// so they fire after the page becomes interactive (post-FCP, post-LCP)
// and never block paint or hydration. `lazyOnload` would be even
// cheaper for perf but unreliable for analytics: a user who closes the
// tab before browser-idle never gets tracked, and bounce-rate funnels
// become useless. `afterInteractive` is GA4's officially-recommended
// strategy for SPAs.
//
// Either tracker is opt-in via env var:
//
//   NEXT_PUBLIC_GA4_MEASUREMENT_ID    — e.g. "G-XXXXXXXXXX"
//   NEXT_PUBLIC_CLARITY_PROJECT_ID    — e.g. "abcdefghij"
//
// When an env var is unset (dev / preview environments by default), the
// corresponding script is not rendered at all. No 3rd-party domain is
// contacted, and no client JS is shipped. This keeps local development
// from polluting the production analytics property.
//
// GDPR / CCPA: this component does NOT implement consent management.
// Pages serving traffic from regions that require prior consent need a
// banner that gates these scripts until the user opts in. Deferred to
// a separate task — see website/README.md "Analytics" for context.
// ─────────────────────────────────────────────────────────────────────

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

export function Analytics() {
  return (
    <>
      {GA4_ID ? (
        <>
          {/* Google's gtag loader. Async by default via next/script;
              `afterInteractive` defers until hydration completes. */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          {/* GA4 init — initializes dataLayer + sends the first
              page_view. The id-suffix on the inline Script is what
              next/script uses as the cache key. */}
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      ) : null}

      {CLARITY_ID ? (
        // Microsoft Clarity install snippet — direct port of the
        // copy-from-Clarity-dashboard install code, wrapped in
        // next/script so it inherits Next's strategy + dedupe.
        <Script id="clarity-init" strategy="afterInteractive">
          {`
            (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
            })(window, document, "clarity", "script", "${CLARITY_ID}");
          `}
        </Script>
      ) : null}
    </>
  );
}
