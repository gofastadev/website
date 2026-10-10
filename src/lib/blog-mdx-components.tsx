import type { ComponentPropsWithoutRef, CSSProperties, ReactNode } from "react";
import { AnchoredHeading } from "@/components/atoms/anchored-heading";
import { MdxPre } from "@/components/molecules/mdx-pre";
import { getLocalImageDim } from "./image-dim";

// The component map for blog posts, separate from the project-root
// `mdx-components.tsx` that Nextra uses for docs.
//
// Keystatic stores MDX without imports or raw HTML, so a custom
// component must be registered both here and in the Keystatic `body`
// field schema before a post can reference it.

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

// Replaces markdown's bare `<img>` with a captioned, lazy-loaded
// `<figure>`. Known dimensions also set an inline `aspect-ratio` so the
// browser reserves vertical space on first paint, which is the CLS fix;
// remote or missing files degrade to no attributes.
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

// h2–h6 get hover-revealed fragment links, with ids supplied by
// rehype-slug in the [slug] route's pipeline. h1 is deliberately absent:
// the article header owns the title and stripTitleH1 removes body H1s.
type HeadingProps = React.ComponentPropsWithoutRef<"h2">;

export type TableProps = ComponentPropsWithoutRef<"table">;

// A wide comparison table would otherwise push the whole article into
// horizontal scroll on narrow viewports. The wrapper keeps the overflow
// local to the table, and `block` on the table itself is what lets the
// wrapper actually clip it inside Tailwind's prose styles.
export function BlogTable(props: TableProps) {
  return (
    <div className="my-6 -mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
      <table {...props} className="my-0 block w-max min-w-full sm:table" />
    </div>
  );
}

export const blogMdxComponents = {
  Callout,
  img: BlogImage,
  pre: MdxPre,
  table: BlogTable,
  h2: (props: HeadingProps) => <AnchoredHeading as="h2" {...props} />,
  h3: (props: HeadingProps) => <AnchoredHeading as="h3" {...props} />,
  h4: (props: HeadingProps) => <AnchoredHeading as="h4" {...props} />,
  h5: (props: HeadingProps) => <AnchoredHeading as="h5" {...props} />,
  h6: (props: HeadingProps) => <AnchoredHeading as="h6" {...props} />,
};
