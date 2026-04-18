import type { Metadata } from "next";
import { LandingTemplate } from "@/components/templates";
import {
  Hero,
  AudienceTiles,
  ValuePillars,
  AgentSpotlight,
  FeaturesGrid,
  ArchitectureStrip,
  QuickStartSection,
  CtaSection,
  ComingSoon,
} from "@/components/organisms";
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
        "Agent-native Go toolkit that scaffolds production backends in one command. Auth, databases, jobs, observability, and deployment wired on day one. Standard Go, zero lock-in.",
    },
    {
      "@type": "WebSite",
      name: "Gofasta",
      url: "https://gofasta.dev",
      description:
        "Agent-native Go toolkit that scaffolds production backends in one command. Auth, databases, jobs, observability, and deployment wired on day one. Standard Go, zero lock-in.",
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
        "Agent-native Go toolkit: CLI scaffolding, composable packages, and first-class AI coding agent support for production backend services.",
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
      <AudienceTiles />
      <ValuePillars />
      <AgentSpotlight />
      <FeaturesGrid />
      <ArchitectureStrip />
      <QuickStartSection />
      <CtaSection />
    </LandingTemplate>
  );
}
