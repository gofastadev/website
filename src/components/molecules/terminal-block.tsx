import { cn } from "@/lib/utils";

interface TerminalBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function TerminalBlock({ children, className }: TerminalBlockProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-gray-200 bg-[#1e293b] shadow-2xl dark:border-gray-700",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-gray-700 px-4 py-3">
        <div className="h-3 w-3 rounded-full bg-red-500" />
        <div className="h-3 w-3 rounded-full bg-yellow-500" />
        <div className="h-3 w-3 rounded-full bg-green-500" />
        <span className="ml-2 text-xs text-gray-400">Terminal</span>
      </div>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all p-4 text-left font-mono text-xs leading-relaxed text-gray-300 sm:break-normal sm:p-6 sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}
