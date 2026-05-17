import type { CSSProperties, ReactNode } from "react";
import { getLocalImageDim } from "./image-dim";

// ─────────────────────────────────────────────────────────────────────
// blog-mdx-components.tsx
//
// Component map passed to `<MDXRemote components={...}>` when rendering
// posts under `content/blog/`. Distinct from the project-root
// `mdx-components.tsx` (which Nextra uses for the docs route) — the
// blog uses `next-mdx-remote/rsc` and has its own surface concerns
// (Callout styling, captioned figures, etc.).
//
// Keystatic stores MDX without imports or raw HTML tags, so any
// custom component referenced from a post must be registered both
// here AND in the Keystatic `body` field schema so the editor knows
// it's available.
// ─────────────────────────────────────────────────────────────────────

export type CalloutType = "info" | "warning" | "tip";

// Each variant ships a light/dark color pair so the callout reads
// well on the white background in light mode and the dark surface in
// dark mode.
const CALLOUT_STYLES: Record<CalloutType, string> = {
  info: "border-primary/50 bg-primary/5 text-gray-800 dark:text-gray-100",
  warning:
    "border-amber-500/60 bg-amber-500/10 text-amber-800 dark:bg-amber-500/5 dark:text-amber-100",
  tip: "border-emerald-500/60 bg-emerald-500/10 text-emerald-800 dark:bg-emerald-500/5 dark:text-emerald-100",
};

const CALLOUT_LABELS: Record<CalloutType, string> = {
  info: "Note",
  warning: "Warning",
  tip: "Tip",
};

export interface CalloutProps {
  type?: CalloutType;
  children: ReactNode;
}

export function Callout({ type = "info", children }: CalloutProps) {
  return (
    <aside
      role="note"
      aria-label={CALLOUT_LABELS[type]}
      className={`my-6 rounded-lg border-l-4 p-4 ${CALLOUT_STYLES[type]}`}
    >
      <div className="mb-1 text-xs font-semibold uppercase tracking-wider opacity-80">
        {CALLOUT_LABELS[type]}
      </div>
      <div className="text-sm">{children}</div>
    </aside>
  );
}

export interface BlogImageProps {
  src?: string;
  alt?: string;
  title?: string;
}

// Markdown's `![alt](src)` syntax emits a bare `<img>` element. We
// replace it with a captioned `<figure>` and a lazy-loaded `<img>` so
// blog images don't block first paint and so the alt text doubles as
// a caption when present.
//
// `width` / `height` come from `getLocalImageDim`, which probes the
// file at build time (the consuming route is `force-static`). When the
// dimensions are known we also set an inline `aspect-ratio` so the
// browser reserves vertical space immediately on first paint — that's
// the Core Web Vitals (CLS) fix. Remote URLs or missing files keep the
// current attribute-less behavior.
export function BlogImage({ src, alt, title }: BlogImageProps) {
  if (!src) return null;
  const caption = title ?? alt;
  const dim = getLocalImageDim(src);
  const style: CSSProperties | undefined = dim
    ? { aspectRatio: `${dim.width} / ${dim.height}` }
    : undefined;
  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        width={dim?.width}
        height={dim?.height}
        style={style}
        className="w-full rounded-lg border border-gray-200 dark:border-white/10"
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-gray-700 dark:text-gray-400">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}

export const blogMdxComponents = {
  Callout,
  img: BlogImage,
};
