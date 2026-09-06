import type { MetadataRoute } from "next";
import { existsSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { getAllPosts, getAllTags, getPostsByTag } from "@/lib/blog";
import { AGENT_DOC_FILES, SITE_URL } from "@/lib/seo";

// Walks an MDX directory and emits URL paths, mirroring Nextra's
// routing: `index.mdx` resolves to its parent slug, everything else to
// its own. `urlPrefix` is the URL-space root, so one walker serves both
// /docs and /blog.
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

// `lastModified` is emitted only where it is verifiable. Blog posts use
// frontmatter, and the index and tag pages derive from their newest
// post. Static and docs pages carry none: stamping them with the build
// time bumped every URL on every deploy, which is the exact inaccuracy
// Google cites for ignoring a site's lastmod, and it would discredit the
// accurate blog values alongside it.
export default function sitemap(): MetadataRoute.Sitemap {
  const buildTime = new Date();

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/sitemap`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // The sitemap protocol accepts any URL on the host, not just HTML.
    // No lastModified: the prebuild script regenerates both files on
    // every deploy, so a stamp would claim changes that didn't happen.
    ...AGENT_DOC_FILES.map((file) => ({
      url: `${SITE_URL}${file.path}`,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    })),
  ];

  const contentRoot = join(process.cwd(), "src", "content");

  // Blog content lives outside Nextra's scan path, so the docs walker
  // needs no filtering here.
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
    changeFrequency: "weekly" as const,
    priority: path === "/docs" ? 0.9 : 0.7,
  }));

  // Per-post lastModified from frontmatter lets crawlers detect edits
  // without refetching every page.
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
        // Sitemap image extension: tells Google Images and Discover
        // which image belongs to the post without parsing the page.
        images: [
          post.coverUrl.startsWith("http")
            ? post.coverUrl
            : `${SITE_URL}${post.coverUrl}`,
        ],
      });
    }
  }

  // Tag archives, dated by the most recent post carrying the tag.
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
