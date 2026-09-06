import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ConsentProvider, STORAGE_KEY, CURRENT_VERSION } from "@/contexts/consent-context";
import { CookieBanner } from "./cookie-banner";

// usePathname is mocked per-test so a single it() can simulate a
// /keystatic visit without rewriting the test runner's URL.
let mockPathname: string | null = "/";
vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

describe("CookieBanner", () => {
  beforeEach(() => {
    window.localStorage.clear();
    mockPathname = "/";
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it("renders the consent prompt when no decision has been recorded", () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    expect(screen.getByRole("region", { name: "Cookie consent" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("hides itself once the user accepts", () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(screen.queryByRole("region", { name: "Cookie consent" })).not.toBeInTheDocument();
  });

  it("hides itself once the user rejects", () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.queryByRole("region", { name: "Cookie consent" })).not.toBeInTheDocument();
  });

  it("does not render when a previous decision is already on file", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: "2026-01-01T00:00:00.000Z",
        version: CURRENT_VERSION,
      }),
    );
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    expect(screen.queryByRole("region", { name: "Cookie consent" })).not.toBeInTheDocument();
  });

  it("links to the /cookies page for more details", () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    const link = screen.getByRole("link", { name: /cookie policy/i });
    expect(link).toHaveAttribute("href", "/cookies");
  });

  // GDPR Article 7 + EDPB 05/2020: Reject must be no harder to find or
  // act on than Accept. We can't assert visual prominence in jsdom but
  // we CAN assert both buttons are present and reachable as buttons.
  it("exposes Accept and Reject as equal-prominence buttons", () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    const accept = screen.getByRole("button", { name: "Accept" });
    const reject = screen.getByRole("button", { name: "Reject" });
    expect(accept.tagName).toBe(reject.tagName);
    expect(accept).not.toHaveAttribute("aria-hidden");
    expect(reject).not.toHaveAttribute("aria-hidden");
  });

  it("does not render on the Keystatic admin UI", () => {
    // Editors visiting /keystatic shouldn't see the consent banner —
    // they're authenticated operators with repo write access, and the
    // banner would overlap Keystatic's sidebar layout.
    mockPathname = "/keystatic";
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    expect(
      screen.queryByRole("region", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  // Opaque, tokened surface (task 19): the glassmorphism/backdrop-blur
  // stack is gone in favor of bg-surface + shadow-e3, and the
  // nonexistent dark:bg-gray-950 token is removed.
  it("uses an opaque tokened surface (bg-surface, shadow-e3, no backdrop-blur)", () => {
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    const region = screen.getByRole("region", { name: "Cookie consent" });
    expect(region.className).toContain("bg-surface");
    expect(region.className).toContain("shadow-e3");
    expect(region.className).not.toContain("backdrop-blur");
    expect(region.className).not.toContain("dark:bg-gray-950");
  });

  it("does not render on nested Keystatic paths", () => {
    mockPathname = "/keystatic/collection/posts";
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    expect(
      screen.queryByRole("region", { name: "Cookie consent" }),
    ).not.toBeInTheDocument();
  });

  it("survives a null pathname (no /keystatic match → banner renders)", () => {
    // usePathname can return null during certain Next.js rendering
    // passes. The pathname guard uses optional chaining + startsWith,
    // which evaluates to undefined (falsy) and lets the banner render.
    mockPathname = null;
    render(
      <ConsentProvider>
        <CookieBanner />
      </ConsentProvider>,
    );
    expect(
      screen.getByRole("region", { name: "Cookie consent" }),
    ).toBeInTheDocument();
  });
});
