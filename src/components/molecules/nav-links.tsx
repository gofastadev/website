"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";
import { AGENT_DOC_FILES } from "@/lib/seo";

interface NavLinksProps {
  variant?: "header" | "footer";
  className?: string;
}

// Typography differs by variant (header reads at text-sm, footer sits
// smaller in font-mono text-xs); active/inactive color is decided per
// link below via usePathname(), so it's shared across both variants.
const variantTextStyles = {
  header: "text-sm transition-colors",
  footer: "font-mono text-xs transition-colors",
};

const activeLinkStyles = "text-foreground font-medium";
const inactiveLinkStyles = "text-gray-600 dark:text-gray-400 hover:text-foreground";

// Footer links share a single `footer_link_click` event with the
// label + destination as params — the GA4 dashboard slices on those
// to see "which footer links get clicked" without needing one event
// name per link. Header gets dedicated event names per link because
// there are only two and they're high-intent enough to mark as
// conversions.
function trackFooterClick(label: string, href: string) {
  trackEvent("footer_link_click", { label, destination: href });
}

export function NavLinks({ variant = "header", className }: NavLinksProps) {
  const isHeader = variant === "header";
  const pathname = usePathname();

  // Exact-match by default: several footer links share the /docs prefix
  // (Docs itself, White Paper), so a startsWith() rule there would mark
  // more than one link active at once. Exact match keeps "active"
  // meaning "this is the current page's own link," which is
  // unambiguous for /docs.
  //
  // /blog is the one deliberate exception: the landing navbar/footer
  // also render on /blog/[slug] and /blog/tags/[tag] post pages, so
  // Blog needs prefix matching there or it never highlights outside
  // the bare /blog index. No other link shares this ambiguity.
  function isActive(href: string): boolean {
    if (href === "/blog") {
      return pathname === "/blog" || (pathname?.startsWith("/blog/") ?? false);
    }
    return pathname === href;
  }

  function linkClassName(href: string) {
    return cn(
      variantTextStyles[variant],
      isActive(href) ? activeLinkStyles : inactiveLinkStyles,
    );
  }

  function ariaCurrent(href: string): "page" | undefined {
    return isActive(href) ? "page" : undefined;
  }

  return (
    // flex-wrap + justify-center: the footer variant now carries nine
    // links, which is wider than a 430px phone viewport. Without
    // wrapping the row overflows its container in BOTH directions —
    // "Docs" gets clipped off the left edge and the last link runs past
    // the right — instead of breaking onto a second line.
    <div
      className={cn(
        "flex flex-wrap items-center justify-center gap-3 sm:gap-6",
        className,
      )}
    >
      <Link
        href="/docs/getting-started/introduction"
        className={linkClassName("/docs/getting-started/introduction")}
        aria-current={ariaCurrent("/docs/getting-started/introduction")}
        onClick={() =>
          isHeader
            ? trackEvent("nav_to_docs", {
                destination: "/docs/getting-started/introduction",
              })
            : trackFooterClick("Docs", "/docs/getting-started/introduction")
        }
      >
        Docs
      </Link>
      <Link
        href="/blog"
        className={linkClassName("/blog")}
        aria-current={ariaCurrent("/blog")}
        onClick={() =>
          isHeader
            ? trackEvent("nav_to_blog", { destination: "/blog" })
            : trackFooterClick("Blog", "/blog")
        }
      >
        Blog
      </Link>
      <Link
        href="https://github.com/gofastadev/gofasta"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClassName("https://github.com/gofastadev/gofasta")}
        onClick={() =>
          isHeader
            ? trackEvent("nav_to_github_library", {
                destination: "https://github.com/gofastadev/gofasta",
              })
            : trackFooterClick("GitHub", "https://github.com/gofastadev/gofasta")
        }
      >
        GitHub
      </Link>
      {variant === "footer" && (
        <>
          <Link
            href="/docs/white-paper"
            className={linkClassName("/docs/white-paper")}
            aria-current={ariaCurrent("/docs/white-paper")}
            onClick={() => trackFooterClick("White Paper", "/docs/white-paper")}
          >
            White Paper
          </Link>
          <Link
            href="/sitemap"
            className={linkClassName("/sitemap")}
            aria-current={ariaCurrent("/sitemap")}
            onClick={() => trackFooterClick("Sitemap", "/sitemap")}
          >
            Sitemap
          </Link>
          {/* GDPR / CPRA: explicit "manage cookies" link in the
              footer is a baseline compliance requirement so users
              can revoke consent without re-finding the banner.
              Doubles as the CPRA "Do Not Sell or Share" link. */}
          <Link
            href="/cookies"
            className={linkClassName("/cookies")}
            aria-current={ariaCurrent("/cookies")}
            onClick={() => trackFooterClick("Cookies", "/cookies")}
          >
            Cookies
          </Link>
          {/* llms.txt / llms-full.txt. These sit in the footer rather
              than a single deep docs page on purpose: the footer
              renders on every landing-side page, so it is the strongest
              internal link the site can give them. They previously had
              ZERO inbound links anywhere — only prose mentions — which
              is why crawlers never picked them up.

              prefetch={false}: these are static files in public/, not
              routes. next/link's default prefetch would fire a useless
              RSC request for a payload that doesn't exist. */}
          {AGENT_DOC_FILES.map((file) => (
            <Link
              key={file.path}
              href={file.path}
              prefetch={false}
              title={file.title}
              className={linkClassName(file.path)}
              aria-current={ariaCurrent(file.path)}
              onClick={() => trackFooterClick(file.label, file.path)}
            >
              {file.label}
            </Link>
          ))}
          <Link
            href="https://github.com/gofastadev/gofasta/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClassName(
              "https://github.com/gofastadev/gofasta/blob/main/LICENSE",
            )}
            onClick={() =>
              trackFooterClick(
                "License",
                "https://github.com/gofastadev/gofasta/blob/main/LICENSE",
              )
            }
          >
            License
          </Link>
        </>
      )}
    </div>
  );
}
