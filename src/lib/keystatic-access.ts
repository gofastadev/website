// Pure decision logic for the Keystatic admin, kept free of `process.env`
// reads so it is testable and so callers control which variables they
// pass. That matters because `keystatic.config.ts` is bundled into the
// browser too: Next.js only inlines `process.env.NEXT_PUBLIC_*` when the
// expression is written out literally at the call site, so the config
// reads the variables itself and hands the values in here.

export type KeystaticStorageKind = "github" | "local";

export interface KeystaticStorageEnv {
  /** NEXT_PUBLIC_KEYSTATIC_GITHUB_APP_SLUG */
  appSlug?: string;
  /** NEXT_PUBLIC_KEYSTATIC_STORAGE — "github" forces GitHub mode for setup. */
  storage?: string;
}

// Decided from public variables only, so the browser bundle and the API
// route always agree. Deciding from the server-only OAuth secrets made the
// client fall back to `local` while the server ran `github`.
export function resolveKeystaticStorageKind(
  env: KeystaticStorageEnv,
): KeystaticStorageKind {
  if (env.appSlug || env.storage === "github") return "github";
  return "local";
}

export interface KeystaticAccessEnv {
  storageKind: KeystaticStorageKind;
  clientId?: string;
  clientSecret?: string;
  secret?: string;
  nodeEnv?: string;
}

// Fails closed. Local storage has no authentication at all — its API reads
// and writes the filesystem — so it only ever runs under `next dev`.
// GitHub mode is gated by Keystatic's OAuth flow but needs all three
// secrets; dev is the exception so Keystatic's GitHub App setup wizard can
// run before the secrets exist.
export function isKeystaticAccessible(env: KeystaticAccessEnv): boolean {
  const isDev = env.nodeEnv === "development";
  if (env.storageKind === "local") return isDev;
  if (isDev) return true;
  return Boolean(env.clientId && env.clientSecret && env.secret);
}
