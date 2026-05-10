import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      {/* Decorative logo — `alt=""` because the visible text label
          beside it provides the same name to assistive tech, and
          Lighthouse axe-core flags duplicate alt+text as redundant. */}
      <Image src="/logo.png" alt="" width={32} height={32} className="rounded-lg" />
      <span className="text-xl font-bold text-gray-900 dark:text-white">Gofasta</span>
    </Link>
  );
}
