import type { ReactNode } from "react";

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

const CALLOUT_STYLES: Record<CalloutType, string> = {
  info: "border-primary/50 bg-primary/5 text-gray-100",
  warning: "border-amber-500/60 bg-amber-500/5 text-amber-100",
  tip: "border-emerald-500/60 bg-emerald-500/5 text-emerald-100",
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
export function BlogImage({ src, alt, title }: BlogImageProps) {
  if (!src) return null;
  const caption = title ?? alt;
  return (
    <figure className="my-8">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt ?? ""}
        loading="lazy"
        decoding="async"
        className="w-full rounded-lg border border-white/10"
      />
      {caption ? (
        <figcaption className="mt-2 text-center text-sm text-gray-400">
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
