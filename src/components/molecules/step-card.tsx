import { StepNumber } from "@/components/atoms";

interface StepCardProps {
  step: number;
  title: string;
  code: string;
}

export function StepCard({ step, title, code }: StepCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-6 dark:border-gray-800">
      <StepNumber step={step} className="mb-4" />
      <h3 className="text-lg font-semibold">{title}</h3>
      <pre className="mt-4 overflow-x-auto rounded-lg bg-[#1e293b] p-4 font-mono text-sm text-gray-300">
        <code>{code}</code>
      </pre>
    </div>
  );
}
