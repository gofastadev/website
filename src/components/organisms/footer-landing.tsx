import { NavLinks } from "@/components/molecules";

export function FooterLanding() {
  return (
    <footer className="border-t border-gray-200 bg-surface px-6 py-10 dark:border-gray-800">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          &copy; 2025-{new Date().getFullYear()} Gofasta Authors, MIT License
        </p>
        <NavLinks variant="footer" className="gap-x-5 gap-y-2" />
      </div>
    </footer>
  );
}
