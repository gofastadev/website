"use client";

import { Logo, ThemeToggle } from "@/components/atoms";
import { NavLinks } from "@/components/molecules";

export function NavbarLanding() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-md dark:border-gray-800 dark:bg-[#0d1117]/80">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Logo />
        <div className="flex items-center gap-6">
          <NavLinks variant="header" />
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
