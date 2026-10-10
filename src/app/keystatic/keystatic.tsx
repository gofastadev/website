"use client";

import { makePage } from "@keystatic/next/ui/app";
import config from "../../../keystatic.config";

// Client-side mount for the Keystatic admin UI. `makePage` returns a
// single-page-app component that owns its own router inside
// /keystatic/* — Next.js routing is bypassed for transitions within
// the admin, which is why we pair this with a catch-all
// `[[...params]]` route + a thin layout.

export default makePage(config);
