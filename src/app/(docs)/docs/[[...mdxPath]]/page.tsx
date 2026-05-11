import { generateStaticParamsFor, importPage } from "nextra/pages";
import { useMDXComponents as getMDXComponents } from "../../../../../mdx-components";
import { getKeywordsForPath } from "@/lib/seo-keywords";
import { buildTechArticleJsonLd } from "@/lib/structured-data";

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

// buildStructuredData now lives in src/lib/structured-data.ts so the
// /blog routes can share the breadcrumb logic. This thin local wrapper
// just unpacks Nextra's metadata shape into the lib's typed input.
function buildStructuredData(
  mdxPath: string[] | undefined,
  meta: Record<string, string>,
) {
  return buildTechArticleJsonLd({
    segments: mdxPath ?? [],
    title: meta?.title ?? "Documentation",
    description:
      meta?.description ?? "Gofasta documentation for the Go backend toolkit.",
  });
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
