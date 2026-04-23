import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AudienceCard } from "./audience-card";

describe("AudienceCard", () => {
  it("renders title, description, and icon", () => {
    render(
      <AudienceCard
        icon={<svg data-testid="icon" />}
        title="Solo"
        description="A description"
      />
    );
    expect(screen.getByText("Solo")).toBeInTheDocument();
    expect(screen.getByText("A description")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
