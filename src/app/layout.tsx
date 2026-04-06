import type { Metadata } from "next";
import { Poppins, Geist_Mono } from "next/font/google";
import { Head } from "nextra/components";
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

const siteTitle = "Gofasta - Build Go Backends at Lightning Speed";
const siteDescription =
  "Production-ready scaffolding, code generation, and batteries-included packages for Go web services.";
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
        url: "/api/og?title=Build%20Go%20Backends%20at%20Lightning%20Speed&section=Gofasta",
        width: 1200,
        height: 630,
        alt: "Gofasta - Build Go Backends at Lightning Speed",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: [
      "/api/og?title=Build%20Go%20Backends%20at%20Lightning%20Speed&section=Gofasta",
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
      className={`${poppins.variable} ${geistMono.variable}`}
    >
      <Head faviconGlyph="G" />
      <body>{children}</body>
    </html>
  );
}
