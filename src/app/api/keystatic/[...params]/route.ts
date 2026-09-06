import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { hasGithubCredentials } from "../../../../../keystatic.config";

// Keystatic's backend route handler. Owns OAuth callbacks, GitHub
// API proxying, save/commit/PR flows, and image uploads. The route
// is hit only by the Keystatic admin client — see robots.ts which
// disallows /api/keystatic/ for SEO.

const handlers = makeRouteHandler({ config });

// Fail closed in production, mirroring the /keystatic layout: with the
// GitHub OAuth secrets missing the config falls back to unauthenticated
// `local` storage — fine for CI/dev/preview builds, never acceptable on
// the production domain.
function productionLockout(): Response | null {
  if (process.env.VERCEL_ENV === "production" && !hasGithubCredentials) {
    return new Response("Not found", { status: 404 });
  }
  return null;
}

export const GET: typeof handlers.GET = async (...args) =>
  productionLockout() ?? handlers.GET(...args);

export const POST: typeof handlers.POST = async (...args) =>
  productionLockout() ?? handlers.POST(...args);
