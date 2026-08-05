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

  it("renders the Get started CTA and navigates to docs", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Get started"));
    expect(mockPush).toHaveBeenCalledWith("/docs/getting-started/introduction");
  });

  it("fires cta_get_started with location=cta_section when Get started is clicked", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Get started"));
    expect(trackEventSpy).toHaveBeenCalledWith("cta_get_started", {
      location: "cta_section",
      destination: "/docs/getting-started/introduction",
    });
  });

  // The secondary "Read the white paper" button points at
  // /docs/white-paper — a different intent from the hero's "Read the
  // docs" (which goes to /docs). Both CTAs are expected here: primary
  // "Get started" and secondary "Read the white paper".
  it("renders exactly one primary CTA and one secondary CTA (no duplicate docs-intent secondary)", () => {
    render(<CtaSection />);
    expect(
      screen.queryAllByRole("button", { name: /^get started$/i }),
    ).toHaveLength(1);
    expect(
      screen.queryAllByRole("button", { name: /^read the white paper$/i }),
    ).toHaveLength(1);
    // Guard against the docs-intent duplicate specifically: the
    // secondary CTA must not read "Read the docs" (the hero's copy).
    expect(screen.queryByText("Read the docs")).not.toBeInTheDocument();
  });

  it("renders the Read the white paper CTA and navigates to /docs/white-paper", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Read the white paper"));
    expect(mockPush).toHaveBeenCalledWith("/docs/white-paper");
  });

  it("fires cta_read_white_paper with location=cta_section when Read the white paper is clicked", () => {
    render(<CtaSection />);
    fireEvent.click(screen.getByText("Read the white paper"));
    expect(trackEventSpy).toHaveBeenCalledWith("cta_read_white_paper", {
      location: "cta_section",
    });
  });

  it("renders the install command snippet below the CTA", () => {
    render(<CtaSection />);
    expect(
      screen.getByText("go install github.com/gofastadev/cli/cmd/gofasta@latest"),
    ).toBeInTheDocument();
  });
});
