const meta = {
  index: "Overview",
  "getting-started": "Getting Started",
  guides: "Guides",
  "cli-reference": "CLI Reference",
  "api-reference": "Package Library",
  "white-paper": "White Paper",
  // llmstxt.org surfaces. Nextra renders an entry carrying `href` as a
  // plain link rather than a content page, which is what lets these
  // static files under public/ appear in the docs sidebar at all.
  //
  // They are last on purpose — they index the docs above them, so they
  // read as a footnote to the tree rather than a section of it. The
  // sidebar is the one placement that puts them in front of a reader
  // on every single docs page.
  //
  // `{ title, href }` and nothing else: Nextra 4 validates link entries
  // against a zod STRICT object (server/schemas.js → linkSchema), so an
  // unknown key fails the build with "Invalid input" at page-data
  // collection. In particular `newWindow` is a Nextra 2 option that no
  // longer exists — same-tab is fine here anyway, since both files are
  // same-origin and the browser renders them inline.
  "llms-txt": {
    title: "llms.txt",
    href: "/llms.txt",
  },
  "llms-full-txt": {
    title: "llms-full.txt",
    href: "/llms-full.txt",
  },
};

export default meta;
