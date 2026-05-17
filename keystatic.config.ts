import { config, fields, collection } from "@keystatic/core";

// Keystatic editor config for the Gofasta blog.
//
// Storage mode is capability-conditional, not environment-conditional:
// if every GitHub OAuth env var is present, we use `github` (PR mode
// with a `keystatic/` branch prefix); otherwise we fall back to
// `local` so builds without secrets (CI, dev, preview deploys
// without the OAuth app linked) still succeed.
//
// Required env vars for github mode (Vercel Production scope):
//   KEYSTATIC_GITHUB_CLIENT_ID
//   KEYSTATIC_GITHUB_CLIENT_SECRET
//   KEYSTATIC_SECRET
//   NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG
//
// All Keystatic-flavored MDX disallows `import` and raw HTML tags;
// custom components must be passed at render time (see
// `src/lib/blog-mdx-components.tsx`).

const hasGithubCredentials =
  Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_ID) &&
  Boolean(process.env.KEYSTATIC_GITHUB_CLIENT_SECRET) &&
  Boolean(process.env.KEYSTATIC_SECRET);

export default config({
  storage: hasGithubCredentials
    ? {
        kind: "github",
        repo: { owner: "gofastadev", name: "website" },
        // PR mode — saves open a Pull Request on a dedicated branch
        // instead of committing to main. Editorial review + preview
        // deploy per post.
        branchPrefix: "keystatic/",
      }
    : { kind: "local" },
  ui: {
    brand: { name: "Gofasta" },
  },
  collections: {
    posts: collection({
      label: "Blog posts",
      slugField: "title",
      path: "data/blog/*",
      format: { contentField: "body" },
      entryLayout: "content",
      schema: {
        draft: fields.checkbox({
          label: "Draft",
          description:
            "Drafts are excluded from the public blog, sitemap, RSS, JSON Feed, tag pages, and on-site search. Pair with a future Published date to schedule — the post will stay hidden until both Draft is unchecked AND the scheduled date passes.",
          defaultValue: false,
        }),
        title: fields.slug({
          name: { label: "Title" },
          slug: {
            label: "URL slug",
            description:
              "Auto-derived from the title — only edit if the URL needs to differ.",
          },
        }),
        description: fields.text({
          label: "Description",
          description:
            "1–2 sentences shown under the title and used as the meta description.",
          multiline: true,
          validation: { length: { min: 50, max: 200 } },
        }),
        publishedAt: fields.datetime({
          label: "Published at",
          description:
            "Posts dated in the future are hidden until the next deploy after that timestamp.",
        }),
        updatedAt: fields.datetime({
          label: "Updated at (optional)",
        }),
        author: fields.text({
          label: "Author name",
          defaultValue: "Gofasta Team",
        }),
        authorUrl: fields.url({
          label: "Author URL (optional)",
        }),
        tags: fields.array(
          fields.text({ label: "Tag" }),
          {
            label: "Tags",
            itemLabel: (props) => props.value || "Tag",
          },
        ),
        cover: fields.image({
          label: "Cover image",
          description: "1200×630 recommended. Saved under public/blog/covers/.",
          directory: "public/blog/covers",
          publicPath: "/blog/covers/",
          validation: { isRequired: true },
        }),
        body: fields.mdx({
          label: "Body",
          description:
            "Start at H2 — the post title (H1) is rendered above the body by the article header. Medium and Hashnode follow the same convention.",
          options: {
            // H1 is reserved for the post title, which the article header
            // renders from frontmatter. Allowing H1 in the body produces
            // a duplicate title on the rendered page.
            heading: [2, 3, 4, 5, 6],
            image: {
              directory: "public/blog/inline",
              publicPath: "/blog/inline/",
            },
          },
        }),
      },
    }),
  },
});
