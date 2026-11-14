// Beschreibung für Erwachsene (Christian, 2026-11-14): Jedes Spiel in spiele/spiele.json hat ein Feld `beschreibung`,
// 2–3 Sätze (höchstens 4), höchstens 400 Zeichen, neutral (Wortliste docs/grundsaetze.md §3.2), ohne Klassen- und
// Lehrplanangaben. Sie erscheint nur in der Elternansicht (?eltern) und im Elternbereich, nie für das Kind.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const WURZEL = join(dirname(fileURLToPath(import.meta.url)), "..");
const SPIELE = JSON.parse(readFileSync(join(WURZEL, "spiele/spiele.json"), "utf8")).spiele;

const VERBOTEN = /\b(super|toll|klasse|prima|spitze|perfekt|unglaublich|wahnsinn|klug|schlau|brav|fleißig|schade|leider|endlich|schnell(er)? als)\b/i;

/** Gibt die Mängel einer Beschreibung zurück (leer = in Ordnung). */
export function maengel(text) {
  if (typeof text !== "string" || !text.trim()) return ["fehlt"];
  const m = [];
  if (text.length > 400) m.push(`zu lang (${text.length} Zeichen)`);
  const saetze = text.split(/(?<=[.!?])\s+/).filter(Boolean);
  if (saetze.length < 2 || saetze.length > 4) m.push(`${saetze.length} Sätze statt 2–4`);
  if (VERBOTEN.test(text)) m.push("Wort aus der Wortliste 3.2");
  if (/\bKlasse\s*\d|\b\d\.\s*Klasse|Lehrplan/i.test(text)) m.push("Klassen- oder Lehrplanangabe");
  return m;
}

test("jedes Spiel in spiele.json hat eine Beschreibung für Erwachsene (2–4 Sätze, ≤ 400 Zeichen, neutral)", () => {
  const rot = SPIELE.map((s) => [s.id, maengel(s.beschreibung)]).filter(([, m]) => m.length);
  assert.deepEqual(rot, []);
});

test("Prüfer der Beschreibung (Fixture): Beispiel gut, Mängel erkannt", () => {
  const gut = "Timo packt Vorräte in den Korb: Schuhpaare, Brötchentüten, Eierkartons. Das Kind rechnet aus, wie viele Dinge es zusammen sind, und sieht die Malaufgabe als Perlenkette. So übt es das Einmaleins mit echten Packungsgrößen.";
  assert.deepEqual(maengel(gut), []);
  assert.deepEqual(maengel(undefined), ["fehlt"]);
  assert.deepEqual(maengel("  "), ["fehlt"]);
  assert.ok(maengel("Nur ein Satz.").length);
  assert.ok(maengel("Eins. Zwei. Drei. Vier. Fünf.").some((x) => /Sätze/.test(x)));
  assert.ok(maengel(`Das Kind legt Perlen. ${"Es übt dabei viel. ".repeat(30)}`).some((x) => /zu lang/.test(x)));
  assert.ok(maengel("Das Kind legt Perlen. Das macht es super.").some((x) => /Wortliste/.test(x)));
  assert.ok(maengel("Das Kind legt Perlen. Das Thema aus Klasse 2.").some((x) => /Klassen/.test(x)));
});
