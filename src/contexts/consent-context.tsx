"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

// ─────────────────────────────────────────────────────────────────────
// Cookie / analytics consent — single source of truth.
//
// Design choices behind this implementation:
//
//   - **Default-deny.** When the user hasn't decided yet (`analytics`
//     is `null`), no analytics scripts fire and Google Consent Mode v2
//     defaults are set to "denied". GDPR requires prior consent for
//     non-essential tracking; defaulting to denied is the safest
//     posture while the banner is shown.
//
//   - **Versioned schema.** The persisted record carries a
//     `version` integer. Bumping `CURRENT_VERSION` invalidates every
//     stored decision and re-prompts users. Use this whenever the
//     categories change (e.g. adding a "marketing" category later).
//
//   - **localStorage, not cookies.** A consent record about cookies
//     should not itself be a cookie. localStorage is per-origin,
//     persists across visits, and is exempt from the consent dance.
//
//   - **`hydrated` flag.** Server-rendered HTML cannot know what's in
//     the user's localStorage. The provider starts with
//     `hydrated=false` and flips to `true` after a `useEffect` reads
//     storage on the client. Consumers (the banner, the analytics
//     gate) check `hydrated` before rendering anything that depends
//     on user state, which avoids hydration mismatches and prevents
//     the banner from flashing on every navigation.
// ─────────────────────────────────────────────────────────────────────

/** Current schema version for the persisted consent record. */
export const CURRENT_VERSION = 1;

/** Storage key — namespaced so app-level localStorage is browseable. */
export const STORAGE_KEY = "gofasta:consent";

/**
 * Persisted shape. `analytics` of `null` means "user has not decided
 * yet" (banner shows). `true`/`false` means a recorded decision.
 */
export interface ConsentRecord {
  analytics: boolean | null;
  decidedAt: string | null; // ISO 8601, null when undecided
  version: number;
}

const DEFAULT_RECORD: ConsentRecord = {
  analytics: null,
  decidedAt: null,
  version: CURRENT_VERSION,
};

interface ConsentContextValue {
  /** Current consent state. While `hydrated` is false this matches DEFAULT_RECORD. */
  consent: ConsentRecord;
  /** True once we've finished reading localStorage on the client. */
  hydrated: boolean;
  /** Record an analytics decision. */
  setAnalyticsConsent: (granted: boolean) => void;
  /** Wipe the saved decision so the banner shows again. Used by the /cookies page. */
  resetConsent: () => void;
}

const ConsentContext = createContext<ConsentContextValue | null>(null);

/**
 * Read the persisted record from localStorage, returning DEFAULT_RECORD
 * for any failure case (missing key, malformed JSON, version mismatch,
 * SSR — no `window`). Pure read; safe to call repeatedly.
 */
function readPersisted(): ConsentRecord {
  if (typeof window === "undefined") return DEFAULT_RECORD;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_RECORD;
    const parsed = JSON.parse(raw) as ConsentRecord;
    if (parsed.version !== CURRENT_VERSION) return DEFAULT_RECORD;
    if (typeof parsed.analytics !== "boolean" && parsed.analytics !== null) {
      return DEFAULT_RECORD;
    }
    return parsed;
  } catch {
    return DEFAULT_RECORD;
  }
}

function writePersisted(record: ConsentRecord) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage may be unavailable (private mode, full quota); the
    // user's choice will simply not persist. They'll see the banner
    // again next visit. Acceptable — better than crashing the app.
  }
}

interface ConsentProviderProps {
  children: React.ReactNode;
}

export function ConsentProvider({ children }: ConsentProviderProps) {
  const [consent, setConsent] = useState<ConsentRecord>(DEFAULT_RECORD);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate from localStorage on mount. The lint rule against
  // "setState in effect" generally targets state-syncing-with-state
  // (cascading renders); reading from a Web Storage API that simply
  // does not exist during SSR is the canonical exception. The two
  // setStates run exactly once, fire together, and complete before
  // any consumer reads `hydrated`.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setConsent(readPersisted());
    setHydrated(true);
  }, []);

  const setAnalyticsConsent = useCallback((granted: boolean) => {
    const next: ConsentRecord = {
      analytics: granted,
      decidedAt: new Date().toISOString(),
      version: CURRENT_VERSION,
    };
    setConsent(next);
    writePersisted(next);
  }, []);

  const resetConsent = useCallback(() => {
    setConsent(DEFAULT_RECORD);
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Same rationale as writePersisted — best-effort.
      }
    }
  }, []);

  const value = useMemo<ConsentContextValue>(
    () => ({ consent, hydrated, setAnalyticsConsent, resetConsent }),
    [consent, hydrated, setAnalyticsConsent, resetConsent],
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

/**
 * Read consent state. Throws if used outside of <ConsentProvider />.
 */
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error("useConsent must be used inside <ConsentProvider />");
  }
  return ctx;
}
