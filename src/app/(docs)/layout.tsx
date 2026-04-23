import Image from "next/image";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
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
            <span className="flex items-center gap-2">
              <Image src="/logo.png" alt="Gofasta" width={28} height={28} className="rounded-lg" />
              <span className="text-lg font-bold">Gofasta</span>
            </span>
          }
          projectLink="https://github.com/gofastadev/gofasta"
        />
      }
      footer={
        <Footer>
          &copy; 2025–{new Date().getFullYear()} Gofasta Authors — MIT License
        </Footer>
      }
      docsRepositoryBase="https://github.com/gofastadev/website/tree/main"
      sidebar={{ defaultMenuCollapseLevel: 1 }}
      nextThemes={{ defaultTheme: "dark" }}
      pageMap={pageMap}
    >
      {children}
    </Layout>
  );
}
