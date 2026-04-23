import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { NotFound } from "./not-found";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("NotFound", () => {
  it("renders the 404 status badge", () => {
    render(<NotFound />);
    expect(screen.getByText(/HTTP 404 · route not found/)).toBeInTheDocument();
  });

  it("renders the giant 404 headline", () => {
    render(<NotFound />);
    expect(screen.getByRole("heading", { level: 1, name: "404" })).toBeInTheDocument();
  });

  it("renders the witty subheadline", () => {
    render(<NotFound />);
    expect(
      screen.getByRole("heading", { level: 2, name: /didn['’]t compile/ }),
    ).toBeInTheDocument();
  });

  it("renders the terminal with the compile-error suggestions", () => {
    render(<NotFound />);
    expect(screen.getByText(/undefined: requested-path/)).toBeInTheDocument();
    expect(screen.getByText("/docs/getting-started")).toBeInTheDocument();
    // /docs/cli-reference and /docs/white-paper appear twice: once inside
    // the terminal's suggestion list, once as a destination-card path label.
    expect(screen.getAllByText("/docs/cli-reference").length).toBeGreaterThan(0);
    expect(screen.getAllByText("/docs/white-paper").length).toBeGreaterThan(0);
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
});
