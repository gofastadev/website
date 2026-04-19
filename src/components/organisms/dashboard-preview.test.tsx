import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { DashboardPreview } from "./dashboard-preview";

describe("DashboardPreview", () => {
  it("renders the section heading", () => {
    render(<DashboardPreview />);
    expect(
      screen.getByText("Debug visually, not through log greps.")
    ).toBeInTheDocument();
  });

  it("renders the eyebrow", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("Local dev dashboard")).toBeInTheDocument();
  });

  it("renders every capability title", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("App health at a glance")).toBeInTheDocument();
    expect(
      screen.getByText("Live compose service status")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Every REST route you've defined")
    ).toBeInTheDocument();
    expect(
      screen.getByText("One-click jumps to the ancillary endpoints")
    ).toBeInTheDocument();
    expect(screen.getByText("Zero runtime coupling")).toBeInTheDocument();
  });

  it("renders the mockup browser url bar pointing at localhost:9090", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("localhost:9090")).toBeInTheDocument();
  });

  it("renders the mocked services table entries", () => {
    render(<DashboardPreview />);
    expect(screen.getByText("db")).toBeInTheDocument();
    expect(screen.getByText("cache")).toBeInTheDocument();
    expect(screen.getByText("queue")).toBeInTheDocument();
    expect(screen.getByText("postgres:16-alpine")).toBeInTheDocument();
    expect(screen.getByText("redis:7-alpine")).toBeInTheDocument();
  });

  it("renders a sample set of routes with methods", () => {
    render(<DashboardPreview />);
    // `/users` appears in multiple rows (index + get-by-id + delete, etc.)
    // so use getAllByText.
    expect(screen.getAllByText("/users").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("/users/{id}").length).toBeGreaterThanOrEqual(1);
    // Multiple HTTP methods should be visible in the mocked routes table.
    expect(screen.getAllByText("GET").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("POST")).toBeInTheDocument();
    expect(screen.getByText("DELETE")).toBeInTheDocument();
  });
});
