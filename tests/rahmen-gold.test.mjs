import { test } from "node:test";
import assert from "node:assert/strict";
import { gold, zahlAus, MATERIAL_HOEHE, STANGEN_ABSTAND } from "../spiele/rahmen/gold-geometrie.js";
import { laenge } from "../spiele/rahmen/perlen-geometrie.js";

test("zahlAus: ganze Zahlen 0 bis 99, als Zahl oder Text; alles andere wird abgewiesen, nicht geklemmt", () => {
  for (const n of [0, 7, 10, 17, 99]) {
    assert.equal(zahlAus(n), n);
    assert.equal(zahlAus(String(n)), n);
  }
  for (const roh of [100, -1, 7.5, "7.5", "", " ", "abc", "1e1", "+3", null, undefined, NaN, {}]) {
    assert.equal(zahlAus(roh), null, String(roh));
    assert.equal(gold(roh), null, String(roh));
  }
});

test("gold: Zehnerstangen und einzelne Perlen entsprechen der Zahl, alles innerhalb von Breite und Höhe", () => {
  for (let n = 0; n <= 99; n++) {
    const g = gold(n);
    assert.ok(g, String(n));
    assert.equal(g.zehner, Math.floor(n / 10));
    assert.equal(g.einer, n % 10);
    assert.equal(g.stangen.length, g.zehner);
    assert.equal(g.einzel.length, g.einer);
    assert.equal(g.zehner * 10 + g.einzel.length, n, `${n}: Perlen zusammen`);
    for (const s of g.stangen) {
      assert.equal(s.perlen.length, 10);
      assert.ok(s.x - 0.7 >= -1e-9 && s.x + 0.7 <= g.breite + 1e-9, `${n}: Stange in der Breite`);
    }
    for (const p of g.einzel) {
      assert.ok(p.x - 0.5 >= -1e-9 && p.x + 0.5 <= g.breite + 1e-9, `${n}: Perle in der Breite`);
      assert.ok(p.y - 0.5 >= -1e-9 && p.y + 0.5 <= g.hoehe + 1e-9, `${n}: Perle in der Höhe`);
    }
    assert.equal(g.hoehe, MATERIAL_HOEHE);
  }
});

test("gold: 0 ist leer, 17 hat eine Stange und sieben Perlen in zwei Säulen (fünf und zwei), Stangen stehen nebeneinander", () => {
  const leer = gold(0);
  assert.deepEqual([leer.zehner, leer.einer, leer.breite], [0, 0, 0]);
  const g = gold("17");
  assert.equal(g.stangen.length, 1);
  const spalten = [...new Set(g.einzel.map((p) => p.x))];
  assert.equal(spalten.length, 2);
  assert.deepEqual(spalten.map((x) => g.einzel.filter((p) => p.x === x).length), [5, 2]);
  assert.ok(g.einzel.every((p) => p.x > g.stangen[0].x + 0.7), "Perlen rechts neben der Stange (Einer rechts, Zehner links)");
  const f = gold(43);
  assert.deepEqual(f.stangen.map((s) => s.x), [0, 1, 2, 3].map((i) => f.stangen[0].x + i * STANGEN_ABSTAND));
  assert.equal(MATERIAL_HOEHE, laenge(10));
});

test("gold: Zehnerzahlen nur Stangen, Zahlen unter zehn nur Perlen (Z und E lassen sich getrennt zeigen)", () => {
  assert.equal(gold(70).einzel.length, 0);
  assert.equal(gold(70).stangen.length, 7);
  assert.equal(gold(7).stangen.length, 0);
  assert.equal(gold(7).einzel.length, 7);
});
