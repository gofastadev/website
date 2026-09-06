# Website redesign: confident engineering minimal

Date: 2026-08-04
Status: approved section-by-section in brainstorming; pending final spec review
Scope: entire website repo (landing, blog, docs chrome, 404, cookie surfaces, OG images)

## 1. Goal

Remove the "generic AI-built site" visual vocabulary and replace it with a design a senior
frontend engineer/designer would ship: editorial typography, a strong grid, restrained color,
purposeful motion, and the terminal as the hero visual. Functionality, routes, content
structure, SEO, and analytics events are preserved.

Direction: confident engineering minimal. Dials (design-taste-frontend):
DESIGN_VARIANCE 6, MOTION_INTENSITY 3-4, VISUAL_DENSITY 4.

## 2. Audit summary (what is being removed / kept)

Removed sitewide (the "AI tells"):

- Floating gradient orbs, dotted grid background, radial glows (hero.tsx:16-31, not-found.tsx:46-61)
- Gradient-clipped shimmering headline words (hero.tsx:139, not-found.tsx:125, pillar-card.tsx:55)
- Pill-badge eyebrow above every section (section-heading.tsx:26, fired 7x)
- Six near-identical "centered heading + card grid" sections with the same shell
  (`mx-auto max-w-6xl px-6 py-20 sm:py-28`)
- Emoji in the hero terminal (hero.tsx:201-271)
- Rotating conic-gradient hover borders on all cards (globals.css:430-462)
- Uniform 40x40 `bg-primary/10` icon tiles on every card
- Decorative motion with no payload: rotating arcs, traveling connector dot, bezier
  "data stream" curves, 12 breathing code fragments
- Poppins as the identity typeface
- Dead CSS: `.gofasta-cta-ring`, `.gofasta-chip`, `.gofasta-chip-pulse`
- The site's only glassmorphism (cookie banner)

Kept (already good):

- The color token system: one 193deg cyan hue, 10-step primary ramp, 10-step tinted neutral
  ramp overriding Tailwind gray, semantic aliases, `--primary-rgb`, true dark-mode flip
- Total `prefers-reduced-motion` coverage
- Documented contrast discipline (button text choice, term-line keyframe design)
- Opaque navbar (documented reasoning stands)
- ArchitectureStrip's `gap-px` hairline-seam grid: promoted to the site signature
- Terminal/CLI vocabulary: TerminalBlock, CopyableCommand, TypewriterCode, the 404
  Go compile-error terminal
- Atomic design structure and colocated tests

## 3. Foundations

### 3.1 Typography

- Display/headlines: Cabinet Grotesk (Fontshare, free license), weights 700/800,
  self-hosted woff2 via `next/font/local`.
- Body/UI: Satoshi (Fontshare, free license), weights 400/500/600/700, self-hosted
  woff2 via `next/font/local`.
- Code/numbers/labels: Geist Mono (already present), with `font-variant-numeric: tabular-nums`
  wherever numbers align.
- Poppins is removed entirely from `layout.tsx`.

Scale:

- Hero h1: Cabinet Grotesk 800, `text-5xl` mobile to `text-6xl` desktop, `tracking-tight`,
  line-height 1.02, max 2 lines.
- Section h2: Cabinet Grotesk 700, `text-3xl`/`text-4xl`, tracking-tight.
- Card/sub-headings: Satoshi 600.
- Body: Satoshi 400/500, max-width 65ch, `leading-relaxed`.
- Eyebrows: at most 2 on the entire landing page, mono small-caps, plain text (no pill).
  Blog index "Latest post" label is one of the site's allowed eyebrows.
- Sentence case everywhere. No Title Case headers.

### 3.2 New token layers (globals.css `@theme`)

Currently missing entirely; to be added and used exclusively:

- Spacing rhythm: named section-padding steps (e.g. `--section-y-sm/md/lg`) replacing the
  uniform `py-20 sm:py-28`; vertical rhythm varies deliberately between sections.
- Radius scale: buttons/inputs 8px, cards/terminal frames 12px. `rounded-2xl`/`rounded-3xl`
  usage is retired.
- Shadow scale: 3 steps, tinted with the navy hue (never raw black, never raw `shadow-2xl`).
- Easing/duration tokens: the `cubic-bezier(0.22,0.61,0.36,1)` retyped 8x becomes
  `--ease-out` etc.; durations `--duration-fast/base/slow`.

