export const SITE_URL = "https://gofasta.dev";
export const SITE_NAME = "Gofasta";

export const BASE_KEYWORDS = [
  "Go",
  "Golang",
  "Gofasta",
  "Go toolkit",
  "Go backend",
  "Go web services",
  "web framework",
  "backend",
] as const;

export function withBaseKeywords(...extra: readonly string[]): string[] {
  return [...new Set<string>([...BASE_KEYWORDS, ...extra])];
}
