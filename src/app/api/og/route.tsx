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

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const title = searchParams.get("title") ?? "Documentation";
  const section = searchParams.get("section") ?? "Docs";
  const footerUrl = buildOgFooterUrl(section);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #00283A 0%, #0d1117 50%, #001a2c 100%)",
          fontFamily: "system-ui, sans-serif",
          padding: "60px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: "#00ADD8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "28px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            G
          </div>
          <span
            style={{ fontSize: "28px", fontWeight: 600, color: "#94a3b8" }}
          >
            Gofasta
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div
            style={{
              fontSize: "18px",
              fontWeight: 500,
              color: "#00ADD8",
              textTransform: "uppercase",
              letterSpacing: "2px",
            }}
          >
            {section}
          </div>
          <div
            style={{
              fontSize: "52px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.2,
              maxWidth: "900px",
            }}
          >
            {title}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "18px", color: "#64748b" }}>
            {footerUrl}
          </span>
          <span style={{ fontSize: "16px", color: "#475569" }}>
            Go Backend Toolkit
          </span>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: { "Cache-Control": OG_CACHE_HEADER },
    },
  );
}
