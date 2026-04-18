import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Hero } from "./hero";

// Mock next/navigation
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("Hero", () => {
  it("renders the headline", () => {
    render(<Hero />);
    expect(screen.getByText("scaffolded.")).toBeInTheDocument();
  });

  it("renders the eyebrow badge", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Open Source · Go Toolkit · Agent-Native/)
    ).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Gofasta scaffolds a complete backend in one command/)
    ).toBeInTheDocument();
  });

  it("renders the Get Started CTA and navigates on click", () => {
    render(<Hero />);
    const cta = screen.getByText("Get Started");
    expect(cta).toBeInTheDocument();
    expect(cta.tagName).toBe("BUTTON");
    fireEvent.click(cta);
    expect(mockPush).toHaveBeenCalledWith("/docs/getting-started/introduction");
  });

  it("renders the View on GitHub CTA and opens in new tab on click", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<Hero />);
    const github = screen.getByText("View on GitHub");
    expect(github).toBeInTheDocument();
    expect(github.tagName).toBe("BUTTON");
    fireEvent.click(github);
    expect(openSpy).toHaveBeenCalledWith(
      "https://github.com/gofastadev/cli",
      "_blank",
      "noopener,noreferrer"
    );
    openSpy.mockRestore();
  });

  it("renders the terminal block with gofasta command", () => {
    render(<Hero />);
    expect(screen.getByText("Terminal")).toBeInTheDocument();
    expect(screen.getAllByText(/gofasta/).length).toBeGreaterThan(0);
  });

  it("renders the ready message in terminal", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Ready — standard Go, zero lock-in, AGENTS.md scaffolded./)
    ).toBeInTheDocument();
  });

  it("renders the listening message", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Listening on :8080 — \/health, \/metrics, \/swagger live/)
    ).toBeInTheDocument();
  });
});
