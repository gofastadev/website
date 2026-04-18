import { SectionHeading } from "@/components/molecules";

const principles = [
  {
    title: "Compile-time DI",
    description:
      "Google Wire generates dependency wiring at build time. No reflection, no service locator, no runtime surprises.",
  },
  {
    title: "Zero init-time side effects",
    description:
      "Every pkg/* package has no side effects on import. Nothing starts until you start it. Nothing writes, listens, or connects without an explicit call.",
  },
  {
    title: "Every package swappable",
    description:
      "pkg/cache, pkg/mailer, pkg/auth — each is a standard Go import on an interface. Delete any one, plug in an alternative, move on.",
  },
  {
    title: "Full eject anytime",
    description:
      "Remove github.com/gofastadev/gofasta from go.mod entirely and your project still builds. No runtime tether. No proprietary contract.",
  },
];

export function ArchitectureStrip() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="How it works"
        title="No magic. Just Go."
        description="Every decision Gofasta makes is one you can read, change, or remove. You own the code — and the escape hatch is always unlocked."
      />
      <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-gray-200 bg-gray-200 sm:grid-cols-2 dark:border-gray-800 dark:bg-gray-800">
        {principles.map((p) => (
          <div
            key={p.title}
            className="bg-surface p-8 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-900/40"
          >
            <h3 className="text-lg font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
              {p.description}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
