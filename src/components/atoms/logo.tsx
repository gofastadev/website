import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link
      href="/"
      aria-label="Gofasta home"
      className={cn("flex items-center gap-2", className)}
    >
      {/* Decorative logo — `alt=""` because the visible text label
          beside it provides the same name to assistive tech, and
          Lighthouse axe-core flags duplicate alt+text as redundant.
          The wordmark span is hidden below `sm`, so on mobile the
          link's only accessible name would otherwise come from the
          empty alt text — `aria-label` on the Link covers every
          viewport instead of relying on the hidden span. */}
      <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg" />
      <span className="hidden text-xl font-bold text-gray-900 sm:inline dark:text-white">
        Gofasta
      </span>
    </Link>
  );
}
