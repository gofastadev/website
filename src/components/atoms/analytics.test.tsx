import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render } from "@testing-library/react";

// next/script → plain element so we can introspect strategy / id / src.
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

// useConsent is mocked per-test so we don't have to spin up a real
// provider for every scenario. The mock module lets each test
// configure the consent record + hydration state.
const consentState = {
  consent: { analytics: null as boolean | null, decidedAt: null, version: 1 },
  hydrated: true,
  setAnalyticsConsent: vi.fn(),
  resetConsent: vi.fn(),
};
vi.mock("@/contexts/consent-context", () => ({
  useConsent: () => consentState,
}));

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
    consentState.consent = { analytics: null, decidedAt: null, version: 1 };
    consentState.hydrated = true;
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

  it("emits a Consent Mode v2 default-denied script BEFORE gtag.js loads", async () => {
    const Analytics = await loadAnalytics({ ga4: "G-CONSENT" });
    const { container } = render(<Analytics />);

    const consentDefault = container.querySelector('[data-id="gtag-consent-default"]');
    expect(consentDefault).toBeInTheDocument();
    expect(consentDefault?.getAttribute("data-strategy")).toBe("beforeInteractive");
    // The default MUST set analytics_storage to denied — this is the
    // GDPR-safe posture before user opts in.
    expect(consentDefault?.textContent).toContain("'consent', 'default'");
    expect(consentDefault?.textContent).toContain("analytics_storage: 'denied'");
    expect(consentDefault?.textContent).toContain("ad_storage: 'denied'");
  });

  it("renders the gtag loader + init when GA4 is configured (consent updates handled at runtime)", async () => {
    const Analytics = await loadAnalytics({ ga4: "G-RUNTIME" });
    const { container } = render(<Analytics />);
    const remoteLoader = container.querySelector('[data-src*="googletagmanager.com"]');
    expect(remoteLoader).toBeInTheDocument();
    expect(remoteLoader?.getAttribute("data-src")).toContain("id=G-RUNTIME");
    const init = container.querySelector('[data-id="ga4-init"]');
    expect(init).toBeInTheDocument();
    expect(init?.textContent).toContain("G-RUNTIME");
  });

  it("does NOT render Clarity when consent is undecided (analytics === null)", async () => {
    consentState.consent = { analytics: null, decidedAt: null, version: 1 };
    const Analytics = await loadAnalytics({ clarity: "abcdefghij" });
    const { container } = render(<Analytics />);
    expect(container.querySelector('[data-id="clarity-init"]')).toBeNull();
    // No clarity.ms reference should appear at all.
    expect(container.innerHTML).not.toContain("clarity.ms");
  });

  it("does NOT render Clarity when the user rejected", async () => {
    consentState.consent = { analytics: false, decidedAt: "2026-01-01T00:00:00.000Z", version: 1 };
    const Analytics = await loadAnalytics({ clarity: "abcdefghij" });
    const { container } = render(<Analytics />);
    expect(container.querySelector('[data-id="clarity-init"]')).toBeNull();
  });

  it("renders Clarity ONLY after the user accepts", async () => {
    consentState.consent = { analytics: true, decidedAt: "2026-01-01T00:00:00.000Z", version: 1 };
    const Analytics = await loadAnalytics({ clarity: "abcdefghij" });
    const { container } = render(<Analytics />);
    const clarity = container.querySelector('[data-id="clarity-init"]');
    expect(clarity).toBeInTheDocument();
    expect(clarity?.textContent).toContain("abcdefghij");
  });

  it("does not render Clarity before consent has hydrated, even if analytics=true", async () => {
    // Edge case: `hydrated=false` means we haven't read localStorage
    // yet. The component must not optimistically load Clarity in that
    // window.
    consentState.consent = { analytics: true, decidedAt: "2026-01-01T00:00:00.000Z", version: 1 };
    consentState.hydrated = false;
    const Analytics = await loadAnalytics({ clarity: "abcdefghij" });
    const { container } = render(<Analytics />);
    expect(container.querySelector('[data-id="clarity-init"]')).toBeNull();
  });

  it("loads GA4 regardless of consent (Consent Mode handles the privacy contract)", async () => {
    // GA4 with default-denied is GDPR-compliant — Google does not write
    // identifiers in this state; loading the loader script is safe.
    consentState.consent = { analytics: false, decidedAt: "2026-01-01T00:00:00.000Z", version: 1 };
    const Analytics = await loadAnalytics({ ga4: "G-EVERLOAD" });
    const { container } = render(<Analytics />);
    expect(container.querySelector('[data-src*="googletagmanager.com"]')).toBeInTheDocument();
    expect(container.querySelector('[data-id="gtag-consent-default"]')).toBeInTheDocument();
  });
});
