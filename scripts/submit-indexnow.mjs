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
// URLs, never the whole site. We read the PRODUCTION sitemap and
// submit /blog/ URLs whose <lastmod> falls inside a recency window —
// blog lastmod values come from frontmatter, so they only move when a
// post is genuinely added or edited. Docs URLs carry no lastmod and
// are never submitted. Runs from CI after a deploy; exits 0 with a
// clear message when there is nothing new to submit.

const SITE_URL = "https://gofasta.dev";
const INDEXNOW_KEY = "1efde401c44c057d055356ce4ce57a16";
const WINDOW_HOURS = Number(process.env.INDEXNOW_WINDOW_HOURS ?? 72);

async function main() {
  const res = await fetch(`${SITE_URL}/sitemap.xml`);
  if (!res.ok) {
    throw new Error(`sitemap fetch failed: ${res.status}`);
  }
  const xml = await res.text();

  const cutoff = Date.now() - WINDOW_HOURS * 3600 * 1000;
  const changed = [];
  for (const block of xml.matchAll(/<url>([\s\S]*?)<\/url>/g)) {
    const loc = block[1].match(/<loc>([^<]+)<\/loc>/)?.[1];
    const lastmod = block[1].match(/<lastmod>([^<]+)<\/lastmod>/)?.[1];
    if (!loc || !lastmod) continue;
    if (!loc.startsWith(`${SITE_URL}/blog`)) continue;
    const t = new Date(lastmod).getTime();
    if (Number.isFinite(t) && t >= cutoff) changed.push(loc);
  }

  if (changed.length === 0) {
    console.log(`indexnow: no blog URLs changed in the last ${WINDOW_HOURS}h — nothing to submit`);
  } else {
    const body = {
      host: new URL(SITE_URL).host,
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList: changed,
    };
    const submit = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(body),
    });
    // 200 = ok, 202 = accepted pending key validation. Anything else
    // (403 bad key, 422 host mismatch, 429 rate limited) should fail
    // the workflow loudly so it gets fixed instead of silently rotting.
    if (submit.status !== 200 && submit.status !== 202) {
      throw new Error(`indexnow submit failed: HTTP ${submit.status}`);
    }
    console.log(`indexnow: submitted ${changed.length} URL(s) [HTTP ${submit.status}]`);
    for (const url of changed) console.log(`  - ${url}`);
  }

  // WebSub publish — always safe to send; the hub fetches the feed and
  // no-ops when nothing changed.
  const hub = await fetch("https://pubsubhubbub.appspot.com/", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      "hub.mode": "publish",
      "hub.url": `${SITE_URL}/blog/rss.xml`,
    }),
  });
  // The hub answers 204 on success.
  console.log(`websub: publish ping [HTTP ${hub.status}]`);
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
