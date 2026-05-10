import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { act, render, screen } from "@testing-library/react";
import {
  ConsentProvider,
  useConsent,
  STORAGE_KEY,
  CURRENT_VERSION,
} from "./consent-context";

// Probe component — surfaces the consent state so individual tests
// can assert on what the provider holds without spinning up real
// banner UI.
function Probe() {
  const { consent, hydrated, setAnalyticsConsent, resetConsent } = useConsent();
  return (
    <div>
      <div data-testid="hydrated">{String(hydrated)}</div>
      <div data-testid="analytics">{String(consent.analytics)}</div>
      <div data-testid="version">{String(consent.version)}</div>
      <button onClick={() => setAnalyticsConsent(true)}>accept</button>
      <button onClick={() => setAnalyticsConsent(false)}>reject</button>
      <button onClick={resetConsent}>reset</button>
    </div>
  );
}

describe("ConsentProvider / useConsent", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it("starts with analytics=null and hydrates from empty localStorage", async () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    // Effects run synchronously under RTL's render; both the initial
    // and post-hydration states should resolve to undecided + hydrated.
    expect(screen.getByTestId("analytics").textContent).toBe("null");
    expect(screen.getByTestId("hydrated").textContent).toBe("true");
  });

  it("persists Accept to localStorage with timestamp + version", () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    act(() => {
      screen.getByText("accept").click();
    });
    expect(screen.getByTestId("analytics").textContent).toBe("true");
    const raw = window.localStorage.getItem(STORAGE_KEY);
    expect(raw).not.toBeNull();
    const stored = JSON.parse(raw!);
    expect(stored.analytics).toBe(true);
    expect(stored.version).toBe(CURRENT_VERSION);
    expect(typeof stored.decidedAt).toBe("string");
  });

  it("persists Reject the same way", () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    act(() => {
      screen.getByText("reject").click();
    });
    expect(screen.getByTestId("analytics").textContent).toBe("false");
    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY)!);
    expect(stored.analytics).toBe(false);
  });

  it("reset clears localStorage and reverts to undecided", () => {
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    act(() => {
      screen.getByText("accept").click();
    });
    expect(screen.getByTestId("analytics").textContent).toBe("true");
    act(() => {
      screen.getByText("reset").click();
    });
    expect(screen.getByTestId("analytics").textContent).toBe("null");
    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("hydrates an existing valid record from localStorage", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: "2026-01-01T00:00:00.000Z",
        version: CURRENT_VERSION,
      }),
    );
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByTestId("analytics").textContent).toBe("true");
  });

  it("ignores stored records with a stale schema version", () => {
    // Version mismatch → record is treated as missing, banner reappears.
    // This is the migration-safety contract: bumping CURRENT_VERSION
    // re-prompts every existing user.
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: "2026-01-01T00:00:00.000Z",
        version: CURRENT_VERSION - 1,
      }),
    );
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByTestId("analytics").textContent).toBe("null");
  });

  it("falls back to undecided on malformed JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "{not-json");
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByTestId("analytics").textContent).toBe("null");
  });

  it("falls back to undecided on a record with the wrong analytics type", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: "yes",
        decidedAt: "2026-01-01T00:00:00.000Z",
        version: CURRENT_VERSION,
      }),
    );
    render(
      <ConsentProvider>
        <Probe />
      </ConsentProvider>,
    );
    expect(screen.getByTestId("analytics").textContent).toBe("null");
  });

  it("throws when useConsent is called outside the provider", () => {
    // RTL surfaces the throw via React's error boundary path; capture it
    // by rendering and asserting on the suppressed error console call.
    expect(() => render(<Probe />)).toThrow(/inside <ConsentProvider/);
  });
});
