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

export type SharePlatform = "x" | "linkedin" | "hackernews" | "reddit";
export type SharePlacement = "header" | "footer";

const SHARE_PLATFORMS: SharePlatform[] = [
  "x",
  "linkedin",
  "hackernews",
  "reddit",
];

const PLATFORM_LABELS: Record<SharePlatform, string> = {
  x: "Share on X",
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
    case "linkedin":
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`;
    case "hackernews":
      return `https://news.ycombinator.com/submitlink?u=${u}&t=${t}`;
    case "reddit":
      return `https://www.reddit.com/submit?url=${u}&title=${t}`;
  }
}

// Brand glyphs are inlined rather than pulled from an icon package —
// lucide dropped brand icons, and X / Hacker News / Reddit never had
// stroke-style equivalents anyway. Paths are the standard simple-icons
// shapes, filled with currentColor so the button's text color drives
// them in both themes.
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
    case "linkedin":
      return (
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.266 2.37 4.266 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.125 2.062 2.062 0 0 1 0 4.125zM7.119 20.452H3.554V9h3.565v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
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
          viewBox="0 0 24 24"
          className="h-4 w-4"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
      );
  }
}

const iconButtonBase =
  "inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600 transition-colors hover:border-primary/40 hover:text-primary dark:border-white/10 dark:text-gray-300";

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
