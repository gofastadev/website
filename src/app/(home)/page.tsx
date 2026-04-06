import { NavbarLanding } from "@/components/landing/navbar-landing";
import { Hero } from "@/components/landing/hero";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { QuickStartSection } from "@/components/landing/quick-start-section";
import { FooterLanding } from "@/components/landing/footer-landing";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <NavbarLanding />
      <main>
        <Hero />
        <FeaturesGrid />
        <QuickStartSection />
      </main>
      <FooterLanding />
    </div>
  );
}
