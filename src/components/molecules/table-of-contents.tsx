"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import type { TocItem } from "@/lib/toc";

// "On this page" navigation for blog posts, in two variants rendered
// by the [slug] route: `sidebar` is the sticky rail on xl screens with
// an IntersectionObserver scroll-spy highlighting the section in view;
// `inline` is a native <details> box for smaller screens — no JS
// beyond the disclosure element the browser provides.
//
// The observer's rootMargin top offset mirrors the headings'
// `scroll-mt-24` (96px) so "active" flips exactly when a heading
// settles under the fixed navbar; the -70% bottom margin keeps the
// active band in the upper third of the viewport, which is where the
// reader's eyes are.

export interface TableOfContentsProps {
  items: TocItem[];
  variant: "sidebar" | "inline";
}

const DEPTH_INDENT: Record<TocItem["depth"], string> = {
  2: "",
  3: "pl-3",
  4: "pl-6",
  5: "pl-9",
  6: "pl-12",
};

function TocLinks({
  items,
  activeId,
}: {
  items: TocItem[];
  activeId: string | null;
}) {
  return (
    <ul className="flex flex-col gap-2 text-sm">
      {items.map((item) => (
        <li key={item.id} className={DEPTH_INDENT[item.depth]}>
          <a
            href={`#${item.id}`}
            aria-current={activeId === item.id ? "true" : undefined}
            className={cn(
              "block leading-snug transition-colors hover:text-primary",
              activeId === item.id
                ? "font-medium text-primary"
                : "text-gray-600 dark:text-gray-400",
            )}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TableOfContents({ items, variant }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const isSidebar = variant === "sidebar";

  useEffect(() => {
    if (!isSidebar || items.length < 2) return;

    const visible = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        // Highlight the first document-order heading currently in the
        // active band; keep the previous highlight when none is (the
        // reader is inside a long section between headings).
        const current = items.find((item) => visible.has(item.id));
        if (current) setActiveId(current.id);
      },
      { rootMargin: "-96px 0px -70% 0px" },
    );

    for (const item of items) {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [isSidebar, items]);

  if (items.length < 2) return null;

  if (variant === "inline") {
    return (
      <details className="mb-8 rounded-lg border border-gray-200 px-4 py-3 xl:hidden dark:border-white/10">
        <summary className="cursor-pointer text-sm font-semibold text-foreground">
          On this page
        </summary>
        <nav aria-label="On this page" className="mt-3">
          <TocLinks items={items} activeId={null} />
        </nav>
      </details>
    );
  }

  return (
    <nav aria-label="On this page">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-700 dark:text-gray-400">
        On this page
      </p>
      <TocLinks items={items} activeId={activeId} />
    </nav>
  );
}
