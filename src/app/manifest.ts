import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Gofasta - Build Go Backends at Lightning Speed",
    short_name: "Gofasta",
    description:
      "Production-ready scaffolding, code generation, and batteries-included packages for Go web services.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#00ADD8",
    icons: [
      {
        src: "/logo.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
