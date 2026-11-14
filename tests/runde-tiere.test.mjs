// Tiere im Stil der Runde (spiele/runde/tiere/): Feldhase, Hausmaus, Rotkehlchen.
// grundsaetze-bilder.md §3: stilisiert, aber artrichtig; keine menschliche Mimik, keine Kleidung (T1, T3).
import { test } from "node:test";
import assert from "node:assert/strict";

const { TIERE, tierSvg } = await import("../spiele/runde/tiere/tiere.js");

test("Tiere: Feldhase, Hausmaus und Rotkehlchen sind angemeldet, mit Namen fürs Vorlesen", () => {
  assert.deepEqual(Object.keys(TIERE).sort(), ["hase", "maus", "rotkehlchen"]);
  assert.equal(TIERE.hase.name, "Feldhase");
  assert.equal(TIERE.maus.name, "Hausmaus");
  assert.equal(TIERE.rotkehlchen.name, "Rotkehlchen");
});

test("Tiere: SVG mit viewBox im Maßstab der Runde, Kontur nur außen in Tinte (Breite wie die Figuren), kein Text", () => {
  for (const id of Object.keys(TIERE)) {
    const svg = tierSvg(id);
    assert.match(svg, new RegExp(`^<svg [^>]*viewBox="0 0 ${TIERE[id].groesse[0]} ${TIERE[id].groesse[1]}"[^>]*data-tier="${id}"`), id);
    assert.doesNotMatch(svg, /<text/, id);
    assert.match(svg, /<g data-schicht="kontur" fill="#3B2A6B" stroke="#3B2A6B" stroke-width="6"/, id);
    for (const m of svg.matchAll(/<(?:path|circle|ellipse|rect)\b[^>]*\bstroke="([^"]+)"[^>]*>/g))
      if (m[1] !== "none") assert.ok(Number(m[0].match(/stroke-width="([\d.]+)"/)?.[1] ?? 1) <= 3, `${id}: ${m[0].slice(0, 60)}`);
  }
});

test("Tiere: Blick nach links spiegelt, unbekanntes Tier ist ein Fehler", () => {
  assert.match(tierSvg("hase", { blick: "links" }), /scale\(-1 1\)/);
  assert.doesNotMatch(tierSvg("hase"), /scale\(-1 1\)/);
  assert.throws(() => tierSvg("einhorn"), /unbekanntes Tier/);
});
