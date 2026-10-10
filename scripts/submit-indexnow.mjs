#!/usr/bin/env node
//
// Post-deploy search-engine notification. Two channels:
//
// 1. IndexNow (api.indexnow.org) — one POST fans out to Bing, Yandex,
//    Naver, Seznam, and Yep; Bing's index also feeds DuckDuckGo,
//    Yahoo, Ecosia, and ChatGPT Search. Google does not consume
//    IndexNow (it relies on sitemap lastmod), which is why the sitemap
//    keeps accurate per-post dates.
//
// 2. WebSub (pubsubhubbub.appspot.com) — the push channel Google's
//    sitemap documentation recommends since the sitemap ping endpoint
//    was retired: publishing the RSS feed URL to the hub tells
//    subscribers (including Google's hub) the feed changed.
//
// Submission policy (per indexnow.org/faq): notify only about CHANGED
// URLs, never the whole site. Candidates come from the checkout, not
// from sitemap lastmod — a post's date is when it was written, which can
// be weeks before it is un-drafted or merged:
//
//   --changed <file...>  posts whose files changed in the push (CI)
//   --since-hours <N>    posts whose publishedAt fell in the last N hours
//                        (the daily scheduled-publish rebuild)
//   (no flag)            every public post (manual dispatch)
//   --dry-run            print what would be submitted, send nothing
//
// Drafts and future-dated posts are dropped first (scripts/lib/
// blog-posts.mjs mirrors the site's visibility rules). The script then
// polls the production sitemap until every candidate is live, so it no
// longer guesses how long the Vercel deploy takes.

import { readFile } from 'node:fs/promises';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readPublicPosts, toPublicPost } from './lib/blog-posts.mjs';

const SITE_URL = 'https://gofasta.dev';
const INDEXNOW_KEY = '1efde401c44c057d055356ce4ce57a16';
const BLOG_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'data', 'blog');
const POLL_INTERVAL_MS = 20_000;
const POLL_TIMEOUT_MS = 10 * 60_000;

function parseArgs(argv) {
  const args = { changed: null, sinceHours: null, dryRun: false };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') args.dryRun = true;
    else if (arg === '--since-hours') args.sinceHours = Number(argv[++i]);
    else if (arg === '--changed') {
      args.changed = [];
      while (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args.changed.push(argv[++i]);
      }
    } else throw new Error(`unknown argument: ${arg}`);
  }
  if (args.sinceHours !== null && !(args.sinceHours > 0)) {
    throw new Error('--since-hours needs a positive number');
  }
  return args;
}

async function candidateSlugs(args) {
  const now = new Date();
  if (args.changed) {
    const slugs = [];
    for (const file of args.changed) {
      if (!file.endsWith('.mdx')) continue;
      const name = basename(file);
      const source = await readFile(join(BLOG_DIR, name), 'utf8').catch(() => null);
      // Deleted files and hidden posts (draft, scheduled) are skipped.
      const post = source === null ? null : toPublicPost(name, source, now);
      if (post) slugs.push(post.slug);
      else console.log(`skipped: ${name} (deleted, draft, or scheduled)`);
    }
    return slugs;
  }
  const posts = await readPublicPosts(BLOG_DIR, now);
  if (args.sinceHours !== null) {
    const cutoff = now.getTime() - args.sinceHours * 3600 * 1000;
    return posts
      .filter((p) => new Date(p.data.publishedAt).getTime() >= cutoff)
      .map((p) => p.slug);
  }
  return posts.map((p) => p.slug);
}

async function fetchSitemapUrls() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`, { cache: 'no-store' });
  if (!res.ok) throw new Error(`sitemap fetch failed: HTTP ${res.status}`);
  const xml = await res.text();
  return new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]));
}

// Waits for the production deploy carrying these posts to go live.
async function waitUntilLive(urls) {
  const deadline = Date.now() + POLL_TIMEOUT_MS;
  for (;;) {
    const live = await fetchSitemapUrls();
    const missing = urls.filter((u) => !live.has(u));
    if (missing.length === 0) return urls;
    if (Date.now() >= deadline) {
      for (const u of missing) console.log(`not live after timeout, skipped: ${u}`);
      return urls.filter((u) => live.has(u));
    }
    console.log(`waiting for deploy: ${missing.length} URL(s) not in the sitemap yet`);
    await new Promise((r) => setTimeout(r, POLL_INTERVAL_MS));
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const urls = (await candidateSlugs(args)).map((slug) => `${SITE_URL}/blog/${slug}`);

  if (urls.length === 0) {
    console.log('indexnow: no newly public blog posts — nothing to submit');
    return;
  }
  if (args.dryRun) {
    console.log('dry run — would submit:');
    for (const url of urls) console.log(`  - ${url}`);
    return;
  }

  const live = await waitUntilLive(urls);
  if (live.length === 0) {
    console.log('indexnow: none of the candidate posts went live — nothing to submit');
    return;
  }

  const submit = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: live,
    }),
  });
  // 200 = ok, 202 = accepted pending key validation. Anything else
  // (403 bad key, 422 host mismatch, 429 rate limited) should fail
  // the workflow loudly so it gets fixed instead of silently rotting.
  if (submit.status !== 200 && submit.status !== 202) {
    throw new Error(`indexnow submit failed: HTTP ${submit.status}`);
  }
  console.log(`indexnow: submitted ${live.length} URL(s) [HTTP ${submit.status}]`);
  for (const url of live) console.log(`  - ${url}`);

  const hub = await fetch('https://pubsubhubbub.appspot.com/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ 'hub.mode': 'publish', 'hub.url': `${SITE_URL}/blog/rss.xml` }),
  });
  // The hub answers 204 (or 202). A failure here is worth a warning, not
  // a red workflow — IndexNow already went through.
  if (hub.status === 204 || hub.status === 202) {
    console.log(`websub: publish ping [HTTP ${hub.status}]`);
  } else {
    console.warn(`::warning::websub publish ping failed: HTTP ${hub.status}`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
