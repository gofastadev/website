import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";

// nextra/page-map's getPageMap is mocked per-test; we set the mock's
// resolved value to the page-map shape we want each scenario to see.
const getPageMapMock = vi.fn();
vi.mock("nextra/page-map", () => ({
  getPageMap: (route?: string) => getPageMapMock(route),
}));

import { RelatedPages } from "./related-pages";

// React server components return Promises — render them by awaiting and
// passing the resolved JSX to RTL's render. Vitest + React 19 supports
// this directly.
async function renderRSC(node: Promise<React.ReactElement | null>) {
  const resolved = await node;
  if (resolved === null) {
    return { container: null };
  }
  return render(resolved);
}

describe("RelatedPages", () => {
  beforeEach(() => {
    getPageMapMock.mockReset();
  });

  it("renders sibling MDX files from the section, excluding the current page", async () => {
    getPageMapMock.mockResolvedValue([
      { name: "config", route: "/docs/cli-reference/config", frontMatter: { title: "Config" } },
      { name: "dev", route: "/docs/cli-reference/dev", frontMatter: { title: "Dev" } },
      { name: "deploy", route: "/docs/cli-reference/deploy", frontMatter: { title: "Deploy" } },
    ]);

    await renderRSC(RelatedPages({ path: "cli-reference/dev" }));

    expect(screen.getByText("Config")).toBeInTheDocument();
    expect(screen.getByText("Deploy")).toBeInTheDocument();
    expect(screen.queryByText("Dev")).not.toBeInTheDocument();
    expect(getPageMapMock).toHaveBeenCalledWith("/docs/cli-reference");
  });

  it("falls back to the slug name when frontMatter.title is missing", async () => {
    getPageMapMock.mockResolvedValue([
      { name: "init", route: "/docs/cli-reference/init", frontMatter: {} },
      { name: "dev", route: "/docs/cli-reference/dev", frontMatter: { title: "Dev" } },
    ]);

    await renderRSC(RelatedPages({ path: "cli-reference/dev" }));

    expect(screen.getByText("init")).toBeInTheDocument();
  });

  it("filters out folders and hidden/index entries", async () => {
    getPageMapMock.mockResolvedValue([
      { name: "_meta", route: "/docs/cli-reference/_meta" }, // hidden
      { name: "index", route: "/docs/cli-reference" }, // section landing
      {
        name: "generate",
        route: "/docs/cli-reference/generate",
        children: [], // folder, has children — must be skipped
      },
      { name: "dev", route: "/docs/cli-reference/dev", frontMatter: { title: "Dev" } },
      { name: "config", route: "/docs/cli-reference/config", frontMatter: { title: "Config" } },
    ]);

    await renderRSC(RelatedPages({ path: "cli-reference/dev" }));

    expect(screen.getByText("Config")).toBeInTheDocument();
    expect(screen.queryByText("_meta")).not.toBeInTheDocument();
    expect(screen.queryByText("index")).not.toBeInTheDocument();
    expect(screen.queryByText("generate")).not.toBeInTheDocument();
  });

  it("renders extra cross-section links after the siblings", async () => {
    getPageMapMock.mockResolvedValue([
      { name: "config", route: "/docs/cli-reference/config", frontMatter: { title: "Config" } },
    ]);

    await renderRSC(
      RelatedPages({
        path: "cli-reference/dev",
        extra: [
          { href: "/docs/api-reference/cache", label: "pkg/cache" },
          { href: "/docs/guides/configuration", label: "Configuration guide" },
        ],
      }),
    );

    expect(screen.getByText("Config")).toBeInTheDocument();
    expect(screen.getByText("pkg/cache")).toBeInTheDocument();
    expect(screen.getByText("Configuration guide")).toBeInTheDocument();
  });

  it("returns null when there are no siblings AND no extras", async () => {
    getPageMapMock.mockResolvedValue([
      { name: "dev", route: "/docs/cli-reference/dev", frontMatter: { title: "Dev" } },
    ]);

    const { container } = await renderRSC(RelatedPages({ path: "cli-reference/dev" }));

    // Empty section → component renders nothing.
    expect(container).toBeNull();
  });

  it("survives a getPageMap throw and falls back to extras-only", async () => {
    getPageMapMock.mockImplementation(() => {
      throw new Error("unknown route");
    });

    await renderRSC(
      RelatedPages({
        path: "cli-reference/dev",
        extra: [{ href: "/docs/guides/configuration", label: "Configuration" }],
      }),
    );

    expect(screen.getByText("Configuration")).toBeInTheDocument();
  });

  it("queries the parent folder for nested paths like guides/debugging/architecture", async () => {
    getPageMapMock.mockResolvedValue([
      { name: "architecture", route: "/docs/guides/debugging/architecture", frontMatter: { title: "Architecture" } },
      { name: "tracing", route: "/docs/guides/debugging/tracing", frontMatter: { title: "Tracing" } },
    ]);

    await renderRSC(RelatedPages({ path: "guides/debugging/architecture" }));

    expect(getPageMapMock).toHaveBeenCalledWith("/docs/guides/debugging");
    expect(screen.getByText("Tracing")).toBeInTheDocument();
    expect(screen.queryByText("Architecture")).not.toBeInTheDocument();
  });

  it("returns null when path is empty", async () => {
    const { container } = await renderRSC(RelatedPages({ path: "" }));
    expect(container).toBeNull();
  });

  it("queries the docs root for single-segment paths like white-paper", async () => {
    // path="white-paper" has only one segment, so the section route is
    // /docs (not /docs/<something>). This exercises the `segments.length > 1`
    // false branch in the route-builder.
    getPageMapMock.mockResolvedValue([
      { name: "index", route: "/docs", frontMatter: { title: "Documentation" } },
      { name: "white-paper", route: "/docs/white-paper", frontMatter: { title: "White Paper" } },
    ]);

    await renderRSC(
      RelatedPages({
        path: "white-paper",
        extra: [{ href: "/docs/getting-started/introduction", label: "Introduction" }],
      }),
    );

    expect(getPageMapMock).toHaveBeenCalledWith("/docs");
    // Current page is excluded; "index" is filtered out by isRenderableMdx.
    expect(screen.queryByText("White Paper")).not.toBeInTheDocument();
    expect(screen.queryByText("Documentation")).not.toBeInTheDocument();
    expect(screen.getByText("Introduction")).toBeInTheDocument();
  });

  it("filters out non-object items from the page map (defensive)", async () => {
    // The page map type is theoretically PageMapItem[], but
    // isRenderableMdx is defensive against unusual shapes — strings,
    // numbers, nulls, objects with non-string `name` or `route`. This
    // test exercises each rejected shape so a future page-map schema
    // change doesn't silently crash the component.
    getPageMapMock.mockResolvedValue([
      null,                                                              // non-object
      "this-is-a-string",                                                // string entry
      42,                                                                // number entry
      { route: "/docs/cli-reference/missing-name" },                     // missing name
      { name: "missing-route" },                                         // missing route
      { name: 123, route: "/docs/cli-reference/numeric-name" },          // wrong-typed name
      { name: "wrong-route", route: 42 },                                // wrong-typed route
      { name: "config", route: "/docs/cli-reference/config", frontMatter: { title: "Config" } },
    ]);

    await renderRSC(RelatedPages({ path: "cli-reference/dev" }));

    // Only the well-formed entry survives.
    expect(screen.getByText("Config")).toBeInTheDocument();
    expect(screen.queryByText("missing-route")).not.toBeInTheDocument();
    expect(screen.queryByText("wrong-route")).not.toBeInTheDocument();
  });

  it("uses semantic <nav> with aria-label for screen readers", async () => {
    getPageMapMock.mockResolvedValue([
      { name: "config", route: "/docs/cli-reference/config", frontMatter: { title: "Config" } },
    ]);

    await renderRSC(RelatedPages({ path: "cli-reference/dev" }));

    const nav = screen.getByRole("navigation", { name: "Related pages" });
    expect(nav).toBeInTheDocument();
  });
});
