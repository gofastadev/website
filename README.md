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

## Maintenance and sustainability

Gofasta is currently maintained by one person; sustainability planning — release cadence, security SLOs, the solo-to-team transition, and the automation arc that retires manual steps as the project matures — is documented in the [release coordination repo](https://github.com/gofastadev/release), specifically in [`CADENCE.md`](https://github.com/gofastadev/release/blob/main/CADENCE.md), [`RELEASING.md`](https://github.com/gofastadev/release/blob/main/RELEASING.md), and [`COMMUNITY.md`](https://github.com/gofastadev/release/blob/main/COMMUNITY.md). Read those three together for the full picture.

## License

MIT
