## Package Manager

Use **yarn** for all install/add/remove commands. Never use npm.

### Dependency Installation (Container-Only)

**Never run `yarn add`, `yarn remove`, or any dependency-modifying command directly on the host machine.** Dependencies must be installed inside the Docker container. Follow this workflow:

1. Connect to the container: `docker exec -it <container_name> sh` (or `bash`)
2. Run the dependency command inside the container (e.g., `yarn add <package>`)
3. Exit the container and return to the host machine to continue making code changes

This ensures the containerized environment stays in sync and avoids host/container dependency mismatches.

## Project

This is the **gofasta.dev** documentation website for the [Gofasta](https://github.com/gofastadev/gofasta) Go web framework and its [CLI tool](https://github.com/gofastadev/cli). The site serves as the official documentation, guides, and reference for developers using Gofasta.

## Tech Stack

- **Next.js 16.2** (App Router, Turbopack, React Compiler)
- **React 19**
- **TypeScript** (strict mode)
- **Nextra 4** (documentation framework — file-based MDX routing, Pagefind search, Shiki syntax highlighting)
- **Tailwind CSS 4** (via `@tailwindcss/postcss`)
- **next-themes** for dark mode

## Next.js 16 Features & Conventions

- **Turbopack** is the default bundler for both `dev` and `build` (no flags needed)
- **React Compiler** is stable — enabled via `reactCompiler: true` in `next.config.ts`. Requires `babel-plugin-react-compiler` installed as a dev dependency
- **`proxy.ts`** replaces `middleware.ts` — runs on Node.js runtime (not Edge), exports a `proxy` function (not `middleware`). Use for coarse routing/redirects only
- **`"use cache"` directive** — opt-in caching for pages, components, and functions. Use `cacheLife('hours')`, `cacheLife('days')`, etc. for cache duration
- **Async Dynamic APIs** — `params`, `searchParams`, `cookies()`, `headers()` are all async and must be `await`ed. Sync access is fully removed in Next.js 16
  - Page/layout: `export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; }`
  - `cookies()`: `const cookieStore = await cookies();`
  - `headers()`: `const headersList = await headers();`
  - `searchParams`: `export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string }> }) { const { q } = await searchParams; }`

## Nextra 4 Conventions

- **Content directory**: MDX documentation files live in `src/content/`, NOT in `src/app/`. The `contentDirBasePath: '/docs'` in `next.config.ts` maps them to the `/docs` URL path.
- **Catch-all route**: `src/app/(docs)/docs/[[...mdxPath]]/page.tsx` renders content from `src/content/`
- **Sidebar ordering and titles** are controlled by `_meta.js` files in each content directory
- **Frontmatter** in MDX files defines page metadata (title, description)
- **Search** is powered by Pagefind — runs as a `postbuild` script
- **Syntax highlighting** uses Shiki — supports all languages out of the box, no extra config
- **Adding a new doc page** = create a new `.mdx` file in the appropriate `src/content/` subdirectory + add it to the corresponding `_meta.js`
- **Custom components** can be used inside MDX via the `mdx-components.tsx` file at the project root

### Route Groups

The site uses two Next.js route groups:

- **`(home)/`** — Landing page. Minimal layout with ThemeProvider, no Nextra sidebar/chrome.
- **`(docs)/`** — Documentation pages. Nextra Layout with sidebar, search, navigation, and footer.

The root `layout.tsx` only provides `<html>`, fonts, and `globals.css` — shared by both groups.

### Content Workflow

1. Create/edit an `.mdx` file in the appropriate `src/content/` subdirectory
2. Add the filename (without extension) as a key in the directory's `_meta.js`
3. Push to GitHub
4. Redeploy — documentation is updated

## Design System

- **Primary color:** `#00D4AA` (bright teal-green, light) / `#00B894` (dark)
- **Accent color:** `#6C5CE7` (purple, light) / `#A29BFE` (dark)
- **Font:** Geist Sans + Geist Mono (loaded from `next/font/google`)
- **Theme:** Light/dark mode via `next-themes` with `attribute="class"`
- **Code blocks:** Shiki syntax highlighting with Go as the primary highlighted language

## Directory Structure

```
src/
  app/
    layout.tsx              # Root layout (fonts, html, body)
    globals.css             # Tailwind + brand colors
    _meta.js                # Top-level nav config
    (home)/
      layout.tsx            # Landing page layout (ThemeProvider, no Nextra)
      page.tsx              # Landing page (hero, features, quick start)
    (docs)/
      layout.tsx            # Nextra Layout (sidebar, search, footer)
      docs/
        [[...mdxPath]]/
          page.tsx          # Catch-all MDX renderer
  content/                  # All documentation MDX files
    _meta.js
    index.mdx
    getting-started/
    guides/
    cli-reference/
      generate/
    api-reference/
  components/
    landing/                # Landing page components (hero, features, etc.)
  lib/                      # Utility functions
mdx-components.tsx          # MDX component overrides (project root)
next.config.ts              # Nextra wrapper config
```

## Conventions

- Use `'use client'` directive only on components that need client-side interactivity
- Prefer React Server Components where possible
- All MDX content should be clear, beginner-friendly, and accurate
- Code examples in documentation must use Go as the primary language
- Every code example must be complete and runnable — no truncated snippets with `...`
- Use Nextra's built-in components (Callout, Cards, Steps, Tabs, FileTree) for rich documentation formatting
- No inline styles — use Tailwind classes exclusively
- No `any` types — always provide proper TypeScript types

## Engineering Principles

- **No shortcuts or workarounds** — Never opt for the "simplest" or "easiest" fix. Always research the proper, sustainable solution by consulting documentation and community best practices, then implement the root-cause fix. Workarounds introduce tech debt and mask real problems.
- **Research before implementing** — When encountering an issue with a library or framework, search the official documentation and community resources to understand the correct approach. Do not guess or invent ad-hoc solutions.
- **Reliability over speed** — Every implementation must be reliable, sustainable, and optimizable. Quick hacks that "just work" are not acceptable.

## Debugging Rules

When debugging an issue, **never assume, guess, or speculate**. Follow this process strictly:

1. **Investigate first** — Read the actual code, trace the data flow, check configs, inspect logs/errors. Do not use words like "likely", "might be", "must be", "probably". Find the real root cause with evidence.
2. **Verify with facts** — Confirm the issue by reading the relevant source files, checking environment variables, verifying network endpoints, reading error messages literally. Every conclusion must be backed by code you have read.
3. **Create an implementation plan** — Once the root cause is confirmed with evidence, outline the exact fix with specific file paths and changes before writing any code.
4. **No shotgun debugging** — Do not try multiple speculative fixes hoping one works. One targeted fix based on confirmed root cause.
5. **Check the full chain** — When a feature doesn't work, trace the entire path: config → build → routing → rendering → client. Do not skip steps.
