import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// usePathname is the only routing dependency; each test sets the mock's
// return value to the route under test.
const usePathnameMock = vi.fn<() => string | null>();
vi.mock("next/navigation", () => ({
  usePathname: () => usePathnameMock(),
}));

// The chrome pieces themselves are tested in their own files — here they
// are stubbed so the tests assert exactly one thing: which routes get
// the analytics/cookie stack and which are isolated from it.
vi.mock("@/components/atoms", () => ({
  Analytics: () => <div data-testid="analytics" />,
  PageviewTracker: () => <div data-testid="pageview-tracker" />,
}));
vi.mock("@/components/organisms", () => ({
  CookieBanner: () => <div data-testid="cookie-banner" />,
}));

import { SiteChrome } from "./site-chrome";

describe("SiteChrome", () => {
  beforeEach(() => {
    usePathnameMock.mockReset();
  });

  it("renders the analytics + tracker + cookie-banner stack on public routes", () => {
    usePathnameMock.mockReturnValue("/blog/hello-gofasta");
    render(<SiteChrome />);
    expect(screen.getByTestId("analytics")).toBeInTheDocument();
    expect(screen.getByTestId("pageview-tracker")).toBeInTheDocument();
    expect(screen.getByTestId("cookie-banner")).toBeInTheDocument();
  });

  it("renders nothing under /keystatic so the admin SPA stays isolated", () => {
    usePathnameMock.mockReturnValue("/keystatic/branch/main");
    const { container } = render(<SiteChrome />);
    expect(container).toBeEmptyDOMElement();
  });

  it("treats a null pathname as a public route (chrome still renders)", () => {
    usePathnameMock.mockReturnValue(null);
    render(<SiteChrome />);
    expect(screen.getByTestId("analytics")).toBeInTheDocument();
  });
});
