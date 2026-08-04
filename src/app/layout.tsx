import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { Head } from "nextra/components";
import { SiteChrome } from "@/components/organisms";
import { ConsentProvider } from "@/contexts/consent-context";
import { AGENT_DOC_ALTERNATES } from "@/lib/seo";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteTitle = "Gofasta - Production-Ready Go Backend Toolkit";
// siteDescription lands in <meta name="description"> and feeds every
// page's OpenGraph fallback. Keep both halves of the positioning in
// one ~160-char sentence — the traditional "scaffold + packages"
// story AND the agent-native differentiator (Claude Code / Cursor /
// Codex / Aider / Windsurf integrations, AGENTS.md shipped by
// default, --json everywhere). Pages that override via their own
// frontmatter still win; this is the fallback + homepage copy.
const siteDescription =
  "Go backend toolkit for humans and AI coding agents. CLI scaffolding, composable pkg/* packages, and first-class Claude Code / Cursor / Codex / Aider / Windsurf integrations. No magic, just Go.";
const siteUrl = "https://gofasta.dev";

export const metadata: Metadata = {
  title: {
    template: "%s - Gofasta",
    default: siteTitle,
  },
  description: siteDescription,
  metadataBase: new URL(siteUrl),
  authors: [{ name: "Gofasta", url: siteUrl }],
  creator: "Gofasta",
  publisher: "Gofasta",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "Gofasta",
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/api/og?title=Go%20backend%20toolkit%20for%20humans%20and%20AI%20coding%20agents&section=Gofasta",
        width: 1200,
        height: 630,
        alt: "Gofasta - Production-Ready Go Backend Toolkit",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [
      "/api/og?title=Go%20backend%20toolkit%20for%20humans%20and%20AI%20coding%20agents&section=Gofasta",
    ],
  },
  robots: {
    index: true,
    follow: true,
    // Top-level (generic <meta name="robots">) so EVERY engine gets the
    // preview directives — previously these lived only under googleBot,
    // which left Bing and others without max-image-preview:large.
    // "large" is the documented gate for big image cards in Google
    // Discover and rich image previews in Search.
    "max-video-preview": -1,
    "max-image-preview": "large",
    "max-snippet": -1,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Real favicon files (generated from logo.png by
  // scripts/generate-seo-assets.mjs). Google renders a site's favicon
  // beside every search result (48×48 minimum) — the previous
  // Nextra-glyph-only setup gave SERPs nothing to show.
  icons: {
    icon: [
      { url: "/icon-48.png", sizes: "48x48", type: "image/png" },
      { url: "/logo.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  alternates: {
    canonical: siteUrl,
    // Feed discovery: feed-aware browsers and aggregators (Reeder,
    // NetNewsWire, Inoreader) advertise these so a reader can "follow"
    // the blog without us shipping a sidebar widget. RSS is the broad
    // compat target; JSON Feed is the modern alternative.
    // "text/plain" advertises the llmstxt.org files. An agent that
    // fetches the homepage HTML finds them in the <head> without
    // having to guess the well-known path, and a crawler gets a
    // machine-readable pointer alongside the visible footer links.
    types: {
      "application/rss+xml": "/blog/rss.xml",
      "application/feed+json": "/blog/feed.json",
      "text/plain": AGENT_DOC_ALTERNATES,
    },
  },
  other: {
    "theme-color": "#00ADD8",
  },
  category: "technology",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`dark ${poppins.variable} ${geistMono.variable}`}
    >
      <Head faviconGlyph="G" />
      <body>
        {/* ConsentProvider wraps EVERYTHING so the cookies page,
            footer "Manage cookies" link, banner, and Analytics all
            read the same record. The provider is a client component
            but accepts server-rendered children — it stays a thin
            React Context boundary, no extra JS in the page bodies. */}
        <ConsentProvider>
          {children}
          {/* Public-site chrome (Analytics, PageviewTracker, CookieBanner).
              SiteChrome reads usePathname() and renders nothing under
              /keystatic/* so the admin SPA isn't polluted by GA pageviews
              on its internal route changes, by tracking-script global click
              handlers, or by the banner overlay. */}
          <SiteChrome />
        </ConsentProvider>
      </body>
    </html>
  );
}
