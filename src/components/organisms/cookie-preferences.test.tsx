import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  ConsentProvider,
  STORAGE_KEY,
  CURRENT_VERSION,
} from "@/contexts/consent-context";
import { CookiePreferences } from "./cookie-preferences";

// CookiePreferences is the interactive control surfaced on the
// /cookies page. It has four observable states:
//   1. Pre-hydration  → "Loading current preference…"
//   2. Undecided      → Accept + Reject buttons
//   3. Accepted       → Revoke button + status + timestamp
//   4. Rejected       → Accept button + status + timestamp
//
// Each state has a distinct UI, so tests pin each one and confirm
// transitions persist back to localStorage (via the real provider).

function seedStorage(analytics: boolean | null) {
  if (analytics === null) {
    window.localStorage.removeItem(STORAGE_KEY);
    return;
  }
  window.localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      analytics,
      decidedAt: "2026-01-01T12:34:56.000Z",
      version: CURRENT_VERSION,
    }),
  );
}

describe("CookiePreferences", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });
  afterEach(() => {
    window.localStorage.clear();
  });

  it("shows the Accept and Reject buttons when no decision is recorded", () => {
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    expect(screen.getByRole("button", { name: "Accept" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reject" })).toBeInTheDocument();
  });

  it("records Accept and switches into the accepted state", () => {
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Accept" }));
    expect(screen.getByText(/currently/i)).toBeInTheDocument();
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revoke consent" })).toBeInTheDocument();
  });

  it("records Reject and switches into the rejected state", () => {
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Reject" }));
    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept analytics" })).toBeInTheDocument();
  });

  it("shows the accepted state when an accepted record is already on file", () => {
    seedStorage(true);
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revoke consent" })).toBeInTheDocument();
    // Timestamp surfaces a human-readable form of decidedAt.
    expect(screen.getByText(/Last updated:/i)).toBeInTheDocument();
  });

  it("shows the rejected state when a rejected record is already on file", () => {
    seedStorage(false);
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept analytics" })).toBeInTheDocument();
  });

  it("revoking from the accepted state moves to rejected", () => {
    seedStorage(true);
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Revoke consent" }));
    expect(screen.getByText(/rejected/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Accept analytics" })).toBeInTheDocument();
  });

  it("re-accepting from the rejected state moves back to accepted", () => {
    seedStorage(false);
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    fireEvent.click(screen.getByRole("button", { name: "Accept analytics" }));
    expect(screen.getByText(/accepted/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Revoke consent" })).toBeInTheDocument();
  });

  // Edge cases: a record without `decidedAt` (e.g. corrupted
  // storage) renders without crashing — both branches (accepted and
  // rejected) have their own null-fallback to the em-dash, so we
  // exercise both.
  it("renders a placeholder timestamp on an accepted record without decidedAt", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: true,
        decidedAt: null,
        version: CURRENT_VERSION,
      }),
    );
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    expect(screen.getByText(/Last updated:/i).textContent).toContain("—");
  });

  it("renders a placeholder timestamp on a rejected record without decidedAt", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        analytics: false,
        decidedAt: null,
        version: CURRENT_VERSION,
      }),
    );
    render(
      <ConsentProvider>
        <CookiePreferences />
      </ConsentProvider>,
    );
    expect(screen.getByText(/Last updated:/i).textContent).toContain("—");
  });
});
