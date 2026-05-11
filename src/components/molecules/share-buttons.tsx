"use client";

import { trackEvent } from "@/lib/analytics";

// Social share buttons rendered at the end of an article. Each
// button opens the target platform's pre-filled share intent in a
// new tab and fires a `share_click` GA4 event with the platform key
// so the dashboard can compare which channels see the most action.

export type SharePlatform = "x" | "linkedin" | "hackernews" | "reddit";

const PLATFORM_LABELS: Record<SharePlatform, string> = {
  x: "Share on X",
  linkedin: "Share on LinkedIn",
  hackernews: "Submit to Hacker News",
  reddit: "Share on Reddit",
};

const SHARE_PLATFORMS: SharePlatform[] = [
  "x",
  "linkedin",
  "hackernews",
  "reddit",
];

function buildShareUrl(
  platform: SharePlatform,
  url: string,
  title: string,
): string {
  const u = encodeURIComponent(url);
  const t = encodeURIComponent(title);
  switch (platform) {
    case "x":
      return `https://x.com/intent/tweet?url=${u}&text=${t}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "hackernews":
      return `https://news.ycombinator.com/submitlink?u=${u}&t=${t}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${u}&title=${t}`;
  }
}

export interface ShareButtonsProps {
  url: string;
  title: string;
}

export function ShareButtons({ url, title }: ShareButtonsProps) {
  return (
    <div
      role="group"
      aria-label="Share this post"
      className="my-8 flex flex-wrap items-center gap-3 border-t border-gray-200 pt-6 dark:border-white/10"
    >
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
        Share
      </span>
      {SHARE_PLATFORMS.map((platform) => (
        <a
          key={platform}
          href={buildShareUrl(platform, url, title)}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:text-gray-300"
          onClick={() => trackEvent("share_click", { platform, url })}
        >
          {PLATFORM_LABELS[platform]}
        </a>
      ))}
    </div>
  );
}
