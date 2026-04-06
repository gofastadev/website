import type { Metadata } from "next";
import Link from "next/link";
import { LandingTemplate } from "@/components/templates";
import { getKeywordsForPath } from "@/lib/seo-keywords";

export const metadata: Metadata = {
  title: "Sitemap",
  description:
    "Complete sitemap of the Gofasta documentation — all guides, CLI reference, and API reference pages.",
  keywords: getKeywordsForPath("/"),
  alternates: {
    canonical: "https://gofasta.dev/sitemap",
  },
};

const sections = [
  {
    title: "Getting Started",
    links: [
      { href: "/docs/getting-started/introduction", label: "Introduction" },
      { href: "/docs/getting-started/installation", label: "Installation" },
      { href: "/docs/getting-started/quick-start", label: "Quick Start" },
      {
        href: "/docs/getting-started/project-structure",
        label: "Project Structure",
      },
    ],
  },
  {
    title: "Guides",
    links: [
      { href: "/docs/guides/rest-api", label: "REST API" },
      { href: "/docs/guides/graphql", label: "GraphQL" },
      {
        href: "/docs/guides/database-and-migrations",
        label: "Database & Migrations",
      },
      { href: "/docs/guides/authentication", label: "Authentication" },
      { href: "/docs/guides/code-generation", label: "Code Generation" },
      { href: "/docs/guides/background-jobs", label: "Background Jobs" },
      {
        href: "/docs/guides/email-and-notifications",
        label: "Email & Notifications",
      },
      { href: "/docs/guides/testing", label: "Testing" },
      { href: "/docs/guides/deployment", label: "Deployment" },
      { href: "/docs/guides/configuration", label: "Configuration" },
    ],
  },
  {
    title: "CLI Reference",
    links: [
      { href: "/docs/cli-reference/new", label: "gofasta new" },
      { href: "/docs/cli-reference/init", label: "gofasta init" },
      { href: "/docs/cli-reference/dev", label: "gofasta dev" },
      { href: "/docs/cli-reference/migrate", label: "gofasta migrate" },
      { href: "/docs/cli-reference/seed", label: "gofasta seed" },
      { href: "/docs/cli-reference/serve", label: "gofasta serve" },
      { href: "/docs/cli-reference/wire", label: "gofasta wire" },
      { href: "/docs/cli-reference/swagger", label: "gofasta swagger" },
    ],
  },
  {
    title: "CLI Reference — Generate",
    links: [
      { href: "/docs/cli-reference/generate/scaffold", label: "scaffold" },
      { href: "/docs/cli-reference/generate/model", label: "model" },
      {
        href: "/docs/cli-reference/generate/repository",
        label: "repository",
      },
      { href: "/docs/cli-reference/generate/service", label: "service" },
      {
        href: "/docs/cli-reference/generate/controller",
        label: "controller",
      },
      { href: "/docs/cli-reference/generate/dto", label: "dto" },
      { href: "/docs/cli-reference/generate/migration", label: "migration" },
      { href: "/docs/cli-reference/generate/route", label: "route" },
      { href: "/docs/cli-reference/generate/resolver", label: "resolver" },
      { href: "/docs/cli-reference/generate/provider", label: "provider" },
      { href: "/docs/cli-reference/generate/job", label: "job" },
      { href: "/docs/cli-reference/generate/task", label: "task" },
      {
        href: "/docs/cli-reference/generate/email-template",
        label: "email-template",
      },
    ],
  },
  {
    title: "Framework API",
    links: [
      { href: "/docs/api-reference/config", label: "Config" },
      { href: "/docs/api-reference/logger", label: "Logger" },
      { href: "/docs/api-reference/errors", label: "Errors" },
      { href: "/docs/api-reference/models", label: "Models" },
      { href: "/docs/api-reference/http-utilities", label: "HTTP Utilities" },
      { href: "/docs/api-reference/middleware", label: "Middleware" },
      { href: "/docs/api-reference/auth", label: "Auth" },
      { href: "/docs/api-reference/cache", label: "Cache" },
      { href: "/docs/api-reference/storage", label: "Storage" },
      { href: "/docs/api-reference/mailer", label: "Mailer" },
      { href: "/docs/api-reference/notifications", label: "Notifications" },
      { href: "/docs/api-reference/websocket", label: "WebSocket" },
      { href: "/docs/api-reference/scheduler", label: "Scheduler" },
      { href: "/docs/api-reference/queue", label: "Queue" },
      { href: "/docs/api-reference/resilience", label: "Resilience" },
      { href: "/docs/api-reference/validators", label: "Validators" },
      { href: "/docs/api-reference/i18n", label: "i18n" },
      { href: "/docs/api-reference/observability", label: "Observability" },
      { href: "/docs/api-reference/feature-flags", label: "Feature Flags" },
      { href: "/docs/api-reference/sessions", label: "Sessions" },
      { href: "/docs/api-reference/encryption", label: "Encryption" },
      { href: "/docs/api-reference/seeds", label: "Seeds" },
      { href: "/docs/api-reference/types", label: "Types" },
      { href: "/docs/api-reference/utils", label: "Utils" },
      { href: "/docs/api-reference/health", label: "Health" },
      { href: "/docs/api-reference/test-utilities", label: "Test Utilities" },
    ],
  },
];

export default function SitemapPage() {
  return (
    <LandingTemplate>
      <section className="mx-auto max-w-4xl px-6 pt-32 pb-20">
        <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
          Sitemap
        </h1>
        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
          A complete index of every page on the Gofasta documentation site.
        </p>

        <nav className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-lg font-semibold text-foreground">
                {section.title}
              </h2>
              <ul className="mt-3 space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-600 transition-colors hover:text-foreground dark:text-gray-400 dark:hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </section>
    </LandingTemplate>
  );
}
