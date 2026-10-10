import { cn } from "@/lib/utils";

// Blog post headings (h2–h6) with a GitHub-style hover-revealed "#"
// anchor link. rehype-slug supplies the `id` prop through the MDX
// component map; when it's absent (a heading rendered outside the
// rehype pipeline) the heading renders without an anchor rather than
// linking to "#undefined". Server component — the anchor is a plain
// fragment link, no JS. The prose wrapper's `prose-headings:scroll-mt-24`
// keeps jumps clear of the fixed navbar.

type HeadingTag = "h2" | "h3" | "h4" | "h5" | "h6";

export interface AnchoredHeadingProps
  extends React.ComponentPropsWithoutRef<"h2"> {
  as: HeadingTag;
}

export function AnchoredHeading({
  as: Tag,
  id,
  children,
  className,
  ...props
}: AnchoredHeadingProps) {
  return (
    <Tag id={id} className={cn("group", className)} {...props}>
      {children}
      {id ? (
        <a
          href={`#${id}`}
          aria-label="Link to this section"
          className="ml-2 font-normal text-gray-400 no-underline opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background hover:text-primary dark:text-gray-500"
        >
          #
        </a>
      ) : null}
    </Tag>
  );
}
