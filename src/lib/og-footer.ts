// Section-aware footer URL builder for `/api/og` rendered images.
//
// The OG image renders a footer URL in the bottom-left corner. When
// the `section` query param matches a known top-level route group
// (`docs`, `blog`), the footer reads `gofasta.dev/<section>` so the
// share preview points at the right surface. For everything else
// (landing page previews, marketing pages, unknown sections) it falls
// back to the bare `gofasta.dev` so the image stays generic.
//
// Lives in `src/lib/` rather than alongside `route.tsx` so it can be
// unit-tested without booting `next/og`'s `ImageResponse` machinery.

const KNOWN_SECTION_PATHS = new Set(["docs", "blog"]);

export function buildOgFooterUrl(section: string | null | undefined): string {
  if (!section) return "gofasta.dev";
  const normalized = section.trim().toLowerCase();
  if (KNOWN_SECTION_PATHS.has(normalized)) {
    return `gofasta.dev/${normalized}`;
  }
  return "gofasta.dev";
}
