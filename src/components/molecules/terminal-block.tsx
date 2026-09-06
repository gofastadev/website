import { cn } from "@/lib/utils";

interface TerminalBlockProps {
  children: React.ReactNode;
  /** Mono title shown in the header bar (default: "~/dev"). */
  title?: string;
  /**
   * Body wrapper element. "pre" (default) renders the classic
   * `<pre><code>…</code></pre>` body for literal command-output text.
   * "div" renders the same padding/typography as a plain `<div>` instead —
   * use this when the body contains interactive/block-level children
   * (e.g. a `CopyableCommand`) for which `<div>`-inside-`<code>` would be
   * invalid HTML5.
   */
  bodyAs?: "pre" | "div";
  className?: string;
}

const bodyClassName =
  "overflow-x-auto whitespace-pre-wrap break-all p-4 text-left font-mono text-xs leading-relaxed text-gray-300 sm:break-normal sm:p-6 sm:text-sm";

export function TerminalBlock({
  children,
  title = "~/dev",
  bodyAs = "pre",
  className,
}: TerminalBlockProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-gray-800 bg-terminal-surface shadow-e3",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-2.5">
        <span className="font-mono text-xs text-gray-400">{title}</span>
      </div>
      {bodyAs === "div" ? (
        <div className={bodyClassName}>{children}</div>
      ) : (
        <pre className={bodyClassName}>
          <code>{children}</code>
        </pre>
      )}
    </div>
  );
}
