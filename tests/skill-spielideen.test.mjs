// Spielideen vor dem Bau (docs/superpowers/specs/2026-11-17-spielideen-design.md): Blatt „Was Spaß macht“,
// Skill „spielideen“ und die Kostenphase.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
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

test("Skill spielideen: Kopf, Lesen, Verbote, Ergebnis", () => {
  const s = lies(".claude/skills/spielideen/SKILL.md");
  assert.match(s, /^---\nname: spielideen\ndescription: .+\n---/);
  for (const x of ["docs/spielideen.md", "docs/spiele/ideen/", "ideen-", "--ff-only", "--phase ideen", '"ideen"', "Lauf aus der Verwaltung"]) assert.ok(s.includes(x), x);
  assert.doesNotMatch(s, /[Ll]ies.*(Bauheft|G1–G14)/);
});

test("Skill spielideen: jeder genannte Pfad im Repo existiert", () => {
  const fehlt = [];
  for (const [, roh] of lies(".claude/skills/spielideen/SKILL.md").matchAll(/`([^`\s]+)`/g)) {
    if (!/^(docs|spiele|tests|werkzeuge|\.claude)\//.test(roh) || /[<{…*]/.test(roh)) continue;
    const pfad = roh.replace(/[?#].*$/, "").replace(/[:,.)]+$/, "");
    if (!existsSync(join(WURZEL, pfad))) fehlt.push(pfad);
  }
  assert.deepEqual(fehlt, []);
});
