import Link from "next/link";

export function FooterLanding() {
  return (
    <footer className="border-t border-gray-200 bg-surface dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-muted">
          MIT {new Date().getFullYear()} &copy; Gofasta Authors
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/docs/getting-started/introduction"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            Docs
          </Link>
          <a
            href="https://github.com/gofastadev/gofasta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            GitHub
          </a>
          <a
            href="https://github.com/gofastadev/gofasta/blob/main/LICENSE"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-muted hover:text-foreground transition-colors"
          >
            License
          </a>
        </div>
      </div>
    </footer>
  );
}
