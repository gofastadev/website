"use client";

import Giscus from "@giscus/react";
import type { Repo } from "@giscus/react";

// Giscus-backed comments thread for blog posts. Mounts only when all
// four configuration env vars are present — when they're not (preview
// deploys, local dev without a configured app), the component renders
// nothing instead of failing or showing a broken iframe.
//
// `mapping="pathname"` gives each blog URL its own GitHub Discussion,
// keyed by the page's pathname. `theme="dark"` is hard-coded because
// the site is dark-locked (see `src/app/layout.tsx`'s
// `<html className="dark">` + `enableSystem={false}`); wiring useTheme
// would only ever return "dark" anyway.

function isConfiguredRepo(value: string | undefined): value is Repo {
  return typeof value === "string" && /^[^/]+\/[^/]+$/.test(value);
}

export function Comments() {
  const repo = process.env.NEXT_PUBLIC_GISCUS_REPO;
  const repoId = process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
  const category = process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
  const categoryId = process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;

  if (!isConfiguredRepo(repo) || !repoId || !category || !categoryId) {
    return null;
  }

  return (
    <section
      aria-label="Comments"
      className="mt-12 border-t border-white/10 pt-8"
    >
      <h2 className="mb-4 text-lg font-semibold text-white">Comments</h2>
      <Giscus
        repo={repo}
        repoId={repoId}
        category={category}
        categoryId={categoryId}
        mapping="pathname"
        theme="dark"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        lang="en"
        loading="lazy"
      />
    </section>
  );
}
