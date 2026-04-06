# Contributing to the Gofasta Website

Thank you for your interest in contributing to the Gofasta documentation! This document explains how to get started.

## Ways to Contribute

- **Fix typos or unclear explanations** — The most common and valuable contribution.
- **Add missing documentation** — Many pages are stubs waiting for content.
- **Improve code examples** — Make them more complete, accurate, or beginner-friendly.
- **Report issues** — Open an issue if you find broken links, incorrect information, or confusing sections.
- **Suggest new pages** — Open an issue describing what documentation is missing and why.

## Development Setup

1. **Fork and clone** the repository:

   ```bash
   git clone https://github.com/YOUR_USERNAME/website.git
   cd website
   ```

2. **Install dependencies** (requires Node.js 22+):

   ```bash
   yarn install
   ```

3. **Start the dev server:**

   ```bash
   yarn dev
   ```

4. **Open** [http://localhost:3000/docs](http://localhost:3000/docs) to see your changes.

## Writing Documentation

All documentation lives in `src/content/` as `.mdx` files. MDX is Markdown with JSX support — you write normal Markdown and can embed React components when needed.

### Page structure

Every MDX file starts with frontmatter:

```mdx
---
title: Page Title
description: A one-line description shown in search results and meta tags.
---

# Page Title

Your content here...
```

### Adding a new page

1. Create the `.mdx` file in the appropriate directory under `src/content/`
2. Add an entry to the directory's `_meta.js` file for sidebar ordering
3. Write the content

### Content guidelines

- **Be beginner-friendly** — Assume the reader is new to Gofasta but knows Go basics.
- **Show complete examples** — Every code block should be runnable. No `...` truncation.
- **Use Go as the primary language** — Code examples should be in Go unless demonstrating CLI commands (bash), configuration (YAML), or queries (SQL/GraphQL).
- **Link to related pages** — Help readers discover related documentation.
- **Keep it concise** — Say what needs to be said, then stop.

### Using Nextra components

You can use these built-in components without importing them:

- `Callout` — Highlight important information
- `Steps` — Numbered step-by-step instructions
- `Tabs` / `Tab` — Show alternatives side by side
- `FileTree` — Visualize directory structures

## Making Changes

1. **Create a branch** from `main`:

   ```bash
   git checkout -b fix-auth-docs
   ```

2. **Make your changes.**

3. **Verify the build passes:**

   ```bash
   yarn build
   ```

4. **Commit** with a clear message:

   ```
   docs: clarify JWT token refresh flow in authentication guide

   The previous example didn't show how to handle expired tokens.
   Added a complete Go code example with error handling.
   ```

5. **Push and open a pull request** against `main`.

## Pull Request Guidelines

- Keep PRs focused — one logical change per PR.
- If you're adding a new page, include it in the sidebar (`_meta.js`).
- Verify `yarn build` passes before requesting review.
- If your PR addresses an issue, reference it: `Fixes #123`.

## Reporting Security Issues

If you discover a security issue, **do not open a public issue.** See [SECURITY.md](SECURITY.md) for instructions.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
