import { FeatureIcon } from "@/components/atoms";

interface PillarCardProps {
  number: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}

export function PillarCard({ number, icon, title, description }: PillarCardProps) {
  return (
    <div className="gofasta-card-glow gofasta-icon-draw relative flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-surface p-8 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl dark:border-gray-800">
      {/* Decorative animated arc — a large rotating ring in the upper-
          right corner of each pillar card. Visible at rest, rotates
          continuously, pulled from the Next.js feature-card playbook. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 200 200"
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 opacity-40 dark:opacity-50"
      >
        <defs>
          <linearGradient id={`pillar-arc-${number}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="rgb(0 173 216)" stopOpacity="0.0" />
            <stop offset="50%" stopColor="rgb(0 173 216)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="rgb(0 173 216)" stopOpacity="0.0" />
          </linearGradient>
        </defs>
        <g className="gofasta-pillar-arc" style={{ transformOrigin: "100px 100px" }}>
          <circle
            cx="100"
            cy="100"
            r="78"
            fill="none"
            stroke={`url(#pillar-arc-${number})`}
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="160 320"
          />
          <circle
            cx="100"
            cy="100"
            r="58"
            fill="none"
            stroke={`url(#pillar-arc-${number})`}
            strokeWidth="1.5"
            strokeDasharray="90 240"
            opacity="0.6"
          />
        </g>
      </svg>

      <div className="relative mb-6 flex items-center gap-3">
        <FeatureIcon>{icon}</FeatureIcon>
        <span
          className="gofasta-number-float inline-block bg-gradient-to-br from-primary to-primary/50 bg-clip-text font-mono text-xs font-semibold text-transparent"
          style={{ animationDelay: `${Number(number) * 0.6}s` }}
        >
          {number}
        </span>
      </div>
      <h3 className="relative text-xl font-bold tracking-tight sm:text-2xl">
        {title}
      </h3>
      <p className="relative mt-3 text-sm leading-relaxed text-gray-600 dark:text-gray-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}
