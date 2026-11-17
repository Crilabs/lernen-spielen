// Erinnerungsfragen der Sachbücher (docs/geschichten.md §2b, Christian 2026-11-16): je Kapitel eine Frage nach der
// Kernerkenntnis, drei Antworten, neutrale Auflösung, Seite zum Nachlesen und deren Foto (2026-11-17).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ORDNER = "spiele/geschichten";
const woerter = (t) => t.split(/\s+/).filter((w) => /\p{L}|\d/u.test(w)).length;
/** Urteilende Wörter am Anfang der Auflösung (grundsaetze.md §3) */
const URTEIL = /^(ja|nein|genau|richtig|falsch|leider|nicht ganz|super|toll|prima|gut gemacht|stimmt)\b/i;

const buecher = readdirSync(ORDNER, { withFileTypes: true }).filter((d) => d.isDirectory())
  .map((d) => ({ id: d.name, g: JSON.parse(readFileSync(join(ORDNER, d.name, "geschichte.json"), "utf8")) }))
  .filter(({ g }) => Array.isArray(g.kapitel) && g.kapitel.length);

for (const { id, g } of buecher) {
  test(`${id}: jedes Kapitel hat eine Erinnerungsfrage nach §2b`, () => {
    g.kapitel.forEach((k, i) => {
      const e = k.erinnern, wo = `${id} Kapitel ${i + 1}`;
      assert.ok(e && typeof e === "object", `${wo}: erinnern fehlt`);
      assert.ok(typeof e.frage === "string" && e.frage.endsWith("?") && woerter(e.frage) <= 15, `${wo}: Frage (≤ 15 Wörter, mit ?)`);
      assert.ok(Array.isArray(e.antworten) && e.antworten.length === 3, `${wo}: genau drei Antworten`);
      for (const a of e.antworten) assert.ok(typeof a === "string" && a && woerter(a) <= 8, `${wo}: Antwort „${a}“ (≤ 8 Wörter)`);
      assert.equal(new Set(e.antworten).size, 3, `${wo}: Antworten verschieden`);
      assert.ok([0, 1, 2].includes(e.richtig), `${wo}: richtig 0–2`);
      assert.ok(typeof e.aufloesung === "string" && e.aufloesung.length > 10, `${wo}: Auflösung`);
      assert.doesNotMatch(e.aufloesung.trim(), URTEIL, `${wo}: Auflösung urteilt`);
      assert.ok(Number.isInteger(e.seite) && e.seite >= 0 && e.seite < k.seiten.length, `${wo}: seite im Kapitel`);
      assert.equal(e.bild, k.seiten[e.seite].bild, `${wo}: bild ist das Foto der Seite ${e.seite} (dort steht die Antwort)`);
      assert.ok(existsSync(join(ORDNER, id, e.bild)), `${wo}: ${e.bild} fehlt`);
    });
    assert.ok(new Set(g.kapitel.map((k) => k.erinnern.richtig)).size > 1, `${id}: die passende Antwort steht nicht immer an derselben Stelle`);
  });
}
