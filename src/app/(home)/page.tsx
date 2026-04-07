import type { Metadata } from "next";
import { LandingTemplate } from "@/components/templates";
import { Hero, FeaturesGrid, QuickStartSection, ComingSoon } from "@/components/organisms";
import { getKeywordsForPath } from "@/lib/seo-keywords";

export const metadata: Metadata = {
  keywords: getKeywordsForPath("/"),
  alternates: {
    canonical: "https://gofasta.dev",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "Gofasta",
      url: "https://gofasta.dev",
      logo: "https://gofasta.dev/logo.png",
      description:
        "Production-ready scaffolding, code generation, and batteries-included packages for Go web services.",
    },
    {
      "@type": "WebSite",
      name: "Gofasta",
      url: "https://gofasta.dev",
      description:
        "Production-ready scaffolding, code generation, and batteries-included packages for Go web services.",
      potentialAction: {
        "@type": "SearchAction",
        target: "https://gofasta.dev/docs?search={search_term_string}",
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "SoftwareApplication",
      name: "Gofasta",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Cross-platform",
      url: "https://gofasta.dev",
      description:
        "A Go web framework with CLI tooling for scaffolding, code generation, and production-ready backend services.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
    },
  ],
};

const isProduction = process.env.NODE_ENV === "production";

export default function HomePage() {
  if (isProduction) {
    return <ComingSoon />;
  }

  return (
    <LandingTemplate>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Hero />
      <FeaturesGrid />
      <QuickStartSection />
    </LandingTemplate>
  );
}
