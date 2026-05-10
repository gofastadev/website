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
              {/* Decorative — text label "Gofasta" follows; alt="" prevents redundant SR readout. */}
              <Image src="/logo.png" alt="" width={28} height={28} className="rounded-lg" />
              <span className="text-lg font-bold">Gofasta</span>
            </span>
          }
          projectLink="https://github.com/gofastadev/gofasta"
        />
      }
      footer={
        <Footer>
          <span className="flex flex-wrap items-center gap-3">
            <span>
              &copy; 2025–{new Date().getFullYear()} Gofasta Authors — MIT
              License
            </span>
            <span aria-hidden="true">·</span>
            {/* "Manage cookies" lives in the docs footer too so EU/CA
                visitors who land directly on a docs page have the
                same revoke-consent path as landing-page visitors. */}
            <a
              href="/cookies"
              className="text-sm underline-offset-4 hover:underline"
            >
              Cookies
            </a>
          </span>
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
