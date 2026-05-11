"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

interface NavLinksProps {
  variant?: "header" | "footer";
  className?: string;
}

const linkStyles = {
  header:
    "text-sm font-medium text-gray-700 hover:text-foreground dark:text-gray-300 dark:hover:text-white transition-colors",
  footer:
    "text-sm text-gray-600 hover:text-foreground dark:text-gray-400 dark:hover:text-white transition-colors",
};

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
  return (
    <div className={cn("flex items-center gap-3 sm:gap-6", className)}>
      <Link
        href="/docs/getting-started/introduction"
        className={linkStyles[variant]}
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
        className={linkStyles[variant]}
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
        className={linkStyles[variant]}
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
            className={linkStyles[variant]}
            onClick={() => trackFooterClick("White Paper", "/docs/white-paper")}
          >
            White Paper
          </Link>
          <Link
            href="/sitemap"
            className={linkStyles[variant]}
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
            className={linkStyles[variant]}
            onClick={() => trackFooterClick("Cookies", "/cookies")}
          >
            Cookies
          </Link>
          <Link
            href="https://github.com/gofastadev/gofasta/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className={linkStyles[variant]}
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
