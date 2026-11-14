import { test } from "node:test";
import assert from "node:assert/strict";
import { zerlegePfad, tastePfadAb, richtungAm } from "../spiele/kern/vorlagen/pfad.js";

test("zerlegt M L C Q", () => {
  assert.deepEqual(
    zerlegePfad("M 0 0 L 10 0 Q 20 0 20 10 C 20 20 0 20 0 10").map((s) => s.befehl),
    ["M", "L", "Q", "C"],
  );
});

test("Zahlen auch mit Komma, Minus und Dezimalpunkt", () => {
  const s = zerlegePfad("M10,20 L-5.5 .5");
  assert.deepEqual(s[1].punkte, [{ x: -5.5, y: 0.5 }]);
});

test("lehnt relative, Bögen, zweites M und fehlendes M ab", () => {
  for (const d of ["m 0 0 l 1 1", "M 0 0 A 5 5 0 0 1 10 0", "M 0 0 L 1 1 M 5 5 L 6 6", "L 1 1", "M 0 0 L 1", ""])
    assert.throws(() => zerlegePfad(d), /Ungültiger Pfad/, d);
});

test("Abtastung: Start, Ende, gleichmäßig", () => {
  const p = tastePfadAb("M 0 0 L 100 0", 10);
  assert.deepEqual(p[0], { x: 0, y: 0 });
  assert.deepEqual(p.at(-1), { x: 100, y: 0 });
  assert.equal(p.length, 11);
});

test("Kurve: Punkte liegen auf dem Bogen, Abstand fast gleich", () => {
  const p = tastePfadAb("M 0 0 C 0 55.2 44.8 100 100 100", 5); // Viertelkreis r=100 um (100,0)
  for (const q of p) assert.ok(Math.abs(Math.hypot(q.x - 100, q.y) - 100) < 1);
  const d = p.slice(1).map((q, i) => Math.hypot(q.x - p[i].x, q.y - p[i].y));
  const innen = d.slice(0, -1);
  assert.ok(Math.max(...innen) - Math.min(...innen) < 0.5);
});

test("Quadratische Kurve endet am Endpunkt", () => {
  const p = tastePfadAb("M 0 0 Q 50 100 100 0");
  assert.deepEqual(p.at(-1), { x: 100, y: 0 });
});

test("Richtung am Anfang und Ende", () => {
  const p = tastePfadAb("M 0 0 L 0 50 L 50 50", 5);
  assert.deepEqual(richtungAm(p, "anfang"), { x: 0, y: 1 });
  assert.deepEqual(richtungAm(p, "ende"), { x: 1, y: 0 });
});
