import { describe, it, expect } from "vitest";
import {
  isKeystaticAccessible,
  resolveKeystaticStorageKind,
} from "./keystatic-access";

describe("resolveKeystaticStorageKind", () => {
  it("uses github when the app slug is set", () => {
    expect(resolveKeystaticStorageKind({ appSlug: "gofasta-cms" })).toBe(
      "github",
    );
  });

  it("uses github when storage is forced for the setup wizard", () => {
    expect(resolveKeystaticStorageKind({ storage: "github" })).toBe("github");
  });

  it("falls back to local otherwise", () => {
    expect(resolveKeystaticStorageKind({})).toBe("local");
    expect(resolveKeystaticStorageKind({ appSlug: "", storage: "local" })).toBe(
      "local",
    );
  });
});

describe("isKeystaticAccessible", () => {
  const secrets = { clientId: "id", clientSecret: "cs", secret: "s" };

  it("allows local storage only in development", () => {
    expect(
      isKeystaticAccessible({ storageKind: "local", nodeEnv: "development" }),
    ).toBe(true);
    expect(
      isKeystaticAccessible({ storageKind: "local", nodeEnv: "production" }),
    ).toBe(false);
    expect(isKeystaticAccessible({ storageKind: "local" })).toBe(false);
  });

  it("allows github storage in development without secrets (setup wizard)", () => {
    expect(
      isKeystaticAccessible({ storageKind: "github", nodeEnv: "development" }),
    ).toBe(true);
  });

  it("requires every secret for github storage outside development", () => {
    expect(
      isKeystaticAccessible({
        storageKind: "github",
        nodeEnv: "production",
        ...secrets,
      }),
    ).toBe(true);
    expect(
      isKeystaticAccessible({
        storageKind: "github",
        nodeEnv: "production",
        ...secrets,
        secret: undefined,
      }),
    ).toBe(false);
    expect(
      isKeystaticAccessible({
        storageKind: "github",
        nodeEnv: "production",
        ...secrets,
        clientId: "",
      }),
    ).toBe(false);
  });
});
