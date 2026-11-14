// Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md): Verzeichnis aktuell, Form jeder Datei, die Regeln
// für den Text, soweit sie sich ohne Lesen prüfen lassen (Rest: Prüfung E1–E9 durch einen frischen Agenten).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { anleitungen, baueVerzeichnis, alsText, VERZEICHNIS } from "../werkzeuge/echte-dinge/verzeichnis.mjs";
import { liesAnleitung, formText } from "../spiele/rahmen/markdown.js";

const plan = JSON.parse(readFileSync(new URL("../spiele/lernplan.json", import.meta.url), "utf8"));
const themen = new Map(plan.themen.map((t) => [t.id, t]));
const liste = anleitungen();

// Wortliste grundsaetze.md 3.2, „schnell“ (Druck), Fachbegriffe, die §5.1 ausschließt, und Elternsprache statt „ihr“.
const VERBOTEN = [
  /\b(super|toll|klasse|prima|spitze|perfekt|unglaublich|wahnsinn|klug|schlau|profi|brav|lieb|fleißig|falsch|leider|schade|fehler|endlich|schnell\w*)\b/i,
  /oh nein|schon wieder|immer noch|schaffst du|ganz leicht|besser als|schneller als/i,
  /\b(namenwort|hauptwort|dingwort|tunwort|tätigkeitswort|zeitwort|wiewort|eigenschaftswort|selbstlaut|mitlaut|ergibt)\b/i,
  /\bIhr Kind\b|\bSie\b|\bIhnen\b|\bIhre[mnrs]?\b/,
];

test("es gibt Anleitungen, und das Verzeichnis passt zu den Dateien (sonst: npm run echte-dinge)", () => {
  assert.ok(liste.length >= 1);
  assert.equal(readFileSync(VERZEICHNIS, "utf8"), alsText(baueVerzeichnis(liste, plan)));
});

for (const a of liste) {
  test(`${a.fach}/${a.thema}.md: Kopf, Thema im Lernplan, Formen vollständig, Regeln für den Text`, () => {
    const l = liesAnleitung(a.text);
    assert.equal(l.kopf.thema, a.thema, "thema im Kopf = Dateiname");
    assert.equal(l.kopf.fach, a.fach, "fach im Kopf = Ordner");
    assert.equal(themen.get(a.thema)?.strang, a.fach, "Thema steht im Lernplan in diesem Fach");
    assert.ok(Array.isArray(l.kopf.quellen) && l.kopf.quellen.length >= 1, "Quellen im Kopf");
    for (const q of /** @type {string[]} */ (l.kopf.quellen)) assert.match(q, /https?:\/\/\S+/, `Quelle mit Adresse: ${q}`);
    assert.ok(l.titel, "Überschrift # in Alltagssprache");
    assert.ok(l.formen.length >= 1 && l.formen.length <= 3, "eine Grundform, höchstens zwei Varianten");
    assert.equal(l.vorspann.length, 0, "nichts zwischen Überschrift und erster Form");
    for (const f of l.formen) {
      const p = f.bloecke.filter((b) => b.typ === "p").map((b) => /** @type {any} */ (b).text);
      assert.ok(p.some((t) => /^Ihr braucht: \S/.test(t)), `${f.name}: „Ihr braucht:“`);
      assert.ok(f.bloecke.some((b) => b.typ === "ol" && b.punkte.length >= 2), `${f.name}: Schritte als nummerierte Liste`);
      assert.ok(p.some((t) => /^\*\*Darauf kommt es an:\*\* \S/.test(t)), `${f.name}: „Darauf kommt es an“`);
      assert.ok(p.some((t) => /\*\*Leichter:\*\* \S/.test(t) && /\*\*Schwerer:\*\* \S/.test(t)), `${f.name}: Leichter und Schwerer`);
      const text = formText(f);
      const woerter = text.split(/\s+/).filter(Boolean).length;
      assert.ok(woerter <= 130, `${f.name}: höchstens etwa 120 Wörter (sind ${woerter})`);
      for (const muster of VERBOTEN) assert.doesNotMatch(text, muster, `${f.name}: Wortliste/Anrede`);
    }
  });
}
