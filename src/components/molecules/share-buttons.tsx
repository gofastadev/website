"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

// Circular icon share buttons, rendered twice per post: in the article
// header (right of the byline) and after the article body. Each share
// button opens the platform's pre-filled share intent in a small popup
// window — the platform renders the link preview itself from the
// page's OpenGraph tags, so the article stays in place while the
// reader shares. The copy button writes the canonical post URL to the
// clipboard and confirms with an icon swap + tooltip.
//
// Every click fires a `share_click` GA4 event carrying the platform
// key AND the placement, so the dashboard can compare not just which
// channels see action but which of the two surfaces earns it.

export type SharePlatform =
  | "x"
  | "facebook"
  | "linkedin"
  | "hackernews"
  | "reddit";
export type SharePlacement = "header" | "footer";

const SHARE_PLATFORMS: SharePlatform[] = [
  "x",
  "facebook",
  "linkedin",
  "hackernews",
  "reddit",
];

const PLATFORM_LABELS: Record<SharePlatform, string> = {
  x: "Share on X",
  facebook: "Share on Facebook",
  linkedin: "Share on LinkedIn",
  hackernews: "Submit to Hacker News",
  reddit: "Share on Reddit",
};

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
    case "facebook":
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`;
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "hackernews":
      return `https://news.ycombinator.com/submitlink?u=${u}&t=${t}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${u}&title=${t}`;
  }
}

// Brand glyphs are inlined rather than pulled from an icon package —
// lucide dropped brand icons. Each glyph is the BARE letterform (the
// "f", the "in", the alien face), never the enclosed logo variant:
// the button itself is the circle, so an icon that ships its own
// circle or square enclosure reads as a logo-in-a-ring while its
// neighbors read as glyphs. Filled with currentColor so the button's
// text color drives them in both themes.
function PlatformIcon({ platform }: { platform: SharePlatform }) {
  switch (platform) {
    case "x":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      );
    case "facebook":
      return (
        <svg
          viewBox="0 0 320 512"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z" />
        </svg>
      );
    case "linkedin":
      return (
        <svg
          viewBox="0 0 448 512"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M100.28 448H7.4V148.9h92.88zM53.79 108.1C24.09 108.1 0 83.5 0 53.8a53.79 53.79 0 0 1 107.58 0c0 29.7-24.1 54.3-53.79 54.3zM447.9 448h-92.68V302.4c0-34.7-.7-79.2-48.29-79.2-48.29 0-55.69 37.7-55.69 76.7V448h-92.78V148.9h89.08v40.8h1.3c12.4-23.5 42.69-48.3 87.88-48.3 94 0 111.28 61.9 111.28 148.3z" />
        </svg>
      );
    case "hackernews":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M7 5.5 12 13m0 0 5-7.5M12 13v5.5" />
        </svg>
      );
    case "reddit":
      return (
        <svg
          viewBox="0 0 512 512"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M440.3 203.5c-15 0-28.2 6.2-37.9 15.9-35.7-24.7-83.8-40.6-137.1-42.3L293 52.3l88.2 19.8c0 21.6 17.6 39.2 39.2 39.2 22 0 39.7-18.1 39.7-39.7s-17.6-39.7-39.7-39.7c-15.4 0-28.7 9.3-35.3 22l-97.4-21.6c-4.9-1.3-9.7 2.2-11 7.1L246.3 177c-52.9 2.2-100.5 18.1-136.3 42.8-9.7-10.1-23.4-16.3-38.4-16.3-55.6 0-73.8 74.6-22.9 100.1-1.8 7.9-2.6 16.3-2.6 24.7 0 83.8 94.4 151.7 210.3 151.7 116.4 0 210.8-67.9 210.8-151.7 0-8.4-.9-17.2-3.1-25.1 49.9-25.6 31.5-99.7-23.8-99.7zM129.4 308.9c0-22 17.6-39.7 39.7-39.7 21.6 0 39.2 17.6 39.2 39.7 0 21.6-17.6 39.2-39.2 39.2-22 .1-39.7-17.6-39.7-39.2zm214.3 93.5c-36.4 36.4-139.1 36.4-175.5 0-4-3.5-4-9.7 0-13.7 3.5-3.5 9.7-3.5 13.2 0 27.8 28.5 120 29 149 0 3.5-3.5 9.7-3.5 13.2 0 4.1 4 4.1 10.2.1 13.7zm-.8-54.2c-21.6 0-39.2-17.6-39.2-39.2 0-22 17.6-39.7 39.2-39.7 22 0 39.7 17.6 39.7 39.7-.1 21.5-17.7 39.2-39.7 39.2z" />
        </svg>
      );
  }
}

const iconButtonBase =
  "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:text-gray-300";

export interface ShareButtonsProps {
  url: string;
  title: string;
  placement: SharePlacement;
}

export function ShareButtons({ url, title, placement }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleShare = (platform: SharePlatform) => {
    trackEvent("share_click", { platform, url, placement });
    window.open(
      buildShareUrl(platform, url, title),
      "_blank",
      "noopener,noreferrer,width=580,height=450",
    );
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      trackEvent("share_click", { platform: "copy", url, placement });
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permission denied or unavailable — swallow silently;
      // the reader can still copy the URL from the address bar.
      setCopied(false);
    }
  };

  return (
    <div
      role="group"
      aria-label="Share this post"
      className={cn(
        "flex items-center gap-2",
        placement === "footer" &&
          "my-8 border-t border-gray-200 pt-6 dark:border-white/10",
      )}
    >
      {SHARE_PLATFORMS.map((platform) => (
        <button
          key={platform}
          type="button"
          aria-label={PLATFORM_LABELS[platform]}
          title={PLATFORM_LABELS[platform]}
          onClick={() => handleShare(platform)}
          className={iconButtonBase}
        >
          <PlatformIcon platform={platform} />
        </button>
      ))}

      <div className="relative">
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy link"}
          title={copied ? "Copied" : "Copy link"}
          onClick={() => {
            void handleCopy();
          }}
          className={cn(
            iconButtonBase,
            copied &&
              "border-primary/40 text-primary hover:border-primary/40 hover:text-primary",
          )}
        >
          {copied ? (
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect width="13" height="13" x="9" y="9" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
          )}
        </button>

        {copied ? (
          <span
            role="status"
            className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2.5 py-1 text-xs font-medium text-white shadow-sm dark:bg-white dark:text-gray-900"
          >
            Copied
          </span>
        ) : null}
      </div>
    </div>
  );
}
