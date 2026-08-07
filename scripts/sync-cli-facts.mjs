#!/usr/bin/env node
//
// Vendors the CLI facts document into `src/data/cli-facts.json`.
//
// Reads a `gofasta facts --json` document from stdin:
//
//   gofasta facts --json | node scripts/sync-cli-facts.mjs           # rewrite
//   gofasta facts --json | node scripts/sync-cli-facts.mjs --check   # verify
//
// `--check` deep-compares the stdin document against the vendored file
// (formatting-independent — the CLI emits single-line JSON, the vendored
// copy is pretty-printed) and exits 1 on any difference. CI runs the
// check with the CLI installed at the exact version pinned in
// `.cli-version`, so the vendored facts can never drift from the release
// the docs describe.

import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const VENDORED = resolve(__dirname, "..", "src", "data", "cli-facts.json");
const CHECK = process.argv.includes("--check");

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) chunks.push(chunk);
  return Buffer.concat(chunks).toString("utf8");
}

function deepEqual(a, b, path = "$") {
  if (Object.is(a, b)) return null;
  if (typeof a !== typeof b || a === null || b === null) {
    return `${path}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`;
  }
  if (Array.isArray(a) !== Array.isArray(b)) {
    return `${path}: array/object mismatch`;
  }
  if (typeof a === "object") {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const diff = deepEqual(a[key], b[key], `${path}.${key}`);
      if (diff) return diff;
    }
    return null;
  }
  return `${path}: ${JSON.stringify(a)} !== ${JSON.stringify(b)}`;
}

async function main() {
  const raw = await readStdin();
  if (!raw.trim()) {
    console.error("✗ sync-cli-facts: no JSON on stdin — pipe `gofasta facts --json` into this script.");
    process.exit(1);
  }
  const incoming = JSON.parse(raw);

  if (!CHECK) {
    await writeFile(VENDORED, `${JSON.stringify(incoming, null, 2)}\n`);
    console.log(`✓ sync-cli-facts: wrote ${VENDORED}`);
    return;
  }

  let vendored;
  try {
    vendored = JSON.parse(await readFile(VENDORED, "utf8"));
  } catch (err) {
    console.error(`✗ sync-cli-facts: cannot read vendored facts at ${VENDORED}: ${err.message}`);
    process.exit(1);
  }

  const diff = deepEqual(vendored, incoming);
  if (diff) {
    console.error("✗ sync-cli-facts: vendored cli-facts.json differs from the installed CLI's output.");
    console.error(`  first difference — ${diff}`);
    console.error("  Regenerate with: gofasta facts --json | node scripts/sync-cli-facts.mjs");
    console.error("  (and review the docs the changed facts affect).");
    process.exit(1);
  }
  console.log("✓ sync-cli-facts: vendored facts match the installed CLI.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
