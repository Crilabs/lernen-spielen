import { test } from "node:test";
import assert from "node:assert/strict";
import { perlenstab, wertAus, laenge, SCHRITT, LUECKE, HOEHE, UEBERSTAND } from "../spiele/rahmen/perlen-geometrie.js";
import { LERNFARBE } from "../spiele/rahmen/stil.js";

const nah = (a, b, text) => assert.ok(Math.abs(a - b) < 1e-9, `${text}: ${a} ≠ ${b}`);

test("wertAus: ganze Zahlen 1 bis 10, als Zahl oder Text", () => {
  for (let n = 1; n <= 10; n++) {
    assert.equal(wertAus(n), n);
    assert.equal(wertAus(String(n)), n);
  }
  assert.equal(wertAus(" 7 "), 7);
});

test("wertAus: ungültige Werte werden abgewiesen, nicht geklemmt", () => {
  for (const roh of [0, 11, -3, 7.5, "7.5", "0", "11", "", "  ", "abc", "7a", "1e1", "+3", null, undefined, NaN, Infinity, {}]) {
    assert.equal(wertAus(roh), null, String(roh));
    assert.equal(perlenstab(roh), null, String(roh));
  }
});

test("perlenstab: so viele Perlen wie der Wert, alle innerhalb der Länge", () => {
  for (let n = 1; n <= 10; n++) {
    const s = perlenstab(n);
    assert.ok(s);
    assert.equal(s.wert, n);
    assert.equal(s.perlen.length, n);
    assert.ok(s.perlen[0] - 0.5 >= 0, "erste Perle ragt nicht vor den Anfang");
    assert.ok(s.perlen.at(-1) + 0.5 <= s.laenge + 1e-9, "letzte Perle ragt nicht über das Ende");
    nah(s.hoehe, HOEHE, "gleiche Höhe");
    nah(s.mitte, HOEHE / 2, "Perlen mittig");
  }
});

test("perlenstab: Spalt zwischen Nachbarn, Lücke nur zwischen der fünften und sechsten Perle", () => {
  const s = perlenstab(10);
  assert.ok(s);
  for (let i = 1; i < 10; i++) {
    const abstand = s.perlen[i] - s.perlen[i - 1];
    nah(abstand, i === 5 ? SCHRITT + LUECKE : SCHRITT, `Abstand Perle ${i} zu ${i + 1}`);
    assert.ok(abstand > 1, "Perlen berühren sich nicht");
  }
  assert.ok(LUECKE > 2 * (SCHRITT - 1), "die Lücke ist deutlich größer als der Spalt");
});

test("perlenstab: Marke in der Mitte der Lücke, erst ab 6", () => {
  for (let n = 1; n <= 5; n++) assert.equal(perlenstab(n)?.marke, null);
  for (let n = 6; n <= 10; n++) {
    const s = perlenstab(n);
    assert.ok(s && s.marke !== null);
    nah(s.marke, (s.perlen[4] + s.perlen[5]) / 2, `Marke bei ${n}`);
  }
  assert.ok(UEBERSTAND > 0, "die Marke ragt über die Perlen");
});

test("Länge proportional: 10 ist doppelt 5 plus Lücke, jede Perle mehr ein Schritt", () => {
  nah(laenge(10), 2 * laenge(5) + LUECKE, "10 = 2 · 5 + Lücke");
  nah(laenge(7), laenge(5) + laenge(2) + LUECKE, "7 = 5 + 2 + Lücke");
  for (let n = 2; n <= 10; n++) nah(laenge(n) - laenge(n - 1), n === 6 ? SCHRITT + LUECKE : SCHRITT, `Schritt zu ${n}`);
  for (let n = 1; n <= 10; n++) nah(perlenstab(n)?.laenge ?? -1, laenge(n), `laenge(${n})`);
});

test("Farben der Lernzeichen nach der Farbwelt 6.2", () => {
  assert.deepEqual({ ...LERNFARBE.perle }, {
    1: "#E5484D", 2: "#3FA34D", 3: "#F4A3C0", 4: "#F7D038", 5: "#6CB8F0",
    6: "#9B5DE5", 7: "#FFFFFF", 8: "#9A6B4F", 9: "#2F5BC4", 10: "#D9A520",
  });
  assert.deepEqual({ ...LERNFARBE.wortart }, { nomen: "#1E1A2E", artikel: "#7CC4F0", adjektiv: "#2F5BC4", verb: "#E5484D" });
});

test("Perlenkette: zehn Stäbchen in zwei Reihen zu fünf, Orte am Ende der Stäbchen und dazwischen", async () => {
  const { perlenkette, laenge, GLIED } = await import("../spiele/rahmen/perlen-geometrie.js");
  const k = perlenkette(7);
  assert.equal(k.staebchen.length, 10);
  assert.equal(k.reihen, 2);
  assert.deepEqual(k.staebchen.map((s) => s.reihe), [0, 0, 0, 0, 0, 1, 1, 1, 1, 1]);
  assert.ok(Math.abs(k.breite - (5 * laenge(7) + 4 * GLIED)) < 1e-9);
  assert.equal(k.staebchen[5].x0, 0);
  assert.equal(k.staebchen[0].perlen.length, 7);
  assert.notEqual(k.staebchen[0].marke, null);
  const ende3 = k.ort(21);
  assert.equal(ende3.reihe, 0);
  assert.ok(Math.abs(ende3.x - (k.staebchen[2].x1 + GLIED / 2)) < 1e-9);
  assert.equal(k.ort(42).reihe, 1);
  const mitten = k.ort(15);
  assert.ok(mitten.x > k.staebchen[2].perlen[0] && mitten.x < k.staebchen[2].perlen[1]);
  assert.equal(k.ort(71).ueber, true);
  assert.equal(k.ort(70).ueber, false);
  const kurz = perlenkette(4, { staebchen: 3, jeReihe: 3 });
  assert.equal(kurz.reihen, 1);
  assert.equal(perlenkette(11), null);
  assert.equal(perlenkette(4, { staebchen: 0 }), null);
});
