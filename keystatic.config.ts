import { config, fields, collection } from "@keystatic/core";
import {
  isKeystaticAccessible,
  resolveKeystaticStorageKind,
} from "./src/lib/keystatic-access";

// Keystatic editor config for the Gofasta blog.
//
// Storage mode comes from PUBLIC env vars only. This file is bundled into
// the browser as well as the API route, and Next.js inlines only
// `NEXT_PUBLIC_*` into client code — deciding from the server-only OAuth
// secrets made the admin UI run `local` while the API ran `github`.
//
//   NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG set  -> github (PR mode)
//   NEXT_PUBLIC_KEYSTATIC_STORAGE=github       -> github (first-time setup,
//                                                 before the slug exists)
//   neither                                    -> local (dev only)
//
// GitHub mode also needs, server-side:
//   KEYSTATIC_GITHUB_CLIENT_ID
//   KEYSTATIC_GITHUB_CLIENT_SECRET
//   KEYSTATIC_SECRET (at least 32 characters)
//
// All Keystatic-flavored MDX disallows `import` and raw HTML tags;
// custom components must be passed at render time (see
// `src/lib/blog-mdx-components.tsx`).

const storageKind = resolveKeystaticStorageKind({
  appSlug: process.env.NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG,
  storage: process.env.NEXT_PUBLIC_KEYSTATIC_STORAGE,
});

// Server-side gate shared by the /keystatic layout and the API route.
// Fails closed: local storage is unauthenticated and only ever served by
// `next dev`; github storage is served only when its secrets are present.
export function isKeystaticEnabled(): boolean {
  return isKeystaticAccessible({
    storageKind,
    clientId: process.env.KEYSTATIC_GITHUB_CLIENT_ID,
    clientSecret: process.env.KEYSTATIC_GITHUB_CLIENT_SECRET,
    secret: process.env.KEYSTATIC_SECRET,
    nodeEnv: process.env.NODE_ENV,
  });
}

export default config({
  storage:
    storageKind === "github"
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
            "Drafts are excluded from the public blog, sitemap, RSS, JSON Feed, tag pages, and on-site search — but stay visible on preview deploys so reviewers can read the post. To schedule, uncheck Draft and set a future Published date — a daily rebuild publishes the post within a day of that date.",
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
            "Entered in UTC. Posts dated in the future stay hidden until the first daily rebuild after that moment.",
          validation: { isRequired: true },
        }),
        updatedAt: fields.datetime({
          label: "Updated at (optional)",
        }),
        author: fields.text({
          label: "Author name",
          defaultValue: "Gofasta Team",
          validation: { length: { min: 1 } },
        }),
        authorUrl: fields.url({
          label: "Author URL (optional)",
        }),
        tags: fields.array(
          fields.text({ label: "Tag", validation: { length: { min: 1 } } }),
          {
            label: "Tags",
            itemLabel: (props) => props.value || "Tag",
          },
        ),
        series: fields.text({
          label: "Series (optional)",
          description:
            "Name of the multi-part series this post belongs to. Posts sharing the exact name are linked together on every part's page.",
        }),
        seriesPart: fields.integer({
          label: "Series part (optional)",
          description:
            "1-based position within the series. Required when Series is set — a part number without a series name fails CI on the Keystatic pull request.",
          validation: { min: 1 },
        }),
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
