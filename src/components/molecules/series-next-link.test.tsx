import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeriesNextLink } from "./series-next-link";

describe("SeriesNextLink", () => {
  it("renders the series label and a link to the next part", () => {
    render(
      <SeriesNextLink
        seriesName="Deploy Anywhere"
        title="Rollbacks"
        slug="deploy-3"
      />,
    );
    expect(screen.getByText("Next in Deploy Anywhere")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Rollbacks/ })).toHaveAttribute(
      "href",
      "/blog/deploy-3",
    );
  });
});
