import { config, fields, collection } from "@keystatic/core";

// Keystatic editor config for the Gofasta blog.
//
// Storage mode is environment-conditional:
//
//   - `local` in development → saves commit to the local working
//     tree, no auth required. Lets the team draft posts via the
//     Keystatic UI without round-tripping through GitHub.
//   - `github` in production → saves open a Pull Request against
//     the configured repo. The `branchPrefix` puts each post on a
//     dedicated `keystatic/<slug>` branch so each post is reviewed
//     independently, and Vercel issues a preview deploy per branch.
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

export default config({
  storage:
    process.env.NODE_ENV === "development"
      ? { kind: "local" }
      : {
          kind: "github",
          repo: { owner: "gofastadev", name: "website" },
          // PR mode — saves open a Pull Request on a dedicated branch
          // instead of committing to main. Editorial review + preview
          // deploy per post.
          branchPrefix: "keystatic/",
        },
  ui: {
    brand: { name: "Gofasta" },
  },
  collections: {
    posts: collection({
      label: "Blog posts",
      slugField: "title",
      path: "src/content/blog/*",
      format: { contentField: "body" },
      entryLayout: "content",
      schema: {
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
          options: {
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
