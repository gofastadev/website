import { StepNumber } from "@/components/atoms";

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
      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-all rounded-lg bg-terminal-bg p-3 font-mono text-xs text-gray-300 sm:whitespace-pre sm:break-normal sm:p-4 sm:text-sm">
        <code>{code}</code>
      </pre>
    </div>
  );
}
