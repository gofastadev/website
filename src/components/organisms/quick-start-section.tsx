import {
  SectionHeading,
  TerminalBlock,
  CopyableCommand,
} from "@/components/molecules";

const commands = [
  {
    command: "gofasta new myapp --driver postgres",
    output: [
      "Creating new gofasta project: myapp",
      "Generating Wire DI code",
      "Project myapp created successfully",
    ],
  },
  {
    command: "gofasta dev",
    output: [
      "Starting gofasta development server",
      "Running migrations",
      "REST API: http://localhost:8080",
    ],
  },
  {
    command: "gofasta g scaffold post title:string body:text",
    output: [
      "created app/models/post.model.go",
      "created db/migrations/000006_create_posts.up.sql",
      "patched app/rest/routes/index.routes.go",
    ],
  },
];

export function QuickStartSection() {
  return (
    <section className="px-6 py-section">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Three commands to a running backend"
          description="No cloud service, no signup, no configuration wizard. The CLI does the rest."
        />

        <div className="mx-auto mt-12 max-w-3xl">
          <TerminalBlock title="quick start" bodyAs="div">
            <div className="flex flex-col gap-6">
              {commands.map((item) => (
                <div key={item.command} className="flex flex-col gap-1.5">
                  <CopyableCommand command={item.command} size="sm" />
                  {item.output.map((line) => (
                    <span key={line} className="pl-1 text-gray-500">
                      {line}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </TerminalBlock>
        </div>
      </div>
    </section>
  );
}
