import { useMDXComponents as getDocsMDXComponents } from "nextra-theme-docs";
import type { MDXComponents } from "mdx/types";
import { RelatedPages } from "@/components/molecules/related-pages";

const docsComponents = getDocsMDXComponents();

// Components registered here are available in every MDX file without
// import. Keep this list intentionally small — generic primitives only,
// nothing tied to a specific page's content. See:
//   https://mdxjs.com/docs/using-mdx/#components-context
const sharedComponents = {
  RelatedPages,
};

export function useMDXComponents(components?: MDXComponents): MDXComponents {
  return {
    ...docsComponents,
    ...sharedComponents,
    ...components,
  };
}
