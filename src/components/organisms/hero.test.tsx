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
    expect(screen.getByText("Start shipping.")).toBeInTheDocument();
  });

  it("renders the Open Source badge", () => {
    render(<Hero />);
    expect(screen.getByText("Open Source Go Toolkit")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Gofasta generates production-ready Go backends/)
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
      "https://github.com/gofastadev/gofasta",
      "_blank"
    );
    openSpy.mockRestore();
  });

  it("renders the terminal block with gofasta command", () => {
    render(<Hero />);
    expect(screen.getByText("Terminal")).toBeInTheDocument();
    expect(screen.getByText(/gofasta/)).toBeInTheDocument();
  });

  it("renders the Done message in terminal", () => {
    render(<Hero />);
    expect(
      screen.getByText("Done! Project created at ./myapp")
    ).toBeInTheDocument();
  });

  it("renders the server running message", () => {
    render(<Hero />);
    expect(
      screen.getByText("Server running at http://localhost:8080")
    ).toBeInTheDocument();
  });
});
