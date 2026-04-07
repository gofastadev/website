import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
  it("renders with default primary variant", () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole("button", { name: "Click me" });
    expect(button).toBeInTheDocument();
    expect(button.className).toContain("bg-primary");
    expect(button.className).toContain("text-white");
  });

  it("renders with secondary variant", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button", { name: "Secondary" });
    expect(button.className).toContain("border-primary");
    expect(button.className).toContain("text-primary");
  });

  it("renders with default size", () => {
    render(<Button>Default</Button>);
    const button = screen.getByRole("button", { name: "Default" });
    expect(button.className).toContain("px-4");
    expect(button.className).toContain("text-sm");
  });

  it("renders with lg size", () => {
    render(<Button size="lg">Large</Button>);
    const button = screen.getByRole("button", { name: "Large" });
    expect(button.className).toContain("px-6");
    expect(button.className).toContain("text-base");
  });

  it("passes additional className", () => {
    render(<Button className="mt-4">Styled</Button>);
    const button = screen.getByRole("button", { name: "Styled" });
    expect(button.className).toContain("mt-4");
  });

  it("handles click events", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Clickable</Button>);
    fireEvent.click(screen.getByRole("button", { name: "Clickable" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("can be disabled", () => {
    render(<Button disabled>Disabled</Button>);
    const button = screen.getByRole("button", { name: "Disabled" });
    expect(button).toBeDisabled();
  });
});
