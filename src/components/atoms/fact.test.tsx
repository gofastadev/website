import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Fact } from "./fact";

describe("Fact", () => {
  it("renders the resolved fact value as text", () => {
    render(
      <p>
        creates <Fact name="scaffold.createdCount" /> files
      </p>,
    );
    expect(screen.getByText(/creates 18 files/)).toBeInTheDocument();
  });

  it("throws on unknown fact names so drift fails the build", () => {
    expect(() => render(<Fact name="no.such.fact" />)).toThrow(/unknown field/);
  });
});
