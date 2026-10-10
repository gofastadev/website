"use client";

import Giscus from "@giscus/react";
import type { Repo, Theme } from "@giscus/react";
import { useTheme } from "next-themes";

// Giscus-backed comments thread for blog posts. Mounts only when all
// four configuration env vars are present — when they're not (preview
// deploys, local dev without a configured app), the component renders
// nothing instead of failing or showing a broken iframe.
//
// `mapping="pathname"` gives each blog URL its own GitHub Discussion,
// keyed by the page's pathname. The theme tracks the site theme:
// next-themes' `resolvedTheme` returns "dark" or "light" depending on
// the user's choice in the header toggle, and `@giscus/react` posts
// the new value to the iframe so the embedded thread re-themes
// without a reload.

function isConfiguredRepo(value: string | undefined): value is Repo {
  return typeof value === "string" && /^[^/]+\/[^/]+$/.test(value);
}

export function Comments() {
  const { resolvedTheme } = useTheme();
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (!isConfiguredRepo(repo) || !repoId || !category || !categoryId) {
    return null;
  }

  // Fall back to "dark" if `resolvedTheme` is undefined (the initial
  // SSR render before next-themes hydrates) — matches the site's
  // default theme.
  const giscusTheme: Theme = resolvedTheme === "light" ? "light" : "dark";

  return (
    <section
      aria-label="Comments"
      className="mt-12 border-t border-gray-200 pt-8 dark:border-white/10"
    >
      <h2 className="mb-4 text-lg font-semibold text-foreground">Comments</h2>
      <Giscus
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        theme={giscusTheme}
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        lang="en"
        loading="lazy"
      />
    </section>
  );
}
