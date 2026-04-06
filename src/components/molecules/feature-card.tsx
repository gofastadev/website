import { FeatureIcon } from "@/components/atoms";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-xl border border-gray-200 bg-surface p-6 transition-shadow hover:shadow-lg dark:border-gray-800">
      <FeatureIcon className="mb-4">{icon}</FeatureIcon>
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
