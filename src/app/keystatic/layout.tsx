import { notFound } from "next/navigation";
import { hasGithubCredentials } from "../../../keystatic.config";
import KeystaticApp from "./keystatic";

// /keystatic/* layout — renders the Keystatic SPA. The actual page
// file at `[[...params]]/page.tsx` returns null because Keystatic's
// own router handles the URL inside this subtree.
//
// Fail closed in production: the config's `local` storage fallback
// exists so builds without the GitHub OAuth secrets still succeed
// (CI, dev, previews) — but if a PRODUCTION deploy is missing them,
// serving the admin UI would expose an unauthenticated editor shell.
// GitHub mode is auth-gated by the OAuth flow; local mode has no auth
// at all, so it must never render on the production domain.
export default function KeystaticLayout() {
  if (process.env.VERCEL_ENV === "production" && !hasGithubCredentials) {
    notFound();
  }
  return <KeystaticApp />;
}
