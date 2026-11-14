// Dezente Landschaft hinter den Karten (spiele/start/hintergrund.js), Spec Karten §3.3a: nur Grundtöne, keine Kontur.
import { test } from "node:test";
import assert from "node:assert/strict";

const { hintergrundSvg } = await import("../spiele/start/hintergrund.js");

test("Hintergrund: nur Grundtöne der Farbwelt (Nebel, Linie, Naht, Papier), keine Kontur, kein Text", () => {
  const svg = hintergrundSvg();
  assert.match(svg, /^<svg [^>]*aria-hidden="true"/);
  assert.doesNotMatch(svg, /stroke=|<text/);
  const farben = new Set([...svg.matchAll(/fill="(#[0-9A-F]{6})"/g)].map((m) => m[1]));
  assert.ok(farben.size >= 3);
  for (const f of farben) assert.ok(["#F4F0FA", "#E4DEF0", "#CFC4E3", "#FFFCF7"].includes(f), f);
});
