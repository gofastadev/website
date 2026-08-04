import { cn } from "@/lib/utils";

interface TerminalBlockProps {
  children: React.ReactNode;
  /** Mono title shown in the header bar (default: "~/dev"). */
  title?: string;
  className?: string;
}

export function TerminalBlock({
  children,
  title = "~/dev",
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
        <span className="font-mono text-xs text-gray-500">{title}</span>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all p-4 text-left font-mono text-xs leading-relaxed text-gray-300 sm:break-normal sm:p-6 sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}
