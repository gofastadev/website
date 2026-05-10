import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../../../../mdx-components";
import { getKeywordsForPath } from "@/lib/seo-keywords";

export const generateStaticParams = generateStaticParamsFor("mdxPath");

export async function generateMetadata(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const { metadata } = await importPage(params.mdxPath);
  const mdxMeta = metadata as unknown as Record<string, string>;
  const urlPath = `/docs${params.mdxPath ? `/${params.mdxPath.join("/")}` : ""}`;
  const fullUrl = `https://gofasta.dev${urlPath}`;
  const title = mdxMeta?.title ?? "Documentation";
  const description =
    mdxMeta?.description ??
    "Gofasta documentation — guides, CLI reference, and API reference for the Go backend toolkit.";
  const section = params.mdxPath?.[0]
    ?.replace(/-/g, " ")
    .replace(/\b\w/g, (c: string) => c.toUpperCase()) ?? "Docs";
  const ogImageUrl = `/api/og?title=${encodeURIComponent(title)}&section=${encodeURIComponent(section)}`;

  return {
    ...metadata,
    keywords: getKeywordsForPath(urlPath),
    openGraph: {
      type: "article",
      locale: "en_US",
      url: fullUrl,
      siteName: "Gofasta",
      title: `${title} - Gofasta`,
      description,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${title} - Gofasta Documentation`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image" as const,
      title: `${title} - Gofasta`,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: fullUrl,
    },
  };
}

const { wrapper: Wrapper } = getMDXComponents() as Record<
  string,
  React.ComponentType<{ toc: unknown; metadata: unknown; children: React.ReactNode }>
>;

function buildStructuredData(
  mdxPath: string[] | undefined,
  meta: Record<string, string>,
) {
  const segments = mdxPath ?? [];
  const urlPath = `/docs${segments.length > 0 ? `/${segments.join("/")}` : ""}`;
  const fullUrl = `https://gofasta.dev${urlPath}`;
  const title = meta?.title ?? "Documentation";
  const description =
    meta?.description ??
    "Gofasta documentation for the Go backend toolkit.";

  // Section name derived from the first path segment (e.g. "cli-reference" → "Cli Reference"),
  // mirroring the OG-image `section` so JSON-LD and OG share a single source of truth.
  const articleSection = segments[0]
    ? segments[0]
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase())
    : "Docs";

  // Mirror the OG image URL on the schema so Google can use it as the
  // article hero image in rich results. Same query-string contract as
  // generateMetadata above.
  const ogImageUrl = `https://gofasta.dev/api/og?title=${encodeURIComponent(title)}&section=${encodeURIComponent(articleSection)}`;

  // Per-page keywords come from the same SEO map as the metadata side
  // — keep them in sync so structured data and meta tags don't diverge.
  const keywords = getKeywordsForPath(urlPath);

  const breadcrumbItems = [
    { name: "Home", url: "https://gofasta.dev" },
    { name: "Docs", url: "https://gofasta.dev/docs" },
    ...segments.map((seg, i) => ({
      name: seg
        .replace(/-/g, " ")
        .replace(/\b\w/g, (c) => c.toUpperCase()),
      url: `https://gofasta.dev/docs/${segments.slice(0, i + 1).join("/")}`,
    })),
  ];

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        // The breadcrumb's parent: Google groups sitelinks better when
        // BreadcrumbList nests under a WebPage with the current URL.
        mainEntity: { "@type": "WebPage", "@id": fullUrl },
        itemListElement: breadcrumbItems.map((item, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: item.name,
          item: item.url,
        })),
      },
      {
        "@type": "TechArticle",
        headline: title,
        description,
        url: fullUrl,
        inLanguage: "en",
        articleSection,
        keywords: keywords.length > 0 ? keywords.join(", ") : undefined,
        image: ogImageUrl,
        author: { "@type": "Organization", name: "Gofasta" },
        publisher: {
          "@type": "Organization",
          name: "Gofasta",
          url: "https://gofasta.dev",
          logo: "https://gofasta.dev/logo.png",
        },
        mainEntityOfPage: fullUrl,
      },
    ],
  };
}

export default async function Page(props: {
  params: Promise<{ mdxPath?: string[] }>;
}) {
  const params = await props.params;
  const { default: MDXContent, toc, metadata } = await importPage(
    params.mdxPath
  );
  const jsonLd = buildStructuredData(
    params.mdxPath,
    metadata as unknown as Record<string, string>,
  );

  return (
    <Wrapper toc={toc} metadata={metadata}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <MDXContent {...props} params={params} />
    </Wrapper>
  );
}
