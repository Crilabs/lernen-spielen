// Vorgaben an die Startseite (spiele/index.html), Spec 2026-11-14-startseite-karten-design.md: Karten je Fach,
// Regal als Seitenleiste rechts, dezenter Hintergrund, ein Kind; Zahnrad für Erwachsene; nur lesen, nichts zählen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../spiele/index.html", import.meta.url), "utf8");
const skript = html.slice(html.indexOf('<script type="module">'));
const { literaleAusCode, knopfNamen, sammle } = await import("../werkzeuge/audio/texte.mjs");

test("Startseite: Kopfleiste „Lernen Spielen“ ohne Fach, ohne Haus, durchsichtig, Zahnrad im Slot rechts", () => {
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

test("Startseite: Karten aus startKarten (uebersicht), Abschnitte je Fach, Vignette aus der Welt-Palette", () => {
  assert.match(skript, /startKarten\(uebersicht\(ctx, stand\), ctx, stand, heute\)/);
  assert.match(skript, /abschnittHtml\(/);
  assert.match(skript, /spielKarteHtml\(/);
  assert.match(skript, /echtKarteHtml\(/);
  assert.match(skript, /vignetteSvg\(/);
  assert.match(html, /id="raster"/);
});

test("Startseite: rechts „Zuletzt gelernt“ aus gekonnteThemen mit Knopf zum Regal", () => {
  assert.match(skript, /zuletztHtml\(ctx \? gekonnteThemen\(ctx, stand\) : \[\]\)/);
  assert.match(html, /<aside class="seite" id="seite">/);
  assert.ok(html.indexOf('id="raster"') < html.indexOf('id="seite"'), "Regal rechts vom Raster");
});

test("Startseite: dezenter Hintergrund; kein Kind (Christian: zu wenig Platz neben Zuletzt gelernt)", () => {
  assert.match(skript, /hintergrundSvg\(\)/);
  assert.doesNotMatch(skript, /setzeKind\(/);
});

test("Startseite: Mit echten Dingen führt zur eigenen Seite; der Titel der Anleitung steht auf der Karte, wenn es sie gibt", () => {
  assert.doesNotMatch(html, /<ls-anregung/);
  assert.match(skript, /import \{ ladeVerzeichnis \} from "\.\/rahmen\/echte-dinge\.js";/);
  assert.match(skript, /a\.querySelector\("b"\)\.textContent = e\.titel/);
});

test("Startseite: Links sprechen ihren Namen einmal je Sitzung und speichern vor dem Wechsel", () => {
  assert.match(skript, /linkKlick\(e\)/);
  assert.match(skript, /sageEinmal\(name, sprich\)/);
});

test("Startseite: Namen der Fächer sammelt das Audio-Werkzeug", () => {
  const texte = sammle(new URL("..", import.meta.url).pathname).eintraege.map((e) => e.text);
  for (const k of JSON.parse(readFileSync(new URL("../spiele/spiele.json", import.meta.url), "utf8")).kategorien)
    assert.ok(texte.includes(k.name), k.name);
});

test("Startseite: schreibt den Lernstand nie, keine Balken, keine Zählung, kein Klassenbezug", () => {
  assert.doesNotMatch(skript, /speichere\(|sofortSpeichern|markiereGekonnt|startThema|verbucheErgebnis|localStorage/);
  assert.doesNotMatch(html, /fortschritt\/|wertVon|\.weg\b|Balken|Klasse\b|Prozent/);
  assert.doesNotMatch(html, /\$\{[^}]*\.(length|size)\}| von \$\{/);
});

test("Startseite: Spielzeit der Eltern – gesperrt fehlen nur die Spielkarten, an ihrer Stelle ein ruhiger Satz (einmal je Sitzung); Mit echten Dingen, Fächer und Regal bleiben", () => {
  assert.match(skript, /import \{ spielzeitLage, schlussSatz, sage \} from "\.\/rahmen\/spielzeit\.js";/);
  assert.match(skript, /const spielFrei = !zeit \|\| zeit\.lage\.frei;/);
  assert.match(skript, /\(spielFrei \? f\.spiele : \[\]\)/);
  assert.match(skript, /if \(satz && leiste\.ton\) sage\(satz\);/);
  assert.match(html, /<p class="schluss" id="schluss" role="status" hidden><\/p>/);
});
