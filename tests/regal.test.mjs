// Vorgaben an das Regal (spiele/regal.html): Quelle der Dinge, Merker, Erzählersatz, keine Zählung, nur lesen.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const html = readFileSync(new URL("../spiele/regal.html", import.meta.url), "utf8");
const skript = html.slice(html.indexOf('<script type="module">'));
const { literaleAusCode } = await import("../werkzeuge/audio/texte.mjs");

test("Regal: Kopfleiste „Mein Regal“ ohne Fach", () => {
  assert.match(html, /<ls-leiste id="leiste" spiel="ansichten" titel="Mein Regal"><\/ls-leiste>/);
  assert.doesNotMatch(html, /<ls-leiste[^>]*\bfach=/);
});

test("Regal: Dinge aus gekonnteThemen, Material über materialFuer und bausteinHtml", () => {
  assert.match(skript, /gekonnteThemen\(ctx, stand\)/);
  assert.match(skript, /materialFuer\(g\)/);
  assert.match(skript, /bausteinHtml\(g\.baustein\)/);
  assert.match(skript, /kategorien/);
});

test("Regal: neu seit dem letzten Besuch über neuSeit und den Merker regal.gesehen (einstellungen)", () => {
  assert.match(skript, /const GESEHEN = "regal\.gesehen"/);
  assert.match(skript, /neuSeit\(ids, alt\)/);
  assert.match(skript, /setzeEinstellung\(GESEHEN, ids\)/);
});

test("Regal: schreibt den Lernstand nie", () => {
  assert.doesNotMatch(skript, /speichere\(|markiereGekonnt|setzeZurueck|gibFrei|verbucheErgebnis|localStorage/);
});

test("Regal: Erzählersatz für das leere Regal ist eine feste Zeichenkette (sammelbar)", () => {
  assert.ok(literaleAusCode(skript).texte.includes("Hier stellst du hin, was du kannst."));
});

test("Regal: keine Zählung, kein „von“, kein Klassenbezug beim Kind", () => {
  assert.doesNotMatch(html, /\.length\}|\$\{[^}]*\.(length|size)\}/);
  assert.doesNotMatch(html, / von \$\{|Klasse|Prozent|%\}/);
  assert.match(skript, /anregung\.oeffne\(\{ titel: g\.name, text: g\.eltern \}\)/);
});

test("Regal: Bretter sind Gruppen mit Fachnamen, das Schild ist nicht live, nur der Name", () => {
  assert.match(skript, /class="brett" role="group"[^`]*aria-label="\$\{esc\(name\(f\)\)\}"/);
  assert.doesNotMatch(html, /role="status"/);
  assert.match(html, /<h2 id="name" tabindex="-1"><\/h2>/); // live nur beim Tippen, nicht bei Tastaturöffnung (kein Doppel)
  assert.match(skript, /setAttribute\("aria-live", tastatur \? "off" : "polite"\)/);
});

test("Regal: die Reihen sperren das senkrechte Rollen nicht (kein touch-action: pan-x)", () => {
  assert.doesNotMatch(html, /touch-action:\s*pan-x/);
});
