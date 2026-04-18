"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface CopyableCommandProps {
  /** The command text that gets both displayed and copied. */
  command: string;
  /** Optional prompt character shown before the command (default: "$"). */
  prompt?: string;
  /** Compact sizing for hero/CTA subtext; default keeps it snug. */
  size?: "sm" | "md";
  className?: string;
}

/**
 * CopyableCommand — terminal-styled inline code block with a
 * click-to-copy button. One-line layout, always-visible copy action,
 * branded "$" prompt, dark slate background matching the site's
 * terminal palette. Used anywhere a developer is likely to run a
 * command verbatim (install hints, Quick Start steps, docs callouts).
 */
export function CopyableCommand({
  command,
  prompt = "$",
  size = "md",
  className,
}: CopyableCommandProps) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(command);
      } else {
        // Legacy fallback for browsers without the async Clipboard API.
        const textarea = document.createElement("textarea");
        textarea.value = command;
        textarea.setAttribute("readonly", "");
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }
      setCopied(true);
      if (timerRef.current !== null) window.clearTimeout(timerRef.current);
      timerRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard permission denied or unavailable — swallow silently;
      // user can still manually select + copy the visible text.
    }
  };

  const sizing = {
    sm: "px-3 py-2 text-xs sm:text-sm",
    md: "px-4 py-3 text-sm",
  }[size];

  return (
    <div
      className={cn(
        "group flex w-full max-w-full items-center gap-3 overflow-hidden rounded-lg border border-gray-800 bg-terminal-bg font-mono shadow-sm",
        sizing,
        className
      )}
    >
      {prompt && (
        <span
          aria-hidden="true"
          className="flex-shrink-0 select-none font-semibold text-terminal-accent"
        >
          {prompt}
        </span>
      )}
      <code className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-gray-200">
        {command}
      </code>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={copied ? "Copied to clipboard" : "Copy command to clipboard"}
        className={cn(
          "flex flex-shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium transition-colors",
          copied
            ? "text-primary"
            : "text-gray-400 hover:bg-gray-700/50 hover:text-gray-100"
        )}
      >
        {copied ? (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span>Copied</span>
          </>
        ) : (
          <>
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
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
            <span className="hidden sm:inline">Copy</span>
          </>
        )}
      </button>
    </div>
  );
}
