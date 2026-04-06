import { cn } from "@/lib/utils";

interface FeatureIconProps {
  children: React.ReactNode;
  className?: string;
}

export function FeatureIcon({ children, className }: FeatureIconProps) {
  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary",
        className
      )}
    >
      {children}
    </div>
  );
}
