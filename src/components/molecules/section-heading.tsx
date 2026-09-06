import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
  className?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  const alignClasses = align === "center" ? "mx-auto items-center text-center" : "items-start text-left";

  return (
    <div className={cn("flex max-w-3xl flex-col", alignClasses, className)}>
      {eyebrow && <span className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</span>}
      <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>}
    </div>
  );
}
