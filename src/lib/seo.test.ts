import { describe, it, expect } from "vitest";
import {
  AGENT_DOC_ALTERNATES,
  AGENT_DOC_FILES,
  BASE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
  withBaseKeywords,
} from "./seo";

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

describe("AGENT_DOC_FILES", () => {
  it("lists both llmstxt.org surfaces", () => {
    expect(AGENT_DOC_FILES.map((f) => f.path)).toEqual([
      "/llms.txt",
      "/llms-full.txt",
    ]);
  });

  // Root-relative paths only. These get concatenated onto SITE_URL by
  // sitemap.ts and robots.txt/route.ts, and passed straight to next/link
  // by the footer — an absolute URL here would produce a doubled origin
  // in the first two and an external link in the third.
  it("uses root-relative paths", () => {
    for (const file of AGENT_DOC_FILES) {
      expect(file.path.startsWith("/")).toBe(true);
      expect(file.path).not.toContain(SITE_URL);
    }
  });

  it("gives every file a visible label and a descriptive title", () => {
    for (const file of AGENT_DOC_FILES) {
      expect(file.label.length).toBeGreaterThan(0);
      expect(file.title.length).toBeGreaterThan(0);
    }
  });

  it("AGENT_DOC_ALTERNATES mirrors the files in Metadata shape", () => {
    expect(AGENT_DOC_ALTERNATES).toEqual(
      AGENT_DOC_FILES.map((f) => ({ url: f.path, title: f.title }))
    );
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
