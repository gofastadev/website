"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { TerminalBlock } from "@/components/molecules";
import { trackEvent } from "@/lib/analytics";

export function Hero() {
  const router = useRouter();

  return (
    <section className="px-6 pt-24 pb-section-sm sm:pb-section">
      <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col items-start text-left">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-balance text-foreground sm:text-6xl lg:text-5xl">
            A production Go backend in one command
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            gofasta scaffolds plain, idiomatic Go and generates the repetitive
            layers. Every default is swappable.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button
              size="lg"
              onClick={() => {
                trackEvent("cta_get_started", {
                  location: "hero",
                  destination: "/docs/getting-started/introduction",
                });
                router.push("/docs/getting-started/introduction");
              }}
            >
              Get started
            </Button>
            <Button
              size="lg"
              variant="secondary"
              onClick={() => {
                trackEvent("cta_read_docs", {
                  location: "hero",
                  destination: "/docs",
                });
                router.push("/docs");
              }}
            >
              Read the docs
            </Button>
          </div>
        </div>

        <TerminalBlock title="~/projects" className="min-w-0">
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0s" } as React.CSSProperties}
          >
            <span className="text-gray-400">$</span> go install
            github.com/gofastadev/cli/cmd/gofasta@latest
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.17s" } as React.CSSProperties}
          >
            <span className="text-gray-400">$</span>{" "}
            <span className="text-terminal-accent">gofasta</span> new myapp
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.34s" } as React.CSSProperties}
          >
            <span className="text-terminal-accent">
              Creating new gofasta project: myapp
            </span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.51s" } as React.CSSProperties}
          >
            <span className="text-gray-400">Creating directory myapp/</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.68s" } as React.CSSProperties}
          >
            <span className="text-gray-400">
              Initializing Go module: myapp
            </span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "0.85s" } as React.CSSProperties}
          >
            <span className="text-gray-400">Creating project structure...</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.02s" } as React.CSSProperties}
          >
            <span className="text-gray-400">
              Installing gofasta library...
            </span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.19s" } as React.CSSProperties}
          >
            <span className="text-gray-400">Generating Wire DI code...</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.36s" } as React.CSSProperties}
          >
            <span className="text-gray-400">
              Initializing git repository...
            </span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.53s" } as React.CSSProperties}
          >
            <span className="term-ok">ok</span> Project myapp created
            successfully!
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.7s" } as React.CSSProperties}
          >
            {"\n"}
            <span className="text-gray-400">$</span> cd myapp &&{" "}
            <span className="text-terminal-accent">gofasta</span> dev
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "1.87s" } as React.CSSProperties}
          >
            <span className="text-terminal-accent">
              Starting gofasta development server...
            </span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.04s" } as React.CSSProperties}
          >
            <span className="text-gray-400">Running migrations...</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.21s" } as React.CSSProperties}
          >
            <span className="text-gray-400">Starting air (hot reload)...</span>
          </span>
          <span
            className="gofasta-term-line"
            style={{ "--gofasta-term-delay": "2.38s" } as React.CSSProperties}
          >
            <span className="text-gray-400">   REST API:  </span>
            <span className="text-terminal-accent">http://localhost:8080</span>{" "}
            <span className="gofasta-cursor" aria-hidden="true" />
          </span>
        </TerminalBlock>
      </div>
    </section>
  );
}
