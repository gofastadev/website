import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { Head } from "nextra/components";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pageMap = await getPageMap();

  return (
    <Layout
      navbar={
        <Navbar
          logo={
            <span className="text-lg font-bold">
              Gofasta
            </span>
          }
          projectLink="https://github.com/gofastadev/gofasta"
        />
      }
      footer={
        <Footer>
          MIT {new Date().getFullYear()} &copy; Gofasta Authors.
        </Footer>
      }
      docsRepositoryBase="https://github.com/gofastadev/website/tree/main"
      sidebar={{ defaultMenuCollapseLevel: 1 }}
      pageMap={pageMap}
    >
      <Head faviconGlyph="G" />
      {children}
    </Layout>
  );
}
