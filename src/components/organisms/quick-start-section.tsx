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
      <div className="mt-14 grid gap-6 sm:grid-cols-2 sm:gap-7 lg:grid-cols-4">
        {steps.map((item) => (
          <StepCard
            key={item.step}
            step={item.step}
            title={item.title}
            code={item.code}
          />
        ))}
      </div>
    </section>
  );
}
