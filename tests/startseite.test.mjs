// Vorgaben an die Startseite (spiele/index.html), Spec 2026-11-14-startseite-karten-design.md: Karten je Fach,
// Regal als Seitenleiste rechts, dezenter Hintergrund, ein Kind; Zahnrad für Erwachsene; nur lesen, nichts zählen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const html = readFileSync(new URL("../spiele/index.html", import.meta.url), "utf8");
const skript = html.slice(html.indexOf('<script type="module">'));
const { literaleAusCode, knopfNamen, sammle } = await import("../werkzeuge/audio/texte.mjs");

test("Startseite: Kopf mit Reiter „Können“ (Designsprache), Zahnrad im Slot rechts", () => {
  assert.match(html, /<ls-kopf id="leiste" reiter="koennen" spiel="ansichten">/);
  assert.doesNotMatch(html, /<ls-leiste/);
  assert.match(html, /<span id="zahnrad" slot="rechts"><\/span>/);
  assert.match(skript, /zahnrad\(document\.getElementById\("zahnrad"\)\);/);
  assert.deepEqual(knopfNamen(html), [], "der Name des Zahnrads wird nicht gesprochen");
});

test("Startseite und Wissen: Zahnrad gedrückt halten führt zu eltern.html, loslassen bricht ab (rahmen/zahnrad.js)", () => {
  const rad = readFileSync(new URL("../spiele/rahmen/zahnrad.js", import.meta.url), "utf8");
  assert.match(rad, /export const HALTEN_MS = 3000;/);
  assert.match(rad, /<ls-knopf id="eltern" symbol="zahnrad\.svg"[^>]*\bstumm>/);
  assert.match(rad, /setTimeout\(\(\) => \{ los\(\); location\.href = ziel; \}, HALTEN_MS\)/);
  assert.match(rad, /\["pointerup", "pointercancel", "lostpointercapture"\]\.forEach/);
  const bib = readFileSync(new URL("../spiele/bibliothek.html", import.meta.url), "utf8");
  assert.match(bib, /<ls-kopf id="leiste" reiter="wissen" spiel="ansichten"><span id="zahnrad" slot="rechts"><\/span><\/ls-kopf>/);
  assert.match(bib, /zahnrad\(document\.getElementById\("zahnrad"\)\);/);
});

test("Startseite: Karten aus startKarten (uebersicht), Abschnitte je Fach, Vignette aus der Welt-Palette", () => {
  assert.match(skript, /startKarten\(uebersicht\(ctx, stand\), ctx, stand, heute\)/);
  assert.match(skript, /abschnittHtml\(/);
  assert.match(skript, /spielKarteHtml\(/);
  assert.match(skript, /echtKarteHtml\(/);
  assert.match(skript, /vignetteSvg\(/);
  assert.match(html, /id="raster"/);
});

test("Startseite: unten „Zuletzt gelernt“ aus gekonnteThemen mit Knopf zum Regal", () => {
  assert.match(skript, /zuletztHtml\(ctx \? gekonnteThemen\(ctx, stand\) : \[\]\)/);
  assert.match(html, /<footer class="unten" id="seite">/);
  assert.ok(html.indexOf('id="raster"') < html.indexOf('id="seite"'), "Regal unter dem Raster");
});

test("Startseite: Grundmuster Hügel (Designsprache); kein Kind", () => {
  assert.match(html, /<ls-muster art="huegel"><\/ls-muster>/);
  assert.match(skript, /import "\.\/rahmen\/muster\.js";/);
  assert.doesNotMatch(skript, /setzeKind\(/);
});

test("Startseite: Mit echten Dingen führt zur eigenen Seite; der Titel der Anleitung steht auf der Karte, wenn es sie gibt", () => {
  assert.doesNotMatch(html, /<ls-anregung/);
  assert.match(skript, /import \{ ladeVerzeichnis, fotoUrl \} from "\.\/rahmen\/echte-dinge\.js";/);
  assert.match(skript, /a\.querySelector\("b"\)\.textContent = e\.titel/);
});

test("Startseite: Links sprechen ihren Namen einmal je Sitzung und speichern vor dem Wechsel", () => {
  assert.match(skript, /linkKlick\(e\)/);
  assert.match(skript, /sageEinmal\(name, sprich\)/);
});

test("Startseite: Namen der Fächer sammelt das Audio-Werkzeug", () => {
  const texte = sammle(fileURLToPath(new URL("..", import.meta.url))).eintraege.map((e) => e.text);
  for (const k of JSON.parse(readFileSync(new URL("../spiele/spiele.json", import.meta.url), "utf8")).kategorien)
    assert.ok(texte.includes(k.name), k.name);
});

test("Startseite: schreibt den Lernstand nie, keine Balken, keine Zählung, kein Klassenbezug", () => {
  assert.doesNotMatch(skript, /speichere\(|sofortSpeichern|markiereGekonnt|startThema|verbucheErgebnis|localStorage/);
  assert.doesNotMatch(html, /fortschritt\/|wertVon|\.weg\b|Balken|Klasse\b|Prozent/);
  assert.doesNotMatch(html, /\$\{[^}]*\.(length|size)\}| von \$\{/);
});

test("Startseite: Spielzeit der Eltern – gesperrt tragen die Spielkarten eine Uhr und zeigen den Hinweis; ausgeblendet fehlen sie; Mit echten Dingen, Fächer und Regal bleiben", () => {
  assert.match(skript, /import \{ spielzeitLage \} from "\.\/rahmen\/spielzeit\.js";/);
  assert.match(skript, /const spielFrei = !zeit \|\| zeit\.lage\.frei;/);
  assert.match(skript, /const spieleZeigen = spielFrei \|\| zeit\.lage\.grund !== "aus";/);
  assert.match(skript, /\(spieleZeigen \? f\.spiele : \[\]\)/);
  assert.match(skript, /sperre\(a, a\.querySelector\("\.bild"\), satzFuer\(zeit\.lage\.grund\)/);
  assert.doesNotMatch(html, /id="schluss"/);
});
