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

  it("fires cta_get_started with location=cta_section when Get Started is clicked", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Get Started"));
    expect(trackEventSpy).toHaveBeenCalledWith("cta_get_started", {
      location: "cta_section",
      destination: "/docs/getting-started/introduction",
    });
  });

  // The old secondary "Read the Whitepaper" button pointed at
  // /docs/white-paper — a docs destination, which duplicates the hero's
  // "Read the docs" intent. It was removed so this section carries
  // exactly one primary CTA.
  it("renders exactly one primary CTA button (no duplicate docs-intent secondary)", () => {
    render(<CtaSection />);
    expect(
      screen.queryAllByRole("button", { name: /get started/i }),
    ).toHaveLength(1);
    expect(screen.queryByText("Read the Whitepaper")).not.toBeInTheDocument();
    expect(screen.queryByText(/whitepaper/i)).not.toBeInTheDocument();
  });

  it("renders the install command snippet below the CTA", () => {
    render(<CtaSection />);
    expect(
      screen.getByText("go install github.com/gofastadev/cli/cmd/gofasta@latest"),
    ).toBeInTheDocument();
  });
});
