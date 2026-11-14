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

test("Szene: kein Text; Kontur in Tinte und so fein wie bei den Figuren; Nähte fein im Flächenton; Verläufe nur im Himmel", () => {
  const svg = szeneSvg();
  assert.doesNotMatch(svg, /<text/);
  // Konturgruppen: Tinte, Breite höchstens 8 (sichtbar ≤ 4, Figuren ≈ 3,6 auf Szenengröße)
  const konturen = [...svg.matchAll(/<g fill="#3B2A6B" stroke="#3B2A6B" stroke-width="([\d.]+)"/g)].map((m) => Number(m[1]));
  assert.ok(konturen.length > 10, `Konturgruppen: ${konturen.length}`);
  assert.ok(konturen.every((w) => w <= 8), JSON.stringify([...new Set(konturen)]));
  // alle anderen Striche: nicht Tinte, höchstens 3 breit (Fugen, Maserung)
  for (const m of svg.matchAll(/<(?:path|line|circle|ellipse|rect)\b[^>]*\bstroke="([^"]+)"[^>]*>/g)) {
    if (m[1] === "none") continue;
    assert.notEqual(m[1], "#3B2A6B", `Tinte innen: ${m[0].slice(0, 80)}`);
    const w = Number(m[0].match(/stroke-width="([\d.]+)"/)?.[1] ?? 1);
    assert.ok(w <= 3, m[0].slice(0, 80));
  }
  const himmel = svg.slice(svg.indexOf('<g id="himmel"'), svg.indexOf('<g id="ferne"'));
  assert.doesNotMatch(svg.replace(himmel, ""), /Gradient/);
});

test("Szene: Schatten in Stufen wie bei den Figuren (viele Flächen je Form)", () => {
  const svg = szeneSvg();
  assert.ok((svg.match(/<(path|circle|ellipse|rect)\b/g) ?? []).length > 600);
});

test("Szene: unbekannte Zeit fällt auf Sommer/Tag zurück", () => {
  assert.equal(szeneSvg(/** @type {any} */ ({ tageszeit: "x", jahreszeit: "y" })), szeneSvg({ tageszeit: "tag", jahreszeit: "sommer" }));
});

test("Szene: bedienbare Orte liegen im sicheren 4:3-Bereich (x 72–216 rem)", () => {
  const xs = [ORTE.regal, ORTE.faecher, ...ORTE.tore, ...ORTE.runde, ...ORTE.tiere].flatMap((o) => [o.x, o.x + (o.b ?? 0)]);
  assert.ok(xs.every((x) => x >= 72 && x <= 216), JSON.stringify(xs));
});

test("Szene: kein Wegweiser-Pfahl mehr (die Fächer sind Knöpfe am Rand)", () => {
  assert.doesNotMatch(szeneSvg(), /id="pfahl"/);
});

test("Szene: Tore haben Luft zum Baumhaus (mindestens 5 rem bis zum Dachüberstand bei x 175,5)", () => {
  const rechts = Math.max(...ORTE.tore.map((t) => t.x + t.b));
  assert.ok(rechts <= 170.5, String(rechts));
});

test("Szene: kein Schlagschatten des Hauses auf der Krone", () => {
  assert.doesNotMatch(szeneSvg(), /M1789 267 L1994 150/);
});

test("Szene: Bodenschatten auch unter den Tieren am Boden", () => {
  const amBoden = ORTE.tiere.filter((t) => t.boden).length;
  assert.equal((szeneSvg().match(/class="bodenschatten"/g) ?? []).length, ORTE.runde.length + amBoden);
});
