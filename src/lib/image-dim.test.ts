import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { getLocalImageDim } from "./image-dim";

// Construct a minimal valid PNG buffer with width/height embedded in
// the IHDR chunk. `image-size` parses the IHDR to extract dimensions
// and doesn't validate the CRC, so a 33-byte header is enough to give
// us deterministic per-test fixtures without needing real image files
// checked into the repo.
function makePngHeader(width: number, height: number): Buffer {
  const buf = Buffer.alloc(33);
  // PNG signature.
  buf.write("\x89PNG\r\n\x1a\n", 0, "binary");
  // IHDR chunk: 4-byte length (13), 4-byte type, 13-byte data, 4-byte CRC.
  buf.writeUInt32BE(13, 8);
  buf.write("IHDR", 12);
  buf.writeUInt32BE(width, 16);
  buf.writeUInt32BE(height, 20);
  // Bit depth, color type, compression, filter, interlace.
  buf[24] = 8;
  buf[25] = 6;
  buf[26] = 0;
  buf[27] = 0;
  buf[28] = 0;
  // CRC bytes left at 0 — image-size doesn't verify them.
  return buf;
}

let publicDir: string;

beforeEach(() => {
  publicDir = fs.mkdtempSync(path.join(os.tmpdir(), "img-dim-test-"));
});

afterEach(() => {
  fs.rmSync(publicDir, { recursive: true, force: true });
  vi.restoreAllMocks();
});

describe("getLocalImageDim", () => {
  it("returns null for empty / missing src", () => {
    expect(getLocalImageDim(undefined, { publicDir })).toBeNull();
    expect(getLocalImageDim(null, { publicDir })).toBeNull();
    expect(getLocalImageDim("", { publicDir })).toBeNull();
  });

  it("returns null for remote http(s) URLs without touching the filesystem", () => {
    const spy = vi.spyOn(fs, "readFileSync");
    expect(
      getLocalImageDim("https://cdn.example.com/a.png", { publicDir }),
    ).toBeNull();
    expect(
      getLocalImageDim("http://cdn.example.com/a.png", { publicDir }),
    ).toBeNull();
    expect(spy).not.toHaveBeenCalled();
  });

  it("reads dimensions from a real on-disk fixture (leading-/ path)", () => {
    const dir = path.join(publicDir, "blog", "inline");
    fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, "hero.png"), makePngHeader(1200, 630));
    expect(
      getLocalImageDim("/blog/inline/hero.png", { publicDir }),
    ).toEqual({ width: 1200, height: 630 });
  });

  it("handles a relative src without leading slash by resolving inside publicDir", () => {
    fs.writeFileSync(
      path.join(publicDir, "thumb.png"),
      makePngHeader(64, 64),
    );
    expect(getLocalImageDim("thumb.png", { publicDir })).toEqual({
      width: 64,
      height: 64,
    });
  });

  it("returns null when the file does not exist (read throws)", () => {
    expect(
      getLocalImageDim("/blog/inline/missing.png", { publicDir }),
    ).toBeNull();
  });

  it("returns null when image-size cannot determine dimensions", async () => {
    // Mock image-size's `imageSize` to return a partial result —
    // simulates an SVG without explicit width/height/viewBox or any
    // future format where the lib detects the type but can't read
    // dimensions. This is the only path to the typed null guard short
    // of pinning a specific image-size version.
    const mod = await import("image-size");
    vi.spyOn(mod, "imageSize").mockReturnValue({
      width: undefined,
      height: undefined,
      type: "svg",
    } as unknown as ReturnType<typeof mod.imageSize>);
    fs.writeFileSync(path.join(publicDir, "weird.svg"), Buffer.from("<svg/>"));
    expect(getLocalImageDim("/weird.svg", { publicDir })).toBeNull();
  });

  it("falls back to process.cwd()/public when publicDir is omitted", () => {
    // Point process.cwd() at our temp dir so the default branch is
    // exercised without polluting the real public/ tree.
    const cwdSpy = vi.spyOn(process, "cwd").mockReturnValue(publicDir);
    const pub = path.join(publicDir, "public");
    fs.mkdirSync(pub, { recursive: true });
    fs.writeFileSync(path.join(pub, "default.png"), makePngHeader(100, 200));
    expect(getLocalImageDim("/default.png")).toEqual({
      width: 100,
      height: 200,
    });
    cwdSpy.mockRestore();
  });
});
