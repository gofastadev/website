import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotFound } from "./not-found";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("NotFound", () => {
  it("renders the flat mono 404 headline with no gradient or shimmer classes", () => {
    render(<NotFound />);
    const heading = screen.getByRole("heading", { level: 1, name: "404" });
    expect(heading).toBeInTheDocument();
    expect(heading.className).toContain("font-mono");
    expect(heading.className).toContain("text-gray-200");
    expect(heading.className).toContain("dark:text-gray-800");
    expect(heading.className).not.toContain("gofasta-headline-shimmer");
    expect(heading.className).not.toContain("bg-gradient-to-br");
    expect(heading.className).not.toContain("bg-clip-text");
    expect(heading.className).not.toContain("text-transparent");
  });

  it("does not render the ambient grid, glow, orbs, breathing code, or badge pill", () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector(".gofasta-grid-bg")).not.toBeInTheDocument();
    expect(container.querySelector(".gofasta-orb")).not.toBeInTheDocument();
    expect(container.querySelector(".gofasta-orb-slow")).not.toBeInTheDocument();
    expect(container.querySelector(".gofasta-code-breath")).not.toBeInTheDocument();
    expect(container.querySelector(".gofasta-pulse-dot")).not.toBeInTheDocument();
    expect(screen.queryByText(/HTTP 404/)).not.toBeInTheDocument();
  });

  it("renders the witty subheadline in sentence case", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 2, name: /didn['’]t compile/ }),
    ).toBeInTheDocument();
  });

  it("renders the terminal with title 'gofasta routes' and the compile-error suggestions", () => {
    render(<NotFound />);
    expect(screen.getByText("gofasta routes")).toBeInTheDocument();
    expect(screen.getByText(/undefined: requested-path/)).toBeInTheDocument();
    expect(screen.getByText("/docs/getting-started")).toBeInTheDocument();
    // /docs/cli-reference and /docs/white-paper appear twice: once inside
    // the terminal's suggestion list, once as a destination-card path label.
    expect(screen.getAllByText("/docs/cli-reference").length).toBeGreaterThan(0);
    expect(screen.getAllByText("/docs/white-paper").length).toBeGreaterThan(0);
  });

  it("uses term-err and term-warn tokens for the error and note lines", () => {
    const { container } = render(<NotFound />);
    expect(container.querySelector(".term-err")).toBeInTheDocument();
    expect(container.querySelector(".term-warn")).toBeInTheDocument();
  });

  it("navigates home when the primary CTA is clicked", () => {
    render(<NotFound />);
    fireEvent.click(screen.getByText("Take me home"));
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("navigates to the docs when the secondary CTA is clicked", () => {
    render(<NotFound />);
    fireEvent.click(screen.getByText("Browse the docs"));
    expect(mockPush).toHaveBeenCalledWith("/docs/getting-started/introduction");
  });

  it("renders the popular-destinations label in sentence case with no uppercase tracking", () => {
    render(<NotFound />);
    const label = screen.getByText("Or jump to a popular destination");
    expect(label.className).not.toContain("uppercase");
    expect(label.className).not.toContain("tracking-[0.18em]");
  });

  it("renders the seam-grid destination list", () => {
    const { container } = render(<NotFound />);
    const list = container.querySelector("ul");
    expect(list).toBeInTheDocument();
    expect(list?.className).toContain("gap-px");
    expect(list?.className).toContain("bg-gray-200");
  });

  it("renders all popular destination cards with their hrefs", () => {
    render(<NotFound />);
    const gettingStarted = screen.getByRole("link", { name: /Getting Started/ });
    expect(gettingStarted).toHaveAttribute(
      "href",
      "/docs/getting-started/introduction",
    );

    const cliRef = screen.getByRole("link", { name: /CLI Reference/ });
    expect(cliRef).toHaveAttribute("href", "/docs/cli-reference");

    const apiRef = screen.getByRole("link", { name: /API Reference/ });
    expect(apiRef).toHaveAttribute("href", "/docs/api-reference");

    const whitePaper = screen.getByRole("link", { name: /White Paper/ });
    expect(whitePaper).toHaveAttribute("href", "/docs/white-paper");
  });

  it("renders the GitHub report-broken-link off-ramp as an external link", () => {
    render(<NotFound />);
    const issueLink = screen.getByRole("link", { name: "Let us know on GitHub" });
    expect(issueLink).toHaveAttribute(
      "href",
      "https://github.com/gofastadev/website/issues/new",
    );
    expect(issueLink).toHaveAttribute("target", "_blank");
    expect(issueLink).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("does not contain em or en dashes anywhere in the rendered text", () => {
    const { container } = render(<NotFound />);
    expect(container.textContent).not.toMatch(/[–—]/);
  });
});
