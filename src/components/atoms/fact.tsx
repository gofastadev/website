// Renders one scalar from the vendored CLI facts document inline in MDX,
// e.g. `<Fact name="scaffold.createdCount" />` → "18".
//
// Registered in mdx-components.tsx, so docs MDX can use it without an
// import. Server-only: the facts JSON should never ship to the client as
// part of a component bundle — the value is rendered to static text.
// Deliberately NOT exported from the atoms barrel (same rule as
// RelatedPages): deep-import it where needed outside MDX.
import "server-only";

import { getFact } from "@/lib/cli-facts";

export interface FactProps {
  /** Dotted path into the facts document, e.g. "skeleton.fileCount". */
  name: string;
}

export function Fact({ name }: FactProps) {
  // getFact throws on unknown paths — that failure surfaces at build
  // time (docs pages are statically rendered), which is the drift gate.
  return <>{getFact(name)}</>;
}
