# Contributing

This file covers how to contribute. The [README](./README.md) explains how the repo is laid out and how it's deployed.

## What's worth contributing

In rough order of how much it helps:

1. **Fixing something wrong.** A typo, a broken link, an example that doesn't compile, a flag that no longer exists. Open a pull request straight away; no need for an issue first.
2. **Fixing something unclear.** If a page lost you, open an issue that says where and why, even if you don't know what the fix is. We write for someone who knows Go but has never seen Gofasta, so your confusion is the signal we need.
3. **Filling a gap.** Open an issue describing what you were trying to do and couldn't find, so we can agree on where it goes before you write it.
4. **Site changes.** Design, components, build tooling. Open an issue first for anything bigger than a small fix, so you don't spend an evening on something we'd approach differently.

## Setting up

Fork the repo, clone your fork, then:

```bash
yarn install
yarn dev
```

You need Node 22 and Yarn 1. The site is at `http://localhost:3000`, the docs at `/docs`, the blog at `/blog`.

## Writing docs

Docs are MDX files under `src/content/`. Every page starts with frontmatter:

```mdx
---
title: Page title
description: One sentence. It shows up in search results and link previews.
---

# Page title
```

A new page also needs an entry in its folder's `_meta.js`, which controls the sidebar order and title.

Some things we hold to:

- Examples run. Every code block should be complete and copy-pasteable; no `...` where real code would go.
- Go for code, bash for commands, YAML for config, SQL or GraphQL for queries. Nothing else unless the page is about it.
- Say it once, then stop. Link to the page that explains the rest instead of repeating it.
- Every `gofasta …` command in a shell block is checked against the CLI's real commands and flags at build time. If `yarn build` fails on a command you wrote, the command is wrong, not the check.

## Writing a blog post

Posts live in `data/blog/` and are edited through Keystatic at `/keystatic` on your dev server, which writes the MDX file for you and handles the cover image. Posts are reviewed as pull requests like everything else. The README has the details on drafts and scheduling.

## Before you open the pull request

Run what CI runs:

```bash
yarn lint
npx tsc --noEmit
yarn test
yarn build
```

`yarn test` enforces 100% coverage on `src/lib` and `src/components`, so a new component needs a test next to it. Docs-only changes don't touch coverage; `yarn build` is the check that matters for them.

Then:

- Branch from `main` and keep one change per pull request.
- Write a commit message that says what changed and why. "Fix typo" is fine for a typo. For anything else, a sentence of reasoning saves the reviewer guessing.
- If it closes an issue, say `Fixes #123` in the description.

Pull requests get a Vercel preview, so you can check your change rendered the way you expected before anyone reviews it.

## Security

If you've found a security problem, don't open an issue. See [SECURITY.md](./SECURITY.md).

## License

By contributing you agree that your work is released under the [MIT License](./LICENSE), the same as the rest of the repo.
