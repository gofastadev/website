import { FeatureIcon } from "@/components/atoms";

interface AudienceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function AudienceCard({ icon, title, description }: AudienceCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-surface p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-xl dark:border-gray-800 dark:hover:border-primary/50">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/70 to-primary/0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <FeatureIcon className="mb-5">{icon}</FeatureIcon>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
        {description}
      </p>
    </div>
  );
}
