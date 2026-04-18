import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { PillarCard } from "./pillar-card";

describe("PillarCard", () => {
  it("renders number, title, description, and icon", () => {
    render(
      <PillarCard
        number="01"
        icon={<svg data-testid="icon" />}
        title="Pillar"
        description="A pillar description"
      />
    );
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("Pillar")).toBeInTheDocument();
    expect(screen.getByText("A pillar description")).toBeInTheDocument();
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });
});
