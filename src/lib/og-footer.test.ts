import { describe, it, expect } from "vitest";
import { buildOgFooterUrl } from "./og-footer";

describe("buildOgFooterUrl", () => {
  it("returns the docs path for section=docs", () => {
    expect(buildOgFooterUrl("docs")).toBe("gofasta.dev/docs");
  });

  it("returns the blog path for section=blog", () => {
    expect(buildOgFooterUrl("blog")).toBe("gofasta.dev/blog");
  });

  it("normalizes case (Blog → blog)", () => {
    // The /docs route titles its section as `Getting Started` etc. via
    // case-preserving humanization. The footer normalizer keeps the
    // path canonical so `?section=Blog` and `?section=blog` produce
    // the same image cache key.
    expect(buildOgFooterUrl("BLOG")).toBe("gofasta.dev/blog");
    expect(buildOgFooterUrl("Docs")).toBe("gofasta.dev/docs");
  });

  it("strips surrounding whitespace before matching", () => {
    expect(buildOgFooterUrl("  blog  ")).toBe("gofasta.dev/blog");
  });

  it("falls back to bare gofasta.dev for unknown sections", () => {
    // Marketing pages pass values like "Pricing" or "Landing" — those
    // are not URL-bearing top-level groups, so the footer stays
    // generic rather than emitting a 404-shaped path.
    expect(buildOgFooterUrl("Pricing")).toBe("gofasta.dev");
    expect(buildOgFooterUrl("Landing")).toBe("gofasta.dev");
  });

  it("falls back to bare gofasta.dev for empty / null / undefined", () => {
    expect(buildOgFooterUrl("")).toBe("gofasta.dev");
    expect(buildOgFooterUrl(null)).toBe("gofasta.dev");
    expect(buildOgFooterUrl(undefined)).toBe("gofasta.dev");
  });
});
