import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Hero } from "./hero";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

// Mock trackEvent so we can verify Hero CTAs fire the correct analytics
// events without spinning up a real GA4 environment.
const trackEventSpy = vi.fn();
vi.mock("@/lib/analytics", () => ({
  trackEvent: (...args: unknown[]) => trackEventSpy(...args),
}));

describe("Hero", () => {
  it("renders the headline", () => {
    render(<Hero />);
    expect(
      screen.getByText("A production Go backend in one command"),
    ).toBeInTheDocument();
  });

  it("renders the subtext", () => {
    render(<Hero />);
    expect(
      screen.getByText(
        /gofasta scaffolds plain, idiomatic Go and generates the repetitive/,
      ),
    ).toBeInTheDocument();
  });

  it("renders the Get started CTA and navigates on click", () => {
    render(<Hero />);
    const cta = screen.getByText("Get started");
    expect(cta).toBeInTheDocument();
    expect(cta.tagName).toBe("BUTTON");
    fireEvent.click(cta);
    expect(mockPush).toHaveBeenCalledWith("/docs/getting-started/introduction");
  });

  it("renders the Read the docs CTA and navigates on click", () => {
    render(<Hero />);
    const docs = screen.getByText("Read the docs");
    expect(docs).toBeInTheDocument();
    expect(docs.tagName).toBe("BUTTON");
    fireEvent.click(docs);
    expect(mockPush).toHaveBeenCalledWith("/docs");
  });

  it("renders the terminal block titled ~/projects", () => {
    render(<Hero />);
    expect(screen.getByText("~/projects")).toBeInTheDocument();
    expect(screen.getAllByText(/gofasta/).length).toBeGreaterThan(0);
  });

  it("renders the success message in terminal", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Project myapp created successfully!/),
    ).toBeInTheDocument();
  });

  it("renders the dev server URL", () => {
    render(<Hero />);
    expect(screen.getByText(/http:\/\/localhost:8080/)).toBeInTheDocument();
  });

  it("renders the actual dev startup message", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Starting gofasta development server.../),
    ).toBeInTheDocument();
  });

  it("fires cta_get_started when the primary CTA is clicked", () => {
    trackEventSpy.mockReset();
    render(<Hero />);
    fireEvent.click(screen.getByText("Get started"));
    expect(trackEventSpy).toHaveBeenCalledWith("cta_get_started", {
      location: "hero",
      destination: "/docs/getting-started/introduction",
    });
  });

  it("fires cta_read_docs when the secondary CTA is clicked", () => {
    trackEventSpy.mockReset();
    render(<Hero />);
    fireEvent.click(screen.getByText("Read the docs"));
    expect(trackEventSpy).toHaveBeenCalledWith("cta_read_docs", {
      location: "hero",
      destination: "/docs",
    });
  });

  it("does not render any ambient orb or grid-bg elements", () => {
    const { container } = render(<Hero />);
    expect(container.querySelector('[class*="gofasta-orb"]')).toBeNull();
    expect(container.querySelector('[class*="gofasta-grid-bg"]')).toBeNull();
  });

  it("contains no emoji characters", () => {
    const { container } = render(<Hero />);
    expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u);
  });
});
