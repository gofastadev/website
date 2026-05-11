import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

// Stub @giscus/react so the component renders without trying to inject
// an actual GitHub Discussions iframe (jsdom can't simulate that).
vi.mock("@giscus/react", () => ({
  default: (props: Record<string, unknown>) => (
    <div data-testid="giscus-mount" data-props={JSON.stringify(props)} />
  ),
}));

// Override the global next-themes mock so individual tests can toggle
// `resolvedTheme` and assert how the Giscus iframe theme reacts.
const themeRef = vi.hoisted(() => ({
  current: undefined as "light" | "dark" | undefined,
}));
vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme: themeRef.current }),
}));

import { Comments } from "./comments";

const FULL_ENV = {
  NEXT_PUBLIC_GISCUS_REPO: "gofastadev/website",
  NEXT_PUBLIC_GISCUS_REPO_ID: "R_kgD0_repoId",
  NEXT_PUBLIC_GISCUS_CATEGORY: "Announcements",
  NEXT_PUBLIC_GISCUS_CATEGORY_ID: "DIC_kwD0_catId",
};

const ENV_KEYS = Object.keys(FULL_ENV) as (keyof typeof FULL_ENV)[];
const previousValues: Record<string, string | undefined> = {};

beforeEach(() => {
  themeRef.current = undefined;
  for (const k of ENV_KEYS) {
    previousValues[k] = process.env[k];
    process.env[k] = FULL_ENV[k];
  }
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (previousValues[k] === undefined) {
      delete process.env[k];
    } else {
      process.env[k] = previousValues[k];
    }
  }
});

describe("Comments (Giscus wrapper)", () => {
  it("mounts Giscus with pathname mapping when all env vars are configured", () => {
    render(<Comments />);
    const mount = screen.getByTestId("giscus-mount");
    const props = JSON.parse(mount.getAttribute("data-props") ?? "{}");
    expect(props.repo).toBe("gofastadev/website");
    expect(props.repoId).toBe("R_kgD0_repoId");
    expect(props.category).toBe("Announcements");
    expect(props.categoryId).toBe("DIC_kwD0_catId");
    expect(props.mapping).toBe("pathname");
    expect(props.theme).toBe("dark");
    expect(props.loading).toBe("lazy");
  });

  it("renders inside a Comments section heading", () => {
    render(<Comments />);
    expect(screen.getByText("Comments")).toBeInTheDocument();
    expect(
      screen.getByRole("region", { name: "Comments" }),
    ).toBeInTheDocument();
  });

  it("renders nothing when NEXT_PUBLIC_GISCUS_REPO is missing", () => {
    delete process.env.NEXT_PUBLIC_GISCUS_REPO;
    const { container } = render(<Comments />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when NEXT_PUBLIC_GISCUS_REPO has the wrong shape", () => {
    process.env.NEXT_PUBLIC_GISCUS_REPO = "not-a-valid-owner-name-pair";
    const { container } = render(<Comments />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when NEXT_PUBLIC_GISCUS_REPO_ID is missing", () => {
    delete process.env.NEXT_PUBLIC_GISCUS_REPO_ID;
    const { container } = render(<Comments />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when NEXT_PUBLIC_GISCUS_CATEGORY is missing", () => {
    delete process.env.NEXT_PUBLIC_GISCUS_CATEGORY;
    const { container } = render(<Comments />);
    expect(container.firstChild).toBeNull();
  });

  it("renders nothing when NEXT_PUBLIC_GISCUS_CATEGORY_ID is missing", () => {
    delete process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID;
    const { container } = render(<Comments />);
    expect(container.firstChild).toBeNull();
  });

  it("passes Giscus a light theme when next-themes resolves to light", () => {
    themeRef.current = "light";
    render(<Comments />);
    const props = JSON.parse(
      screen.getByTestId("giscus-mount").getAttribute("data-props") ?? "{}",
    );
    expect(props.theme).toBe("light");
  });

  it("passes Giscus a dark theme when next-themes resolves to dark", () => {
    themeRef.current = "dark";
    render(<Comments />);
    const props = JSON.parse(
      screen.getByTestId("giscus-mount").getAttribute("data-props") ?? "{}",
    );
    expect(props.theme).toBe("dark");
  });
});
