import nextra from "nextra";

const withNextra = nextra({
  contentDirBasePath: "/docs",
  search: {
    codeblocks: false,
  },
});

export default withNextra({
  reactStrictMode: true,
  reactCompiler: true,
  output: "standalone",
  turbopack: {
    root: __dirname,
    // ── react-aria duplicate-context workaround ──────────────────────
    // Keystatic 0.5.50 imports `@react-aria/interactions` while its
    // button components transitively load the `react-aria` umbrella.
    // Each ships its own bundled PressResponderContext, so toolbar
    // PressResponders never find their pressable children → toolbar
    // buttons render but do not fire. The shim below re-exports the
    // subpackage's surface from the umbrella's private paths so both
    // worlds share one set of context instances. See
    // shims/react-aria-interactions-shim.mjs for the full rationale,
    // and adobe/react-spectrum#5647 for the upstream bug.
    //
    // Remove this once Keystatic ships a version that uses the
    // `react-aria` monopackage directly.
    resolveAlias: {
      "@react-aria/interactions": "./shims/react-aria-interactions-shim.mjs",
    },
  },
  // Image optimization: serve modern formats by default. Next.js will
  // negotiate AVIF first (best compression), then WebP, then fall
  // back to the original on browsers that support neither — so this
  // is purely additive. The 30-day minimum cache TTL means repeat
  // visitors get edge-cached images instead of round-tripping through
  // the optimizer on every request, which saves CWV LCP on warm
  // visits.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // SVG covers are allowed for blog posts. Authoring goes through
    // Keystatic (an authenticated admin UI gated behind GitHub OAuth)
    // OR via direct PRs we review — never via untrusted user upload.
    // The strict CSP below sandboxes the rendered SVG so scripts and
    // foreign-origin assets inside the file are blocked, eliminating
    // the XSS vector that makes user-uploaded SVGs risky on hosts
    // that mirror unmodified user input.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
});
