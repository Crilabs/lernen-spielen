// Rückmeldungen (docs/superpowers/specs/2026-11-17-rueckmeldungen-design.md): Skill „rueckmeldung“ und der Hinweis in
// „spiel-entwickeln“ für geparkte Spiele und Antworten.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const lies = (p) => readFileSync(join(WURZEL, p), "utf8");

test("Skill rueckmeldung: Kopf, drei Bereiche, Nachprüfung je Punkt, Probe, Ergebnis", () => {
  const s = lies(".claude/skills/rueckmeldung/SKILL.md");
  assert.match(s, /^---\nname: rueckmeldung\ndescription: .+\n---/);
  for (const x of ["## Spiel", "## Buch", "## Mit echten Dingen", "Rückmeldung von Christian", "rueckmeldung.md",
    "nachpruefung.json", '"umgesetzt"', "--zweig aenderung-", "--merge", "Probe", "Lauf aus der Verwaltung", "VERWALTUNG_AUFTRAG"]) assert.ok(s.includes(x), x);
  assert.doesNotMatch(s, /git push(?!` scheitert)/);
});

test("Skill rueckmeldung: jeder genannte Pfad im Repo existiert", () => {
  const fehlt = [];
  for (const [, roh] of lies(".claude/skills/rueckmeldung/SKILL.md").matchAll(/`([^`\s]+)`/g)) {
    if (!/^(docs|spiele|tests|werkzeuge|\.claude)\//.test(roh) || /[<{…*]/.test(roh)) continue;
    const pfad = roh.replace(/[?#].*$/, "").replace(/[:,.)]+$/, "");
    if (!existsSync(join(WURZEL, pfad))) fehlt.push(pfad);
  }
  assert.deepEqual(fehlt, []);
});

test("spiel-entwickeln: Rückmeldung unter dem Aufruf kommt ins Bauheft, Bau und Prüfung kennen sie", () => {
  assert.match(lies(".claude/skills/spiel-entwickeln/SKILL.md"), /Rückmeldung von Christian.*Bauheft/s);
  assert.match(lies(".claude/skills/spiel-entwickeln/bauen.md"), /Rückmeldung von Christian/);
  assert.match(lies(".claude/skills/spiel-entwickeln/pruefen.md"), /Rückmeldung von Christian/);
});
