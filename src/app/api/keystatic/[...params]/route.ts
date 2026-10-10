import { makeRouteHandler } from "@keystatic/next/route-handler";
import config, { isKeystaticEnabled } from "../../../../../keystatic.config";

// Keystatic's backend route handler. Owns OAuth callbacks, GitHub
// API proxying, save/commit/PR flows, and image uploads. The route
// is hit only by the Keystatic admin client — robots.txt disallows
// /api/keystatic/ for SEO.

type Handlers = ReturnType<typeof makeRouteHandler>;

// Built on first use rather than at import: in GitHub mode Keystatic
// throws while constructing the handler when its secrets are missing,
// which would otherwise fail every build that lacks them.
let handlers: Handlers | undefined;
function getHandlers(): Handlers {
  handlers ??= makeRouteHandler({ config });
  return handlers;
}

// Fail closed, mirroring the /keystatic layout: no unauthenticated local
// storage outside `next dev`, no GitHub mode without its secrets.
function notFound(): Response {
  return new Response("Not found", { status: 404 });
}

export const GET: Handlers["GET"] = async (...args) =>
  isKeystaticEnabled() ? getHandlers().GET(...args) : notFound();

export const POST: Handlers["POST"] = async (...args) =>
  isKeystaticEnabled() ? getHandlers().POST(...args) : notFound();
