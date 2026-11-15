import { test } from "node:test";
import assert from "node:assert/strict";
import { musterSvg, MUSTER_FARBEN } from "../spiele/rahmen/muster.js";

test("jede Art liefert ein stilles SVG nur in den Tönen des Grundes", () => {
  for (const art of ["huegel", "wellen", "blaetter", "ringe"]) {
    const svg = musterSvg(art);
    assert.match(svg, /^<svg [^>]*aria-hidden="true"/, art);
    const farben = [...svg.matchAll(/(?:fill|stroke)="(#[0-9A-Fa-f]{6})"/g)].map((m) => m[1].toUpperCase());
    assert.ok(farben.length > 0, art);
    for (const f of farben) assert.ok(MUSTER_FARBEN.includes(f), `${art}: ${f}`);
  }
});

test("unbekannte Art: nichts", () => {
  assert.equal(musterSvg("sterne"), "");
  assert.equal(musterSvg(""), "");
});
