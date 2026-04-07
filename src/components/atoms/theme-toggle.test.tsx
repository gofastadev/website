import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { mockSetTheme } from "@/__tests__/setup";

const mockUseTheme = vi.fn();

vi.mock("next-themes", () => ({
  useTheme: () => mockUseTheme(),
}));

const { ThemeToggle } = await import("./theme-toggle");

describe("ThemeToggle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseTheme.mockReturnValue({
      theme: "light",
      setTheme: mockSetTheme,
    });
  });

  it("renders the toggle button", () => {
    render(<ThemeToggle />);
    expect(screen.getByRole("button", { name: "Toggle theme" })).toBeInTheDocument();
  });

  it("calls setTheme to dark when in light mode", () => {
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(mockSetTheme).toHaveBeenCalledWith("dark");
  });

  it("calls setTheme to light when in dark mode", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });
    render(<ThemeToggle />);
    fireEvent.click(screen.getByRole("button", { name: "Toggle theme" }));
    expect(mockSetTheme).toHaveBeenCalledWith("light");
  });

  it("renders the moon icon in light mode", () => {
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector("path[d*='21 12.79']")).toBeInTheDocument();
  });

  it("renders the sun icon in dark mode", () => {
    mockUseTheme.mockReturnValue({
      theme: "dark",
      setTheme: mockSetTheme,
    });
    render(<ThemeToggle />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    const svg = button.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg?.querySelector("circle[r='5']")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<ThemeToggle className="extra-class" />);
    const button = screen.getByRole("button", { name: "Toggle theme" });
    expect(button).toHaveClass("extra-class");
  });

  it("renders nothing when not mounted", async () => {
    vi.resetModules();

    vi.doMock("react", async () => {
      const actual = await vi.importActual<typeof import("react")>("react");
      return {
        ...actual,
        useSyncExternalStore: (
          _subscribe: () => () => void,
          _getSnapshot: () => boolean,
          getServerSnapshot?: () => boolean,
        ) => getServerSnapshot?.() ?? false,
      };
    });

    vi.doMock("next-themes", () => ({
      useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
    }));

    const { ThemeToggle: UnmountedToggle } = await import("./theme-toggle");
    const { container } = render(<UnmountedToggle />);
    expect(container.innerHTML).toBe("");
  });
});
