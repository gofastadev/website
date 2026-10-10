import { describe, expect, it } from "vitest";

import { cliFacts, getFact } from "./cli-facts";

describe("cliFacts", () => {
  it("exposes the vendored document", () => {
    expect(cliFacts.schemaVersion).toBe(1);
    expect(cliFacts.commands.length).toBeGreaterThan(0);
  });
});

describe("getFact", () => {
  it("resolves scalar number fields", () => {
    expect(getFact("scaffold.createdCount")).toBe("18");
    expect(getFact("skeleton.fileCount")).toBe("78");
  });

  it("resolves scalar string fields", () => {
    expect(getFact("cliVersion")).toMatch(/^v/);
  });

  it("resolves array indexes", () => {
    expect(getFact("drivers[0]")).toBe("postgres");
    expect(getFact("skeleton.migrations[0].driver")).toBe("postgres");
  });

  it("throws on unknown fields", () => {
    expect(() => getFact("scaffold.nope")).toThrow(/unknown field "nope"/);
  });

  it("throws on malformed segments", () => {
    expect(() => getFact("drivers[x]")).toThrow(/malformed path segment/);
  });

  it("throws when indexing a non-array", () => {
    expect(() => getFact("scaffold[0]")).toThrow(/indexes a non-array/);
  });

  it("throws on out-of-range indexes", () => {
    expect(() => getFact("drivers[99]")).toThrow(/index out of range/);
  });

  it("throws when descending through a non-object", () => {
    expect(() => getFact("skeleton.fileCount.deeper")).toThrow(/not reachable/);
  });

  it("throws on non-scalar leaves", () => {
    expect(() => getFact("scaffold")).toThrow(/non-scalar/);
  });
});
