"use client";

// ─────────────────────────────────────────────────────────────────────
// trackEvent — the single chokepoint for firing GA4 events from
// component code. Wraps `window.gtag` with three guarantees:
//
//   1. **Null-safe.** If gtag isn't loaded (no env var, consent denied,
//      ad-blocker installed), the call is a no-op. Callers don't have
//      to defensively check `window.gtag?` themselves.
//
//   2. **Typed.** The event name is a string-literal union — typos
//      become TypeScript errors instead of silent missing data. Add
//      new events by extending `EventName`.
//
//   3. **Consistent base parameters.** Every event auto-attaches
//      `page_location` and `page_referrer` so reports can slice by
//      where the event originated without each callsite remembering
//      to pass them. GA4 collects these automatically for `page_view`,
//      not for custom events.
//
// Why a helper instead of inline gtag calls? Three reasons:
//
//   - **Refactor safety.** If the analytics layer ever changes (e.g.
//     switching to a server-side proxy, or adding consent gating at
//     the call site), there's one file to update.
//
//   - **Test surface.** Each component's test mocks one function
//     (`trackEvent`) instead of stubbing `window.gtag` globally.
//
//   - **Documentation.** The `EventName` union is the canonical list
//     of "events this site fires" — anyone can read it in 10 seconds
//     and know what's tracked.
// ─────────────────────────────────────────────────────────────────────

/**
 * The fixed set of event names the site fires. Adding an event = add
 * a line here. The TS compiler then refuses to ship any callsite that
 * spells the name wrong.
 *
 * Grouped by intent so the GA4 dashboard reads cleanly:
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
  | "cta_view_github"
  | "cta_read_white_paper"
  | "nav_to_docs"
  | "nav_to_github_library"
  | "footer_link_click"
  | "copy_install_command"
  | "section_view"
  | "scroll_depth"
  | "read_debugging_guide";

/**
 * Parameters attached to a single event. GA4 accepts any
 * string/number/boolean — keep values primitive. Custom keys appear in
 * GA4 reports as "custom parameters" once you register them under
 * Admin → Custom Definitions.
 */
export type EventParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Fire a GA4 custom event. No-op when gtag isn't loaded (consent
 * pending or denied, env var unset, ad-blocker active).
 *
 * The `params` object is merged with auto-attached `page_location` and
 * `page_referrer` so every event carries the origin URL without each
 * callsite having to remember.
 */
export function trackEvent(name: EventName, params: EventParams = {}): void {
  // No `typeof window === "undefined"` guard needed — this module is
  // "use client" so it never runs server-side. The gtag check below
  // covers the only realistic null case (consent pending/denied,
  // env var unset, ad-blocker active).
  if (typeof window.gtag !== "function") return;

  window.gtag("event", name, {
    page_location: window.location.href,
    page_referrer: document.referrer || undefined,
    ...params,
  });
}
