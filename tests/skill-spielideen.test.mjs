// Spielideen vor dem Bau (docs/superpowers/specs/2026-11-17-spielideen-design.md): Blatt „Was Spaß macht“,
// Skill „spielideen“ und die Kostenphase.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CLAUDE_PHASEN } from "../werkzeuge/kosten/kosten.mjs";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(WURZEL, p), "utf8");

test("Blatt: drei Teile, höchstens 60 Zeilen, alle sechs Prototypen", () => {
  const t = lies("docs/spielideen.md");
  for (const h of ["## Was Spaß macht", "## Woran man eine langweilige Idee erkennt", "## Spielkern in fünf Zeilen"]) assert.ok(t.includes(h), h);
  assert.ok(t.trimEnd().split("\n").length <= 60, "höchstens 60 Zeilen");
  for (const p of ["Kettenhüpfer", "Perlenbrücke", "Zahlenzauber", "Einhorn-Steine", "Großbuchstaben", "Wimmelbild"]) assert.ok(t.includes(p), p);
});

test("Kosten: Phase ideen", () => {
  assert.ok(CLAUDE_PHASEN.includes("ideen"));
});
