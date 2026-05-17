import { describe, it, expect } from "vitest";
import { computeReadingTime } from "./reading-time";

describe("computeReadingTime", () => {
  it("returns zero values for an empty source", () => {
    const r = computeReadingTime("");
    expect(r.words).toBe(0);
    expect(r.minutes).toBe(0);
    expect(typeof r.text).toBe("string");
  });

  it("counts words and reports a human-readable label for a short prose source", () => {
    const source = "Gofasta is a Go backend toolkit. ".repeat(50);
    const r = computeReadingTime(source);
    // Roughly 250 words at 200 WPM ≈ 1.25 min ≈ "2 min read" (the
    // package rounds up). We assert the floor, not the exact number,
    // because the upstream package owns the rounding rule.
    expect(r.words).toBeGreaterThanOrEqual(200);
    expect(r.minutes).toBeGreaterThan(0);
    expect(r.text).toMatch(/min read/);
  });

  it("scales with input length", () => {
    const short = computeReadingTime("hello world ".repeat(50));
    const long = computeReadingTime("hello world ".repeat(500));
    expect(long.words).toBeGreaterThan(short.words);
    expect(long.minutes).toBeGreaterThan(short.minutes);
  });
});
