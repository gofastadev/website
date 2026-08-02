"use client";

// ─────────────────────────────────────────────────────────────────────
// Global error boundary — intentionally self-contained.
//
// Next.js 16 prerenders /_global-error at build time WITHOUT the root
// layout's providers. Its internal fallback error page crashes there
// with "Cannot read properties of null (reading 'useContext')"
// (vercel/next.js#86178, #84994, discussion #94667), which aborts
// `next build` for the whole site. Supplying our own global-error that
// consumes NO app contexts replaces that crashing composition.
//
// Hard constraints, per the upstream guidance:
//   - must render its own <html> and <body> (it replaces the root
//     layout when it triggers);
//   - no next/link (needs AppRouterContext — null here), no
//     next-themes, no ConsentProvider, no component that reads any
//     React context;
//   - raw elements are deliberate: importing app atoms would drag in
//     the very module graph this file must stay independent of. This
//     file is a sanctioned exception to the "no raw HTML outside
//     atoms" rule for the same reason layout.tsx renders raw
//     <html>/<body>.
//
// globals.css is safe to import (pure CSS, no JS), so Tailwind
// classes work and the page follows the site's dark theme.
// ─────────────────────────────────────────────────────────────────────
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <main className="mx-auto max-w-md px-6 text-center">
          <h1 className="text-2xl font-semibold">Something went wrong</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            An unexpected error occurred
            {error?.digest ? ` (digest ${error.digest})` : ""}. You can try
            again, or head back to the homepage.
          </p>
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={reset}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90"
            >
              Try again
            </button>
            {/* Plain <a>, not next/link: AppRouterContext is unavailable
                in the global-error tree and next/link would crash the
                prerender — the exact bug this file exists to avoid. */}
            <a
              href="/"
              className="rounded-md border border-border px-4 py-2 text-sm font-medium hover:bg-accent"
            >
              Go home
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
