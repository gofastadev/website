import { cn } from "@/lib/utils";

// Separator between byline metadata items (author, date, reading time).
// Drawn in CSS rather than typed as a middot glyph, so the separator
// never reaches the text layer: screen readers skip it, copied text
// stays clean, and the file has no character a keyboard cannot produce.

export interface MetaDotProps {
  className?: string;
}

export function MetaDot({ className }: MetaDotProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-[3px] shrink-0 rounded-full bg-current opacity-60",
        className,
      )}
    />
  );
}
