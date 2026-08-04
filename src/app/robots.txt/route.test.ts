import { describe, it, expect } from "vitest";
import { buildRobotsTxt, GET } from "./route";
import { AGENT_DOC_FILES, SITE_URL } from "@/lib/seo";

describe("robots.txt", () => {
  it("allows the whole site and the OG image route", () => {
    const txt = buildRobotsTxt();
    expect(txt).toContain("User-Agent: *");
    expect(txt).toContain("Allow: /");
    // /api/og must stay crawlable or Google reports every docs page's
    // og:image as "Blocked by robots.txt".
    expect(txt).toContain("Allow: /api/og");
  });

  it("keeps the internal and admin paths disallowed", () => {
    const txt = buildRobotsTxt();
    expect(txt).toContain("Disallow: /api/");
    expect(txt).toContain("Disallow: /_next/");
    expect(txt).toContain("Disallow: /keystatic/");
    expect(txt).toContain("Disallow: /api/keystatic/");
  });

  it("does not disallow the llms files", () => {
    const txt = buildRobotsTxt();
    for (const file of AGENT_DOC_FILES) {
      expect(txt).not.toContain(`Disallow: ${file.path}`);
    }
  });

  it("points at the sitemap", () => {
    expect(buildRobotsTxt()).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  });

  it("advertises every llms file as an absolute URL comment", () => {
    const txt = buildRobotsTxt();
    for (const file of AGENT_DOC_FILES) {
      expect(txt).toContain(`#   ${SITE_URL}${file.path}`);
    }
  });

  it("serves plain text", async () => {
    const res = GET();
    expect(res.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    await expect(res.text()).resolves.toBe(buildRobotsTxt());
  });
});
