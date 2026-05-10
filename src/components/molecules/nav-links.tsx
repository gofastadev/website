import Link from "next/link";
import { cn } from "@/lib/utils";

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

export function NavLinks({ variant = "header", className }: NavLinksProps) {
  return (
    <div className={cn("flex items-center gap-3 sm:gap-6", className)}>
      <Link
        href="/docs/getting-started/introduction"
        className={linkStyles[variant]}
      >
        Docs
      </Link>
      <Link
        href="https://github.com/gofastadev/gofasta"
        target="_blank"
        rel="noopener noreferrer"
        className={linkStyles[variant]}
      >
        GitHub
      </Link>
      {variant === "footer" && (
        <>
          <Link href="/docs/white-paper" className={linkStyles[variant]}>
            White Paper
          </Link>
          <Link href="/sitemap" className={linkStyles[variant]}>
            Sitemap
          </Link>
          {/* GDPR / CPRA: explicit "manage cookies" link in the
              footer is a baseline compliance requirement so users
              can revoke consent without re-finding the banner.
              Doubles as the CPRA "Do Not Sell or Share" link. */}
          <Link href="/cookies" className={linkStyles[variant]}>
            Cookies
          </Link>
          <Link
            href="https://github.com/gofastadev/gofasta/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className={linkStyles[variant]}
          >
            License
          </Link>
        </>
      )}
    </div>
  );
}
