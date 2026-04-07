import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ComingSoon } from "./coming-soon";

const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush }),
}));

describe("ComingSoon", () => {
  it("renders the Coming Soon badge", () => {
    render(<ComingSoon />);
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });

  it("renders the headline", () => {
    render(<ComingSoon />);
    expect(screen.getByText("almost here.")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<ComingSoon />);
    expect(
      screen.getByText(/composable packages, and zero magic/)
    ).toBeInTheDocument();
  });

  it("renders the Read the White Paper CTA and navigates on click", () => {
    render(<ComingSoon />);
    const cta = screen.getByText("Read the White Paper");
    expect(cta).toBeInTheDocument();
    expect(cta.tagName).toBe("BUTTON");
    fireEvent.click(cta);
    expect(mockPush).toHaveBeenCalledWith("/docs/white-paper");
  });

  it("renders the Star on GitHub CTA and opens in new tab on click", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);
    render(<ComingSoon />);
    const github = screen.getByText("Star on GitHub");
    expect(github).toBeInTheDocument();
    expect(github.tagName).toBe("BUTTON");
    fireEvent.click(github);
    expect(openSpy).toHaveBeenCalledWith(
      "https://github.com/gofastadev/gofasta",
      "_blank"
    );
    openSpy.mockRestore();
  });

  it("renders the logo image", () => {
    render(<ComingSoon />);
    const logo = screen.getByAltText("Gofasta");
    expect(logo).toBeInTheDocument();
  });

  it("renders the copyright notice", () => {
    render(<ComingSoon />);
    expect(screen.getByText(/Gofasta Authors/)).toBeInTheDocument();
  });
});
