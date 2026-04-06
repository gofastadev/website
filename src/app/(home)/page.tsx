import { LandingTemplate } from "@/components/templates";
import { Hero, FeaturesGrid, QuickStartSection } from "@/components/organisms";

export default function HomePage() {
  return (
    <LandingTemplate>
      <Hero />
      <FeaturesGrid />
      <QuickStartSection />
    </LandingTemplate>
  );
}
