import { describe, it, expect } from "vitest";
import { getKeywordsForPath } from "./seo-keywords";

const BASE_KEYWORDS = ["Go", "Golang", "Gofasta", "web framework", "backend"];

describe("getKeywordsForPath", () => {
  it("returns base keywords plus page-specific keywords for the home page", () => {
    const keywords = getKeywordsForPath("/");
    expect(keywords).toEqual(expect.arrayContaining(BASE_KEYWORDS));
    expect(keywords).toEqual(expect.arrayContaining(["code generation", "scaffolding", "CLI"]));
  });

  it("returns base keywords plus page-specific keywords for a docs page", () => {
    const keywords = getKeywordsForPath("/docs/guides/rest-api");
    expect(keywords).toEqual(expect.arrayContaining(BASE_KEYWORDS));
    expect(keywords).toEqual(expect.arrayContaining(["REST API", "HTTP handlers"]));
  });

  it("returns base keywords plus page-specific keywords for a CLI reference page", () => {
    const keywords = getKeywordsForPath("/docs/cli-reference/new");
    expect(keywords).toEqual(expect.arrayContaining(BASE_KEYWORDS));
    expect(keywords).toEqual(expect.arrayContaining(["CLI", "new project"]));
  });

  it("returns base keywords plus page-specific keywords for a generate subcommand", () => {
    const keywords = getKeywordsForPath("/docs/cli-reference/generate/scaffold");
    expect(keywords).toEqual(expect.arrayContaining(BASE_KEYWORDS));
    expect(keywords).toEqual(expect.arrayContaining(["scaffold", "generate"]));
  });

  it("returns base keywords plus page-specific keywords for an API reference page", () => {
    const keywords = getKeywordsForPath("/docs/api-reference/auth");
    expect(keywords).toEqual(expect.arrayContaining(BASE_KEYWORDS));
    expect(keywords).toEqual(expect.arrayContaining(["auth API", "JWT"]));
  });

  it("returns only base keywords for an unknown path", () => {
    const keywords = getKeywordsForPath("/unknown/path");
    expect(keywords).toEqual(BASE_KEYWORDS);
  });

  it("returns base keywords for the docs index", () => {
    const keywords = getKeywordsForPath("/docs");
    expect(keywords).toEqual(expect.arrayContaining(BASE_KEYWORDS));
    expect(keywords).toEqual(expect.arrayContaining(["documentation"]));
  });

  it("does not duplicate base keywords", () => {
    const keywords = getKeywordsForPath("/");
    const baseOccurrences = keywords.filter((k) => k === "Go");
    expect(baseOccurrences).toHaveLength(1);
  });

  it("returns an array with length greater than base keywords for known paths", () => {
    const keywords = getKeywordsForPath("/docs/guides/graphql");
    expect(keywords.length).toBeGreaterThan(BASE_KEYWORDS.length);
  });
});
