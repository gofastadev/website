#!/usr/bin/env node
//
// Docs anti-drift guard for `src/content/`.
//
// Validates every `gofasta …` invocation found inside shell-ish fenced
// code blocks of the docs MDX against the vendored CLI facts document
// (`src/data/cli-facts.json`): the subcommand path must exist (aliases
// like `g` resolve) and every `--flag` must be declared on the resolved
// command, an ancestor's persistent flags, or the global flags. This is
// the check that catches documenting a flag that was renamed or removed
// (`--no-services` → `--services`) before the page ships.
//
// Also asserts the `.cli-version` pin matches the vendored document's
// cliVersion, so the pair can only move together.
//
// Runs in `prebuild` (so `yarn build` gates on it locally and in CI) and
// in the CI docs-check job. Mirrors cli/internal/docs/{fences,validate}.go
// — keep the two implementations structurally parallel.

import { readFile, readdir } from "node:fs/promises";
import { join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const REPO = resolve(__dirname, "..");
const CONTENT = join(REPO, "src", "content");
const FACTS_PATH = join(REPO, "src", "data", "cli-facts.json");
const PIN_PATH = join(REPO, ".cli-version");

const SHELL_INFO = new Set(["", "bash", "sh", "shell", "console", "terminal", "zsh"]);
const GOFASTA_SPELLINGS = new Set(["gofasta", "./bin/gofasta"]);

async function walk(dir) {
  const out = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else if (entry.isFile() && full.endsWith(".mdx")) out.push(full);
  }
  return out;
}

// --- fence extraction (mirrors cli/internal/docs/fences.go) -------------

function fenceLine(trimmed) {
  for (const marker of ["```", "~~~"]) {
    if (trimmed.startsWith(marker)) {
      return { marker, info: trimmed.slice(marker.length).trim() };
    }
  }
  return null;
}

function splitSegments(line) {
  const segments = [];
  let cur = "";
  let inSingle = false;
  let inDouble = false;
  const flush = () => {
    const s = cur.trim();
    if (s) segments.push(s);
    cur = "";
  };
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === '"' && !inSingle) inDouble = !inDouble;
    else if (!inSingle && !inDouble) {
      if (c === "#") {
        flush();
        return segments;
      }
      if (c === "&" && line[i + 1] === "&") {
        flush();
        i++;
        continue;
      }
      if (c === ";" || c === "|") {
        flush();
        continue;
      }
    }
    cur += c;
  }
  flush();
  return segments;
}

function tokenize(segment) {
  const tokens = [];
  let cur = "";
  let inSingle = false;
  let inDouble = false;
  const flush = () => {
    if (cur.length > 0) {
      tokens.push(cur);
      cur = "";
    }
  };
  for (const c of segment) {
    if (c === "'" && !inDouble) inSingle = !inSingle;
    else if (c === '"' && !inSingle) inDouble = !inDouble;
    else if ((c === " " || c === "\t") && !inSingle && !inDouble) flush();
    else cur += c;
  }
  flush();
  return tokens;
}

function isEnvAssignment(token) {
  return /^[A-Za-z0-9_]+=/.test(token);
}

function fenceUsesPrompts(lines, start, marker) {
  for (let j = start; j < lines.length; j++) {
    const t = lines[j].trim();
    if (t.startsWith(marker)) return false;
    if (t.startsWith("$ ")) return true;
  }
  return false;
}

function extractInvocations(file, content) {
  const invocations = [];
  const lines = content.split("\n");
  let inFence = false;
  let fenceMarker = "";
  let shellFence = false;
  let promptFence = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    const fence = fenceLine(trimmed);
    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceMarker = fence.marker;
        shellFence = SHELL_INFO.has(fence.info.toLowerCase());
        promptFence = fenceUsesPrompts(lines, i + 1, fence.marker);
      } else if (trimmed.startsWith(fenceMarker)) {
        inFence = false;
      }
      continue;
    }
    if (!inFence || !shellFence) continue;
    if (line.includes("{{")) continue;
    // Console-style fences mix commands and output; when the fence uses
    // `$ ` prompts, only prompt-prefixed lines are commands.
    if (promptFence && !trimmed.startsWith("$")) continue;

    const startLine = i + 1;
    let logical = line;
    while (/\\\s*$/.test(logical) && i + 1 < lines.length) {
      logical = `${logical.replace(/\\\s*$/, "")} ${lines[i + 1]}`;
      i++;
    }

    for (const segment of splitSegments(logical)) {
      let tokens = tokenize(segment);
      while (tokens.length > 0 && (tokens[0] === "$" || tokens[0] === ">")) tokens = tokens.slice(1);
      while (tokens.length > 0 && isEnvAssignment(tokens[0])) tokens = tokens.slice(1);
      if (tokens.length === 0 || !GOFASTA_SPELLINGS.has(tokens[0])) continue;
      invocations.push({ file, line: startLine, tokens });
    }
  }
  return invocations;
}

