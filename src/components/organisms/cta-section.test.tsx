import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CtaSection } from "./cta-section";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

const trackEventSpy = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackEventSpy(...args),
}));

describe("CtaSection", () => {
  beforeEach(() => {
    mockPush.mockReset();
    trackEventSpy.mockReset();
  });

  it("renders the headline", () => {
    render(<CtaSection />);
    expect(screen.getByText("Try")).toBeInTheDocument();
    expect(screen.getByText("Gofasta")).toBeInTheDocument();
  });

  it("renders the Get Started CTA and navigates to docs", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(mockPush).toHaveBeenCalledWith("/docs/getting-started/introduction");
  });

  it("renders the Whitepaper CTA and navigates to whitepaper", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Read the Whitepaper"));
    expect(mockPush).toHaveBeenCalledWith("/docs/white-paper");
  });

  it("fires cta_get_started with location=cta_section when Get Started is clicked", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(trackEventSpy).toHaveBeenCalledWith("cta_get_started", {
      location: "cta_section",
      destination: "/docs/getting-started/introduction",
    });
  });

  it("fires cta_read_white_paper when the secondary CTA is clicked", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Read the Whitepaper"));
    expect(trackEventSpy).toHaveBeenCalledWith("cta_read_white_paper", {
      location: "cta_section",
    });
  });
});
