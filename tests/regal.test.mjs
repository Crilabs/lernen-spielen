// Vorgaben an das Regal (spiele/regal.html): Fächer als Reiter, je Bereich ein Brett, Detail rechts; Merker für
// Neues, Erzählersatz, keine Zählung, nur lesen (Spec 2026-11-14-startseite-karten-design.md, Nachtrag Regal-Seite).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../spiele/regal.html", import.meta.url), "utf8");
const skript = html.slice(html.indexOf('<script type="module">'));
const { literaleAusCode } = await import("../werkzeuge/audio/texte.mjs");

test("Regal: Kopfleiste „Was ich schon kann“ ohne Fach (mit Haus)", () => {
  assert.match(html, /<ls-leiste id="leiste" spiel="ansichten" titel="Was ich schon kann"><\/ls-leiste>/);
  assert.doesNotMatch(html, /<ls-leiste[^>]*\b(fach=|ohne-haus)/);
});

test("Regal: Reiter und Bretter aus regalBaum(gekonnteThemen, spieleFuer)", () => {
  assert.match(skript, /regalBaum\(gekonnteThemen\(ctx, stand\), ctx, spieleFuer\)/);
  assert.match(skript, /reiterHtml\(baum, aktiv\)/);
  assert.match(skript, /bretterHtml\(/);
  assert.match(html, /id="reiter"/);
  assert.match(html, /id="bretter"/);
  assert.match(html, /<aside class="detail" id="detail"/);
});

test("Regal: neu seit dem letzten Besuch über neuSeit und den Merker regal.gesehen (einstellungen)", () => {
  assert.match(skript, /const GESEHEN = "regal\.gesehen"/);
  assert.match(skript, /neuSeit\(erspielt, alt\)/); // von Eltern Abgehaktes bekommt keinen Ring
  assert.match(skript, /\.filter\(\(g\) => !g\.vonEltern\)/);
  assert.match(skript, /setzeEinstellung\(GESEHEN, ids\)/);
});

test("Regal: schreibt den Lernstand nie", () => {
  assert.doesNotMatch(skript, /speichere\(|markiereGekonnt|setzeZurueck|gibFrei|verbucheErgebnis|localStorage/);
});

test("Regal: Erzählersatz für das leere Regal ist eine feste Zeichenkette (sammelbar)", () => {
  assert.ok(literaleAusCode(skript).texte.includes("Hier stellst du hin, was du kannst."));
});

test("Regal: keine Zählung, kein „von“, kein Klassenbezug; Mit echten Dingen ist eine eigene Seite", () => {
  assert.doesNotMatch(html, /\.length\}|\$\{[^}]*\.(length|size)\}/);
  assert.doesNotMatch(html, / von \$\{|Klasse|Prozent|%\}/);
  assert.doesNotMatch(html, /<ls-anregung/); // Mit echten Dingen ist eine eigene Seite (Karte im Detail verlinkt)
});

test("Regal: die Bretter sperren das senkrechte Rollen nicht (kein touch-action: pan-x)", () => {
  assert.doesNotMatch(html, /touch-action:\s*pan-x/);
});

test("Regal: ?thema öffnet das Regal an diesem Thema (Fach gewählt, Detail offen)", () => {
  assert.match(skript, /new URLSearchParams\(location\.search\)\.get\("thema"\)/);
});

test("Regal: Spiele im Detail als dieselben Karten wie auf der Startseite (Vignette, Mit echten Dingen)", () => {
  assert.match(html, /<link rel="stylesheet" href="start\/karten\.css">/);
  assert.match(skript, /spielKarteHtml\(/);
  assert.match(skript, /echtKarteHtml\(/);
  assert.match(skript, /vignetteSvg\(/);
});

test("Regal: immer etwas gewählt, passend zum Reiter – beim Öffnen der erste Reiter und sein erstes Thema, beim Wechsel das erste Thema des Fachs", () => {
  assert.match(skript, /let aktiv = fachVon\(ziel\) \?\? baum\[0\]\.fach;/);
  assert.match(skript, /zeigeFach\(k\.dataset\.fach\);\s*oeffne\(erstesVon\(k\.dataset\.fach\), false\);/);
  assert.doesNotMatch(skript, /fachVon\(\[\.\.\.neu\]\[0\]\)/);
});

test("Regal: Spielzeit der Eltern – gesperrt fehlen die Spielkarten im Detail, Mit echten Dingen bleibt", () => {
  assert.match(skript, /import \{ spielzeitLage \} from "\.\/rahmen\/spielzeit\.js";/);
  assert.match(skript, /\(spielFrei \? t\.spiele : \[\]\)/);
});
