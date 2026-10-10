import { notFound } from "next/navigation";
import { isKeystaticEnabled } from "../../../keystatic.config";
import KeystaticApp from "./keystatic";

// /keystatic/* layout — renders the Keystatic SPA. The actual page
// file at `[[...params]]/page.tsx` returns null because Keystatic's
// own router handles the URL inside this subtree.
//
// Fail closed: outside `next dev`, the admin renders only in GitHub mode
// with its OAuth secrets present. Local storage has no authentication, so
// it must never be reachable on a deployed site (production, previews,
// or a self-hosted Docker image alike).
export default function KeystaticLayout() {
  if (!isKeystaticEnabled()) {
    notFound();
  }
  return <KeystaticApp />;
}
