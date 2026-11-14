// Vorgaben an die Startseite (spiele/index.html): dran, Fächer, Regal; Zahnrad für Erwachsene; nur lesen, nichts zählen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../spiele/index.html", import.meta.url), "utf8");
const skript = html.slice(html.indexOf('<script type="module">'));
const { literaleAusCode, knopfNamen, sammle } = await import("../werkzeuge/audio/texte.mjs");

test("Startseite: Kopfleiste „Lernen Spielen“ ohne Fach und ohne Haus, Zahnrad im Slot rechts", () => {
  assert.match(html, /<ls-leiste id="leiste" spiel="start" titel="Lernen Spielen" ohne-haus>/);
  assert.doesNotMatch(html, /<ls-leiste[^>]*\bfach=/);
  assert.match(html, /<span class="zahnrad" id="zahnrad" slot="rechts"><ls-knopf id="eltern" symbol="zahnrad\.svg"[^>]*\bstumm>/);
  assert.deepEqual(knopfNamen(html), [], "der Name des Zahnrads wird nicht gesprochen");
});

test("Startseite: Zahnrad gedrückt halten führt zu eltern.html, loslassen bricht ab", () => {
  assert.match(skript, /const HALTEN_MS = 3000;/);
  assert.match(skript, /setTimeout\(\(\) => \{ los\(\); location\.href = "eltern\.html"; \}, HALTEN_MS\)/);
  assert.match(skript, /\["pointerup", "pointercancel", "lostpointercapture"\]\.forEach/);
});

test("Startseite: dran aus dranThemen (mit ?thema), Fächer nur mit Spielen, Regal aus gekonnteThemen", () => {
  assert.match(skript, /dranThemen\(ctx, stand\)/);
  assert.match(skript, /href="\$\{esc\(t\.spiel\.datei\)\}\?thema=\$\{encodeURIComponent\(t\.id\)\}"/);
  assert.match(skript, /spiele\.some\(\(s\) => s\.kategorie === k\.id\)/);
  assert.match(skript, /href="themen\.html\?fach=\$\{encodeURIComponent\(k\.id\)\}"/);
  assert.match(skript, /gekonnteThemen\(ctx, stand\)\.slice\(-3\)/);
  assert.match(skript, /bausteinHtml\(materialFuer\(g\)\)/);
  assert.match(html, /<a class="kachel" id="regal" href="regal\.html" aria-label="Mein Regal">/);
});

test("Startseite: jede Kachel ist ein Link, spricht ihren Namen einmal je Sitzung und speichert vor dem Wechsel", () => {
  assert.doesNotMatch(html, /<button\b/);
  assert.equal(skript.match(/linkKlick\(e\)/g)?.length, 2);
  assert.match(skript, /sageEinmal\(name, sprich\)/);
  assert.ok(literaleAusCode(skript).texte.includes("Mein Regal"), "„Mein Regal“ ist sammelbar");
});

test("Startseite: Namen der Fächer und Spiele sammelt das Audio-Werkzeug", () => {
  const texte = sammle(new URL("..", import.meta.url).pathname).eintraege.map((e) => e.text);
  for (const k of JSON.parse(readFileSync(new URL("../spiele/spiele.json", import.meta.url), "utf8")).kategorien)
    assert.ok(texte.includes(k.name), k.name);
});

test("Startseite: schreibt den Lernstand nie, keine Balken, keine Zählung, kein Klassenbezug", () => {
  assert.doesNotMatch(skript, /speichere\(|sofortSpeichern|markiereGekonnt|startThema|verbucheErgebnis|localStorage/);
  assert.doesNotMatch(html, /fortschritt\/|wertVon|\.weg\b|Balken|Klasse\b|Prozent/);
  assert.doesNotMatch(html, /\$\{[^}]*\.(length|size)\}| von \$\{/);
});
