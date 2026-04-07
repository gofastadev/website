import { NavLinks } from "@/components/molecules";

export function FooterLanding() {
  return (
    <footer className="border-t border-gray-200 bg-surface dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 sm:flex-row">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          &copy; 2025–{new Date().getFullYear()} Gofasta Authors — MIT License
        </p>
        <NavLinks variant="footer" />
      </div>
    </footer>
  );
}
