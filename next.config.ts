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
  poweredByHeader: false,
  // Without this, www serves the whole site with a 200 and every page
  // exists at two URLs. A canonical tag is only a hint, so it still cost
  // crawl budget on a second copy of the site; a 308 makes the apex the
  // only reachable host. The `has` condition scopes the redirect to www
  // requests so it can't loop.
  async headers() {
    // Baseline hardening headers. HSTS is intentionally absent — Vercel
    // sets strict-transport-security on custom domains itself.
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: "www.gofasta.dev" }],
        destination: "https://gofasta.dev/:path*",
        permanent: true,
      },
    ];
  },
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
  // Next negotiates AVIF, then WebP, then the original, so this is
  // purely additive. The 30-day minimum TTL keeps repeat visits on
  // edge-cached images instead of round-tripping the optimizer.
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // SVG covers are allowed because authoring is gated: Keystatic
    // behind GitHub OAuth, or a reviewed PR, never untrusted upload.
    // The CSP below sandboxes the rendered SVG so scripts and
    // foreign-origin assets inside the file are blocked anyway.
    dangerouslyAllowSVG: true,
    contentSecurityPolicy:
      "default-src 'self'; script-src 'none'; sandbox;",
  },
});
