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

export const metadata: Metadata = {
  title: {
    template: "%s - Gofasta",
    default: "Gofasta - Build Go Backends at Lightning Speed",
  },
  description:
    "Production-ready scaffolding, code generation, and batteries-included packages for Go web services.",
  metadataBase: new URL("https://gofasta.dev"),
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
