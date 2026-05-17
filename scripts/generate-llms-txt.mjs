#!/usr/bin/env node
//
// Walks src/content/ (docs) and data/blog/ (blog posts) and emits two files
// into public/:
//
//   - llms.txt      : structured markdown index (title + one-line summary + URL
//                     per page) following the /llms.txt spec at
//                     https://llmstxt.org. Agents use it to discover what the
//                     site contains and which URL to read for a given topic.
//   - llms-full.txt : every MDX body concatenated into a single markdown file.
//                     Agents that want the entire site as context load this
//                     one file instead of crawling dozens of URLs. MDX JSX
//                     components are stripped (they are presentation widgets,
//                     not content) and relative `/docs/...` and `/blog/...`
//                     links are rewritten to absolute URLs so the file is
//                     useful offline.
//
// Runs automatically via `yarn prebuild` so both files ship on every deploy.
// No external dependencies — pure Node stdlib (fs/promises, path, url).

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, '..', 'src', 'content');
const BLOG_DIR = resolve(__dirname, '..', 'data', 'blog');
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
const SITE_URL = 'https://gofasta.dev';
const DOCS_BASE = '/docs';
const BLOG_BASE = '/blog';

// Human-readable names for each section directory. Matches the top-level
// _meta.js. If a section isn't listed, the directory name is used verbatim.
const SECTION_TITLES = {
  '': 'Overview',
  'getting-started': 'Getting Started',
  'guides': 'Guides',
  'guides/debugging': 'Debugging',
  'cli-reference': 'CLI Reference',
  'cli-reference/generate': 'Code Generators',
  'api-reference': 'Package Library',
  'blog': 'Blog',
};

// Doc paths to surface under the spec's `## Optional` section — "less-important
// resources that can be skipped if context window space is limited" per
// https://llmstxt.org/#format. Add the canonical `path` (e.g. `/docs/foo/bar`)
// for any page that should drop out of a budget-constrained crawl. Currently
// empty: the docs are tight enough that everything is worth indexing. Curate
// as the surface grows.
const OPTIONAL_PAGES = new Set([]);

// Top-of-file context for LLM consumers. Hardcoded prelude — kept near the
// rest of the config so a positioning change is one place, not buried.
const REPO_STATEMENT =
  'Gofasta is split across two repositories: `github.com/gofastadev/cli` (the CLI) and `github.com/gofastadev/gofasta` (the library). A scaffolded project is plain Go code the developer owns — no runtime framework, no custom compiler.';

// Recommended starting points surfaced above the docs sections — agents that
// only read the first section of llms.txt still hit the highest-signal links.
const STARTING_POINTS = [
  {
    title: 'CLI source code',
    url: 'https://github.com/gofastadev/cli',
    description: 'The Gofasta CLI — project scaffolding and code generation.',
  },
  {
    title: 'Library source code',
    url: 'https://github.com/gofastadev/gofasta',
    description: 'The pkg/* library of independent backend packages.',
  },
  {
    title: 'White paper',
    url: 'https://gofasta.dev/docs/white-paper',
    description:
      'Design principles, architecture, and the full positioning of the toolkit.',
  },
  {
    title: 'Blog',
    url: 'https://gofasta.dev/blog',
    description: 'Release notes, technical deep-dives, and positioning posts.',
  },
];

