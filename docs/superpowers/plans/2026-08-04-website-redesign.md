# Website Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the site's generic-AI visual vocabulary with the approved "confident engineering minimal" design (spec: `docs/superpowers/specs/2026-08-04-website-redesign-design.md`) across landing, blog, docs, 404, cookie surfaces, and OG images.

**Architecture:** Token-first rebuild. Phase order follows the risk ladder: fonts → tokens → shared atoms/molecules → landing sections (top to bottom) → blog → docs → 404/cookie/OG → final CSS sweep and verification. Every component keeps its colocated test, updated in the same task.

**Tech Stack:** Next.js 16 (App Router, Turbopack, React Compiler), React 19, Tailwind CSS 4 (`@theme` tokens), Nextra 4, vitest + @testing-library/react, `next/font/local`, rehype-pretty-code (Shiki).

## Global Constraints

- **Claude never commits.** No `git commit`, `git push`, `git add` (unless the user asks). Every task ends by reporting `git status`; the user commits.
- **All yarn commands run inside the Docker container**: `docker compose up -d web` once, then `docker compose exec web yarn <cmd>`. Never `yarn` on the host. No new dependencies are needed anywhere in this plan; if one becomes necessary, stop and ask.
- **Frozen invariants** (spec §9): routes, slugs, anchor IDs, nav labels, meta/structured data, sitemap, RSS, analytics event names and `trackEvent` call sites, legal/cookie copy.
- **Identity language** in all copy: gofasta is a "toolkit" / "CLI plus library of independent packages", never a "framework"; opt-out defaults framing; no Rails/NestJS/Phoenix mentions; no hype words (seamless, blazing, next-gen, revolutionize, elevate, unleash, game-changer).
- **Zero em-dashes (`—`) and zero en-dashes (`–`) in any visible page string.** Hyphens only.
- **Sentence case** for all headings and labels. No exclamation marks. No emoji in UI.
- **Eyebrow budget:** max 2 mono small-caps labels on the whole landing page, none as pills.
- **Radius system:** interactive controls `rounded-lg` (8px), cards/terminal frames `rounded-xl` (12px). `rounded-2xl`/`rounded-3xl` are banned in new code.
- **Contrast:** WCAG AA minimum for every text/background pair introduced; keep the documented navy-on-cyan button rule.
- Tests are updated with intent in the same task as the component. Never deleted wholesale, never weakened to `toBeTruthy`.
- File naming: tests stay colocated as `<name>.test.tsx`.

**Verification loop used by every task** (referred to as "the loop"):

```bash
docker compose exec web yarn test          # vitest run
docker compose exec web yarn lint
docker compose exec web yarn build         # includes prebuild scripts + pagefind postbuild
git status --short                         # report; user commits
```

Visual check: dev server runs via `docker compose up -d web` at http://localhost:3000; screenshot affected pages in light AND dark (toggle via the site's theme toggle) with the Chrome extension.

---

### Task 1: Vendor Cabinet Grotesk + Satoshi, wire next/font/local, remove Poppins

**Files:**
- Create: `src/fonts/CabinetGrotesk-Variable.woff2`, `src/fonts/Satoshi-Variable.woff2`, `src/fonts/Satoshi-VariableItalic.woff2`
- Create: `src/fonts/og/CabinetGrotesk-Extrabold.ttf`, `src/fonts/og/Satoshi-Medium.ttf` (static cuts for the OG route; Satori cannot read woff2)
- Create: `src/fonts/LICENSE.txt` (Fontshare EULA note + download date)
- Modify: `src/app/layout.tsx` (font imports + `<html>` className)
- Modify: `src/app/globals.css` (font-family tokens, lines ~145-165)

**Interfaces:**
- Produces: CSS variables `--font-satoshi`, `--font-cabinet` on `<html>`; Tailwind utilities `font-sans` (Satoshi), `font-display` (Cabinet Grotesk), `font-mono` (Geist Mono, unchanged). Every later task uses `font-display` for h1/h2 headings.

- [ ] **Step 1: Download fonts (host, not container)**

```bash
cd /tmp && mkdir -p fontshare && cd fontshare
curl -L "https://api.fontshare.com/v2/fonts/download/cabinet-grotesk" -o cabinet.zip
curl -L "https://api.fontshare.com/v2/fonts/download/satoshi" -o satoshi.zip
unzip -o cabinet.zip -d cabinet && unzip -o satoshi.zip -d satoshi
find . -name "*Variable*.woff2"; find . -name "*Extrabold*.ttf" -o -name "*Medium*.ttf"
```

