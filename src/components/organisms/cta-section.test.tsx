import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CtaSection } from "./cta-section";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("CtaSection", () => {
  it("renders the headline", () => {
    render(<CtaSection />);
    expect(screen.getByText("Try")).toBeInTheDocument();
    expect(screen.getByText("Gofasta")).toBeInTheDocument();
  });

  it("renders the Get Started CTA and navigates to docs", () => {
    render(<CtaSection />);
    const cta = screen.getByText("Get Started");
    fireEvent.click(cta);
    expect(mockPush).toHaveBeenCalledWith("/docs/getting-started/introduction");
  });

  it("renders the Whitepaper CTA and navigates to whitepaper", () => {
    render(<CtaSection />);
    const cta = screen.getByText("Read the Whitepaper");
    fireEvent.click(cta);
    expect(mockPush).toHaveBeenCalledWith("/docs/white-paper");
  });
});
