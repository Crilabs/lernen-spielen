// Welt-Paletten und Vignetten der Spielkarten (spiele/start/welten.js), Farbwelt grundsaetze-bilder.md 6.2.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { PALETTEN, paletteFuer, vignetteSvg } = await import("../spiele/start/welten.js");
const plan = JSON.parse(readFileSync(new URL("../spiele/lernplan.json", import.meta.url), "utf8"));
const doku = readFileSync(new URL("../docs/grundsaetze-bilder.md", import.meta.url), "utf8");

test("Paletten: genau die sechs Welt-Paletten der Farbwelt, Werte wie dort", () => {
  const namen = { wiese: "Wiese und Wald", wasser: "Wasser und Strand", savanne: "Savanne", dorf: "Dorf und Stadt", werkstatt: "Werkstatt", nacht: "Nacht und Himmel" };
  assert.deepEqual(Object.keys(PALETTEN).sort(), Object.keys(namen).sort());
  for (const [id, name] of Object.entries(namen)) {
    const zeile = doku.split("\n").find((z) => z.startsWith(`| ${name} |`));
    assert.ok(zeile, name);
    assert.deepEqual(PALETTEN[id], [...zeile.matchAll(/`(#[0-9A-F]{6})`/g)].map((m) => m[1]), name);
  }
});

test("paletteFuer: jede Welt des Lernplans bekommt eine Palette; unbekannt → null", () => {
  for (const w of plan.welten) assert.ok(PALETTEN[paletteFuer({ plan }, w.id)], w.id);
  assert.equal(paletteFuer({ plan }, "gibt-es-nicht"), null);
  assert.equal(paletteFuer({ plan }, undefined), null);
});

test("vignetteSvg: flach, nur Farben der Palette (und Papier), keine Kontur, kein Text", () => {
  for (const id of Object.keys(PALETTEN)) {
    const svg = vignetteSvg(id);
    assert.match(svg, /^<svg [^>]*viewBox="0 0 300 160"/);
    assert.doesNotMatch(svg, /<text|stroke="#3B2A6B"/);
    const farben = new Set([...svg.matchAll(/(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase()));
    for (const f of farben) assert.ok([...PALETTEN[id], "#FFFCF7"].includes(f), `${id}: ${f}`);
  }
});
