"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { trackEvent } from "@/lib/analytics";

// `pre` override for blog post MDX. rehype-pretty-code emits
// <figure><pre data-language data-theme><code>…</code></pre></figure>;
// this component wraps the pre in a relative group and floats a
// hover-revealed copy button in its top-right corner. The copied text
// is read from the DOM at click time (ref → querySelector("code")
// → textContent) rather than from React children — the children are
// Shiki's token spans, and textContent is the only faithful
// flattening of them.

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

  return (
    <div className="group relative">
      <pre ref={preRef} className={className} {...props}>
        {children}
      </pre>
      <button
        type="button"
        aria-label={copied ? "Copied" : "Copy code"}
        title={copied ? "Copied" : "Copy code"}
        onClick={() => {
          void handleCopy();
        }}
        className={cn(
          "absolute top-3 right-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md border border-white/10 bg-white/5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary hover:text-gray-100",
          copied && "text-primary hover:text-primary",
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
      </button>
    </div>
  );
}
