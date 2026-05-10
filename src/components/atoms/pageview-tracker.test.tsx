import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, act } from "@testing-library/react";

// usePathname / useSearchParams are mocked per-test so we can simulate
// navigation by mutating the mock return values and re-rendering.
let mockPathname = "/";
let mockSearch: URLSearchParams | null = new URLSearchParams();
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
  useSearchParams: () => mockSearch,
}));

import { PageviewTracker } from "./pageview-tracker";

describe("PageviewTracker", () => {
  beforeEach(() => {
    mockPathname = "/";
    mockSearch = new URLSearchParams();
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  afterEach(() => {
    delete (window as unknown as { gtag?: unknown }).gtag;
  });

  it("does NOT fire on initial mount — GA4's config event already counted that pageview", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    render(<PageviewTracker />);
    expect(gtag).not.toHaveBeenCalled();
  });

  it("fires page_view on a client-side route change after the first render", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    const { rerender } = render(<PageviewTracker />);
    expect(gtag).not.toHaveBeenCalled();

    // Simulate navigation by mutating the mocked hook return values
    // and re-rendering. The effect's dep array picks up the change.
    act(() => {
      mockPathname = "/docs/cli-reference/dev";
    });
    rerender(<PageviewTracker />);

    expect(gtag).toHaveBeenCalledOnce();
    const [verb, name, params] = gtag.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(verb).toBe("event");
    expect(name).toBe("page_view");
    expect(params.page_path).toBe("/docs/cli-reference/dev");
  });

  it("includes querystring in page_path when present", () => {
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    const { rerender } = render(<PageviewTracker />);
    act(() => {
      mockPathname = "/docs";
      mockSearch = new URLSearchParams({ q: "auth" });
    });
    rerender(<PageviewTracker />);
    const [, , params] = gtag.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];
    expect(params.page_path).toBe("/docs?q=auth");
  });

  it("is a no-op when gtag isn't loaded (consent pending/denied)", () => {
    // No window.gtag at all → second guard returns early.
    const { rerender } = render(<PageviewTracker />);
    act(() => {
      mockPathname = "/some-other";
    });
    expect(() => rerender(<PageviewTracker />)).not.toThrow();
  });

  it("survives a null searchParams return (older Next.js versions) and falls back to empty string", () => {
    // useSearchParams() can return null in some Next.js render passes
    // (mostly during dynamic-to-static promotion). The component
    // falls back to "" via `?? ""` so the page_path doesn't end up
    // as "undefined".
    const gtag = vi.fn();
    (window as unknown as { gtag: typeof gtag }).gtag = gtag;
    mockSearch = null;
    const { rerender } = render(<PageviewTracker />);
    act(() => {
      mockPathname = "/docs";
    });
    rerender(<PageviewTracker />);
    const [, , params] = gtag.mock.calls[0] as [
      string,
      string,
      Record<string, unknown>,
    ];
    // No querystring suffix because mockSearch was null.
    expect(params.page_path).toBe("/docs");
    mockSearch = new URLSearchParams();
  });
});
