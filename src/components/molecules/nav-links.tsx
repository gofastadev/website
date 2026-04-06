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
      <a
        href="https://github.com/gofastadev/gofasta"
        target="_blank"
        rel="noopener noreferrer"
        className={linkStyles[variant]}
      >
        GitHub
      </a>
      {variant === "footer" && (
        <>
          <Link href="/sitemap" className={linkStyles[variant]}>
            Sitemap
          </Link>
          <a
            href="https://github.com/gofastadev/gofasta/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className={linkStyles[variant]}
          >
            License
          </a>
        </>
      )}
    </div>
  );
}
