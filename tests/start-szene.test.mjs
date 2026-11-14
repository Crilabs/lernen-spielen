// Szene der Startseite (spiele/start/szene.js): Wiese mit Baumhaus als SVG in Ebenen.
// Spec docs/superpowers/specs/2026-11-14-startseite-treffpunkt-design.md §5.1.
import { test } from "node:test";
import assert from "node:assert/strict";

const { szeneSvg, SZENE, ORTE } = await import("../spiele/start/szene.js");

test("Szene: vier Ebenen in der Reihenfolge himmel, ferne, mitte, vorne", () => {
  const svg = szeneSvg();
  const lage = ["himmel", "ferne", "mitte", "vorne"].map((id) => svg.indexOf(`<g id="${id}"`));
  assert.ok(lage.every((i) => i > 0), JSON.stringify(lage));
  assert.deepEqual([...lage].sort((a, b) => a - b), lage);
  assert.match(svg, /^<svg [^>]*viewBox="0 0 2880 1080"[^>]*aria-hidden="true"/);
  assert.equal(SZENE.breite, 2880);
  assert.equal(SZENE.hoehe, 1080);
});

test("Szene: kein Text, Kontur nur Tinte, Verläufe nur im Himmel", () => {
  const svg = szeneSvg();
  assert.doesNotMatch(svg, /<text/);
  const striche = [...svg.matchAll(/stroke="([^"]+)"/g)].map((m) => m[1]);
  assert.ok(striche.length > 0);
  assert.deepEqual([...new Set(striche)].filter((s) => s !== "#3B2A6B" && s !== "none"), []);
  const himmel = svg.slice(svg.indexOf('<g id="himmel"'), svg.indexOf('<g id="ferne"'));
  const ausserhalb = svg.replace(himmel, "");
  assert.doesNotMatch(ausserhalb, /Gradient/);
});

test("Szene: unbekannte Zeit fällt auf Sommer/Tag zurück", () => {
  assert.equal(szeneSvg(/** @type {any} */ ({ tageszeit: "x", jahreszeit: "y" })), szeneSvg({ tageszeit: "tag", jahreszeit: "sommer" }));
});

test("Szene: bedienbare Orte liegen im sicheren 4:3-Bereich (x 72–216 rem)", () => {
  const xs = [ORTE.regal, ORTE.wegweiser, ...ORTE.tore, ...ORTE.runde].flatMap((o) => [o.x, o.x + (o.b ?? 0)]);
  assert.ok(xs.every((x) => x >= 72 && x <= 216), JSON.stringify(xs));
});

test("Szene: der Pfahl des Wegweisers ist eine eigene Gruppe (die Seite blendet ihn ohne Fächer aus)", () => {
  assert.match(szeneSvg(), /<g id="pfahl">/);
});
