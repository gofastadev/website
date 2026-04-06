import { ImageResponse } from "next/og";

export const alt = "Gofasta - Build Go Backends at Lightning Speed";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #00283A 0%, #0d1117 50%, #001a2c 100%)",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "72px",
              height: "72px",
              borderRadius: "16px",
              background: "#00ADD8",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "40px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            G
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: 700,
              color: "#ffffff",
            }}
          >
            Gofasta
          </span>
        </div>
        <div
          style={{
            fontSize: "32px",
            fontWeight: 600,
            color: "#4FD1E5",
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.3,
          }}
        >
          Build Go Backends at Lightning Speed
        </div>
        <div
          style={{
            fontSize: "20px",
            color: "#94a3b8",
            textAlign: "center",
            maxWidth: "700px",
            marginTop: "20px",
            lineHeight: 1.5,
          }}
        >
          Production-ready scaffolding, code generation, and batteries-included
          packages for Go web services.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "32px",
            right: "40px",
            fontSize: "18px",
            color: "#64748b",
          }}
        >
          gofasta.dev
        </div>
      </div>
    ),
    { ...size },
  );
}
