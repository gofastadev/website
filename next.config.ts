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
