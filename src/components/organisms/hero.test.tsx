import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Hero } from "./hero";

describe("Hero", () => {
  it("renders the headline", () => {
    render(<Hero />);
    expect(screen.getByText("lightning speed")).toBeInTheDocument();
  });

  it("renders the Open Source badge", () => {
    render(<Hero />);
    expect(screen.getByText("Open Source Go Framework")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<Hero />);
    expect(
      screen.getByText(/Production-ready scaffolding/)
    ).toBeInTheDocument();
  });

  it("renders the Get Started CTA", () => {
    render(<Hero />);
    const cta = screen.getByText("Get Started");
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveAttribute("href", "/docs/getting-started/introduction");
  });

  it("renders the View on GitHub CTA", () => {
    render(<Hero />);
    const github = screen.getByText("View on GitHub");
    expect(github).toHaveAttribute(
      "href",
      "https://github.com/gofastadev/gofasta"
    );
    expect(github).toHaveAttribute("target", "_blank");
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
