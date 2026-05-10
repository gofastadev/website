"use client";

import Script from "next/script";
import { useEffect } from "react";
import { useConsent } from "@/contexts/consent-context";

// ─────────────────────────────────────────────────────────────────────
// <Analytics /> — GA4 + Microsoft Clarity, GDPR/CPRA-aware.
//
// Loading model:
//
//   - **GA4 + Google Consent Mode v2.** gtag.js loads even before the
//     user decides — but with `analytics_storage: 'denied'` set as the
//     default. In that state Google does not write cookies and does
//     not collect identifiers; it sends "cookieless pings" that give
//     aggregate counts only. When the user accepts, we call
//     `gtag('consent','update', { analytics_storage: 'granted' })`
//     and full GA4 tracking activates without a reload. This is
//     Google's officially-recommended GDPR posture.
//
//   - **Clarity is gated by consent.** Microsoft Clarity has no
//     analog of Consent Mode; the only safe way to comply with GDPR
//     is to not load the script at all until consent is given. Once
//     the user accepts, the Clarity snippet renders and the tag
//     fetches. If the user later revokes (via /cookies), Clarity is
//     removed from the DOM but already-fired events from this session
//     remain in their dashboard — the user is informed of this on
//     the cookies page.
//
//   - **Strategy.** `next/script strategy="afterInteractive"` for
//     gtag.js so it doesn't block paint. The Consent Mode default is
//     emitted via a `beforeInteractive` inline script — it MUST run
//     before any gtag call, otherwise GA4 records data with the
//     implicit (granted) default which violates GDPR.
//
//   - **Env-var gating.** When NEXT_PUBLIC_GA4_MEASUREMENT_ID is
//     unset (dev / preview), nothing GA-related renders. Same for
//     Clarity. Set these only on production.
// ─────────────────────────────────────────────────────────────────────

const GA4_ID = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
const CLARITY_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

// gtag is set on `window` by the GA4 init script. Declare its shape
// so TypeScript stops complaining when we call it from the consent
// effect.
declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    clarity?: (...args: unknown[]) => void;
  }
}

export function Analytics() {
  const { consent, hydrated } = useConsent();

  // Whenever consent changes, push an update through gtag. This is a
  // no-op when GA4 isn't configured or when the user hasn't decided
  // yet (analytics === null).
  useEffect(() => {
    if (!GA4_ID) return;
    if (typeof window === "undefined") return;
    if (typeof window.gtag !== "function") return;
    if (consent.analytics === null) return;

    window.gtag("consent", "update", {
      analytics_storage: consent.analytics ? "granted" : "denied",
      ad_storage: "denied", // we do not use ads; lock this off
      ad_user_data: "denied",
      ad_personalization: "denied",
    });
  }, [consent.analytics]);

  return (
    <>
      {GA4_ID ? (
        <>
          {/*
           * Consent Mode defaults — this MUST run before any gtag()
           * call. `beforeInteractive` puts it inline in <head> so the
           * defaults are set before gtag.js executes. denied-by-default
           * means GA4 collects nothing identifiable until the user
           * accepts.
           *
           * The lint rule discouraging beforeInteractive outside
           * pages/_document.js is from the pre-App-Router era. App
           * Router supports beforeInteractive when the Script is
           * rendered inside the root layout (or a component the root
           * layout mounts), which is exactly this case. The rule has
           * not been updated to recognize App-Router placement.
           */}
          {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document */}
          <Script id="gtag-consent-default" strategy="beforeInteractive">
            {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              gtag('consent', 'default', {
                ad_storage: 'denied',
                ad_user_data: 'denied',
                ad_personalization: 'denied',
                analytics_storage: 'denied',
                wait_for_update: 500
              });
            `}
          </Script>
          {/* gtag.js — afterInteractive so it doesn't compete with FCP/LCP. */}
          <Script
            src={`https://www.googletagmanager.com/gtag/js?id=${GA4_ID}`}
            strategy="afterInteractive"
          />
          <Script id="ga4-init" strategy="afterInteractive">
            {`
              gtag('js', new Date());
              gtag('config', '${GA4_ID}', { send_page_view: true });
            `}
          </Script>
        </>
      ) : null}

      {/* Clarity is unconditionally gated by consent. We render the
          script tag only after the user has accepted; before that,
          nothing about Clarity touches the DOM. */}
      {CLARITY_ID && hydrated && consent.analytics === true ? (
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
