#!/usr/bin/env node
//
// Walks src/content/ and emits two files into public/:
//
//   - llms.txt      : structured markdown index (title + one-line summary + URL
//                     per page) following the /llms.txt spec at
//                     https://llmstxt.org. Agents use it to discover what the
//                     site contains and which URL to read for a given topic.
//   - llms-full.txt : every MDX body concatenated into a single markdown file.
//                     Agents that want the entire site as context load this
//                     one file instead of crawling dozens of URLs.
//
// Runs automatically via `yarn prebuild` so both files ship on every deploy.
// No external dependencies — pure Node stdlib (fs/promises, path, url).

import { readFile, writeFile, readdir, mkdir } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTENT_DIR = resolve(__dirname, '..', 'src', 'content');
const PUBLIC_DIR = resolve(__dirname, '..', 'public');
const SITE_URL = 'https://gofasta.dev';
const DOCS_BASE = '/docs';

// Human-readable names for each section directory. Matches the top-level
// _meta.js. If a section isn't listed, the directory name is used verbatim.
const SECTION_TITLES = {
  '': 'Overview',
  'getting-started': 'Getting Started',
  'guides': 'Guides',
  'cli-reference': 'CLI Reference',
  'cli-reference/generate': 'Code Generators',
  'api-reference': 'Package Library',
};

// Minimal YAML frontmatter parser — only handles `key: value` pairs on a
// single line, which is all our MDX frontmatter uses. Returns { frontmatter,
// body }. No external YAML dep needed.
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

// Emit the structured llms.txt index.
function renderLLMsTxt(pages) {
  const root = pages.find((p) => p.section === '' && p.path === DOCS_BASE);
  const summary =
    root?.description ||
    'Gofasta is a Go backend toolkit — a CLI for scaffolding projects and generating code, backed by a library of composable pkg/* packages.';

  // Group pages by section path, preserving collect() order within each group.
  const grouped = new Map();
  for (const page of pages) {
    if (!grouped.has(page.section)) grouped.set(page.section, []);
    grouped.get(page.section).push(page);
  }

  let out = '# Gofasta\n\n';
  out += `> ${summary}\n\n`;
  out +=
    'Gofasta is split across two repositories: `github.com/gofastadev/cli` (the CLI) and `github.com/gofastadev/gofasta` (the library). A scaffolded project is plain Go code the developer owns — no runtime framework, no custom compiler.\n\n';

  for (const [section, sectionPages] of grouped) {
    const heading = SECTION_TITLES[section] ?? section;
    out += `## ${heading}\n\n`;
    for (const page of sectionPages) {
      const suffix = page.description ? `: ${page.description}` : '';
      out += `- [${page.title}](${page.url})${suffix}\n`;
    }
    out += '\n';
  }

  return out.trimEnd() + '\n';
}

// Emit the full-text dump — every MDX body concatenated.
function renderLLMsFullTxt(pages) {
  const today = new Date().toISOString().slice(0, 10);
  let out = '# Gofasta Documentation — Full Text\n\n';
  out +=
    '> Complete Gofasta documentation as a single markdown file. Intended for AI agents that prefer one-shot context loading over per-page fetches. The individual pages are served at https://gofasta.dev/docs.\n\n';
  out += `Generated: ${today}\n\n`;
  out += '---\n\n';

  for (const page of pages) {
    out += `## ${page.path} — ${page.title}\n\n`;
    if (page.description) out += `> ${page.description}\n\n`;
    out += `${page.body}\n\n`;
    out += '---\n\n';
  }

  return out.trimEnd() + '\n';
}

async function main() {
  const pages = await collect(CONTENT_DIR);
  await mkdir(PUBLIC_DIR, { recursive: true });
  const llmsTxt = renderLLMsTxt(pages);
  const llmsFullTxt = renderLLMsFullTxt(pages);
  await writeFile(join(PUBLIC_DIR, 'llms.txt'), llmsTxt);
  await writeFile(join(PUBLIC_DIR, 'llms-full.txt'), llmsFullTxt);
  const bytes = Buffer.byteLength(llmsFullTxt, 'utf8');
  console.log(
    `Generated llms.txt (${pages.length} pages) and llms-full.txt (${bytes.toLocaleString()} bytes) in public/.`
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
