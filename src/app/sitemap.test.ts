import { describe, it, expect } from "vitest";
import sitemap from "./sitemap";
import { AGENT_DOC_FILES, SITE_URL } from "@/lib/seo";

describe("sitemap.xml", () => {
  it("includes the home page at top priority", () => {
    const entry = sitemap().find((e) => e.url === SITE_URL);
    expect(entry?.priority).toBe(1.0);
  });

  // The whole reason llms.txt never surfaced in a search index: it was
  // absent from the sitemap AND had no inbound links. This asserts the
  // sitemap half of that fix.
  it("lists every llms file", () => {
    const urls = sitemap().map((e) => e.url);
    for (const file of AGENT_DOC_FILES) {
      expect(urls).toContain(`${SITE_URL}${file.path}`);
    }
  });

  it("ranks the llms files at 0.5 / weekly", () => {
    const entries = sitemap();
    for (const file of AGENT_DOC_FILES) {
      const entry = entries.find((e) => e.url === `${SITE_URL}${file.path}`);
      expect(entry?.priority).toBe(0.5);
      expect(entry?.changeFrequency).toBe("weekly");
    }
  });

  // Both files are rewritten by the prebuild script on every deploy, so
  // a build-time lastModified would claim a change on every build even
  // when the content is byte-identical — the precise inaccuracy that
  // makes Google stop trusting a site's lastmod values.
  it("omits lastModified on the llms files", () => {
    const entries = sitemap();
    for (const file of AGENT_DOC_FILES) {
      const entry = entries.find((e) => e.url === `${SITE_URL}${file.path}`);
      expect(entry?.lastModified).toBeUndefined();
    }
  });

  it("emits no duplicate URLs", () => {
    const urls = sitemap().map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });
});
