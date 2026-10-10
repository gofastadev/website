import { cn } from "@/lib/utils";

// Text input primitive — the repo's first form field. Raw <input>
// lives here per the atoms-only rule; molecules/organisms compose it.
// Focus treatment matches the Button atom so form rows read as one
// family.

export type InputProps = React.ComponentPropsWithoutRef<"input">;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-md border border-gray-200 bg-background px-3 text-sm text-foreground placeholder:text-gray-500 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-60 dark:border-white/10",
        className,
      )}
      {...props}
    />
  );
}
