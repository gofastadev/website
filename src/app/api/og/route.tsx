import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import type { NextRequest } from "next/server";
import { buildOgFooterUrl } from "@/lib/og-footer";

export const runtime = "nodejs";

// One-year immutable cache for the rendered OG image. Safe because the
// query string fully determines output: changing title/section yields
// a different URL, so cache invalidation is automatic. The header
// makes Vercel / any CDN serve repeat fetches from the edge instead
// of re-rendering the SVG each time a Slack/Twitter/iMessage preview
// fires.
const OG_CACHE_HEADER = "public, max-age=31536000, immutable";

// The endpoint is intentionally public (og:image URLs must be
// crawlable), which also makes it an arbitrary-text image generator on
// this domain. Clamp the inputs so nobody can mint Gofasta-branded
// cards carrying paragraphs of attacker-chosen text, and so legitimate
// long titles can't overflow the card layout. Control characters are
// stripped outright.
const MAX_TITLE_LENGTH = 120;
const MAX_SECTION_LENGTH = 40;

function clampParam(
  value: string | null,
  fallback: string,
  maxLength: number,
): string {
  const cleaned = (value ?? "").replace(/\p{C}/gu, " ").replace(/\s+/g, " ").trim();
  if (cleaned.length === 0) return fallback;
  if (cleaned.length <= maxLength) return cleaned;
  return cleaned.slice(0, maxLength - 1).trimEnd() + "…";
}

// Long titles must not overflow the 1200x630 card. Rather than a fixed
// size, scale down as the (already-clamped, <=120 char) title grows,
// and let `WebkitLineClamp` below act as a hard backstop against any
// combination of long words that still wraps past the budget. Satori's
// clamp resolver only activates `WebkitLineClamp` when `textOverflow:
// "ellipsis"` is also set on the same element (undocumented in
// Satori's README, confirmed empirically below) — without it the
// effective line limit is unbounded.
function titleFontSize(title: string): number {
  const len = title.length;
  if (len <= 30) return 68;
  if (len <= 50) return 56;
  if (len <= 80) return 46;
  if (len <= 110) return 38;
  return 32;
}

// Font files are the static TTF cuts vendored in Task 1 (Satori/next/og
// requires ttf/otf — the woff2 variable fonts used elsewhere on the
// site won't load here). Cached at module scope so the file read only
// happens once per server process, not once per request.
let fontsPromise: Promise<
  { cabinetGroteskExtrabold: ArrayBuffer; satoshiMedium: ArrayBuffer }
> | null = null;

function loadFonts() {
  if (!fontsPromise) {
    fontsPromise = Promise.all([
      readFile(
        join(process.cwd(), "src/fonts/og/CabinetGrotesk-Extrabold.ttf"),
      ),
      readFile(join(process.cwd(), "src/fonts/og/Satoshi-Medium.ttf")),
    ]).then(([cabinetGrotesk, satoshi]) => ({
      cabinetGroteskExtrabold: cabinetGrotesk.buffer.slice(
        cabinetGrotesk.byteOffset,
        cabinetGrotesk.byteOffset + cabinetGrotesk.byteLength,
      ) as ArrayBuffer,
      satoshiMedium: satoshi.buffer.slice(
        satoshi.byteOffset,
        satoshi.byteOffset + satoshi.byteLength,
      ) as ArrayBuffer,
    }));
  }
  return fontsPromise;
}

// The gopher logo mark (public/logo.png) is embedded as a base64 data
// URI. `public/` is served statically and isn't reachable via a
// `fetch(new URL(..., import.meta.url))` relative import like the
// fonts above (it sits outside the module graph route.tsx belongs
// to), so it's read from disk instead — the same `process.cwd()` +
// `fs` pattern already used by `src/app/sitemap.ts` in this repo.
// Cached at module scope for the same reason as the fonts.
let logoDataUriPromise: Promise<string> | null = null;

function loadLogoDataUri() {
  if (!logoDataUriPromise) {
    logoDataUriPromise = readFile(join(process.cwd(), "public/logo.png")).then(
      (buffer) => `data:image/png;base64,${buffer.toString("base64")}`,
    );
  }
  return logoDataUriPromise;
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = clampParam(searchParams.get("title"), "Documentation", MAX_TITLE_LENGTH);
  const section = clampParam(searchParams.get("section"), "Docs", MAX_SECTION_LENGTH);
  const footerUrl = buildOgFooterUrl(section);

  const [{ cabinetGroteskExtrabold, satoshiMedium }, logoDataUri] =
    await Promise.all([loadFonts(), loadLogoDataUri()]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#0b3846",
          fontFamily: "Satoshi Medium",
          padding: "72px",
        }}
      >
        <div
          style={{
            display: "flex",
            fontFamily: "Satoshi Medium",
            fontSize: "22px",
            fontWeight: 500,
            color: "#4fd1e5",
            textTransform: "uppercase",
            letterSpacing: "4px",
          }}
        >
          {section}
        </div>

        <div
          style={{
            display: "-webkit-box",
            WebkitBoxOrient: "vertical",
            WebkitLineClamp: 3,
            overflow: "hidden",
            textOverflow: "ellipsis",
            fontFamily: "Cabinet Grotesk Extrabold",
            fontWeight: 800,
            color: "#ffffff",
            fontSize: `${titleFontSize(title)}px`,
            lineHeight: 1.2,
            maxWidth: "1020px",
          }}
        >
          {title}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              width: "100%",
              height: "2px",
              backgroundColor: "#4fd1e5",
            }}
          />
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
              {/* eslint-disable-next-line @next/next/no-img-element -- next/og's ImageResponse renders via Satori, not the DOM; <img> is the required element here, next/image is unsupported. */}
              <img
                src={logoDataUri}
                width={48}
                height={48}
                alt=""
                style={{ borderRadius: "10px" }}
              />
              <span
                style={{
                  fontFamily: "Satoshi Medium",
                  fontSize: "24px",
                  fontWeight: 500,
                  color: "#ffffff",
                }}
              >
                Gofasta
              </span>
            </div>
            <span
              style={{
                fontFamily: "Satoshi Medium",
                fontSize: "20px",
                fontWeight: 500,
                color: "#7fb8c4",
              }}
            >
              {footerUrl}
            </span>
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "Cabinet Grotesk Extrabold",
          data: cabinetGroteskExtrabold,
          weight: 800,
          style: "normal",
        },
        {
          name: "Satoshi Medium",
          data: satoshiMedium,
          weight: 500,
          style: "normal",
        },
      ],
      headers: { "Cache-Control": OG_CACHE_HEADER },
    },
  );
}
