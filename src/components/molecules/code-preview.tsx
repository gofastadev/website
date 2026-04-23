import { cn } from "@/lib/utils";

interface CodePreviewProps {
  label?: string;
  language?: string;
  children: React.ReactNode;
  className?: string;
}

export function CodePreview({
  label,
  language,
  children,
  className,
}: CodePreviewProps) {
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-xl border border-gray-200 bg-terminal-surface shadow-xl dark:border-gray-800",
        className
      )}
    >
      {(label || language) && (
        <div className="flex items-center justify-between border-b border-gray-800 bg-gray-900/50 px-4 py-2.5">
          {label && (
            <span className="text-xs font-medium text-gray-300">{label}</span>
          )}
          {language && (
            <span className="font-mono text-xs uppercase tracking-wider text-gray-500">
              {language}
            </span>
          )}
        </div>
      )}
      <pre className="overflow-x-auto p-4 text-left font-mono text-xs leading-relaxed text-gray-200 sm:p-6 sm:text-sm">
        <code>{children}</code>
      </pre>
    </div>
  );
}