### 3.3 Color (surgical changes only)

- Both ramps and all semantic aliases survive untouched.
- New semantic status tokens: `--success`, `--warn`, `--danger` (light+dark values),
  replacing every hardcoded `text-green-400`, `bg-amber-500`, `text-red-400`, `text-white`
  in terminal/dashboard/404 mocks (~15 call sites).
- Fix cookie banner `dark:bg-gray-950` (token does not exist in the overridden palette).
- Unify blog's parallel card language (`bg-white/[0.02]`, `dark:border-white/10`) onto
  `--surface`/`border-gray-*` tokens.
- Code highlighting: replace hardcoded `github-dark` in rehype-pretty-code with a dual
  light/dark Shiki theme whose accents map to the brand ramp; code blocks follow the
  site theme.

## 4. Landing page recomposition

Section order is preserved; each section gets a distinct layout family. All ambient
decoration is deleted (not reduced). Depth comes from type contrast, hairlines, and
terminal surfaces.

1. Hero: asymmetric split. Left: h1 (approved headline, section 5), one subtext line
   under 20 words, primary CTA ("Get started" -> /docs/getting-started) + secondary
   docs link. Right: terminal running a real `gofasta new` session; emoji removed;
   staggered line entrance kept, calmer timing. Flat background. Hero fits the initial
   viewport; max 4 text elements; install command lives in the terminal, not as a
   floating snippet.
2. Features: seamed index grid. Consolidates the 9 FeaturesGrid items and the 6
   DashboardPreview tiles into one deduplicated set rendered as a `gap-px`
   hairline-seam grid (extends ArchitectureStrip). No card boxes, no icon tiles.
   Each cell: mono keyword (`auth`, `migrate`, `queue`, ...), Satoshi 600 title,
   one-line body. Full-cell hover fill `primary-800` with text flip, as
   ArchitectureStrip does today.
3. Three promises: typographic band. Full-width stacked statements with hairline
   dividers; Cabinet Grotesk statements + one supporting line each. No cards, no
   floating numerals.
4. Audience: sticky-rail split. Left column sticky (heading + one paragraph);
   right column: 6 audiences as a plain 2-column hairline-separated list, no boxes.
5. Agent spotlight: 50/50 media split kept (checklist left, TypewriterCode right);
   bezier streams and gradient wash removed. Checkmarks simplified.
6. Dev experience: full-width terminal band. The fake-browser dashboard becomes an
   honest terminal frame showing `gofasta dev`/`gofasta debug` output. Live row-in
   animation and status updates kept (motion carrying information). Status colors
   from the new tokens.
7. Quick start: one wide terminal walking through the real flow
   (`gofasta new` -> `gofasta dev` -> `gofasta g scaffold`), each command copyable
   via the existing CopyableCommand affordance. StepCards and the decorated
   connector are deleted.
8. CTA: typographic close. Same theme (no inverted band), hairline top border,
   large headline, one primary CTA, install command appearing once. The duplicate
   install snippet is removed.

Chrome: navbar stays opaque, gains an active-page indicator; height <= 72px; footer
becomes one calm row (legal links preserved).

Layout-family count: split-media (hero), seamed grid, typographic band, sticky-rail
split, split-media (spotlight, opposite side), terminal band, terminal walkthrough,
typographic close. No family repeats except the two mirrored splits, which are
non-adjacent.

## 5. Copy

Register: plain, specific, technical prose. Sentence case. No exclamation marks, no
emoji, no hype vocabulary (banned: seamless, blazing, next-gen, revolutionize,
elevate, unleash, game-changer). Commands/packages always mono. Identity rules apply
verbatim: "toolkit" / "CLI plus library of independent packages", never "framework"
for gofasta; opt-out defaults framing; no Rails/NestJS/Phoenix comparisons.

Approved hero copy (tunable in build within these caps):

    A production Go backend
    in one command

    gofasta scaffolds plain, idiomatic Go and generates the
    repetitive layers. Every default is swappable.

Section headings state content directly (no "What you get" / "Three promises" /
"Who it's for" template labels). Zero em-dashes and zero en-dashes in all visible
page copy; hyphens only. Copy self-audit runs before ship.

## 6. Blog, docs, 404, cookie, OG

