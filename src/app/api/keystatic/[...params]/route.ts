import { makeRouteHandler } from "@keystatic/next/route-handler";
import config from "../../../../../keystatic.config";

// Keystatic's backend route handler. Owns OAuth callbacks, GitHub
// API proxying, save/commit/PR flows, and image uploads. The route
// is hit only by the Keystatic admin client — see robots.ts which
// disallows /api/keystatic/ for SEO.

export const { GET, POST } = makeRouteHandler({ config });
