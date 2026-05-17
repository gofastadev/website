import type { MetadataRoute } from "next";
import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { getAllPosts, getAllTags, getPostsByTag } from "@/lib/blog";
import { SITE_URL } from "@/lib/seo";

// getMdxPaths walks an MDX content directory and emits URL paths for
// every .mdx file under it. The mapping mirrors Nextra's content
// routing — `index.mdx` resolves to its parent slug, every other file
// resolves to its slug.
//
// `urlPrefix` is the URL-space root the directory maps to. For docs
// pass "/docs"; for the blog pass "/blog". Previously this prefix was
// hardcoded; making it a parameter is what lets the same walker
// power both surfaces from one source.
function getMdxPaths(
  dir: string,
  urlPrefix: string,
  basePath: string = "",
): string[] {
  const paths: string[] = [];
  if (!existsSync(dir)) return paths;
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      paths.push(...getMdxPaths(fullPath, urlPrefix, `${basePath}/${entry}`));
    } else if (entry.endsWith(".mdx")) {
      const slug = entry.replace(/\.mdx$/, "");
      const urlPath =
        slug === "index" && basePath === ""
          ? urlPrefix
          : slug === "index"
            ? `${urlPrefix}${basePath}`
            : `${urlPrefix}${basePath}/${slug}`;
      paths.push(urlPath);
    }
  }

  return paths;
}

// sitemap.xml — every page that should be discoverable by search
// engines. The home page is high priority; the section roots (`/docs`,
// `/blog`) sit one notch below; individual pages sit at 0.7. The HTML
// sitemap at /sitemap is a secondary discovery surface for humans.
//
// `lastModified` precision:
//   - Static pages + docs use the build timestamp (= deploy time), which
//     is a coherent freshness signal since every build is a deployment.
//   - Blog posts use frontmatter `updatedAt ?? publishedAt` — true
//     per-post freshness so crawlers can tell which posts actually
//     changed since the last sitemap fetch.
//   - Tag pages use the most recent post in that tag.
export default function sitemap(): MetadataRoute.Sitemap {
  const buildTime = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: buildTime,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/sitemap`,
      lastModified: buildTime,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const contentRoot = join(process.cwd(), "src", "content");

  // Docs: every MDX file under src/content/ — blog content lives at
  // the top-level `content/blog/` directory (outside Nextra's scan
  // path) so we don't filter the docs walker here.
  const docPaths = readdirSync(contentRoot)
    .filter(
      (entry) =>
        entry.endsWith(".mdx") ||
        statSync(join(contentRoot, entry)).isDirectory(),
    )
    .flatMap((entry) => {
      const fullPath = join(contentRoot, entry);
      if (statSync(fullPath).isDirectory()) {
        return getMdxPaths(fullPath, "/docs", `/${entry}`);
      }
      const slug = entry.replace(/\.mdx$/, "");
      return [slug === "index" ? "/docs" : `/docs/${slug}`];
    });

  const docPages: MetadataRoute.Sitemap = docPaths.map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: buildTime,
    changeFrequency: "weekly" as const,
    priority: path === "/docs" ? 0.9 : 0.7,
  }));

  // Blog: every published post → /blog/<slug>. Per-post lastModified
  // comes from frontmatter so crawlers can detect edits without a full
  // sitemap re-fetch loop.
  const posts = getAllPosts();
  const blogPages: MetadataRoute.Sitemap = [];
  if (posts.length > 0) {
    const newestPostDate = posts.reduce((latest, p) => {
      const d = new Date(p.updatedAt ?? p.publishedAt);
      return d > latest ? d : latest;
    }, new Date(0));
    blogPages.push({
      url: `${SITE_URL}/blog`,
      lastModified: newestPostDate,
      changeFrequency: "daily",
      priority: 0.9,
    });
    for (const post of posts) {
      blogPages.push({
        url: `${SITE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updatedAt ?? post.publishedAt),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  // Tag archives: discoverability win — previously absent from
  // sitemap.xml so crawlers found them only via internal links.
  // lastModified = most recent post carrying that tag.
  const tagPages: MetadataRoute.Sitemap = getAllTags().map(({ tag }) => {
    const tagPosts = getPostsByTag(tag);
    const latest = tagPosts.reduce((acc, p) => {
      const d = new Date(p.updatedAt ?? p.publishedAt);
      return d > acc ? d : acc;
    }, new Date(0));
    return {
      url: `${SITE_URL}/blog/tags/${tag}`,
      lastModified: latest.getTime() > 0 ? latest : buildTime,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    };
  });

  return [...staticPages, ...docPages, ...blogPages, ...tagPages];
}
