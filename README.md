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

One thing to know: every `gofasta …` command inside a shell code block is validated against `src/data/cli-facts.json`, a snapshot of the CLI's commands and flags pinned to the version in `.cli-version`. Document a flag that doesn't exist and `yarn build` fails with the file and line. When a new CLI version ships, install it and refresh the snapshot:

```bash
gofasta facts --json | node scripts/sync-cli-facts.mjs
```

then bump `.cli-version` to match.

## Writing for the blog

Open `/keystatic` on a dev server. Locally it edits the files in `data/blog/` directly. On production it runs against GitHub, and every save opens a pull request from a `keystatic/…` branch, so a post gets reviewed like any other change. CI validates the frontmatter of every post, and the Vercel preview of the pull request renders it, drafts included.

How a post becomes visible:

| State | Production | Previews and `yarn dev` |
|---|---|---|
| `draft: true` | hidden everywhere, including the sitemap, feeds and `llms.txt` | shown |
| `publishedAt` in the future | hidden until the first rebuild after that date | hidden |
| published | shown | shown |

To schedule a post, un-draft it and set a future *Published at* (in UTC). A workflow runs every day at 06:00 UTC, triggers a production rebuild when a date has arrived, and tells search engines about the new page. So a scheduled post goes live within a day of its date, not at the exact minute.

## Before you open a pull request

CI runs exactly these, so running them locally saves a round trip:

```bash
yarn lint
npx tsc --noEmit
yarn test          # vitest; coverage must stay at 100% for src/lib and src/components
yarn build         # also runs the docs and image checks, then builds the search index
```

The 100% coverage rule only applies to `src/lib` and `src/components`. If you add a component, add its test next to it. Pages under `src/app` aren't measured.

Branch from `main`, keep one change per pull request, and say what you changed and why in the description. More in [CONTRIBUTING.md](./CONTRIBUTING.md); for anything security-related, please follow [SECURITY.md](./SECURITY.md) instead of opening an issue. The [code of conduct](./CODE_OF_CONDUCT.md) applies to issues, pull requests and reviews alike.

## Deploys and configuration

Vercel deploys `main` to production and builds a preview for every pull request. The `Dockerfile` produces a standalone image if you want to run the site somewhere else; it behaves like production, so drafts are hidden there too.

The features below switch on only when their variables are set. Nothing here is needed to run the site locally or to contribute.

| Variable | Turns on |
|---|---|
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` (32+ characters) | the blog editor on production; without all four, `/keystatic` is a 404 outside `yarn dev` |
| `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`, `NEXT_PUBLIC_GISCUS_CATEGORY`, `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | comments under posts, through [giscus](https://giscus.app) |
| `NEXT_PUBLIC_BUTTONDOWN_USERNAME` | the newsletter form, through Buttondown |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` | analytics; set these on production only |
| `VERCEL_DEPLOY_HOOK_URL` (GitHub Actions secret) | the daily rebuild for scheduled posts |

`NEXT_PUBLIC_*` values are baked in at build time, so a change needs a redeploy.

To set up the blog editor for the first time, run `NEXT_PUBLIC_KEYSTATIC_STORAGE=github yarn dev`, open `/keystatic` and let the wizard create the GitHub App; it writes the four Keystatic variables to `.env`. Give the app `https://gofasta.dev/api/keystatic/github/oauth/callback` as its callback URL, install it on this repo, and copy the variables into Vercel.

On analytics and consent: the site ships a cookie banner and a `/cookies` page. Google Analytics loads with Consent Mode v2 set to denied, so it sends cookieless aggregate pings only until a visitor accepts. Microsoft Clarity isn't loaded at all until they do. Declining or revoking later removes Clarity from the page. All of this is in `src/components/atoms/analytics.tsx` and `src/contexts/consent-context.tsx`.

## License

MIT. See [LICENSE](./LICENSE).
