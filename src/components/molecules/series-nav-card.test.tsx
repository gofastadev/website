import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SeriesNavCard } from "./series-nav-card";

const ITEMS = [
  { slug: "deploy-1", title: "Choosing a VPS", part: 1 },
  { slug: "deploy-2", title: "First deploy", part: 2 },
  { slug: "deploy-3", title: "Rollbacks", part: 3 },
];

describe("SeriesNavCard", () => {
  it("labels the nav with the series and the current position", () => {
    render(
      <SeriesNavCard
        seriesName="Deploy Anywhere"
        items={ITEMS}
        currentSlug="deploy-2"
      />,
    );
    expect(
      screen.getByRole("navigation", { name: "Series: Deploy Anywhere" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Part 2 of 3 in: Deploy Anywhere"),
    ).toBeInTheDocument();
  });

  it("lists every part in order, current highlighted and not a link", () => {
    render(
      <SeriesNavCard
        seriesName="Deploy Anywhere"
        items={ITEMS}
        currentSlug="deploy-2"
      />,
    );
    expect(screen.getByRole("link", { name: "Choosing a VPS" })).toHaveAttribute(
      "href",
      "/blog/deploy-1",
    );
    expect(screen.getByRole("link", { name: "Rollbacks" })).toHaveAttribute(
      "href",
      "/blog/deploy-3",
    );
    const current = screen.getByText("First deploy");
    expect(current.tagName).toBe("SPAN");
    expect(current).toHaveAttribute("aria-current", "page");
    expect(
      screen.queryByRole("link", { name: "First deploy" }),
    ).not.toBeInTheDocument();
  });

  it("renders nothing for a single-part series", () => {
    const { container } = render(
      <SeriesNavCard
        seriesName="Solo"
        items={[ITEMS[0]]}
        currentSlug="deploy-1"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders nothing when the current post is not in the list", () => {
    const { container } = render(
      <SeriesNavCard
        seriesName="Deploy Anywhere"
        items={ITEMS}
        currentSlug="unrelated"
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });
});
