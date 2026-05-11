import "server-only";
import { fromMarkdown } from "mdast-util-from-markdown";
import { toHast } from "mdast-util-to-hast";
import { toHtml } from "hast-util-to-html";
import type { BlogPost } from "./blog";

// ─────────────────────────────────────────────────────────────────────
// src/lib/feed.ts
//
// Generates RSS 2.0 (with `<dc:creator>` + `<content:encoded>`
// extensions) and JSON Feed 1.1 representations of the blog index.
// Both formats render the full post body to HTML via the unified
// markdown pipeline (no React involved) so feed aggregators get
// reader-friendly markup without paying the cost of MDX/React
// compilation per request.
//
// The MDX bodies served from `src/content/blog/` are constrained by
// Keystatic to disallow `import` and raw HTML tags. That makes them
// effectively pure markdown plus a small set of custom components.
// Custom component JSX won't expand correctly into HTML here (feed
// readers can't run React anyway), so v1 publishes the prose verbatim
// and treats unknown MDX nodes as no-ops.
// ─────────────────────────────────────────────────────────────────────

export interface SiteMeta {
  siteUrl: string;
  title: string;
  description: string;
  language: string;
}

export function renderMdxToHtml(source: string): string {
  const mdast = fromMarkdown(source);
  const hast = toHast(mdast);
  return toHtml(hast);
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function toRfc822(iso: string): string {
  return new Date(iso).toUTCString();
}

function absoluteCoverUrl(siteUrl: string, coverUrl: string): string {
  if (coverUrl.startsWith("http://") || coverUrl.startsWith("https://")) {
    return coverUrl;
  }
  return `${siteUrl}${coverUrl}`;
}

export function buildRssFeed(posts: BlogPost[], meta: SiteMeta): string {
  const blogUrl = `${meta.siteUrl}/blog`;
  const feedUrl = `${meta.siteUrl}/blog/rss.xml`;
  const lastBuildDate =
    posts.length > 0
      ? toRfc822(posts[0].publishedAt)
      : new Date().toUTCString();

  const itemBlocks = posts.map((post) => {
    const link = `${meta.siteUrl}/blog/${post.slug}`;
    const html = renderMdxToHtml(post.body);
    const categoryLines = post.tags.map(
      (tag) => `    <category>${escapeXml(tag)}</category>`,
    );
    return [
      "  <item>",
      `    <title>${escapeXml(post.title)}</title>`,
      `    <link>${escapeXml(link)}</link>`,
      `    <guid isPermaLink="true">${escapeXml(link)}</guid>`,
      `    <pubDate>${toRfc822(post.publishedAt)}</pubDate>`,
      `    <dc:creator>${escapeXml(post.author)}</dc:creator>`,
      `    <description>${escapeXml(post.description)}</description>`,
      `    <content:encoded><![CDATA[${html}]]></content:encoded>`,
      ...categoryLines,
      "  </item>",
    ].join("\n");
  });

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0"',
    '     xmlns:dc="http://purl.org/dc/elements/1.1/"',
    '     xmlns:content="http://purl.org/rss/1.0/modules/content/"',
    '     xmlns:atom="http://www.w3.org/2005/Atom">',
    "  <channel>",
    `    <title>${escapeXml(meta.title)}</title>`,
    `    <link>${escapeXml(blogUrl)}</link>`,
    `    <description>${escapeXml(meta.description)}</description>`,
    `    <language>${escapeXml(meta.language)}</language>`,
    `    <lastBuildDate>${lastBuildDate}</lastBuildDate>`,
    `    <atom:link href="${escapeXml(feedUrl)}" rel="self" type="application/rss+xml" />`,
    ...itemBlocks,
    "  </channel>",
    "</rss>",
    "",
  ].join("\n");
}

export interface JsonFeedAuthor {
  name: string;
  url?: string;
}

export interface JsonFeedItem {
  id: string;
  url: string;
  title: string;
  summary: string;
  content_html: string;
  date_published: string;
  date_modified?: string;
  authors: JsonFeedAuthor[];
  tags: string[];
  image: string;
}

export interface JsonFeed {
  version: string;
  title: string;
  home_page_url: string;
  feed_url: string;
  description: string;
  language: string;
  items: JsonFeedItem[];
}

export function buildJsonFeed(posts: BlogPost[], meta: SiteMeta): JsonFeed {
  return {
    version: "https://jsonfeed.org/version/1.1",
    title: meta.title,
    home_page_url: `${meta.siteUrl}/blog`,
    feed_url: `${meta.siteUrl}/blog/feed.json`,
    description: meta.description,
    language: meta.language,
    items: posts.map((post) => {
      const url = `${meta.siteUrl}/blog/${post.slug}`;
      const author: JsonFeedAuthor = post.authorUrl
        ? { name: post.author, url: post.authorUrl }
        : { name: post.author };
      const item: JsonFeedItem = {
        id: url,
        url,
        title: post.title,
        summary: post.description,
        content_html: renderMdxToHtml(post.body),
        date_published: post.publishedAt,
        authors: [author],
        tags: post.tags,
        image: absoluteCoverUrl(meta.siteUrl, post.coverUrl),
      };
      if (post.updatedAt) item.date_modified = post.updatedAt;
      return item;
    }),
  };
}