// Minimal YAML frontmatter parser — only handles `key: value` pairs on a
// single line, which is all our MDX frontmatter (docs + blog) uses for the
// fields llms.txt cares about (title, description, publishedAt). Returns
// { frontmatter, body }. No external YAML dep needed.
function parseFrontmatter(source) {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return { frontmatter: {}, body: source };
  const frontmatter = {};
  for (const line of match[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (!kv) continue;
    let value = kv[2].trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    frontmatter[kv[1]] = value;
  }
  return { frontmatter, body: match[2] };
}

// Read a directory's _meta.js as text and pick out the `key: "value"` pairs
// declared on its default-export object literal. We parse the file rather
// than `import()`-ing it to avoid Node's "module type not specified" warning
// for _meta.js files that live inside a CommonJS-default package root.
// Returns an ordered array of keys (ordering matters — it drives the
// sidebar order a reader sees) plus a map of key→human-readable title.
async function loadMeta(dir) {
  let source;
  try {
    source = await readFile(join(dir, '_meta.js'), 'utf8');
  } catch {
    return { order: [], titles: {} };
  }
  const order = [];
  const titles = {};
  // Match `key: "title"`, `"key": "title"`, or `key: { title: "title" }`.
  const stringForm = /["']?([A-Za-z0-9_-]+)["']?\s*:\s*["']([^"']+)["']/g;
  const objectForm = /["']?([A-Za-z0-9_-]+)["']?\s*:\s*\{\s*title:\s*["']([^"']+)["']/g;
  for (const match of source.matchAll(stringForm)) {
    const [, key, title] = match;
    if (order.includes(key)) continue;
    order.push(key);
    titles[key] = title;
  }
  for (const match of source.matchAll(objectForm)) {
    const [, key, title] = match;
    if (order.includes(key)) continue;
    order.push(key);
    titles[key] = title;
  }
  return { order, titles };
}

// Recursively walk CONTENT_DIR, collecting one record per MDX page in the
// order dictated by _meta.js (with any files not listed appended at the end).
async function collect(dir, urlPrefix = '', sectionPath = '') {
  const { order, titles } = await loadMeta(dir);
  const entries = await readdir(dir, { withFileTypes: true });
  const byName = new Map(entries.map((e) => [e.name, e]));

  // Order: entries declared in _meta.js first, then any remaining MDX/dirs.
  const seen = new Set();
  const ordered = [];
  for (const key of order) {
    const exact = byName.get(key);
    const asMdx = byName.get(`${key}.mdx`);
    if (exact) {
      ordered.push(exact);
      seen.add(exact.name);
    } else if (asMdx) {
      ordered.push(asMdx);
      seen.add(asMdx.name);
    }
  }
  for (const entry of entries) {
    if (seen.has(entry.name)) continue;
    if (entry.name.startsWith('_')) continue;
    ordered.push(entry);
  }

  const pages = [];
  for (const entry of ordered) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      const childPrefix = `${urlPrefix}/${entry.name}`;
      const childSection = sectionPath ? `${sectionPath}/${entry.name}` : entry.name;
      pages.push(...(await collect(full, childPrefix, childSection)));
      continue;
    }
    if (!entry.name.endsWith('.mdx')) continue;

    const slug = entry.name.replace(/\.mdx$/, '');
    const url = slug === 'index' ? urlPrefix : `${urlPrefix}/${slug}`;
    const source = await readFile(full, 'utf8');
    const { frontmatter, body } = parseFrontmatter(source);
    const title = titles[slug] || frontmatter.title || slug;

    pages.push({
      url: `${SITE_URL}${DOCS_BASE}${url}`,
      path: `${DOCS_BASE}${url || ''}` || DOCS_BASE,
      title,
      description: frontmatter.description || '',
      body: body.trim(),
      section: sectionPath,
    });
  }
  return pages;
}

// Walks BLOG_DIR (flat — one .mdx per post, no subdirs) and emits one record
// per published post. Mirrors the future-dated filter from src/lib/blog.ts:
// posts whose `publishedAt` is in the future are excluded so the LLM-facing
// index doesn't expose them ahead of schedule.
async function collectBlog(now = new Date()) {
  let entries;
  try {
    entries = await readdir(BLOG_DIR, { withFileTypes: true });
  } catch {
    return [];
  }
  const posts = [];
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!entry.name.endsWith('.mdx')) continue;
    if (entry.name.startsWith('_')) continue;
    const full = join(BLOG_DIR, entry.name);
    const source = await readFile(full, 'utf8');
    const { frontmatter, body } = parseFrontmatter(source);
    if (!frontmatter.title) continue;
    if (frontmatter.publishedAt) {
      const published = new Date(frontmatter.publishedAt);
      if (Number.isFinite(published.getTime()) && published > now) continue;
    }
    const slug = entry.name.replace(/\.mdx$/, '');
    posts.push({
      url: `${SITE_URL}${BLOG_BASE}/${slug}`,
      path: `${BLOG_BASE}/${slug}`,
      title: frontmatter.title,
      description: frontmatter.description || '',
      body: body.trim(),
      section: 'blog',
      publishedAt: frontmatter.publishedAt || '',
    });
  }
  // Newest first — same ordering as /blog and the RSS feed.
  return posts.sort(
    (a, b) => Date.parse(b.publishedAt || 0) - Date.parse(a.publishedAt || 0),
  );
}

// Strip MDX JSX components from a markdown body. Removes <UpperCaseTag />,
// multi-line self-closing tags, and matching <Tag>...</Tag> blocks. JSX
// components in this codebase are presentation widgets (RelatedPages,
// Callout, etc.) — leaving them in produces noise for LLM consumers.
//
// Regex limitations (acceptable for this codebase):
//   - Doesn't support nested same-named components. Not used here.
//   - Doesn't distinguish JSX inside fenced code blocks. Our code blocks
//     show Go / bash / SQL, not JSX, so the false-positive rate is zero
//     in practice. If that changes, switch to a state-machine scanner.
function stripMdxComponents(body) {
  let out = body;
  // Self-closing single-line: <Component prop="x" />
  out = out.replace(/<[A-Z][a-zA-Z0-9]*\b[^<>]*?\/>/g, '');
  // Self-closing multi-line: <Component\n  prop="x"\n/>
  out = out.replace(/<[A-Z][a-zA-Z0-9]*\b[^<]*?\/>/g, '');
  // Block: <Component ...>...</Component> (non-greedy, no nesting).
  out = out.replace(/<([A-Z][a-zA-Z0-9]*)\b[^>]*>[\s\S]*?<\/\1>/g, '');
  // Collapse runs of blank lines left behind by stripped components so
  // the output stays readable.
  out = out.replace(/\n{3,}/g, '\n\n');
  return out;
}

// Rewrite relative `/docs/...` and `/blog/...` markdown links to absolute
// URLs. LLMs reading llms-full.txt offline can't resolve a bare path; an
// absolute URL is unambiguous and points back to the canonical page.
function absolutizeLinks(body) {
  return body.replace(/\]\((\/(?:docs|blog)(?:\/[^)]*)?)\)/g, `](${SITE_URL}$1)`);
}

