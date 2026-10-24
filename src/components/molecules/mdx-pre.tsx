"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

// `pre` override for blog post MDX. rehype-pretty-code emits
// <figure><pre data-language data-theme><code>…</code></pre></figure>;
// this component wraps the pre in a frame with a header bar holding the
// language label and a copy button, so the button never covers code. The copied text
// is read from the DOM at click time (ref → querySelector("code")
// → textContent) rather than from React children — the children are
// Shiki's token spans, and textContent is the only faithful
// flattening of them.

const PLAIN_LANGUAGES = new Set(["plaintext", "text", "txt"]);

export type MdxPreProps = React.ComponentPropsWithoutRef<"pre">;

export function MdxPre({ children, className, ...props }: MdxPreProps) {
  const preRef = useRef<HTMLPreElement>(null);
  const timerRef = useRef<number | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    const code = preRef.current?.querySelector("code")?.textContent ?? "";
    if (!code) return;
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(code);
      } else {
        // Legacy fallback for browsers without the async Clipboard API.
        const textarea = document.createElement("textarea");
        textarea.value = code;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      const language = (props as Record<string, unknown>)["data-language"];
      trackEvent("copy_code", {
        language: typeof language === "string" ? language : "",
      });
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permission denied or unavailable — swallow silently;
      // the reader can still select and copy the code by hand.
    }
  };

  const language = (props as Record<string, unknown>)["data-language"];
  const label =
    typeof language === "string" && !PLAIN_LANGUAGES.has(language)
      ? language
      : "";

  return (
    <div className="overflow-hidden rounded-xl border border-black/10 bg-code-bg max-sm:rounded-none max-sm:border-x-0 dark:border-white/10">
      <div className="flex h-10 items-center justify-between gap-3 border-b border-black/10 bg-black/3 px-4 font-mono text-xs text-gray-600 max-sm:px-6 dark:border-white/10 dark:bg-white/3 dark:text-gray-400">
        <span>{label}</span>
        <button
          type="button"
          aria-label={copied ? "Copied" : "Copy code"}
          title={copied ? "Copied" : "Copy code"}
          onClick={() => {
            void handleCopy();
          }}
          className={cn(
            "-mr-2 inline-flex h-7 cursor-pointer items-center gap-1.5 rounded-md px-2 font-sans transition-colors hover:bg-black/5 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary dark:hover:bg-white/10 dark:hover:text-gray-100",
            copied && "text-primary hover:text-primary dark:hover:text-primary",
          )}
        >
        {copied ? (
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4"
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
            className="h-4 w-4"
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
          <span aria-hidden="true">{copied ? "Copied" : "Copy"}</span>
        </button>
      </div>
      <pre ref={preRef} className={className} {...props}>
        {children}
      </pre>
    </div>
  );
}
