import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureCard } from "./feature-card";

describe("FeatureCard", () => {
  const defaultProps = {
    icon: <svg data-testid="test-icon" />,
    title: "Code Generation",
    description: "Generate CRUD in one command.",
  };

  it("renders the title", () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText("Code Generation")).toBeInTheDocument();
  });

  it("renders the description", () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByText("Generate CRUD in one command.")).toBeInTheDocument();
  });

  it("renders the icon inside a FeatureIcon", () => {
    render(<FeatureCard {...defaultProps} />);
    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });
});
