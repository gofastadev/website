# Operating the site

Maintainer notes: deploys, the optional integrations and their one-time setup, how blog posts get published, and the CLI snapshot the docs are checked against. Contributors don't need any of this; see the [README](../README.md).

## Deploys

Vercel deploys `main` to production and builds a preview for every pull request. Previews show draft posts; production hides them. The `Dockerfile` produces a standalone image for running the site elsewhere. It behaves like production, drafts hidden.

## Integrations

Each one is off until its variables are set. `NEXT_PUBLIC_*` values are inlined at build time, so a change needs a redeploy. Set them in Vercel for Production, and for Preview only where you want the feature on previews too.

| Variable | Turns on |
|---|---|
| `NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG`, `KEYSTATIC_GITHUB_CLIENT_ID`, `KEYSTATIC_GITHUB_CLIENT_SECRET`, `KEYSTATIC_SECRET` (32+ characters) | the blog editor on production; without all four, `/keystatic` is a 404 outside `yarn dev` |
| `NEXT_PUBLIC_GISCUS_REPO`, `NEXT_PUBLIC_GISCUS_REPO_ID`, `NEXT_PUBLIC_GISCUS_CATEGORY`, `NEXT_PUBLIC_GISCUS_CATEGORY_ID` | comments under posts, through [giscus](https://giscus.app) |
| `NEXT_PUBLIC_BUTTONDOWN_USERNAME` | the newsletter form, through Buttondown |
| `NEXT_PUBLIC_GA4_MEASUREMENT_ID`, `NEXT_PUBLIC_CLARITY_PROJECT_ID` | analytics; production only, or preview traffic pollutes the numbers |
| `VERCEL_DEPLOY_HOOK_URL` (GitHub Actions secret, not a Vercel variable) | the daily rebuild that publishes scheduled posts |

## Blog editor setup

Keystatic needs a GitHub App once.

1. Run `NEXT_PUBLIC_KEYSTATIC_STORAGE=github yarn dev` and open `http://localhost:3000/keystatic`. The wizard creates the app and writes the four Keystatic variables to `.env`.
2. In the app's settings on GitHub, set the callback URL to `https://gofasta.dev/api/keystatic/github/oauth/callback` (add the preview domain too if you want to edit on previews), then install the app on `gofastadev/website`.
3. Copy the four variables into Vercel and redeploy.

Without that, `yarn dev` runs Keystatic in local mode, which edits the files in your checkout directly.

## Blog posts

Keystatic runs in two modes. Under `yarn dev` without the GitHub App it edits `data/blog/` in the checkout directly. With the app configured it commits to a `keystatic/…` branch and opens a pull request for each save. CI validates every post's frontmatter (`src/lib/blog-content.test.ts`), so a broken post fails the pull request instead of silently disappearing from the site.

How a post becomes visible:

| State | Production | Previews and `yarn dev` |
|---|---|---|
| `draft: true` | hidden everywhere, including the sitemap, feeds and `llms.txt` | shown |
| `publishedAt` in the future | hidden until the first rebuild after that date | hidden |
| published | shown | shown |

Any build that isn't a Vercel preview or `next dev` hides drafts: Vercel production, the Docker image and a local `next build` alike.

To schedule a post, un-draft it and set a future *Published at*; the time is entered in UTC. It goes live within a day of that date, not at the exact minute, because publishing depends on the daily rebuild below.

## Scheduled posts

The `Scheduled publish` workflow runs at 06:00 UTC daily. If a post's `publishedAt` has passed since the last run, it calls the Vercel deploy hook to rebuild production and then runs `scripts/submit-indexnow.mjs`, which waits for the new page to appear in the sitemap before notifying IndexNow and WebSub. Create the hook under Vercel → Settings → Git → Deploy Hooks for `main`, and store its URL as the `VERCEL_DEPLOY_HOOK_URL` repository secret.

The `Notify search engines` workflow does the same notification for posts changed in a push to `main`. Google doesn't use IndexNow; it finds posts through `sitemap.xml`, which only needs submitting once in Search Console.

## Refreshing the CLI facts snapshot

Every `gofasta …` command in the docs' shell code blocks is validated by `scripts/check-cli-docs.mjs` against `src/data/cli-facts.json`, a snapshot of the CLI's commands and flags. The snapshot is pinned to the CLI version in `.cli-version`, and CI's `docs-check` job installs that exact version and fails if the snapshot has drifted from it.

When a new CLI version ships, install it, then:

```bash
gofasta facts --json | node scripts/sync-cli-facts.mjs
```

and set `.cli-version` to the new version. Commit both together; the check refuses a pair that doesn't match.

## Analytics and consent

The site has a cookie banner and a `/cookies` page. Google Analytics loads with Consent Mode v2 set to denied, so until a visitor accepts it sends cookieless aggregate pings only. Microsoft Clarity isn't loaded at all until they accept, and declining or revoking later removes it from the page. The implementation is in `src/components/atoms/analytics.tsx` and `src/contexts/consent-context.tsx`.
