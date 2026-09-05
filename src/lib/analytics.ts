"use client";

/**
 * The fixed set of event names the site fires, so a misspelled name at
 * a callsite is a compile error rather than silently missing data.
 *
 * Prefixes group the GA4 dashboard:
 *
 *   cta_*      — high-intent clicks worth marking as conversions
 *   nav_*      — primary-navigation clicks (header / footer)
 *   copy_*     — clipboard-copy interactions (install command, code samples)
 *   section_*  — section-impression events (saw a part of the landing)
 *   scroll_*   — depth milestones (25 / 50 / 75 / 100 percent)
 *   read_*     — internal-content engagement (clicked "read the X guide")
 */
export type EventName =
  | "cta_get_started"
  | "cta_read_docs"
  | "cta_read_white_paper"
  | "nav_to_docs"
  | "nav_to_blog"
  | "nav_to_github_library"
  | "footer_link_click"
  | "copy_install_command"
  | "copy_code"
  | "newsletter_subscribe"
  | "section_view"
  | "scroll_depth"
  | "share_click";

/** Keep values primitive — GA4 accepts only string/number/boolean. */
export type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a GA4 custom event, or do nothing if gtag never loaded.
 *
 * GA4 collects `page_location` and `page_referrer` automatically for
 * `page_view` but not for custom events, so they are attached here
 * rather than at each callsite.
 */
export function trackEvent(name: EventName, params: EventParams = {}): void {
  // No `typeof window === "undefined"` guard needed — this module is
  // "use client" so it never runs server-side. The gtag check covers
  // the real null cases: consent pending/denied, env var unset,
  // ad-blocker active.
  if (typeof window.gtag !== "function") return;

  window.gtag("event", name, {
    page_location: window.location.href,
    page_referrer: document.referrer || undefined,
    ...params,
  });
}
