import KeystaticApp from "./keystatic";

// /keystatic/* layout — renders the Keystatic SPA. The actual page
// file at `[[...params]]/page.tsx` returns null because Keystatic's
// own router handles the URL inside this subtree.

export default function KeystaticLayout() {
  return <KeystaticApp />;
}
