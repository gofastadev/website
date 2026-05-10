import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { Head } from "nextra/components";
import { Analytics } from "@/components/atoms";
import { CookieBanner } from "@/components/organisms";
import { ConsentProvider } from "@/contexts/consent-context";
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
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: siteUrl,
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
          {/* GA4 (with Google Consent Mode v2 default-denied) +
              Microsoft Clarity (gated until consent). Both are opt-in
              via NEXT_PUBLIC_* env vars; when unset (dev / preview)
              nothing renders. */}
          <Analytics />
          {/* GDPR/CPRA banner. Renders only on first visit (and after
              `Manage cookies` resets the record). */}
          <CookieBanner />
        </ConsentProvider>
      </body>
    </html>
  );
}