// Drop the body's leading `# Title` heading when it matches the page's
// frontmatter title (or near-matches via case-insensitive comparison). The
// concatenated llms-full.txt already names every page in its H2 separator
// (`## /docs/path — Title`); a body H1 right after that is redundant and
// noisy. If the leading H1 differs from the title, leave it — that's a
// content authoring quirk worth preserving.
function stripDuplicateH1(body, title) {
  const match = body.match(/^#\s+(.+?)\s*\n+/);
  if (!match) return body;
  const headingText = match[1].trim().toLowerCase();
  const expected = title.trim().toLowerCase();
  if (headingText !== expected) return body;
  return body.slice(match[0].length);
}

// Apply all body cleanups in the correct order: strip components first
// (so their innards don't break link rewriting), absolutize links, then
// drop the duplicate H1.
function cleanBody(body, title) {
  return stripDuplicateH1(absolutizeLinks(stripMdxComponents(body)), title);
}

// Emit the structured llms.txt index.
function renderLLMsTxt(pages, blogPosts) {
  const root = pages.find((p) => p.section === '' && p.path === DOCS_BASE);
  const summary =
    root?.description ||
    'Gofasta is a Go backend toolkit — a CLI for scaffolding projects and generating code, backed by a library of composable pkg/* packages.';

  let out = '# Gofasta\n\n';
  out += `> ${summary}\n\n`;
  out += `${REPO_STATEMENT}\n\n`;

  out += '## Recommended starting points\n\n';
  for (const link of STARTING_POINTS) {
    out += `- [${link.title}](${link.url}): ${link.description}\n`;
  }
  out += '\n';

  // Split docs pages into the regular section flow + an Optional bucket
  // for any path listed in OPTIONAL_PAGES.
  const grouped = new Map();
  const optional = [];
  for (const page of pages) {
    if (OPTIONAL_PAGES.has(page.path)) {
      optional.push(page);
      continue;
    }
    if (!grouped.has(page.section)) grouped.set(page.section, []);
    grouped.get(page.section).push(page);
  }

  for (const [section, sectionPages] of grouped) {
    const heading = SECTION_TITLES[section] ?? section;
    out += `## ${heading}\n\n`;
    for (const page of sectionPages) {
      const suffix = page.description ? `: ${page.description}` : '';
      out += `- [${page.title}](${page.url})${suffix}\n`;
    }
    out += '\n';
  }

  if (blogPosts.length > 0) {
    out += `## ${SECTION_TITLES.blog}\n\n`;
    for (const post of blogPosts) {
      const suffix = post.description ? `: ${post.description}` : '';
      out += `- [${post.title}](${post.url})${suffix}\n`;
    }
    out += '\n';
  }

  if (optional.length > 0) {
    out += '## Optional\n\n';
    for (const page of optional) {
      const suffix = page.description ? `: ${page.description}` : '';
      out += `- [${page.title}](${page.url})${suffix}\n`;
    }
    out += '\n';
  }

  return out.trimEnd() + '\n';
}

// Emit the full-text dump — every MDX body concatenated.
function renderLLMsFullTxt(pages, blogPosts) {
  const today = new Date().toISOString().slice(0, 10);
  let out = '# Gofasta Documentation — Full Text\n\n';
  out +=
    '> Complete Gofasta documentation as a single markdown file. Intended for AI agents that prefer one-shot context loading over per-page fetches. The individual pages are served at https://gofasta.dev/docs.\n\n';
  out += `Generated: ${today}\n\n`;
  out += '---\n\n';

  for (const page of pages) {
    out += `## ${page.path} — ${page.title}\n\n`;
    if (page.description) out += `> ${page.description}\n\n`;
    out += `${cleanBody(page.body, page.title)}\n\n`;
    out += '---\n\n';
  }

  for (const post of blogPosts) {
    out += `## ${post.path} — ${post.title}\n\n`;
    if (post.description) out += `> ${post.description}\n\n`;
    if (post.publishedAt) out += `Published: ${post.publishedAt}\n\n`;
    out += `${cleanBody(post.body, post.title)}\n\n`;
    out += '---\n\n';
  }

  return out.trimEnd() + '\n';
}

async function main() {
  const [pages, blogPosts] = await Promise.all([
    collect(CONTENT_DIR),
    collectBlog(),
  ]);
  await mkdir(PUBLIC_DIR, { recursive: true });
  const llmsTxt = renderLLMsTxt(pages, blogPosts);
  const llmsFullTxt = renderLLMsFullTxt(pages, blogPosts);
  await writeFile(join(PUBLIC_DIR, 'llms.txt'), llmsTxt);
  await writeFile(join(PUBLIC_DIR, 'llms-full.txt'), llmsFullTxt);
  const bytes = Buffer.byteLength(llmsFullTxt, 'utf8');
  console.log(
    `Generated llms.txt (${pages.length} docs + ${blogPosts.length} blog posts) and llms-full.txt (${bytes.toLocaleString()} bytes) in public/.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
