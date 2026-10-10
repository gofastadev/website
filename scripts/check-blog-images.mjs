#!/usr/bin/env node
//
// Image-budget guard for `public/blog/`.
//
// Walks every file under `public/blog/` and fails the build if any
// raster image (.jpg, .jpeg, .png, .webp, .avif, .gif) is larger than
// the configured ceiling. SVGs are exempt because they're vector and
// typically a few kilobytes — the budget applies to bitmap formats
// only.
//
// The threshold is intentionally modest. A 1200×630 JPEG at ~80%
// quality lands in the 100–200 KB range; an editor who commits a
// 4 MB straight-from-camera screenshot triggers the budget and gets
// a clear failure with the file path + actual size before the PR
// lands in main.
//
// Adjust MAX_BYTES if real cover art legitimately needs more room.

import { readdir, stat } from "node:fs/promises";
import { join, resolve, extname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const ROOT = resolve(__dirname, "..", "public", "blog");
const MAX_BYTES = 250_000;
const RASTER_EXTENSIONS = new Set([
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".avif",
  ".gif",
]);

async function walk(dir) {
  const out = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err && err.code === "ENOENT") return out;
    throw err;
  }
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(full)));
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

async function main() {
  const files = await walk(ROOT);
  const offenders = [];
  for (const file of files) {
    const ext = extname(file).toLowerCase();
    if (!RASTER_EXTENSIONS.has(ext)) continue;
    const info = await stat(file);
    if (info.size > MAX_BYTES) {
      offenders.push({ file, size: info.size });
    }
  }

  if (offenders.length === 0) {
    console.log(
      `✓ image-budget check passed (${files.length} files under public/blog/, limit ${MAX_BYTES.toLocaleString()} bytes per raster image).`,
    );
    return;
  }

  console.error(
    `✗ image-budget check failed — ${offenders.length} file(s) exceed the ${MAX_BYTES.toLocaleString()}-byte limit:`,
  );
  for (const { file, size } of offenders) {
    const rel = file.slice(ROOT.length + 1);
    console.error(
      `  - public/blog/${rel}  (${size.toLocaleString()} bytes, +${(
        size - MAX_BYTES
      ).toLocaleString()} over)`,
    );
  }
  console.error(
    "\nCompress the file(s) or raise MAX_BYTES in scripts/check-blog-images.mjs if the larger size is intentional.",
  );
  process.exit(1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
