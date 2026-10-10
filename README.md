# Gofasta Website

[![CI](https://github.com/gofastadev/website/actions/workflows/ci.yml/badge.svg)](https://github.com/gofastadev/website/actions/workflows/ci.yml) [![CodeQL](https://github.com/gofastadev/website/actions/workflows/codeql.yml/badge.svg)](https://github.com/gofastadev/website/actions/workflows/codeql.yml) [![codecov](https://codecov.io/gh/gofastadev/website/graph/badge.svg)](https://codecov.io/gh/gofastadev/website) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/gofastadev/website/blob/main/LICENSE) [![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org) [![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com) [![Nextra](https://img.shields.io/badge/Nextra-4-000?logo=nextra)](https://nextra.site) [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://gofasta.dev)

The official documentation website for [Gofasta](https://gofasta.dev) — a Go backend toolkit. Live at **[gofasta.dev](https://gofasta.dev)**. This is the source for every page on the docs site.

## The Gofasta project

Gofasta is split across three independent repositories. Each has its own release cycle and `go.mod` / `package.json`.

| Repo | Role |
|------|------|
| [`gofastadev/website`](https://github.com/gofastadev/website) | **You are here.** The docs site at **[gofasta.dev](https://gofasta.dev)**. |
| [`gofastadev/cli`](https://github.com/gofastadev/cli) | The `gofasta` binary — `gofasta new`, code generation, and the dev loop. |
| [`gofastadev/gofasta`](https://github.com/gofastadev/gofasta) | The library your project imports — every package under `pkg/*`. |

For the rendered docs themselves, visit **[gofasta.dev](https://gofasta.dev)**. This README covers running and contributing to the site itself.

## What This Repo Contains

This is the source code for the Gofasta documentation site. It is built with [Next.js 16.2](https://nextjs.org) and [Nextra 4](https://nextra.site), a documentation framework that turns MDX files into pages with sidebar navigation, full-text search, and syntax highlighting.

The site has two parts:

- **Landing page** (`/`) — A custom React page with a hero section, feature grid, and quick start guide
- **Documentation** (`/docs`) — Guides, CLI reference, and gofasta library API documentation, all written in MDX. See the [Documentation Sections](#documentation-sections) table at the bottom of this README for the layout.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| [Next.js 16.2](https://nextjs.org) | React framework (App Router, Turbopack, React Compiler) |
| [Nextra 4](https://nextra.site) | Documentation framework (MDX routing, sidebar, search) |
| [React 19](https://react.dev) | UI library |
| [TypeScript](https://www.typescriptlang.org) | Type safety |
| [Tailwind CSS 4](https://tailwindcss.com) | Styling |
| [Pagefind](https://pagefind.app) | Static full-text search |
| [Shiki](https://shiki.matsu.io) | Syntax highlighting (Go, bash, YAML, SQL, GraphQL) |

## Development Setup

### Prerequisites

- [Node.js 22](https://nodejs.org) or later
- [Yarn](https://yarnpkg.com) package manager
- [Docker](https://www.docker.com) (optional, for containerized development)

### Local Development

```bash
# Clone the repo
git clone https://github.com/gofastadev/website.git
cd website

# Install dependencies
yarn install

# Start the dev server
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) to see the landing page, and [http://localhost:3000/docs](http://localhost:3000/docs) for the documentation.

### Docker Development

```bash
# Start the dev server in a container
docker compose up

# Install dependencies inside the container
docker exec -it <container_name> sh
yarn add <package>
```

### Build for Production

```bash
yarn build    # Compiles the site (Pagefind search index runs automatically via postbuild)
yarn start    # Serves the production build locally
```

## Project Structure

```
website/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── layout.tsx                # Root layout (fonts, globals.css)
│   │   ├── globals.css               # Tailwind + brand colors
│   │   ├── _meta.js                  # Top-level navigation config
│   │   ├── (home)/                   # Landing page (no Nextra sidebar)
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   └── (docs)/                   # Documentation (Nextra sidebar + search)
│   │       ├── layout.tsx
│   │       └── docs/[[...mdxPath]]/
│   │           └── page.tsx          # Catch-all that renders MDX content
│   ├── content/                      # All documentation MDX files
│   │   ├── _meta.js                  # Sidebar section ordering
│   │   ├── index.mdx                 # /docs overview
│   │   ├── getting-started/          # Introduction, installation, quick start
│   │   ├── guides/                   # REST, GraphQL, auth, deployment, etc.
│   │   ├── cli-reference/            # Every CLI command
│   │   │   └── generate/             # Code generation subcommands
│   │   └── api-reference/            # Every gofasta library package
│   └── components/
│       └── landing/                  # Landing page components
├── mdx-components.tsx                # MDX component overrides
├── next.config.ts                    # Nextra + Next.js config
├── Dockerfile                        # Production container
├── compose.yaml                      # Docker Compose for development
└── package.json
```

## Adding Documentation

### Add a new page

1. Create a `.mdx` file in the appropriate `src/content/` subdirectory:

   ```bash
   # Example: add a "WebSocket" guide
   touch src/content/guides/websocket.mdx
   ```

2. Add frontmatter and content:

   ```mdx
   ---
   title: WebSocket
   description: Real-time communication with WebSocket support.
   ---

   # WebSocket

   Your content here...
   ```

3. Add the page to the sidebar by editing the directory's `_meta.js`:

   ```js
   // src/content/guides/_meta.js
   export default {
     // ... existing entries
     websocket: "WebSocket",
   };
   ```

4. Push to GitHub. The CI pipeline builds and deploys automatically.

### Sidebar ordering

Each directory under `src/content/` has a `_meta.js` file that controls the sidebar order and display names:

```js
export default {
  introduction: "Introduction",      // key = filename without .mdx
  installation: "Installation",      // value = sidebar display name
  "quick-start": "Quick Start",
};
```

Pages not listed in `_meta.js` appear alphabetically at the end.

### Using Nextra components in MDX

Nextra provides built-in components you can use in any MDX file without importing:

- `Callout` — Info, warning, and error boxes
- `Steps` — Numbered step-by-step instructions
- `Tabs` / `Tab` — Tabbed content sections
- `Cards` / `Card` — Linked card grids
- `FileTree` — File/directory tree visualization

## Documentation Sections

| Section | Path | Description |
|---------|------|-------------|
| Getting Started | `content/getting-started/` | Introduction, installation, quick start, project structure |
| Guides | `content/guides/` | REST, GraphQL, auth, database, deployment, etc. |
| CLI Reference | `content/cli-reference/` | Every top-level CLI command, plus the `generate/` subcommand subdirectory |
| Library API | `content/api-reference/` | Package-by-package reference for every `pkg/*` in the gofasta library |

The page set grows with the library and CLI — see [gofasta.dev/docs](https://gofasta.dev/docs) for the live count via the sidebar.

## Blog

Posts live in `data/blog/<slug>.mdx` and are written in the Keystatic editor at `/keystatic`. Each save opens a pull request on a `keystatic/…` branch. CI validates every post (`src/lib/blog-content.test.ts`), and the Vercel preview deploy renders the post, drafts included, for review. Merging publishes it.

### How visibility works

| Post state | Production | Preview deploys and `next dev` |
|---|---|---|
| `draft: true` | hidden everywhere (pages, sitemap, feeds, tags, search, `llms.txt`) | shown |
| future `publishedAt` | hidden until the first rebuild after that date | hidden |
| published | shown | shown |

Any build that is not a Vercel preview and not `next dev` hides drafts. That covers Vercel production, Docker images and a local `next build`.

**Scheduling.** Uncheck Draft and set a future *Published at* (entered in UTC). The `Scheduled publish` workflow runs daily at 06:00 UTC. When a post's date has arrived, it triggers a production rebuild through a Vercel Deploy Hook and notifies search engines. A post therefore goes live within a day of its date.

**Search engines.** The `Notify search engines` workflow submits newly public or edited posts to IndexNow (Bing and others) and pings WebSub after each push to `main`. It polls the production sitemap until the deploy is live. Google discovers posts through `sitemap.xml`; submit it once in Search Console.

### Configuration

Set these in Vercel (Production scope, plus Preview if you want to edit or review there). `NEXT_PUBLIC_*` values are inlined at build time, so redeploy after changing them.

| Variable | Feature | When unset |
|---|---|---|
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG` | Keystatic in GitHub mode | the editor runs in local mode, which is available under `next dev` only |
| `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` (32+ chars) | Keystatic OAuth | `/keystatic` and `/api/keystatic` return 404 outside `next dev` |
| `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`, `NEXT_PUBLIC_GISCUS_CATEGORY`, `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | comments (giscus.app) | no comments section |
| `NEXT_PUBLIC_BUTTONDOWN_USERNAME` | newsletter signup (Buttondown) | no signup form |

Repository secret: `VERCEL_DEPLOY_HOOK_URL`. Create it under Vercel → Settings → Git → Deploy Hooks, for the `main` branch. It is needed for scheduled posts.

### One-time Keystatic setup

1. Run `NEXT_PUBLIC_KEYSTATIC_STORAGE=github yarn dev` and open `http://localhost:3000/keystatic`. Follow the wizard to create the GitHub App, which writes the four Keystatic variables to `.env`.
2. In the GitHub App settings, add the callback URL `https://gofasta.dev/api/keystatic/github/oauth/callback` (plus your preview domain if you edit on previews). Install the app on `gofastadev/website`.
3. Copy the four variables from `.env` into Vercel and redeploy.

Without step 1, `yarn dev` uses local storage, which edits the files in your checkout directly.

## Analytics

The site supports two complementary analytics integrations: **Google Analytics 4** for aggregate behavior metrics, and **Microsoft Clarity** for session replay + heatmaps. Each is opt-in via its own environment variable; when an env var is unset (the default for local development) the corresponding `<script>` tag is not rendered and no third-party domain is contacted.

Both load through `next/script` with `strategy="afterInteractive"`, so they fire after hydration and never affect FCP / LCP / CLS metrics. The integration is in `src/components/atoms/analytics.tsx`.

### Configuration

Set the env vars in your deployment environment (Vercel project settings, `.env.production`, etc.):

| Variable | Source | Format |
|---|---|---|
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID` | Google Analytics → Admin → Data Streams → your stream → Measurement ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_CLARITY_PROJECT_ID` | Microsoft Clarity → Settings → Setup → Project ID | 10-character lowercase string |

Both must be `NEXT_PUBLIC_*` so Next inlines them at build time. **Don't** set them for preview / dev environments — analytics from non-production traffic muddies your real metrics.

### What each tool gives you

- **GA4** — pageviews, sessions, traffic sources, conversion funnels, retention cohorts. Use this to answer *"how many people landed on `/docs/cli-reference/dev` last month"* or *"what's the conversion rate from `/` to `/docs/getting-started/quick-start`"*.
- **Clarity** — session replay, heatmaps, scroll depth, dead-click detection, rage-click detection. Use this to answer *"why are users bouncing from this page"* or *"what's the most-clicked section in the hero"*. Free, no session caps, no sampling.

### GDPR / CCPA caveat

This integration loads analytics scripts unconditionally when the env vars are set. Sites serving traffic from regions that require prior consent (EU under GDPR, California under CPRA, etc.) need a consent banner that gates these scripts until the user opts in. Implementing that banner is **out of scope for this integration** — it would mean adding a consent UI, a state machine for the user's choice, and conditional rendering of `<Analytics />`. Track it as a separate task before going live for EU traffic.

The minimum-viable path if you need basic compliance fast:
1. Add a cookie banner (`react-cookie-consent`, `cookie-consent`, or build one).
2. Set GA4 to "consent denied" by default via `gtag('consent', 'default', { analytics_storage: 'denied' })`.
3. Update the consent state on user opt-in via `gtag('consent', 'update', { analytics_storage: 'granted' })`.
4. For Clarity, use Clarity's [consent API](https://learn.microsoft.com/en-us/clarity/setup-and-installation/cookie-consent).

## Performance measurement

Run Lighthouse against the running dev or production server to measure SEO, performance, accessibility, and best-practices scores. Use these commands; the JSON output is gitignored so repeat runs don't pollute the working tree.

```bash
# 1. Boot the server you want to measure.
yarn dev                           # dev mode (slower, hot-reload overhead expected)
# OR
yarn build && yarn start           # production build (the real number)

# 2. In another terminal, run Lighthouse against the URLs you care about.
npx --yes lighthouse@12 http://localhost:3000/ \
  --output=json --output-path=./lighthouse-home.json \
  --only-categories=performance,seo,accessibility,best-practices \
  --chrome-flags="--headless --no-sandbox" --quiet

npx --yes lighthouse@12 http://localhost:3000/docs/cli-reference/dev \
  --output=json --output-path=./lighthouse-docs-deep.json \
  --only-categories=performance,seo,accessibility,best-practices \
  --chrome-flags="--headless --no-sandbox" --quiet

# 3. Read the scores.
node -e "for (const f of process.argv.slice(1)) {
  const r = require('./' + f);
  console.log(f);
  for (const k of ['performance','seo','accessibility','best-practices'])
    console.log(' ', k.padEnd(15), Math.round((r.categories[k]?.score ?? 0) * 100));
}" lighthouse-home.json lighthouse-docs-deep.json
```

### Reference scores (production build)

Recorded against `yarn build && yarn start` on a 2024-class M-series Mac. Lighthouse uses mobile emulation by default (4G + 4× CPU throttle), so real desktop visitors will see better numbers than these.

| URL | Performance | SEO | Accessibility | Best Practices |
|---|---|---|---|---|
| `/` (landing) | 95 | 100 | 96 | 100 |
| `/docs/cli-reference/dev` (sample doc) | 75 | 100 | 100 | 100 |

The home page hits target. The doc-page performance gap is dominated by Nextra v4's client-side hydration (sidebar, search, ToC) — a known characteristic of the framework, not gofasta-side code. The metric that suffers is *Render Delay* in the LCP breakdown (~12s on mobile-throttled localhost), which translates to ~2–3s on real desktop. Optimizing Nextra hydration would be a deeper architectural project; defer until/unless real-user metrics from production justify it.

### Known accepted trade-offs

- **`color-contrast` audit on the landing's ambient code spans** (`gofasta-code-breath`). The spans are decorative atmosphere set inside an `aria-hidden="true"` parent, with each span individually marked `aria-hidden="true"` as well. Lighthouse / axe-core still flags them because contrast checks run on visually-rendered text regardless of `aria-hidden` (the rule is about low-vision sighted users, not screen readers). The contrast is design-intentional. Score impact: −4 on accessibility for the home page.
- **`unused-javascript`** opportunities (~450ms on home, ~600ms on docs). Most of this is Next.js / Nextra runtime code that is genuinely loaded; some is React Compiler emit. Aggressively code-splitting beyond what Next does by default usually trades one Lighthouse number for another.

## Maintenance and sustainability

Gofasta is currently maintained by one person; sustainability planning — release cadence, security SLOs, the solo-to-team transition, and the automation arc that retires manual steps as the project matures — is documented in the [release coordination repo](https://github.com/gofastadev/release), specifically in [`CADENCE.md`](https://github.com/gofastadev/release/blob/main/CADENCE.md), [`RELEASING.md`](https://github.com/gofastadev/release/blob/main/RELEASING.md), and [`COMMUNITY.md`](https://github.com/gofastadev/release/blob/main/COMMUNITY.md). Read those three together for the full picture.

## Contributing

Contributions are welcome — see [CONTRIBUTING.md](./CONTRIBUTING.md).

## License

MIT
