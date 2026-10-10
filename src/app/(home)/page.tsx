import type { Metadata } from "next";
import { LandingTemplate } from "@/components/templates";
import {
  Hero,
  AudienceTiles,
  ValuePillars,
  AgentSpotlight,
  DashboardPreview,
  FeatureIndex,
  ArchitectureStrip,
  QuickStartSection,
  CtaSection,
} from "@/components/organisms";
import { ScrollDepthTracker, SectionTracker } from "@/components/atoms";
import { AGENT_DOC_ALTERNATES, SITE_URL, withBaseKeywords } from "@/lib/seo";
import { serializeJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = {
  keywords: withBaseKeywords(
    "code generation",
    "scaffolding",
    "CLI",
    "REST API",
    "GraphQL",
    "production-ready",
    "AI coding agent",
    "agent-native",
    "Claude Code",
    "Cursor",
    "OpenAI Codex",
    "Aider",
    "Windsurf",
    "AGENTS.md",
    "llms.txt",
    "LLM-friendly documentation",
  ),
  alternates: {
    canonical: SITE_URL,
    // These `types` are NOT redundant with the root layout's. Next
    // merges metadata per top-level field, so this `alternates` object
    // replaces the layout's entirely — declaring only `canonical` here
    // was silently stripping the blog feed <link>s from the homepage,
    // the one page most likely to be handed to a feed reader. Restated
    // here so the homepage advertises the feeds AND the llms files.
    types: {
      "application/rss+xml": "/blog/rss.xml",
      "application/feed+json": "/blog/feed.json",
      "text/plain": AGENT_DOC_ALTERNATES,
    },
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      // Same @id the blog's publisher/author nodes reference — one
      // merged entity across the whole site instead of disconnected
      // inline copies.
      "@id": "https://gofasta.dev/#organization",
      name: "Gofasta",
      url: "https://gofasta.dev",
      logo: {
        "@type": "ImageObject",
        url: "https://gofasta.dev/logo.png",
        width: 512,
        height: 512,
      },
      sameAs: ["https://github.com/gofastadev"],
      description:
        "Agent-native Go toolkit that scaffolds production backends in one command. Auth, databases, jobs, observability, and deployment wired on day one. Standard Go, zero lock-in.",
    },
    {
      "@type": "WebSite",
      "@id": "https://gofasta.dev/#website",
      name: "Gofasta",
      url: "https://gofasta.dev",
      publisher: { "@id": "https://gofasta.dev/#organization" },
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

export default function HomePage() {
  return (
    <LandingTemplate>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: serializeJsonLd(jsonLd) }}
      />
      {/* Page-level analytics:
          - ScrollDepthTracker fires 25/50/75/100% milestones.
          - Each <SectionTracker> fires a one-shot section_view event
            when the section first scrolls into view. Combined these
            answer "how far down the landing do visitors actually
            get, and which sections do they actually see?" */}
      <ScrollDepthTracker />
      <SectionTracker name="hero">
        <Hero />
      </SectionTracker>
      <SectionTracker name="audience_tiles">
        <AudienceTiles />
      </SectionTracker>
      <SectionTracker name="value_pillars">
        <ValuePillars />
      </SectionTracker>
      <SectionTracker name="agent_spotlight">
        <AgentSpotlight />
      </SectionTracker>
      <SectionTracker name="dashboard_preview">
        <DashboardPreview />
      </SectionTracker>
      <SectionTracker name="features_grid">
        <FeatureIndex />
      </SectionTracker>
      <SectionTracker name="architecture_strip">
        <ArchitectureStrip />
      </SectionTracker>
      <SectionTracker name="quick_start_section">
        <QuickStartSection />
      </SectionTracker>
      <SectionTracker name="cta_section">
        <CtaSection />
      </SectionTracker>
    </LandingTemplate>
  );
}
