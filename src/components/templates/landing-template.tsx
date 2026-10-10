import { NavbarLanding, FooterLanding } from "@/components/organisms";

interface LandingTemplateProps {
  children: React.ReactNode;
}

export function LandingTemplate({ children }: LandingTemplateProps) {
  return (
    // Column flex so short pages (an empty blog, 404) still pin the
    // footer to the bottom of the viewport instead of mid-screen.
    <div className="flex min-h-screen flex-col bg-background">
      <NavbarLanding />
      <main className="flex flex-1 flex-col">{children}</main>
      <FooterLanding />
    </div>
  );
}