// --- validation (mirrors cli/internal/docs/validate.go) -----------------

function isPlaceholder(token) {
  return (
    /[<>[\]…*`$]/.test(token) || token.includes("...")
  );
}

function findChild(commands, name) {
  return (
    commands.find((c) => c.name === name || (c.aliases ?? []).includes(name)) ?? null
  );
}

function flagKnown(name, local, inherited) {
  return (
    local.some((f) => f.name === name) || inherited.some((f) => f.name === name)
  );
}

function shorthandKnown(shorthand, local, inherited) {
  return (
    local.some((f) => f.shorthand === shorthand) ||
    inherited.some((f) => f.shorthand === shorthand)
  );
}

function checkFlag(token, resolved, inherited) {
  let name = token.replace(/^-+/, "");
  const eq = name.indexOf("=");
  if (eq !== -1) name = name.slice(0, eq);
  if (!name || isPlaceholder(name)) return null;
  if (name === "help" || name === "h") return null;
  if (!resolved && (name === "version" || name === "v")) return null;

  const local = resolved?.flags ?? [];
  const cmdPath = resolved?.path ?? "gofasta";

  if (token.startsWith("--")) {
    if (flagKnown(name, local, inherited)) return null;
    return `flag --${name} does not exist on \`${cmdPath}\``;
  }
  for (const c of name) {
    if (!shorthandKnown(c, local, inherited)) {
      return `shorthand -${c} does not exist on \`${cmdPath}\``;
    }
  }
  return null;
}

function validateInvocation(facts, invocation) {
  const tokens = invocation.tokens.slice(1);
  let current = facts.commands;
  let resolved = null;
  const inherited = [...facts.globalFlags];
  let descending = true;

  for (const token of tokens) {
    if (token === "--") return null;
    if (isPlaceholder(token)) return null;
    if (token.startsWith("-")) {
      // Flags do NOT stop path descent — cobra allows them anywhere
      // (`gofasta --json refactor feature --all` is valid).
      const problem = checkFlag(token, resolved, inherited);
      if (problem) return problem;
      continue;
    }
    if (!descending) continue;
    const child = findChild(current, token);
    if (!child) {
      if (!resolved) {
        return `unknown command "${token}" (root has no positional args — typo or removed command?)`;
      }
      descending = false;
      continue;
    }
    resolved = child;
    for (const flag of child.flags ?? []) {
      if (flag.persistent) inherited.push(flag);
    }
    current = child.children ?? [];
  }
  return null;
}

async function main() {
  const facts = JSON.parse(await readFile(FACTS_PATH, "utf8"));
  const pin = (await readFile(PIN_PATH, "utf8")).trim();
  const problems = [];

  if (`v${pin}` !== facts.cliVersion) {
    problems.push(
      `.cli-version pins ${pin} but src/data/cli-facts.json says ${facts.cliVersion} — bump both together (gofasta facts --json | node scripts/sync-cli-facts.mjs).`,
    );
  }

  const files = await walk(CONTENT);
  let invocationCount = 0;
  for (const file of files) {
    const content = await readFile(file, "utf8");
    for (const invocation of extractInvocations(relative(REPO, file), content)) {
      invocationCount++;
      const problem = validateInvocation(facts, invocation);
      if (problem) {
        problems.push(`${invocation.file}:${invocation.line} — ${problem}`);
      }
    }
  }

  if (problems.length > 0) {
    console.error(`✗ check-cli-docs: ${problems.length} problem(s) across ${files.length} MDX files:`);
    for (const problem of problems) console.error(`  ${problem}`);
    console.error(
      "  Fix the docs to match the CLI (facts source: src/data/cli-facts.json at the .cli-version pin).",
    );
    process.exit(1);
  }
  console.log(
    `✓ check-cli-docs: ${invocationCount} gofasta invocations across ${files.length} MDX files all match the CLI facts.`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
