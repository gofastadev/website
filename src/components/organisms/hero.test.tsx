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

  it("renders the subtitle", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Gofasta is a CLI and library for Go backend services/)
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

  it("renders the success message in terminal", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Project myapp created successfully!/)
    ).toBeInTheDocument();
  });

  it("renders the dev server URL", () => {
    render(<Hero />);
    expect(screen.getByText(/http:\/\/localhost:8080/)).toBeInTheDocument();
  });

  it("renders the actual dev startup message", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Starting gofasta development server.../)
    ).toBeInTheDocument();
  });
});
