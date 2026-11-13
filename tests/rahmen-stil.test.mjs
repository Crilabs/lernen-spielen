import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { GRUND_CSS, LEISTE_HOEHE, TOKENS } from "../spiele/rahmen/stil.js";

const SEITE = readFileSync(new URL("../spiele/rahmen/seite.css", import.meta.url), "utf8");

/**
 * Variablen (--ls-*) im ersten Block mit dem Selektor `kopf` (Kommentare entfernt, Leerraum vereinheitlicht).
 * @param {string} css
 * @param {string} kopf
 */
function variablen(css, kopf) {
  const ohne = css.replace(/\/\*[\s\S]*?\*\//g, "");
  const start = ohne.indexOf(`${kopf} {`);
  assert.ok(start >= 0, `Block ${kopf} fehlt`);
  const block = ohne.slice(start + kopf.length + 2, ohne.indexOf("}", start));
  /** @type {Record<string, string>} */
  const werte = {};
  for (const [, name, wert] of block.matchAll(/(--ls-[a-z-]+)\s*:\s*([^;]+);/g)) {
    assert.ok(!(name in werte), `${name} doppelt in ${kopf}`);
    werte[name] = wert.trim().replace(/\s+/g, " ");
  }
  return werte;
}

test("seite.css :root hat genau die Tokens aus stil.js, mit denselben Werten", () => {
  const seite = variablen(SEITE, ":root");
  const { "--ls-leiste-hoehe": leiste, ...rest } = seite;
  assert.deepEqual(rest, { ...TOKENS });
  assert.equal(leiste, LEISTE_HOEHE);
});

test("GRUND_CSS :host übernimmt die Tokens unverändert", () => {
  assert.deepEqual(variablen(GRUND_CSS, ":host"), { ...TOKENS });
});

test("seite.css: Raster 1rem = 1/108 der Bildhöhe, Andika lokal, reduced motion", () => {
  assert.match(SEITE, /font-size:\s*calc\(100dvh \/ 108\)/);
  assert.match(SEITE, /@import url\("\.\.\/schrift\/schrift\.css"\)/);
  assert.match(SEITE, /@media \(prefers-reduced-motion: reduce\)/);
  assert.doesNotMatch(SEITE, /https?:\/\//, "keine Schrift oder Datei aus dem Netz");
});

test("seite.css: Flächen der Farbwelt sind flach, nur .teil hat einen Schatten", () => {
  for (const klasse of [".lernfeld", ".tablett", ".welt", ".buehne"]) {
    const ohne = SEITE.replace(/\/\*[\s\S]*?\*\//g, "");
    const start = ohne.indexOf(`\n${klasse} {`);
    assert.ok(start >= 0, `${klasse} fehlt`);
    const block = ohne.slice(start, ohne.indexOf("}", start));
    // Tablett: nur innere Ringe (inset) für Rand und Linie, kein Schatten nach außen.
    const schatten = block.match(/box-shadow:([^;]+);/);
    if (schatten) for (const teil of schatten[1].split(/,(?![^(]*\))/)) assert.match(teil.trim(), /^inset /, `${klasse}: ${teil.trim()}`);
  }
  assert.match(SEITE, /\.teil \{[^}]*box-shadow: var\(--ls-schatten\)/);
});