Copy into the repo (paths inside the zips vary slightly; use the `find` output):
`CabinetGrotesk-Variable.woff2`, `Satoshi-Variable.woff2`, `Satoshi-VariableItalic.woff2` → `src/fonts/`; `CabinetGrotesk-Extrabold.ttf`, `Satoshi-Medium.ttf` → `src/fonts/og/`. Write `src/fonts/LICENSE.txt` stating: fonts from Fontshare (Indian Type Foundry), free for personal and commercial use under the Fontshare EULA (https://www.fontshare.com/licenses/itf-ffl), downloaded 2026-08-04.

- [ ] **Step 2: Replace Poppins in `src/app/layout.tsx`**

Replace the `Poppins` import and const with:

```tsx
import { Geist_Mono } from "next/font/google";
import localFont from "next/font/local";

const satoshi = localFont({
  src: [
    { path: "../fonts/Satoshi-Variable.woff2", weight: "300 900", style: "normal" },
    { path: "../fonts/Satoshi-VariableItalic.woff2", weight: "300 900", style: "italic" },
  ],
  variable: "--font-satoshi",
  display: "swap",
});

const cabinetGrotesk = localFont({
  src: [{ path: "../fonts/CabinetGrotesk-Variable.woff2", weight: "100 900", style: "normal" }],
  variable: "--font-cabinet",
  display: "swap",
});
```

Update the `<html>` className from `` `dark ${poppins.variable} ${geistMono.variable}` `` to `` `dark ${satoshi.variable} ${cabinetGrotesk.variable} ${geistMono.variable}` ``. Poppins must no longer appear anywhere in the repo (`grep -ri poppins src/` returns nothing).

- [ ] **Step 3: Update font tokens in `src/app/globals.css`**

In the `@theme` block replace `--font-sans: var(--font-poppins);` with:

```css
--font-sans: var(--font-satoshi), system-ui, sans-serif;
--font-display: var(--font-cabinet), var(--font-satoshi), system-ui, sans-serif;
--font-mono: var(--font-geist-mono), ui-monospace, monospace;
```

Update the `body` rule `font-family: var(--font-poppins), ...` to `font-family: var(--font-satoshi), system-ui, sans-serif;`. Tailwind 4 exposes `--font-display` automatically as the `font-display` utility class.

- [ ] **Step 4: Run the loop.** Expect: build green, all tests green (no test asserts on Poppins). Screenshot `/` both themes: body text renders in Satoshi (check devtools computed font), headings still bold (they'll get Cabinet Grotesk per-component in later tasks). Report `git status`.

---

### Task 2: Token layer — spacing, radius, shadows, easing, status colors, Shiki variables

**Files:**
- Modify: `src/app/globals.css` (the `@theme` block ~lines 12-160, `.dark` block ~lines 76-90)

**Interfaces:**
- Produces (used by every later task):
  - Spacing: `py-section-sm` (4rem), `py-section` (6rem), `py-section-lg` (8rem)
  - Shadows: `shadow-e1`, `shadow-e2`, `shadow-e3` (navy-tinted)
  - Easing/duration: `ease-brand` utility, CSS vars `--ease-brand`, `--duration-fast` (150ms), `--duration-base` (300ms), `--duration-slow` (500ms)
  - Status colors: `text-success`, `text-warn`, `text-danger`, `bg-success` etc. (light+dark aware)
  - Button contrast: `text-primary-contrast` (#00283A)
  - Shiki: `--shiki-*` variables themed for light and dark

- [ ] **Step 1: Add tokens to the `@theme` block**

```css
/* Rhythm: three deliberate section-padding steps. */
--spacing-section-sm: 4rem;
--spacing-section: 6rem;
--spacing-section-lg: 8rem;

/* Elevation: shadows tinted with the brand navy, never raw black. */
--shadow-e1: 0 1px 2px rgb(11 56 70 / 0.08);
--shadow-e2: 0 4px 12px rgb(11 56 70 / 0.10), 0 1px 3px rgb(11 56 70 / 0.08);
--shadow-e3: 0 12px 32px rgb(11 56 70 / 0.14), 0 2px 8px rgb(11 56 70 / 0.10);

/* Motion */
--ease-brand: cubic-bezier(0.22, 0.61, 0.36, 1);

/* Status (terminal/dashboard semantics; AA on both surfaces) */
--color-success: var(--success);
--color-warn: var(--warn);
--color-danger: var(--danger);
--color-primary-contrast: #00283a;
```

And in `:root` / `.dark` (semantic values live beside `--background` etc.):

```css
:root {
  --success: #15803d;  /* green-700 on light surfaces */
  --warn: #a16207;     /* amber-700 */
  --danger: #b91c1c;   /* red-700 */
  --duration-fast: 150ms;
  --duration-base: 300ms;
  --duration-slow: 500ms;
}
.dark {
  --success: #4ade80;  /* green-400 on dark terminal surfaces */
  --warn: #fbbf24;
  --danger: #f87171;
}
```

Note: components rendering status INSIDE the always-dark terminal surfaces use the dark values directly via a `terminal-` scoped class added in Task 5, since terminals stay dark in light mode.

- [ ] **Step 2: Replace the 8 inline `cubic-bezier(0.22,0.61,0.36,1)` occurrences** in globals.css with `var(--ease-brand)`.

- [ ] **Step 3: Delete dead CSS now (nothing references it):** `.gofasta-cta-ring` block (~lines 466-491) and `.gofasta-chip` / `.gofasta-chip-pulse` (~lines 512-522) plus their keyframes if unused elsewhere. Do NOT delete other keyframes yet; components still reference them until Tasks 6-13.

- [ ] **Step 4: Add Shiki css-variables theming** (consumed in Tasks 16-17):

```css
:root {
  --shiki-color-text: #1f2937;
  --shiki-token-keyword: #00728f;      /* primary-700 */
  --shiki-token-string: #15803d;
  --shiki-token-function: #06556b;     /* primary-800 */
  --shiki-token-comment: #6b7280;
  --shiki-token-constant: #0095ba;     /* primary-600 */
  --shiki-token-punctuation: #4b5563;
}
.dark {
  --shiki-color-text: #e5e7eb;
  --shiki-token-keyword: #4fd1e5;      /* dark primary */
  --shiki-token-string: #4ade80;
  --shiki-token-function: #69cbe4;     /* primary-300 */
  --shiki-token-comment: #6b7280;
  --shiki-token-constant: #a2dff0;     /* primary-200 */
  --shiki-token-punctuation: #9ca3af;
}
```

- [ ] **Step 5: Run the loop.** Expect green; no visual change yet besides nothing breaking. Report `git status`.

---

### Task 3: Button atom — token contrast, press/focus states

**Files:**
- Modify: `src/components/atoms/button.tsx`
- Test: `src/components/atoms/button.test.tsx`

**Interfaces:**
- Produces: same `ButtonProps` API (`variant?: "primary" | "secondary"`, `size?: "default" | "lg"`); visual contract used by all CTAs: `rounded-lg`, `active:scale-[0.98]`, visible focus ring.

- [ ] **Step 1: Update the test first.** In `button.test.tsx` add/adjust assertions:

```tsx
it("uses the token-based contrast color and press feedback", () => {
  render(<Button>Get started</Button>);
  const btn = screen.getByRole("button", { name: "Get started" });
  expect(btn.className).toContain("text-primary-contrast");
  expect(btn.className).toContain("active:scale-[0.98]");
  expect(btn.className).toContain("focus-visible:ring-2");
  expect(btn.className).not.toContain("#00283A");
});
```

Run `docker compose exec web yarn test button` — expect FAIL.

- [ ] **Step 2: Implement.** Replace `variantStyles` (keep the contrast comment, reworded for the token):

```tsx
const variantStyles: Record<ButtonVariant, string> = {
  // primary-contrast is the gopher-outline navy (#00283A): ~6:1 on the
  // cyan fill (AA normal / AAA large). White would only reach ~2.3:1.
  primary: "bg-primary text-primary-contrast hover:bg-primary-400 dark:hover:bg-primary-300",
  secondary:
    "border border-primary text-primary hover:bg-primary hover:text-primary-contrast",
};
```

Base classes become:

```tsx
"inline-flex cursor-pointer items-center justify-center rounded-lg font-semibold " +
"transition-[background-color,transform] duration-(--duration-fast) ease-(--ease-brand) " +
"active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 " +
"focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
```

- [ ] **Step 3: Run `docker compose exec web yarn test button`** — expect PASS. Run the loop. Report `git status`.

---

### Task 4: SectionHeading — de-pill, display font, left default

**Files:**
- Modify: `src/components/molecules/section-heading.tsx`
- Test: `src/components/molecules/section-heading.test.tsx`

**Interfaces:**
- Produces: `SectionHeadingProps` keeps `{ eyebrow?, title, description?, align?, className? }` but `align` defaults to `"left"`. Eyebrow renders as plain mono small-caps text (no pill). Callers that should show NO eyebrow simply omit the prop (Tasks 6-13 remove almost all of them).

- [ ] **Step 1: Update tests:** eyebrow renders as `<span>` with classes `font-mono text-xs uppercase tracking-widest text-primary` and WITHOUT `rounded-full`/`border`/`bg-primary/10`; h2 has `font-display`; default alignment is left.

- [ ] **Step 2: Implement:**

```tsx
export function SectionHeading({ eyebrow, title, description, align = "left", className }: SectionHeadingProps) {
  const alignClasses = align === "center" ? "mx-auto items-center text-center" : "items-start text-left";
  return (
    <div className={cn("flex max-w-3xl flex-col", alignClasses, className)}>
      {eyebrow && (
        <span className="mb-3 font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</span>
      )}
      <h2 className="font-display text-3xl font-bold tracking-tight text-balance sm:text-4xl">{title}</h2>
      {description && (
        <p className="mt-4 max-w-[65ch] text-base leading-relaxed text-gray-600 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}
```

(Removes the `gofasta-fade-up` from the molecule; section-level reveal is added in Task 14.) Note `md:text-5xl` is dropped: section headings cap at `text-4xl` per the type scale.

- [ ] **Step 3: Run the loop.** Screenshot `/`: all sections now show plain left headings (still on old layouts; fine). Report `git status`.

---

### Task 5: Terminal surfaces — TerminalBlock + CopyableCommand restyle

**Files:**
- Modify: `src/components/molecules/terminal-block.tsx`
- Modify: `src/components/molecules/copyable-command.tsx`
- Modify: `src/app/globals.css` (add `.terminal-scope` status utilities)
- Tests: `terminal-block.test.tsx`, `copyable-command.test.tsx`

**Interfaces:**
- Produces: `TerminalBlock` keeps its children API; chrome becomes: `rounded-xl border border-gray-800 bg-terminal-surface shadow-e3`, header bar with a single mono title slot (new optional prop `title?: string`, default `"~/dev"`), traffic-light dots removed. `CopyableCommand` keeps its API and copy affordance; visual: `rounded-lg border bg-code-bg font-mono`, focus ring per Task 3. New CSS utility classes `.term-ok`, `.term-warn`, `.term-err` (colors = dark-mode status values, since terminals are always dark).

- [ ] **Step 1: globals.css** — add:

```css
/* Terminal surfaces stay dark in both themes, so status colors inside
   them always use the dark-surface values. */
.term-ok { color: #4ade80; }
.term-warn { color: #fbbf24; }
.term-err { color: #f87171; }
```

- [ ] **Step 2: TerminalBlock.** Read the file first. Replace the three traffic-light dots row with a header: `flex items-center gap-2 border-b border-white/10 px-4 py-2.5` containing `<span className="font-mono text-xs text-gray-500">{title}</span>`. Outer: `rounded-xl border border-gray-800 bg-terminal-surface shadow-e3 overflow-hidden`. Update its test: asserts no `bg-red-500` dot, asserts title renders, `expect(screen.getByText("~/dev"))` for default.

- [ ] **Step 3: CopyableCommand.** Keep markup/behavior (including `trackEvent` call sites); update classes to `rounded-lg` + focus-visible ring; ensure copy button hover/active states match Task 3's pattern. Update test only if class assertions exist.

- [ ] **Step 4: Run the loop + screenshot `/` both themes.** Report `git status`.

---

### Task 6: Hero — asymmetric split, new copy, ambient stack deleted

**Files:**
- Modify: `src/components/organisms/hero.tsx` (full rewrite)
- Test: `src/components/organisms/hero.test.tsx`

**Interfaces:**
- Consumes: `Button` (Task 3), `TerminalBlock` (Task 5), `CopyableCommand`, `trackEvent` from `@/lib/analytics` (keep existing event names exactly as currently called).
- Produces: `<Hero />`, no props.

- [ ] **Step 1: Read the current file fully.** Inventory: every `trackEvent(...)` call and its event name; the router pushes; the terminal line content. These survive verbatim (frozen invariants).

- [ ] **Step 2: Rewrite.** Structure (real `gofasta new` output, emoji stripped; keep the existing line-entrance utility `gofasta-term-line` and stagger delays but cap total sequence at ~2.5s):

```tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/atoms";
import { CopyableCommand, TerminalBlock } from "@/components/molecules";
import { trackEvent } from "@/lib/analytics";

export function Hero() {
  const router = useRouter();
  return (
    <section className="px-6 pt-24 pb-section-sm sm:pb-section">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.1fr]">
        <div className="flex flex-col items-start">
          <h1 className="font-display text-5xl font-extrabold leading-[1.02] tracking-tight text-balance sm:text-6xl">
            A production Go backend in one command
          </h1>
          <p className="mt-5 max-w-[46ch] text-lg leading-relaxed text-gray-600 dark:text-gray-400">
            gofasta scaffolds plain, idiomatic Go and generates the repetitive
            layers. Every default is swappable.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            {/* keep the existing onClick handlers + trackEvent names from the old hero */}
            <Button size="lg" onClick={/* existing get-started handler */}>Get started</Button>
            <Button size="lg" variant="secondary" onClick={/* existing docs handler */}>Read the docs</Button>
          </div>
        </div>
        <TerminalBlock title="~/projects">
          {/* the existing gofasta new session lines, emoji removed, ✓ replaced
              by a mono "ok" in .term-ok, statuses via .term-ok/.term-warn */}
        </TerminalBlock>
      </div>
    </section>
  );
}
```

Deleted entirely: dotted-grid div, radial-glow div, both orbs, all 12 ambient code spans, the gradient-clipped shimmer word (`bg-clip-text` + `gofasta-headline-shimmer`). The `CopyableCommand` install snippet moves out of the hero; the install command appears inside the terminal output and once more in the CTA (Task 13).

- [ ] **Step 3: Update `hero.test.tsx`:** assert h1 text equals the new headline; assert both CTAs present with their handlers firing the same `trackEvent` names as before (read old test for the names); assert NO element with class containing `gofasta-orb` or `gofasta-grid-bg`; assert no emoji characters in rendered output (`expect(container.textContent).not.toMatch(/[\u{1F300}-\u{1FAFF}]/u)`).

- [ ] **Step 4: Run the loop.** Screenshot `/` both themes at 1440px and 390px: hero fits initial viewport at 1440, headline is 2 lines, terminal right, nothing floats. Report `git status`.

---

### Task 7: Feature index — seamed grid organism replacing FeaturesGrid

**Files:**
- Create: `src/components/organisms/feature-index.tsx`
- Create: `src/components/organisms/feature-index.test.tsx`
- Modify: `src/components/organisms/index.ts` (export FeatureIndex; keep FeaturesGrid export until Task 11 removes its usage)
- Modify: `src/app/(home)/page.tsx` (swap `<FeaturesGrid />` for `<FeatureIndex />`)

**Interfaces:**
- Produces: `<FeatureIndex />`, no props. 12 cells, `gap-px` seam grid, mono keyword per cell.

- [ ] **Step 1: Build the data.** Copy the 9 descriptions from `features-grid.tsx`'s array (titles listed below), plus 3 cells summarizing the debugging tiles from `dashboard-preview.tsx`. Exact cell set, in order, with mono keywords:

| keyword | title (sentence case) | body source |
|---|---|---|
| `new` | One-command scaffolding | features-grid item 1 |
| `ai` | Agent-native tooling | features-grid item 2 |
| `auth` | Auth and RBAC | features-grid item 3 |
| `db` | Multi-database | features-grid item 4 |
| `api` | REST plus optional GraphQL | features-grid item 5 |
| `jobs` | Background jobs and tasks | features-grid item 6 |
| `otel` | Observability | features-grid item 7 |
| `sec` | Security and resilience | features-grid item 8 |
| `deploy` | Deploy to any VPS | features-grid item 9 |
| `trace` | Request tracing | condensed from "Trace waterfall" + "Per-request logs" tiles |
| `sql` | N+1 detection | from the "N+1 detection" tile |
| `replay` | Edit and replay | from the "Edit & replay" tile |

Bodies: reuse existing description strings, trimmed to one line (< 90 chars), `&` written as "and". No em-dashes.

- [ ] **Step 2: Implement** (pattern from `architecture-strip.tsx:74-88`):

```tsx
import { SectionHeading } from "@/components/molecules";

const FEATURES = [ /* the 12 items: { keyword, title, body } */ ];

export function FeatureIndex() {
  return (
    <section className="px-6 py-section">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          title="Everything a production backend needs"
          description="Generated into your project as plain Go, backed by independent packages you can swap out."
        />
        <ul className="mt-12 grid gap-px overflow-hidden rounded-xl border border-gray-200 bg-gray-200 sm:grid-cols-2 lg:grid-cols-3 dark:border-gray-800 dark:bg-gray-800">
          {FEATURES.map((f) => (
            <li
              key={f.keyword}
              className="group bg-surface p-6 transition-colors duration-(--duration-base) ease-(--ease-brand) hover:bg-primary-800"
            >
              <span className="font-mono text-xs text-primary group-hover:text-primary-200">{f.keyword}</span>
              <h3 className="mt-2 font-semibold group-hover:text-white">{f.title}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-600 group-hover:text-primary-100 dark:text-gray-400">{f.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Test** (`feature-index.test.tsx`): renders 12 `listitem`s; each has a mono keyword; asserts `auth` cell title "Auth and RBAC"; asserts the grid ul has `gap-px` and no descendant with `data-testid`/class from the old `FeatureCard` (`gofasta-card-glow`).

- [ ] **Step 4: Swap into `src/app/(home)/page.tsx`** replacing the `<FeaturesGrid />` usage (leave the old component file in place until Task 11 confirms nothing else uses it). Run the loop + screenshots. Report `git status`.

---

### Task 8: Value pillars — typographic band

**Files:**
- Modify: `src/components/organisms/value-pillars.tsx` (rewrite render; keep data array text)
- Delete usage of: `src/components/molecules/pillar-card.tsx` (delete file + test in this task if no other importer: `grep -rn "pillar-card\|PillarCard" src/`)
- Test: `src/components/organisms/value-pillars.test.tsx`

**Interfaces:**
- Produces: `<ValuePillars />`, no props. Full-width stacked statements with hairline dividers.

- [ ] **Step 1: Rewrite render.** Keep the 3 `{ title, description }` entries ("Standard Go. Zero lock-in.", "Agent-native by default.", "Production from minute one." with their existing descriptions):

```tsx
export function ValuePillars() {
  return (
    <section className="px-6 py-section-lg">
      <div className="mx-auto max-w-4xl divide-y divide-gray-200 dark:divide-gray-800">
        {PILLARS.map((p) => (
          <div key={p.title} className="grid gap-3 py-10 sm:grid-cols-[1fr_1.2fr] sm:gap-10 first:pt-0 last:pb-0">
            <h3 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{p.title}</h3>
            <p className="max-w-[55ch] self-center leading-relaxed text-gray-600 dark:text-gray-400">{p.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
```

No SectionHeading here: the statements ARE the headings (this is one of the two sections without one, varying rhythm). Rotating-arc SVG, gradient numerals, and card chrome all deleted with PillarCard.

- [ ] **Step 2: Tests:** 3 statements render as headings; no element with `gofasta-card-glow` / `gofasta-number-float`; snapshot-free class assertions only.
- [ ] **Step 3: Delete `pillar-card.tsx` + its test** if the grep in Files shows value-pillars was the only importer; update `src/components/molecules/index.ts`. Run the loop + screenshots. Report `git status`.

---

### Task 9: Audience — sticky-rail split

**Files:**
- Modify: `src/components/organisms/audience-tiles.tsx` (rewrite render; keep the 6 data entries)
- Delete (same importer-check ritual as Task 8): `src/components/molecules/audience-card.tsx` + test
- Test: `src/components/organisms/audience-tiles.test.tsx`

**Interfaces:**
- Produces: `<AudienceTiles />` (name and export unchanged so `page.tsx` and analytics section-tracking are untouched).

- [ ] **Step 1: Rewrite:** left sticky rail + right hairline list. Titles go sentence case ("Solo engineers", "Indie hackers", "Startup CTOs", "Senior engineers", "Agencies and consultancies", "Enterprise teams"); descriptions unchanged.

```tsx
<section className="px-6 py-section">
  <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-[1fr_1.6fr]">
    <div className="lg:sticky lg:top-28 lg:self-start">
      <SectionHeading
        title="Built for people who ship"
        description="From a side project to a team codebase, the workflow stays the same."
      />
    </div>
    <ul className="grid gap-x-10 sm:grid-cols-2">
      {AUDIENCES.map((a) => (
        <li key={a.title} className="border-t border-gray-200 py-6 dark:border-gray-800">
          <h3 className="font-semibold">{a.title}</h3>
          <p className="mt-1.5 text-sm leading-relaxed text-gray-600 dark:text-gray-400">{a.description}</p>
        </li>
      ))}
    </ul>
  </div>
</section>
```

- [ ] **Step 2: Tests:** 6 items; sticky rail div has `lg:sticky`; no card classes. Run the loop + screenshots (verify sticky behavior by scrolling). Report `git status`.

---

### Task 10: Agent spotlight — strip decoration, keep the split

**Files:**
- Modify: `src/components/organisms/agent-spotlight.tsx`
- Modify: `src/components/molecules/typewriter-code.tsx` (status dot color → `.term-ok`)
- Tests: both colocated tests

- [ ] **Step 1: Read the file; delete:** the section-level `bg-gradient-to-b from-primary/5...` wash, the 4 SVG bezier "data stream" paths and their gradient defs, and any `gofasta-flow-dash`/`gofasta-dot-travel` usage. Keep: the 2-col grid, checklist content, `TypewriterCode`, all `trackEvent` calls.
- [ ] **Step 2: Simplify checkmarks:** replace the 28px `bg-primary/15` circles with a plain mono `ok` glyph or a 16px check svg in `text-primary`, aligned with the text baseline.
- [ ] **Step 3: TypewriterCode chrome:** align with Task 5's TerminalBlock language (`rounded-xl border border-gray-800 shadow-e3`); status dots use `.term-ok`/`.term-warn` classes instead of `bg-green-400`/`bg-amber-400`.
- [ ] **Step 4: Update tests** (assert removed decoration absent), run the loop + screenshots. Report `git status`.

---

### Task 11: Dev experience — honest terminal band replacing the fake browser

**Files:**
- Modify: `src/components/organisms/dashboard-preview.tsx` (rewrite chrome + trim; keep live-row simulation)
- Delete after grep confirms unused: `src/components/organisms/features-grid.tsx` + test, `src/components/molecules/feature-card.tsx` + test, `src/components/atoms/feature-icon.tsx` + test; update the three `index.ts` barrels
- Test: `src/components/organisms/dashboard-preview.test.tsx`

**Interfaces:**
- Produces: `<DashboardPreview />` (export name unchanged). Content: `gofasta debug watch` style output in a Task-5 TerminalBlock, full-width `max-w-5xl`.

- [ ] **Step 1: Read the file.** The 6-tile FeatureCard grid at the bottom is deleted (its content moved into FeatureIndex in Task 7). The fake browser chrome (traffic lights + URL bar) is replaced by `TerminalBlock` with `title="gofasta debug watch"`.
- [ ] **Step 2: Keep the live simulation** (`gofasta-dashboard-row` entrance, pulsing status, timestamps) — this is the one informational motion band. Swap every hardcoded status color to `.term-ok`/`.term-warn`/`.term-err`; `text-white` inside the terminal becomes `text-gray-100`.
- [ ] **Step 3: Section shell:** `px-6 py-section` + SectionHeading (`title="See every request while you develop"`, description trimmed from existing copy, no eyebrow).
- [ ] **Step 4: Tests:** no `bg-red-500` traffic lights, no FeatureCard tiles, terminal title renders, at least one `.term-ok` row appears after the simulation tick (use vitest fake timers as the existing test does; read it first).
- [ ] **Step 5:** Delete the now-unused files (grep first: `grep -rn "FeaturesGrid\|FeatureCard\|FeatureIcon" src/ | grep -v test`), run the loop + screenshots. Report `git status`.

---

### Task 12: Quick start — one terminal, three commands

**Files:**
- Modify: `src/components/organisms/quick-start-section.tsx` (rewrite)
- Delete after grep: `src/components/molecules/step-card.tsx` + test, `src/components/atoms/step-number.tsx` + test; update barrels
- Test: `src/components/organisms/quick-start-section.test.tsx`

**Interfaces:**
- Consumes: `TerminalBlock` (title `"quick start"`), `CopyableCommand`.
- Produces: `<QuickStartSection />` (export unchanged).

- [ ] **Step 1: Rewrite:** SectionHeading (`title="Three commands to a running backend"`, no eyebrow) + one `max-w-3xl` TerminalBlock containing three blocks, each: a `CopyableCommand` line (`gofasta new myapp --driver postgres`, `gofasta dev`, `gofasta g scaffold post title:string body:text`) followed by 2-3 dimmed mono output lines (reuse the believable output strings from the current StepCards; read them first). The dashed connector + traveling dot are deleted.
- [ ] **Step 2: Tests:** three copyable commands present with exact command strings; no `gofasta-dot-travel` element. Run the loop + screenshots. Report `git status`.

---

### Task 13: CTA, navbar active state, footer

**Files:**
- Modify: `src/components/organisms/cta-section.tsx`
- Modify: `src/components/organisms/navbar-landing.tsx`, `src/components/molecules/nav-links.tsx`
- Modify: `src/components/organisms/footer-landing.tsx`
- Tests: all colocated

- [ ] **Step 1: CTA:** remove the `rounded-3xl border-primary/30` panel and radial glow; new structure: full-width section `border-t border-gray-200 dark:border-gray-800 px-6 py-section-lg`, centered column: h2 `font-display text-4xl font-bold tracking-tight sm:text-5xl` (keep existing headline text unless it Title-Cases; sentence-case it), one primary Button (keep handler + trackEvent), and the `CopyableCommand` install snippet (this is its single appearance outside the hero terminal). Remove the duplicate secondary button if its intent duplicates the hero's docs link.
- [ ] **Step 2: Navbar:** keep opaque surface + heights; in `nav-links.tsx` add active state via `usePathname()`: active link gets `text-foreground font-medium` plus `aria-current="page"`; inactive `text-gray-600 dark:text-gray-400 hover:text-foreground`. Verify nav is one line at 1024px.
- [ ] **Step 3: Footer:** single calm row: left `© {year} Gofasta`, right: existing links in mono text-xs, `border-t`, `py-10`. Keep every legally-required link.
- [ ] **Step 4: Update tests** (active-state assertion with a mocked pathname; CTA single-install assertion), run the loop + screenshots. Report `git status`.

---

### Task 14: Landing CSS sweep — retire dead animation systems, add section reveal

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/(home)/page.tsx` (reveal class on sections if needed)

- [ ] **Step 1: Grep-then-delete.** For each of: `gofasta-orb`, `gofasta-orb-slow`, `gofasta-grid-bg`, `gofasta-headline-shimmer`, `gofasta-card-glow`, `gofasta-icon-draw`, `gofasta-arc-rotate` (pillar arcs), `gofasta-flow-dash`, `gofasta-dot-travel`, `gofasta-stream`, `gofasta-code-breath`, `gofasta-number-float`, `gofasta-conic-spin`, `gofasta-chip-in`, `gofasta-pulse-dot` — run `grep -rn "<name>" src/ --include="*.tsx"`; if zero component references remain, delete the utility class AND its keyframes AND its entry in the `prefers-reduced-motion` block. Keep: `gofasta-fade-up`, `gofasta-term-line`, cursor-blink, typewriter utilities, dashboard row/pulse/refresh.
- [ ] **Step 2: Section reveal.** Single scroll-reveal, CSS-only:

```css
@media (prefers-reduced-motion: no-preference) {
  .section-reveal {
    opacity: 0;
    transform: translateY(16px);
    animation: section-reveal-in var(--duration-slow) var(--ease-brand) forwards;
    animation-timeline: view();
    animation-range: entry 0% entry 30%;
  }
  @keyframes section-reveal-in {
    to { opacity: 1; transform: none; }
  }
}
```

Add `section-reveal` to each landing `<section>` root EXCEPT the hero (it's above the fold). If `animation-timeline: view()` proves unreliable in the container's Chrome during visual check, fall back to the existing `gofasta-fade-up` load-in on section roots and note the substitution in the report.

- [ ] **Step 3: Run the loop.** Full-page screenshots both themes, desktop + 390px. Verify against pre-flight: eyebrow count on `/` is ≤ 2, zero em-dashes visible (`grep -rn "—\|–" src/components/ src/app/\(home\)/ --include="*.tsx"` returns nothing in visible strings), no duplicate CTA intent. Report `git status`.

---

### Task 15: Blog index + cards — unified surface language

**Files:**
- Modify: `src/components/organisms/blog-index-hero.tsx`
- Modify: `src/components/molecules/blog-post-card.tsx`, `src/components/atoms/blog-tag-pill.tsx`
- Modify: `src/app/(home)/blog/blog-index-view.tsx` (and `blog-tag-cloud.tsx` if it carries its own card classes)
- Tests: all colocated

- [ ] **Step 1: Read each file;** replace every `bg-white dark:bg-white/[0.02]`, `dark:border-white/10`, `dark:bg-gray-950` with `bg-surface` / `border-gray-200 dark:border-gray-800`. Cards: `rounded-xl shadow-e1 hover:shadow-e2 transition-shadow duration-(--duration-base) ease-(--ease-brand)`; no translate-lift.
- [ ] **Step 2: Type:** post titles `font-display font-bold tracking-tight`; metadata (dates, reading time) `font-mono text-xs`; the "Latest post" micro-label becomes `font-mono text-xs uppercase tracking-widest text-primary` (allowed eyebrow), no border pill.
- [ ] **Step 3: Tag pills** (`blog-tag-pill.tsx`): `rounded-lg` (not full), mono text-xs, border, hover fill primary-800/white — matching the seam-grid interaction.
- [ ] **Step 4:** Update tests, run the loop, screenshot `/blog` + a tag page, both themes. Report `git status`.

---

### Task 16: Blog post — prose + dual code theme

**Files:**
- Modify: `src/app/(home)/blog/[slug]/page.tsx` (prose class chain + rehype-pretty-code options)
- Modify: `src/components/molecules/blog-article-header.tsx`
- Tests: colocated + any mdx-render test

- [ ] **Step 1: rehype-pretty-code:** change `theme: "github-dark"` to `theme: "css-variables"` (Task 2 defined the `--shiki-*` palette for both modes). Add to globals.css if missing: `pre [data-line] { padding: 0 1rem; }` and code-block chrome `rounded-xl border border-gray-200 dark:border-gray-800 bg-code-bg`.
- [ ] **Step 2: Header:** h1 `font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-balance`; deck `text-xl` Satoshi 400 `text-gray-600 dark:text-gray-400`; byline row mono text-xs.
- [ ] **Step 3: Prose chain:** body stays `max-w-3xl`; ensure `prose-headings:font-display prose-headings:tracking-tight prose-a:underline`; measure ~65ch.
- [ ] **Step 4:** Run the loop; screenshot one real post both themes — code blocks must be readable in light mode (this was the bug). Report `git status`.

---

### Task 17: Docs chrome — Nextra safe-layer styling

**Files:**
- Modify: `src/app/globals.css` (docs-scoped section)
- Modify: `src/app/(docs)/layout.tsx` (only if theme config props are needed; read it first)

- [ ] **Step 1: Fonts flow automatically** (body/`--font-sans` now Satoshi). Add docs-scoped rules in globals.css:

```css
/* Docs (Nextra) - safe-layer theming only. */
.nextra-nav-container { /* match landing navbar height + border */ }
article h1, article h2, article h3 { font-family: var(--font-display); letter-spacing: -0.02em; }
```

Scope selectors by testing against the live DOM; prefer Nextra's documented CSS variables (`--nextra-primary-hue` already set) and element/semantic selectors over internal class names. Any styling goal reachable ONLY through deep internal class overrides (e.g. `_hash`-suffixed classes): skip it and list it in the task report.

- [ ] **Step 2: Code blocks:** Nextra 4 uses its own Shiki pipeline with CSS variables; verify the Task 2 `--shiki-*` values apply to docs code blocks in both themes; if Nextra uses different variable names, map them additively (do not fork Nextra components).
- [ ] **Step 3:** Run the loop; screenshot `/docs`, one guide page, one api-reference page, both themes. The landing→docs transition should read as one site (same fonts, same cyan, similar nav weight). Report `git status`, including the skipped-overrides list.

---

### Task 18: 404 — keep the compile error, delete the atmosphere

**Files:**
- Modify: `src/components/organisms/not-found.tsx`
- Test: `src/components/organisms/not-found.test.tsx`

- [ ] **Step 1:** Delete the ambient stack (grid/glow/orbs/breathing snippets) and the badge pill. The 404 numeral: flat `font-mono font-bold text-[7rem] sm:text-[10rem] text-gray-200 dark:text-gray-800` (background-scale type, no gradient/shimmer). Keep the Go compile-error terminal (restyled via Task 5's TerminalBlock) and its navigational links; error tokens: `.term-err` for the red line, `.term-warn` for the yellow.
- [ ] **Step 2:** Link cards below become the seam-grid language (`gap-px` 2-col, hover fill) instead of bordered cards with arrows.
- [ ] **Step 3:** Update tests (no orb/grid classes; terminal + links render), run the loop, screenshot `/nonexistent-page` both themes. Report `git status`.

---

### Task 19: Cookie surfaces — opaque, tokened, legal copy untouched

**Files:**
- Modify: `src/components/organisms/cookie-banner.tsx`, `src/components/organisms/cookie-preferences.tsx`
- Tests: colocated

- [ ] **Step 1: Banner:** replace the `backdrop-blur` glass stack with `bg-surface border-t border-gray-200 dark:border-gray-800 shadow-e3`; fix `dark:bg-gray-950` (nonexistent token) by removal; buttons become the shared `Button` atom (removes hardcoded `text-[#00283A]`). Copy strings byte-identical.
- [ ] **Step 2: Preferences dialog:** same surface treatment; toggle rows `divide-y`; radius per system.
- [ ] **Step 3:** Update tests (consent behavior assertions unchanged; class assertions updated), run the loop, screenshot with consent cleared (incognito) both themes. Report `git status`.

---

### Task 20: OG image template

**Files:**
- Modify: `src/app/api/og/route.tsx` (read it first; exact filename may be `route.tsx` or `route.ts`)

- [ ] **Step 1:** Load the static cuts vendored in Task 1 via `fetch(new URL("../../../fonts/og/CabinetGrotesk-Extrabold.ttf", import.meta.url))` pattern (Satori requires ttf/otf). Template: `#0b3846` (primary-900) ground, title in Cabinet Grotesk Extrabold white, section label in Satoshi Medium `#4fd1e5`, cyan rule + logo mark positioned bottom-left. Keep the existing query-param API (`title`, `section`) exactly — `layout.tsx` metadata URLs must keep working unmodified.
- [ ] **Step 2:** Verify by requesting `http://localhost:3000/api/og?title=Test&section=Docs` and screenshotting the PNG. Run the loop. Report `git status`.

---

### Task 21: Final verification — pre-flight, Lighthouse, handover

**Files:** none (verification only)

- [ ] **Step 1: Full loop** (test, lint, build) in the container — all green.
- [ ] **Step 2: Screenshot matrix:** `/`, `/blog`, one post, one tag page, `/docs`, one guide, one api-reference page, `/nonexistent`, cookie banner state; each in light AND dark, desktop 1440 + mobile 390.
- [ ] **Step 3: Pre-flight checklist** (from design-taste-frontend §14, the applicable rows): zero em/en-dashes in visible copy; landing eyebrow count ≤ 2; hero fits 1440×900 viewport, headline 2 lines, subtext < 20 words; no duplicate CTA intent sitewide; nav single line ≤ 72px; every CTA/status color AA (spot-check with devtools contrast); one radius system; no section flips theme; reduced-motion: OS setting on → no entrance animations.
- [ ] **Step 4: Lighthouse** on `/` (container build via `docker compose exec web yarn build` then `yarn start` or dev server): a11y must stay 100; note LCP/CLS.
- [ ] **Step 5: Identity grep:** `grep -rin "framework" src/components src/app/\(home\) --include="*.tsx"` — any match describing gofasta itself is a bug (other tools may keep the word).
- [ ] **Step 6: Report:** full summary per completion-gate section 6 (what ran, what was skipped and why, screenshots), `git status` for user commit. Explicitly list: deleted files, retired CSS, the Nextra skipped-overrides list from Task 17.

---

## Self-review notes

- Spec coverage: §3 fonts → Task 1; §3.2 tokens → Task 2; §3.3 color → Tasks 2/5/11/15/19; §4 landing sections 1-8 → Tasks 6,7,8,9,10,11,12,13; §5 copy → embedded in Tasks 6-13 + verified in 21; §6 blog/docs/404/cookie/OG → Tasks 15-20; §7 motion → Tasks 5-14 (deletions) + 14 (reveal); §8 execution/verification → the loop + Task 21; §9 invariants → Global Constraints.
- Deletion ordering: old CSS systems are only deleted after their last component reference is removed (Task 14 grep-gates every deletion).
- Export names (`AudienceTiles`, `DashboardPreview`, `QuickStartSection`, `ValuePillars`) are intentionally kept even where content changed, so `page.tsx`, barrels, and section analytics stay stable.
- Commit steps are intentionally absent: the user commits (global constraint).
