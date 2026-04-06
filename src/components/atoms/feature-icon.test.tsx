import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FeatureIcon } from "./feature-icon";

describe("FeatureIcon", () => {
  it("renders children", () => {
    render(<FeatureIcon><span data-testid="icon">icon</span></FeatureIcon>);
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies custom className", () => {
    render(<FeatureIcon className="mb-4"><span>icon</span></FeatureIcon>);
    expect(screen.getByText("icon").parentElement).toHaveClass("mb-4");
  });

  it("has the primary color styling", () => {
    render(<FeatureIcon><span>icon</span></FeatureIcon>);
    expect(screen.getByText("icon").parentElement).toHaveClass("text-primary");
  });
});
