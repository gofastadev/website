#!/usr/bin/env node
//
// SEO image asset generator — runs in `prebuild`, before the image
// budget check.
//
// 1. Cover crops: Google's Article structured-data guidance asks for
//    multiple high-resolution images in 16:9, 4:3, and 1:1 aspect
//    ratios. Authors upload one 1200×630 cover through Keystatic; this
//    script derives the 4:3 and 1:1 center crops next to it
//    (cover-4x3.jpg / cover-1x1.jpg) so the BlogPosting JSON-LD can
//    list all three. JPEG q80 keeps each crop well under the 250 KB
//    image budget.
//
// 2. Favicons: Google renders a site favicon next to every search
//    result (min 48×48). Derived from public/logo.png:
//    icon-48.png (SERP favicon) and apple-touch-icon.png (180×180).
//
// Idempotent: outputs are regenerated only when missing or older than
// their source, so repeat builds cost nothing.

import { readdir, stat, mkdir } from "node:fs/promises";
import { join, resolve, dirname, extname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const PUBLIC = resolve(__dirname, "..", "public");
const COVERS_DIR = join(PUBLIC, "blog", "covers");
const LOGO = join(PUBLIC, "logo.png");

const RASTER = new Set([".png", ".jpg", ".jpeg", ".webp", ".avif"]);

async function isStale(output, source) {
  try {
    const [o, s] = await Promise.all([stat(output), stat(source)]);
    return o.mtimeMs < s.mtimeMs;
  } catch {
    return true; // output missing
  }
}

async function walk(dir) {
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

// Center-crop `source` to the largest region matching w:h, write JPEG.
async function crop(source, output, ratioW, ratioH) {
  if (!(await isStale(output, source))) return false;
  const meta = await sharp(source).metadata();
  const { width, height } = meta;
  if (!width || !height) return false;
  let cw = width;
  let ch = Math.round((width * ratioH) / ratioW);
  if (ch > height) {
    ch = height;
    cw = Math.round((height * ratioW) / ratioH);
  }
  await mkdir(dirname(output), { recursive: true });
  await sharp(source)
    .extract({
      left: Math.floor((width - cw) / 2),
      top: Math.floor((height - ch) / 2),
      width: cw,
      height: ch,
    })
    .jpeg({ quality: 80 })
    .toFile(output);
  return true;
}

async function resizePng(source, output, size) {
  if (!(await isStale(output, source))) return false;
  await sharp(source)
    .resize(size, size, { fit: "cover" })
    .png()
    .toFile(output);
  return true;
}

let generated = 0;

// 1. Cover crops — every raster cover that is not itself a derived crop.
for (const file of await walk(COVERS_DIR)) {
  const ext = extname(file).toLowerCase();
  const base = basename(file, ext);
  if (!RASTER.has(ext)) continue;
  if (base.endsWith("-4x3") || base.endsWith("-1x1")) continue;
  const dir = dirname(file);
  if (await crop(file, join(dir, `${base}-4x3.jpg`), 4, 3)) generated++;
  if (await crop(file, join(dir, `${base}-1x1.jpg`), 1, 1)) generated++;
}

// 2. Favicons from the logo.
if (await resizePng(LOGO, join(PUBLIC, "icon-48.png"), 48)) generated++;
if (await resizePng(LOGO, join(PUBLIC, "apple-touch-icon.png"), 180)) generated++;

console.log(`seo-assets: ${generated} file(s) generated`);
