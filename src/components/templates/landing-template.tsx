import { NavbarLanding, FooterLanding } from "@/components/organisms";

interface LandingTemplateProps {
  children: React.ReactNode;
}

export function LandingTemplate({ children }: LandingTemplateProps) {
  return (
    <div className="min-h-screen bg-background">
      <NavbarLanding />
      <main>{children}</main>
      <FooterLanding />
    </div>
  );
}
