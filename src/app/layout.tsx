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
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Gofasta logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/logo.png"],
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
