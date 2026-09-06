import "server-only";
import fs from "node:fs";
import path from "node:path";
import { imageSize } from "image-size";

// Markdown's `![alt](src)` emits a bare `<img>` with no width/height, so
// the browser can't reserve vertical space before the bitmap loads. That
// is Cumulative Layout Shift, and Google's Article rich-result
// eligibility reads the same two numbers as size signals. Probing the
// file at build time fixes both. Blog routes are `force-static`, so these
// synchronous reads never touch a request hot path.
//
// Remote URLs are deliberately not probed: the upstream may rate-limit or
// require auth, and a dimension hint isn't worth a network dependency in
// the build. Callers degrade gracefully on null.

export interface ImageDim {
  width: number;
  height: number;
}

export interface GetLocalImageDimOptions {
  /** Root for `/`-rooted paths. Exposed for tests; production passes nothing. */
  publicDir?: string;
}

/**
 * On-disk dimensions of a blog inline image, or null if the source is
 * remote, missing, or unreadable.
 */
export function getLocalImageDim(
  src: string | undefined | null,
  opts: GetLocalImageDimOptions = {},
): ImageDim | null {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return null;

  const publicDir = opts.publicDir ?? path.join(process.cwd(), "public");
  // Strip the leading `/` before joining: `path.join("/abs/public",
  // "/blog/x.png")` yields `/blog/x.png` on POSIX, because an absolute
  // second argument discards the prefix entirely.
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
