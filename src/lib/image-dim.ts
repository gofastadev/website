import "server-only";
import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

// ─────────────────────────────────────────────────────────────────────
// src/lib/image-dim.ts
//
// Build-time image-dimension probe for blog inline images. The MDX
// renderer for posts runs server-side (`next-mdx-remote/rsc`) under a
// `force-static` route, so synchronous filesystem reads here happen at
// `next build` time and never on a request hot path.
//
// Why this exists: Markdown's `![alt](src)` syntax emits a raw `<img>`
// without `width` / `height`. Without those attributes the browser
// can't reserve vertical space before the bitmap loads — that's
// Cumulative Layout Shift, one of the three Core Web Vitals Google
// ranks on — and Google's Article rich-result eligibility uses
// `image.width` / `image.height` as size signals. Probing the file
// once at build time fixes both.
//
// Remote URLs are intentionally not probed: the upstream domain may
// have rate limits or auth, and the build shouldn't take a network
// dependency for a "nice-to-have" dimension hint. Callers degrade
// gracefully when the helper returns null.
// ─────────────────────────────────────────────────────────────────────

export interface ImageDim {
  width: number;
  height: number;
}

export interface GetLocalImageDimOptions {
  /**
   * Directory that a `/`-rooted `src` is resolved against. Defaults to
   * `<process.cwd()>/public` because that's where Next.js serves
   * static assets from (and where Keystatic uploads inline images per
   * `keystatic.config.ts`'s `directory: "public/blog/inline"` setting).
   * Exposed for tests; production callers should never pass it.
   */
  publicDir?: string;
}

/**
 * Returns the on-disk dimensions of a blog inline image, or `null` if
 * the source is remote, missing, or unreadable.
 */
export function getLocalImageDim(
  src: string | undefined | null,
  opts: GetLocalImageDimOptions = {},
): ImageDim | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return null;

  const publicDir = opts.publicDir ?? path.join(process.cwd(), "public");
  // Strip a leading `/` so the join stays inside `publicDir`. Without
  // this, `path.join("/abs/public", "/blog/x.png")` would resolve to
  // `/blog/x.png` on POSIX because the second arg is an absolute path
  // and `join` would discard the prefix.
  const rel = src.startsWith("/") ? src.slice(1) : src;
  const abs = path.join(publicDir, rel);

  try {
    const buf = fs.readFileSync(abs);
    const dim = imageSize(buf);
    if (dim.width == null || dim.height == null) return null;
    return { width: dim.width, height: dim.height };
  } catch {
    return null;
  }
}
