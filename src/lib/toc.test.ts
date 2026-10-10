import { describe, it, expect } from "vitest";
import GithubSlugger from "github-slugger";
import { extractToc } from "./toc";

describe("extractToc", () => {
  it("returns an empty array for an empty body", () => {
    expect(extractToc("")).toEqual([]);
  });

  it("extracts h2–h6 with matching depths and skips h1", () => {
    const body = [
      "# Title",
      "## Install",
      "### Requirements",
      "#### Notes",
      "##### Detail",
      "###### Fine print",
    ].join("\n");
    expect(extractToc(body)).toEqual([
      { id: "install", text: "Install", depth: 2 },
      { id: "requirements", text: "Requirements", depth: 3 },
      { id: "notes", text: "Notes", depth: 4 },
      { id: "detail", text: "Detail", depth: 5 },
      { id: "fine-print", text: "Fine print", depth: 6 },
    ]);
  });

  it("skips headings inside ``` and ~~~ fences, including nested other-marker lines", () => {
    const body = [
      "## Real heading",
      "```bash",
      "## not a heading",
      "~~~ still inside the backtick fence",
      "```",
      "~~~",
      "## also not a heading",
      "~~~",
      "## After fences",
    ].join("\n");
    expect(extractToc(body).map((i) => i.text)).toEqual([
      "Real heading",
      "After fences",
    ]);
  });

  it("strips inline markdown from display text but slugs the visible text", () => {
    const body = [
      "## Using `gofasta dev`",
      "## **Bold** and _emphasis_",
      "## A [link](https://example.com) here",
      "## Shipping ![icon](/x.png) images",
    ].join("\n");
    const items = extractToc(body);
    expect(items.map((i) => i.text)).toEqual([
      "Using gofasta dev",
      "Bold and emphasis",
      "A link here",
      "Shipping icon images",
    ]);
    expect(items[0].id).toBe("using-gofasta-dev");
  });

  it("suffixes duplicate headings the way github-slugger does", () => {
    const body = ["## Setup", "## Setup", "## Setup"].join("\n");
    expect(extractToc(body).map((i) => i.id)).toEqual([
      "setup",
      "setup-1",
      "setup-2",
    ]);
  });

  it("matches github-slugger output for punctuation-heavy titles", () => {
    const titles = [
      "What's new in v0.2.0?",
      "CLI & library: two repos",
      "100% coverage — or bust",
    ];
    const body = titles.map((t) => `## ${t}`).join("\n");
    const reference = new GithubSlugger();
    expect(extractToc(body).map((i) => i.id)).toEqual(
      titles.map((t) => reference.slug(t)),
    );
  });

  it("skips headings whose visible text strips to nothing", () => {
    // An image-only heading has no rendered text for github-slugger to
    // slug — emitting it would produce an empty, dead TOC entry.
    const toc = extractToc("## ![](/diagram.png)\n\n## Real heading");
    expect(toc).toEqual([
      { id: "real-heading", text: "Real heading", depth: 2 },
    ]);
  });

  it("ignores trailing closing hashes in ATX headings", () => {
    expect(extractToc("## Closed heading ##")).toEqual([
      { id: "closed-heading", text: "Closed heading", depth: 2 },
    ]);
  });
});
