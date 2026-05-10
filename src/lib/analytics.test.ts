import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { trackEvent } from "./analytics";

// trackEvent is the single chokepoint for GA4 custom events. Tests
// pin three behaviors: no-op when gtag is missing, forward-with-augment
// when gtag is present, and SSR safety (window undefined).

describe("trackEvent", () => {
  const originalGtag = window.gtag;

  beforeEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  afterEach(() => {
    if (originalGtag) (window as unknown as { gtag: typeof originalGtag }).gtag = originalGtag;
    else delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("is a no-op when window.gtag is undefined (consent denied / env unset)", () => {
    // No error thrown, no side effects. Callers don't have to guard.
    expect(() => trackEvent("cta_get_started")).not.toThrow();
  });

  it("forwards the event name + params to gtag with auto-attached page_location + page_referrer", () => {
    const gtagSpy = vi.fn();
    (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;

    trackEvent("cta_get_started", {
      location: "hero",
      destination: "/docs/getting-started/introduction",
    });

    expect(gtagSpy).toHaveBeenCalledOnce();
    const [verb, name, params] = gtagSpy.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(verb).toBe("event");
    expect(name).toBe("cta_get_started");
    expect(params.location).toBe("hero");
    expect(params.destination).toBe("/docs/getting-started/introduction");
    expect(params.page_location).toBe(window.location.href);
    expect("page_referrer" in params).toBe(true);
  });

  it("defaults page_referrer to undefined when document.referrer is empty (omitted from payload)", () => {
    const gtagSpy = vi.fn();
    (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
    // jsdom's default document.referrer is "" — exercise that branch.
    trackEvent("scroll_depth", { percent: 25 });
    const [, , params] = gtagSpy.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(params.page_referrer).toBeUndefined();
  });

  it("propagates additional referrer string when document.referrer is non-empty", () => {
    const gtagSpy = vi.fn();
    (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
    // Inject a fake referrer for the duration of this test.
    Object.defineProperty(document, "referrer", {
      configurable: true,
      get: () => "https://example.com/from",
    });
    trackEvent("nav_to_docs");
    const [, , params] = gtagSpy.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(params.page_referrer).toBe("https://example.com/from");
    // Restore: re-define to empty for subsequent tests.
    Object.defineProperty(document, "referrer", {
      configurable: true,
      get: () => "",
    });
  });

  it("accepts events without params", () => {
    const gtagSpy = vi.fn();
    (window as unknown as { gtag: typeof gtagSpy }).gtag = gtagSpy;
    trackEvent("cta_view_github");
    expect(gtagSpy).toHaveBeenCalledOnce();
    const [, name] = gtagSpy.mock.calls[0] as [string, string];
    expect(name).toBe("cta_view_github");
  });
});
