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
        "CLI scaffolding and composable packages for Go web services. Generate models, APIs, auth, jobs, and deployment configs. No magic, just Go.",
    },
    {
      "@type": "WebSite",
      name: "Gofasta",
      url: "https://gofasta.dev",
      description:
        "CLI scaffolding and composable packages for Go web services. Generate models, APIs, auth, jobs, and deployment configs. No magic, just Go.",
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
        "A Go backend toolkit with CLI scaffolding, code generation, and composable packages for production web services.",
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
