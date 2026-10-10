# Gofasta Website

[![CI](https://github.com/gofastadev/website/actions/workflows/ci.yml/badge.svg)](https://github.com/gofastadev/website/actions/workflows/ci.yml) [![CodeQL](https://github.com/gofastadev/website/actions/workflows/codeql.yml/badge.svg)](https://github.com/gofastadev/website/actions/workflows/codeql.yml) [![codecov](https://codecov.io/gh/gofastadev/website/graph/badge.svg)](https://codecov.io/gh/gofastadev/website) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/gofastadev/website/blob/main/LICENSE) [![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org) [![Nextra](https://img.shields.io/badge/Nextra-4-000?logo=nextra)](https://nextra.site) [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com) [![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)](https://gofasta.dev)

The source of [gofasta.dev](https://gofasta.dev): the docs and the blog for Gofasta, a Go backend toolkit. The toolkit itself lives in two other repos, [`gofasta`](https://github.com/gofastadev/gofasta) (the library) and [`cli`](https://github.com/gofastadev/cli) (the `gofasta` binary). Changes to the code the docs describe go there; changes to the words, the pages or the site go here.

Most contributions here are small: a typo, an example that doesn't compile, a guide that assumes too much. Those are the ones we want most. The docs are written for someone who knows Go but has never seen Gofasta, so if a page lost you, that's a bug, and an issue saying "this confused me" is a real contribution.

## Running it

You need Node 22 and Yarn 1 (the lockfile is `yarn.lock` v1).

```bash
yarn install
yarn dev
```

That's `http://localhost:3000` for the landing page, `/docs` for the docs and `/blog` for the blog. `docker compose up` does the same inside a container if you'd rather not install Node.

## Where things are

| Path | What's in it |
|---|---|
| `src/content/` | Every docs page, as MDX. Each folder has a `_meta.js` that sets sidebar order and titles. |
| `data/blog/` | Blog posts, one MDX file per post, with the cover images under `public/blog/`. |
| `src/app/` | Next.js routes: `(home)` is the landing page and blog, `(docs)` renders the MDX through Nextra, `keystatic/` is the blog editor. |
| `src/components/` | UI, grouped as `atoms/`, `molecules/`, `organisms/`, `templates/`. |
| `src/lib/` | The non-UI code: blog loading, feeds, SEO, structured data. |
| `scripts/` | Build-time scripts: SEO images, `llms.txt`, image budgets and the CLI docs check. |

## Editing the docs

Add a page by creating the `.mdx` file in the right folder under `src/content/`, giving it `title` and `description` frontmatter, and adding its key to that folder's `_meta.js`. Pages missing from `_meta.js` still render but land alphabetically at the end of the sidebar.

Every `gofasta …` command inside a shell code block is checked at build time against the CLI's real commands and flags, so a flag that doesn't exist fails `yarn build` with the file and line. Fix the command, not the check.

## Writing for the blog

Posts are MDX files in `data/blog/`, edited through Keystatic at `/keystatic` on a dev server. On production the editor opens a pull request for every save, so posts are reviewed like any other change, and the pull request's preview renders them, drafts included. Drafts, scheduling and publishing are covered in [docs/operations.md](./docs/operations.md#blog-posts).

## Before you open a pull request

CI runs exactly these, so running them locally saves a round trip:

```bash
yarn lint
npx tsc --noEmit
yarn test
yarn build
```

Details on tests, coverage and pull requests are in [CONTRIBUTING.md](./CONTRIBUTING.md). For anything security-related, follow [SECURITY.md](./SECURITY.md) instead of opening an issue. The [code of conduct](./CODE_OF_CONDUCT.md) applies to issues, pull requests and reviews alike.

## Deploys

Vercel deploys `main` to production and builds a preview for every pull request, so you can see your change rendered before anyone reviews it.

Comments, the newsletter form, analytics and the production blog editor are switched on by environment variables that only exist on the deployed site. Locally they're off, which is expected, not something missing from your setup. How they're configured is in [docs/operations.md](./docs/operations.md).

## License

MIT. See [LICENSE](./LICENSE).
