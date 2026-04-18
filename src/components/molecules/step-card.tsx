import { StepNumber } from "@/components/atoms";
import { CopyableCommand } from "./copyable-command";

interface StepCardProps {
  step: number;
  title: string;
  code: string;
}

export function StepCard({ step, title, code }: StepCardProps) {
  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-gray-200 bg-surface p-4 sm:p-6 dark:border-gray-800">
      <StepNumber step={step} className="mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <CopyableCommand className="mt-4" size="sm" command={code} />
    </div>
  );
}
