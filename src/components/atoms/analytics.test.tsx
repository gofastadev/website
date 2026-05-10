import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

// next/script is mocked to a plain element so we can introspect
// `src` / `id` / `strategy` / inline children. The real component's
// behavior (loading deduplication, lifecycle events) isn't what we
// want to test; we want to confirm OUR component renders the right
// invocations conditional on the env vars.
vi.mock("next/script", () => ({
  default: ({
    src,
    id,
    strategy,
    children,
  }: {
    src?: string;
    id?: string;
    strategy?: string;
    children?: React.ReactNode;
  }) => (
    <script
      data-testid="next-script"
      data-src={src}
      data-id={id}
      data-strategy={strategy}
    >
      {children}
    </script>
  ),
}));

// We have to re-import the component AFTER mutating env vars on each
// test because the env values are captured at module-load time. Use
// `vi.resetModules()` between tests + `await import()` to get a fresh
// copy.
async function loadAnalytics(env: { ga4?: string; clarity?: string }) {
  vi.resetModules();
  if (env.ga4 !== undefined) process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = env.ga4;
  else delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  if (env.clarity !== undefined) process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = env.clarity;
  else delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  const mod = await import("./analytics");
  return mod.Analytics;
}

describe("Analytics", () => {
  const originalGA = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
  const originalClarity = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

  beforeEach(() => {
    delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  });

  afterEach(() => {
    if (originalGA !== undefined) process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID = originalGA;
    else delete process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID;
    if (originalClarity !== undefined) process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID = originalClarity;
    else delete process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;
  });

  it("renders nothing when both env vars are unset", async () => {
    const Analytics = await loadAnalytics({});
    const { container } = render(<Analytics />);
    expect(container.querySelectorAll("[data-testid='next-script']")).toHaveLength(0);
  });

  it("renders the gtag loader + init when GA4 ID is set", async () => {
    const Analytics = await loadAnalytics({ ga4: "G-TESTTEST" });
    const { container } = render(<Analytics />);
    const scripts = container.querySelectorAll("[data-testid='next-script']");
    // 2 scripts for GA4: the gtag loader + the inline init.
    expect(scripts).toHaveLength(2);

    const loader = container.querySelector('[data-id="ga4-init"]');
    expect(loader).toBeInTheDocument();
    expect(loader?.textContent).toContain("G-TESTTEST");
    expect(loader?.getAttribute("data-strategy")).toBe("afterInteractive");

    const remoteLoader = Array.from(scripts).find(
      (s) => s.getAttribute("data-src")?.includes("googletagmanager.com"),
    );
    expect(remoteLoader).toBeDefined();
    expect(remoteLoader?.getAttribute("data-src")).toContain("id=G-TESTTEST");
  });

  it("renders the Clarity init when Clarity ID is set", async () => {
    const Analytics = await loadAnalytics({ clarity: "abcdefghij" });
    const { container } = render(<Analytics />);
    const clarity = container.querySelector('[data-id="clarity-init"]');
    expect(clarity).toBeInTheDocument();
    expect(clarity?.textContent).toContain("abcdefghij");
    expect(clarity?.getAttribute("data-strategy")).toBe("afterInteractive");
    // Should NOT load GA4.
    expect(container.querySelector('[data-id="ga4-init"]')).toBeNull();
  });

  it("renders both when both env vars are set", async () => {
    const Analytics = await loadAnalytics({
      ga4: "G-AAAAAAAA",
      clarity: "zzzzzzzzzz",
    });
    const { container } = render(<Analytics />);
    expect(container.querySelector('[data-id="ga4-init"]')).toBeInTheDocument();
    expect(container.querySelector('[data-id="clarity-init"]')).toBeInTheDocument();
    // 3 total: GA4 loader + GA4 init + Clarity init.
    expect(container.querySelectorAll("[data-testid='next-script']")).toHaveLength(3);
  });

  it("does not contact analytics domains when env is empty (smoke check)", async () => {
    const Analytics = await loadAnalytics({});
    const { container } = render(<Analytics />);
    // No script with googletagmanager or clarity.ms in the rendered output.
    const html = container.innerHTML;
    expect(html).not.toContain("googletagmanager.com");
    expect(html).not.toContain("clarity.ms");
  });
});
