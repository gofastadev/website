import Image from "next/image";
import Link from "next/link";
import { Footer, Layout, Navbar } from "nextra-theme-docs";
import { getPageMap } from "nextra/page-map";
import "nextra-theme-docs/style.css";

export default async function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // getPageMap() auto-includes every app-router route as a top-level
  // entry — which is how /blog, /cookies, and /sitemap were showing up
  // in the docs SIDEBAR. The sidebar is for documentation pages ONLY;
  // site sections live in the navbar and footer below. Whitelist: keep
  // an item only when it's part of the docs tree (route under /docs,
  // or a routeless container like the content-dir wrapper).
  const pageMap = (await getPageMap()).filter((item) => {
    if (!("route" in item) || typeof item.route !== "string") return true;
    return item.route === "/docs" || item.route.startsWith("/docs/");
  });

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
        >
          {/* The blog is a site section, not documentation content — it
              lives in the top bar (and footer), deliberately NOT in the
              docs sidebar or pageMap. Explicit link because Nextra's
              navbar only lists pageMap entries. */}
          <Link
            href="/blog"
            className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900 dark:text-neutral-400 dark:hover:text-gray-50"
          >
            Blog
          </Link>
        </Navbar>
      }
      footer={
        <Footer>
          <span className="flex flex-wrap items-center gap-3">
            <span>
              &copy; 2025–{new Date().getFullYear()} Gofasta Authors — MIT
              License
            </span>
            <span aria-hidden="true">·</span>
            <Link
              href="/blog"
              className="text-sm underline-offset-4 hover:underline"
            >
              Blog
            </Link>
            <span aria-hidden="true">·</span>
            <Link
              href="/sitemap"
              className="text-sm underline-offset-4 hover:underline"
            >
              Sitemap
            </Link>
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
