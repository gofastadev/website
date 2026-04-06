import type { MetadataRoute } from "next";
import { readdirSync, statSync } from "fs";
import { join } from "path";

const BASE_URL = "https://gofasta.dev";

function getMdxPaths(dir: string, basePath: string = ""): string[] {
  const paths: string[] = [];
  const entries = readdirSync(dir);

  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);

    if (stat.isDirectory()) {
      paths.push(...getMdxPaths(fullPath, `${basePath}/${entry}`));
    } else if (entry.endsWith(".mdx")) {
      const slug = entry.replace(/\.mdx$/, "");
      const urlPath = slug === "index" && basePath === ""
        ? "/docs"
        : slug === "index"
          ? `/docs${basePath}`
          : `/docs${basePath}/${slug}`;
      paths.push(urlPath);
    }
  }

  return paths;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const contentDir = join(process.cwd(), "src", "content");
  const docPaths = getMdxPaths(contentDir);

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/sitemap`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  const docPages: MetadataRoute.Sitemap = docPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "/docs" ? 0.9 : 0.7,
  }));

  return [...staticPages, ...docPages];
}
