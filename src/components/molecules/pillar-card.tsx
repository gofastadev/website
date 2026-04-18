import { FeatureIcon } from "@/components/atoms";

interface PillarCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function PillarCard({ number, icon, title, description }: PillarCardProps) {
  return (
    <div className="relative flex h-full flex-col rounded-2xl border border-gray-200 bg-surface p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-800">
      <div className="mb-6 flex items-center gap-3">
        <FeatureIcon>{icon}</FeatureIcon>
        <span className="font-mono text-xs font-semibold text-gray-400 dark:text-gray-600">
          {number}
        </span>
      </div>
      <h3 className="text-xl font-bold tracking-tight sm:text-2xl">{title}</h3>
      <p className="mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}
