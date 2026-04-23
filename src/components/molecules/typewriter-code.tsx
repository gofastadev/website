"use client";

import { useEffect, useState } from "react";
import { useOnScreen } from "@/hooks/use-on-screen";
import { cn } from "@/lib/utils";

interface TypewriterCodeProps {
  label?: string;
  language?: string;
  code: string;
  /**
   * Milliseconds between each character reveal. Default 8ms — fast enough
   * to read and feel like streaming output, slow enough to look
   * "typed."
   */
  speed?: number;
  className?: string;
}

/**
 * TypewriterCode — code preview that reveals its contents character by
 * character when the element scrolls into view. Mirrors the visual
 * language of real terminal streaming (server-sent events, tail -f) and
 * fits the "agent-native / machine-readable output" theme of the
 * AgentSpotlight section.
 *
 * Visible-only typing means the animation fires once, when the user
 * can actually see it — unlike an on-mount animation that would already
 * be finished by the time anyone scrolled down.
 */
export function TypewriterCode({
  label,
  language,
  code,
  speed = 8,
  className,
}: TypewriterCodeProps) {
  const [ref, visible] = useOnScreen<HTMLDivElement>({
    rootMargin: "0px 0px -15% 0px",
  });
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (!visible) return;
    if (index >= code.length) return;

    const timer = window.setTimeout(() => {
      setIndex((n) => Math.min(n + 1, code.length));
    }, speed);

    return () => window.clearTimeout(timer);
  }, [visible, index, code.length, speed]);

  const shown = code.slice(0, index);
  const done = index >= code.length;

  return (
    <div
      ref={ref}
      className={cn(
        "w-full overflow-hidden rounded-xl border border-gray-200 bg-terminal-surface shadow-xl dark:border-gray-800",
        className
      )}
    >
      {(label || language) && (
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 py-2.5">
          {label && (
            <span className="flex items-center gap-2 text-xs font-medium text-gray-300">
              <span className="inline-flex h-1.5 w-1.5 items-center">
                <span
                  aria-hidden="true"
                  className={cn(
                    "inline-block h-1.5 w-1.5 rounded-full",
                    done ? "bg-green-400" : "bg-amber-400 gofasta-pulse-dot"
                  )}
                />
              </span>
              {label}
            </span>
          )}
          {language && (
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500">
              {language}
            </span>
          )}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-left font-mono text-xs leading-relaxed text-gray-200 sm:p-6 sm:text-sm">
        <code>
          {shown}
          {!done && <span className="gofasta-cursor" aria-hidden="true" />}
        </code>
      </pre>
    </div>
  );
}