- Blog index: featured 2-col composition kept with new type; plain mono "Latest post"
  label; BlogPostCard on unified surface tokens; pagination and tag cloud restyled to
  match; no layout/IA changes.
- Blog post: prose rebuilt on Satoshi body + Cabinet Grotesk headings, 65ch measure,
  dual code theme. Byline/deck structure preserved.
- Docs (Nextra 4): restyle via safe layers only. Fonts mapped to the new stack; cyan
  hue wiring kept; sidebar/TOC typography; callout + search styling; dual code theme;
  docs navbar styled to visually match the landing navbar (logo treatment, height,
  link weights). Anything achievable only via brittle Nextra-internal selector
  overrides is flagged in the implementation plan and skipped, not hacked.
- 404: Go compile-error terminal kept as the centerpiece. Ambient stack removed;
  the giant 404 becomes flat mono at scale (no gradient shimmer); hardcoded
  red/yellow move to status tokens; link-card grid restyled to the seam language.
- Cookie banner + preferences: opaque `--surface` + tinted shadow (glassmorphism
  removed); shared Button atom replaces hardcoded `text-[#00283A]`; dark token bug
  fixed. Legal copy untouched.
- OG images (`api/og`): rebuilt template with deep navy ground, Cabinet Grotesk
  title, mono accent line, cyan mark. Fonts loaded into the OG runtime.

## 7. Motion system

Kept (each justified as feedback, hierarchy, or storytelling):

- Terminal line entrances (hero, quick start, dev band): tightened timing
- Dashboard row-in and status updates in the dev band
- TypewriterCode in agent spotlight
- One subtle scroll fade-up on section entry (0.5s, quart ease, once), CSS-only
- Hover/press/focus on every interactive element: `active:scale-[0.98]`, visible
  focus rings, seamed-grid full-cell hover fill as the signature interaction

Deleted: orb floats (2), headline shimmer, conic spin, arc rotate, dot travel (2),
flow dash (2), code breathe, chip pulse, number float, and their utility classes.

`prefers-reduced-motion`: total coverage retained for everything that remains.

## 8. Execution plan (phases)

Risk-ladder order; each phase ends verified before the next starts:

1. Fonts + tokens: next/font/local setup (Cabinet Grotesk, Satoshi woff2 vendored),
   remove Poppins, add spacing/radius/shadow/easing tokens, status tokens, delete
   dead CSS and retired keyframes.
2. Shared atoms/molecules: Button, SectionHeading (de-pilled), TerminalBlock,
   CopyableCommand, card primitives -> new tokens and states.
3. Landing sections in page order (hero -> CTA), consolidating features, updating
   colocated tests alongside.
4. Blog index + post + tags.
5. Docs chrome + dual code theme.
6. 404, cookie surfaces, OG template.

Per-phase verification (completion gate section 5):

- `yarn build` + typecheck inside the Docker container (yarn only, deps installed
  in-container only)
- Existing test suite green, tests updated with intent (not weakened)
- Chrome screenshots of affected pages in BOTH themes, checked against this spec and
  the pre-flight checklist: zero em-dashes in page copy, eyebrow count <= 2 on the
  landing page, WCAG AA contrast on every CTA/form/status color, no duplicate CTA
  intent, hero within initial viewport, nav on one line
- Lighthouse spot-check at the end (a11y stays at 100; current score is a constraint)

## 9. Frozen invariants

- Routes, slugs, anchor IDs, primary nav labels, meta/structured data, sitemap, RSS
- Analytics event names and `trackEvent` call sites
- Legal/cookie copy
- Identity language rules (toolkit, opt-out defaults, no framework comparisons)
- No commits by Claude; working tree handed over for user review

## 10. Risks and mitigations

- Nextra theming limits: some docs internals are not designed for restyling. Mitigation:
  safe layers only; brittle overrides flagged and skipped.
- Fontshare licensing: Cabinet Grotesk and Satoshi are free for commercial use under the
  Fontshare EULA; fonts are vendored into the repo (no runtime CDN dependency).
- Test churn: organisms have colocated tests asserting on current markup. Mitigation:
  tests updated per-phase with the component, never deleted wholesale.
- Visual regressions in the untouched-by-design surfaces (keystatic admin): out of scope,
  verified unaffected by the token changes during phase 1 screenshots.
