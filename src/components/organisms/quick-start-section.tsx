import { SectionHeading, StepCard } from "@/components/molecules";

const steps = [
  {
    step: 1,
    title: "Install the CLI",
    code: "go install github.com/gofastadev/cli/cmd/gofasta@latest",
  },
  {
    step: 2,
    title: "Create a project",
    code: "gofasta new myapp",
  },
  {
    step: 3,
    title: "Configure your AI (optional)",
    code: "gofasta ai claude",
  },
  {
    step: 4,
    title: "Start developing",
    code: "cd myapp && gofasta dev",
  },
];

export function QuickStartSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
      <SectionHeading
        eyebrow="Quick start"
        title="Install and run"
        description="Four commands. No dashboards, no signup, no configuration wizard. The CLI does the rest."
      />

      {/* Flow connector overlay. Lives behind the step cards and draws
          an animated dashed line (horizontal on lg+, vertical below)
          with a traveling dot that sweeps the full length. */}
      <div className="relative mt-14">
        {/* Horizontal connector (lg+). Spans between the middle of the
            first and last step cards. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[12%] top-1/2 hidden h-[2px] -translate-y-1/2 lg:block"
        >
          <div className="gofasta-flow-bar h-full w-full" />
          <span className="gofasta-flow-dot" />
        </div>

        {/* Vertical connector (mobile + tablet). Hidden on lg+ where
            the horizontal one takes over. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-6 bottom-6 hidden w-[2px] -translate-x-1/2 sm:block lg:hidden"
        >
          <div className="gofasta-flow-bar-vert h-full w-full" />
          <span className="gofasta-flow-dot gofasta-flow-dot-vert" />
        </div>

        <div className="relative grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4">
          {steps.map((item) => (
            <StepCard
              key={item.step}
              step={item.step}
              title={item.title}
              code={item.code}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
