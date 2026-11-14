// Skill „Spiel entwickeln“ (.claude/skills/spiel-entwickeln/): Die Prüfvorlagen zitieren die Kriterien aus
// docs/spielentwicklung.md wörtlich (A1–A12 aus §2, B-Didaktik/B-Welt/B-Bedienung aus §4). Ändert sich das Dokument,
// wird dieser Test rot, bis die Vorlage nachgezogen ist. Dazu: Pfade in den Skill-Dateien gibt es, Platzhalter sind
// im Skill erklärt.
import { test } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const SKILL = join(WURZEL, ".claude/skills/spiel-entwickeln");
const lies = (p) => readFileSync(join(WURZEL, p), "utf8");
const DOK = lies("docs/spielentwicklung.md");

/** Text zwischen zwei Überschriften (die zweite nicht mehr). */
function abschnitt(text, von, bis) {
  const a = text.indexOf(von);
  assert.ok(a >= 0, `Abschnitt „${von}“ fehlt`);
  const b = text.indexOf(bis, a + von.length);
  return text.slice(a, b < 0 ? undefined : b);
}

/** Der Block zwischen den Markierungen „wörtlich“ und „ende wörtlich“ einer Vorlage. */
function woertlich(vorlage) {
  const m = vorlage.match(/<!-- wörtlich aus [^>]*-->\n([\s\S]*?)\n<!-- ende wörtlich -->/);
  assert.ok(m, "Markierung <!-- wörtlich … --> … <!-- ende wörtlich --> fehlt");
  return m[1];
}

const tabellenZeilen = (text) => text.split("\n").filter((z) => z.startsWith("|"));
const glatt = (text) => text.replace(/\s+/g, " ").trim();

test("Prüfung A: Kriterien A1–A12 stehen wörtlich wie in docs/spielentwicklung.md §2 (der ganze markierte Block)", () => {
  const imDok = tabellenZeilen(abschnitt(DOK, "## 2. Prüfung A", "## 3."));
  // Der markierte Block ist genau die Tabelle: nichts davor, dazwischen oder danach.
  assert.equal(woertlich(readFileSync(join(SKILL, "pruefung-a.md"), "utf8")), imDok.join("\n"));
  const nummern = imDok.slice(2).map((z) => z.split("|")[1].trim().split(" ")[0]);
  assert.deepEqual(nummern, ["A1", "A2", "A3", "A4", "A4b", "A5", "A6", "A6b", "A7", "A8", "A9", "A10", "A11", "A12"]);
});

const B_VORLAGEN = { Didaktik: "pruefung-b-didaktik.md", Welt: "pruefung-b-welt.md", Bedienung: "pruefung-b-bedienung.md" };

test("Prüfstand B: jeder Prüfer aus §4 hat eine Vorlage (B-Spielbarkeit ist das Durchspielen), keiner fehlt, keiner zu viel", () => {
  const b = abschnitt(DOK, "## 4. Prüfung B", "## 5.");
  const imDok = [...b.matchAll(/^\*\*B-([A-Za-zÄÖÜäöüß]+)\*\*/gm)].map((m) => m[1]).sort();
  assert.deepEqual(imDok, [...Object.keys(B_VORLAGEN), "Spielbarkeit"].sort());
  assert.match(b, /tests\/browser\/durchspielen\.mjs/);
});

for (const [name, datei] of Object.entries(B_VORLAGEN)) {
  test(`Prüfstand B-${name}: Auftrag steht wörtlich wie in docs/spielentwicklung.md §4`, () => {
    const b = abschnitt(DOK, "## 4. Prüfung B", "## 5.");
    const m = b.match(new RegExp(`^\\*\\*B-${name}\\*\\*[\\s\\S]*?(?=\\n\\n)`, "m"));
    assert.ok(m, `B-${name} fehlt in §4`);
    // ganzer markierter Block = genau der Absatz aus §4 (Zeilenumbrüche dürfen abweichen)
    assert.equal(glatt(woertlich(readFileSync(join(SKILL, datei), "utf8"))), glatt(m[0]));
  });
}

const skillDateien = () => readdirSync(SKILL).filter((d) => d.endsWith(".md"));

test("Skill: Kopf mit Name und Beschreibung, alle genannten Vorlagen liegen daneben", () => {
  const s = readFileSync(join(SKILL, "SKILL.md"), "utf8");
  const kopf = s.match(/^---\nname: (.+)\ndescription: (.+)\n---\n/);
  assert.ok(kopf, "Frontmatter fehlt");
  assert.equal(kopf[1], "spiel-entwickeln");
  assert.ok(kopf[2].length <= 1024, "Beschreibung zu lang");
  for (const v of ["bauen.md", "pruefung-a.md", "pruefung-b-didaktik.md", "pruefung-b-welt.md", "pruefung-b-bedienung.md", "abschluss-review.md"]) {
    assert.ok(s.includes(`\`${v}\``), `SKILL.md nennt ${v} nicht`);
    assert.ok(existsSync(join(SKILL, v)), `${v} fehlt`);
  }
});

test("Skill: jeder genannte Pfad im Repo existiert", () => {
  const fehlt = [];
  for (const d of skillDateien()) {
    const text = readFileSync(join(SKILL, d), "utf8");
    for (const [, roh] of text.matchAll(/`([^`\s]+)`/g)) {
      if (!/^(docs|spiele|tests|werkzeuge|\.claude)\//.test(roh) || /[<{…*]/.test(roh)) continue;
      const pfad = roh.replace(/[?#].*$/, "").replace(/[:,.)]+$/, "");
      if (!existsSync(join(WURZEL, pfad))) fehlt.push(`${d}: ${pfad}`);
    }
  }
  assert.deepEqual(fehlt, []);
});

test("Skill: jeder Platzhalter der Vorlagen ist in SKILL.md erklärt", () => {
  const s = readFileSync(join(SKILL, "SKILL.md"), "utf8");
  const fehlt = new Set();
  for (const d of skillDateien()) {
    for (const [p] of readFileSync(join(SKILL, d), "utf8").matchAll(/\{\{[A-Z_]+\}\}/g)) if (!s.includes(`\`${p}\``)) fehlt.add(p);
  }
  assert.deepEqual([...fehlt], []);
});
