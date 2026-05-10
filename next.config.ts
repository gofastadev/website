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
  },
});
