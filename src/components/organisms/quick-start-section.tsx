import { StepCard } from "@/components/molecules";

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
    title: "Start developing",
    code: "cd myapp && make up",
  },
];

export function QuickStartSection() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-20">
      <h2 className="text-center text-3xl font-bold sm:text-4xl">
        Up and running in 3 steps
      </h2>

      <div className="mt-10 grid gap-6 sm:mt-16 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3">
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
