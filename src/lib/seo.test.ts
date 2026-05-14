import { describe, it, expect } from "vitest";
import { BASE_KEYWORDS, SITE_NAME, SITE_URL, withBaseKeywords } from "./seo";

describe("seo primitives", () => {
  it("exports the canonical site URL and name", () => {
    expect(SITE_URL).toBe("https://gofasta.dev");
    expect(SITE_NAME).toBe("Gofasta");
  });

  it("BASE_KEYWORDS contains the core brand and category terms", () => {
    expect(BASE_KEYWORDS).toContain("Go");
    expect(BASE_KEYWORDS).toContain("Golang");
    expect(BASE_KEYWORDS).toContain("Gofasta");
  });
});

describe("withBaseKeywords", () => {
  it("returns BASE_KEYWORDS verbatim when no extras are passed", () => {
    expect(withBaseKeywords()).toEqual([...BASE_KEYWORDS]);
  });

  it("appends a single extra after the base list", () => {
    const out = withBaseKeywords("authentication");
    expect(out).toEqual([...BASE_KEYWORDS, "authentication"]);
  });

  it("appends multiple extras in order", () => {
    const out = withBaseKeywords("authentication", "JWT", "sessions");
    expect(out.slice(-3)).toEqual(["authentication", "JWT", "sessions"]);
    expect(out).toEqual(expect.arrayContaining([...BASE_KEYWORDS]));
  });

  it("dedupes extras that overlap with BASE_KEYWORDS", () => {
    const out = withBaseKeywords("Go", "GraphQL");
    expect(out.filter((k) => k === "Go")).toHaveLength(1);
    expect(out).toContain("GraphQL");
  });

  it("dedupes duplicates within the extras themselves", () => {
    const out = withBaseKeywords("REST API", "REST API", "JSON");
    expect(out.filter((k) => k === "REST API")).toHaveLength(1);
    expect(out).toContain("JSON");
  });
});
