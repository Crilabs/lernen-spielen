// Vorgaben an die Startseite (spiele/index.html): dran, Fächer, Regal; Zahnrad für Erwachsene; nur lesen, nichts zählen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../spiele/index.html", import.meta.url), "utf8");
const skript = html.slice(html.indexOf('<script type="module">'));
const { literaleAusCode, knopfNamen, sammle } = await import("../werkzeuge/audio/texte.mjs");

test("Startseite: Kopfleiste „Lernen Spielen“ ohne Fach, ohne Haus, durchsichtig über dem Himmel, Zahnrad im Slot rechts", () => {
  assert.match(html, /<ls-leiste id="leiste" spiel="ansichten" titel="Lernen Spielen" ohne-haus durchsichtig>/);
  assert.doesNotMatch(html, /<ls-leiste[^>]*\bfach=/);
  assert.match(html, /<span class="zahnrad" id="zahnrad" slot="rechts"><ls-knopf id="eltern" symbol="zahnrad\.svg"[^>]*\bstumm>/);
  assert.deepEqual(knopfNamen(html), [], "der Name des Zahnrads wird nicht gesprochen");
});

test("Startseite: Zahnrad gedrückt halten führt zu eltern.html, loslassen bricht ab", () => {
  assert.match(skript, /const HALTEN_MS = 3000;/);
  assert.match(skript, /setTimeout\(\(\) => \{ los\(\); location\.href = "eltern\.html"; \}, HALTEN_MS\)/);
  assert.match(skript, /\["pointerup", "pointercancel", "lostpointercapture"\]\.forEach/);
});

test("Startseite: Tore aus dranThemen (höchstens drei), Fach-Knöpfe nur für Fächer mit Spielen, Regal aus gekonnteThemen", () => {
  assert.match(skript, /dranThemen\(ctx, stand\)/);
  assert.match(skript, /\.slice\(0, ORTE\.tore\.length\)/);
  assert.match(skript, /torHtml\(/);
  assert.match(skript, /spiele\.some\(\(s\) => s\.kategorie === k\.id\)/);
  assert.match(skript, /faecherHtml\(faecher\)/);
  assert.match(skript, /gekonnteThemen\(ctx, stand\)\.slice\(-3\)/);
  assert.match(skript, /bausteinHtml\(materialFuer\(g\)\)/);
  assert.match(html, /<a class="baumhaus" id="regal" href="regal\.html" aria-label="Mein Regal">/);
  assert.match(html, /id="dran"/);
  assert.match(html, /id="faecher"/);
  assert.match(html, /id="dinge"/);
});

test("Startseite: Szene im Hintergrund, die Runde steht darin", () => {
  assert.match(skript, /szeneSvg\(/);
  assert.match(skript, /setzeRunde\(/);
});

test("Startseite: Tiere stehen in der Szene (Feldhase, Hausmaus, Rotkehlchen), Namen sammelbar", () => {
  assert.match(skript, /setzeTiere\(/);
  const quelle = readFileSync(new URL("../spiele/start/runde-auf-start.js", import.meta.url), "utf8");
  for (const name of ["Feldhase", "Hausmaus", "Rotkehlchen"]) assert.ok(literaleAusCode(quelle).texte.includes(name), name);
});

test("Startseite: jede Kachel ist ein Link, spricht ihren Namen einmal je Sitzung und speichert vor dem Wechsel", () => {
  assert.doesNotMatch(html, /<button\b/);
  assert.equal(skript.match(/linkKlick\(e\)/g)?.length, 2);
  for (const name of ["Ela", "Kofi", "Lena", "Timo"])
    assert.ok(literaleAusCode(readFileSync(new URL("../spiele/start/runde-auf-start.js", import.meta.url), "utf8")).texte.includes(name), name);
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
