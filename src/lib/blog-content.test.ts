import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import { validatePostFile } from "./blog";

// Validates the real posts in data/blog. Keystatic saves open a pull
// request, so a post that would silently fail to load (an empty required
// field, a part number without a series) fails CI on that PR with the
// reason, instead of disappearing from the site after merge.

const BLOG_DIR = path.join(__dirname, "..", "..", "data", "blog");
const files = fs
  .readdirSync(BLOG_DIR)
  .filter((f) => f.endsWith(".mdx") && !f.startsWith("_"));

describe("data/blog posts", () => {
  it.each(files)("%s loads", (filename) => {
    const source = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
    expect(validatePostFile(filename, source)).toBeNull();
  });

  it("gives every part of a series a unique part number", () => {
    const parts = new Map<string, string[]>();
    for (const filename of files) {
      const source = fs.readFileSync(path.join(BLOG_DIR, filename), "utf8");
      const fm = parseYaml(source.split(/^---$/m)[1]) as Record<string, unknown>;
      if (typeof fm.series !== "string" || fm.seriesPart == null) continue;
      const key = `${fm.series.trim()} #${fm.seriesPart}`;
      parts.set(key, [...(parts.get(key) ?? []), filename]);
    }
    const clashes = [...parts.entries()].filter(([, f]) => f.length > 1);
    expect(clashes).toEqual([]);
  });
});
