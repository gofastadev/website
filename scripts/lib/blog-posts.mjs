// Shared by the build scripts that need "which blog posts are public":
// generate-llms-txt.mjs and submit-indexnow.mjs. Mirrors the public
// visibility rules of src/lib/blog.ts — not a draft, not future-dated, a
// URL-safe filename — so neither script can expose or submit a post the
// site itself hides. (The site's own loader is TypeScript behind
// `server-only`, so plain Node scripts can't import it.)

import { readFile, readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { parse as parseYaml } from 'yaml';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function splitFrontmatter(source) {
  const match = source
    .replace(/^﻿/, '')
    .match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!match) return null;
  let data;
  try {
    data = parseYaml(match[1]);
  } catch {
    return null;
  }
  if (!data || typeof data !== 'object') return null;
  return { data, body: match[2] };
}

// Returns null when the post must stay hidden, otherwise its slug,
// raw frontmatter and body.
export function toPublicPost(filename, source, now = new Date()) {
  if (!filename.endsWith('.mdx') || filename.startsWith('_')) return null;
  const slug = filename.replace(/\.mdx$/, '');
  if (!SLUG_PATTERN.test(slug)) return null;
  const parsed = splitFrontmatter(source);
  if (!parsed) return null;
  const { data, body } = parsed;
  if (data.draft === true) return null;
  if (typeof data.title !== 'string' || typeof data.publishedAt !== 'string') return null;
  const published = new Date(data.publishedAt);
  if (!Number.isFinite(published.getTime()) || published > now) return null;
  return { slug, data, body };
}

export async function readPublicPosts(dir, now = new Date()) {
  let names;
  try {
    names = await readdir(dir);
  } catch {
    return [];
  }
  const posts = [];
  for (const name of names) {
    const source = await readFile(join(dir, name), 'utf8').catch(() => null);
    if (source === null) continue;
    const post = toPublicPost(name, source, now);
    if (post) posts.push(post);
  }
  return posts;
}
