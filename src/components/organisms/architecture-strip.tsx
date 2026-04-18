import { SectionHeading } from "@/components/molecules";

const iconProps = {
  width: 22,
  height: 22,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const principles = [
  {
    title: "Compile-time DI",
    description:
      "Google Wire generates dependency wiring at build time. No reflection, no service locator, no runtime surprises.",
    icon: (
      <svg {...iconProps}>
        <path d="M16 18l6-6-6-6" />
        <path d="M8 6l-6 6 6 6" />
        <path d="M14 4l-4 16" />
      </svg>
    ),
  },
  {
    title: "Zero init-time side effects",
    description:
      "Every pkg/* package has no side effects on import. Nothing starts until you start it. Nothing writes, listens, or connects without an explicit call.",
    icon: (
      <svg {...iconProps}>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 3" />
      </svg>
    ),
  },
  {
    title: "Every package swappable",
    description:
      "pkg/cache, pkg/mailer, pkg/auth — each is a standard Go import on an interface. Delete any one, plug in an alternative, move on.",
    icon: (
      <svg {...iconProps}>
        <path d="M16 3h5v5" />
        <path d="M4 20L21 3" />
        <path d="M21 16v5h-5" />
        <path d="M15 15l6 6" />
        <path d="M4 4l5 5" />
      </svg>
    ),
  },
  {
    title: "Full eject anytime",
    description:
      "Remove github.com/gofastadev/gofasta from go.mod entirely and your project still builds. No runtime tether. No proprietary contract.",
    icon: (
      <svg {...iconProps}>
        <path d="M12 19V5" />
        <path d="M5 12l7-7 7 7" />
        <rect x="3" y="20" width="18" height="1.5" rx="0.5" />
      </svg>
    ),
  },
];

export function ArchitectureStrip() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="Architectural guarantees"
        title="Four things Gofasta will never do to your code."
        description="Every decision is one you can read, change, or remove. These four invariants hold across the CLI and the library — and they're the line in the sand between a toolkit and a framework."
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 dark:border-gray-800 dark:bg-gray-800">
        {principles.map((p) => (
          <div
            key={p.title}
            className="gofasta-icon-draw group relative bg-surface p-8 transition-colors hover:bg-primary-800"
          >
            <div className="mb-5 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-white/15 group-hover:text-white">
              {p.icon}
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-foreground transition-colors group-hover:text-white">
              {p.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 transition-colors group-hover:text-white/85 dark:text-gray-400">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
