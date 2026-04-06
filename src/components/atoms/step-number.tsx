import { cn } from "@/lib/utils";

interface StepNumberProps {
  step: number;
  className?: string;
}

export function StepNumber({ step, className }: StepNumberProps) {
  return (
    <div
      className={cn(
        "flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white",
        className
      )}
    >
      {step}
    </div>
  );
}
