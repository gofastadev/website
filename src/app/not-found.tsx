import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { LandingTemplate } from "@/components/templates";
import { NotFound } from "@/components/organisms";

export const metadata: Metadata = {
  title: "404 - Page Not Found",
  description:
    "The page you were looking for doesn't exist. Jump to the docs, the CLI reference, the white paper, or head home.",
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="dark"
      enableSystem={false}
      disableTransitionOnChange
    >
      <LandingTemplate>
        <NotFound />
      </LandingTemplate>
    </ThemeProvider>
  );
}
