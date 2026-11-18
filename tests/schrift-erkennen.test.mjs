// Erkennung der Handschrift-Linie (spiele/schrift/erkennen.js) an den Vorlagen aus spiele/woerter/schriftzeichen.js.
import test from "node:test";
import assert from "node:assert/strict";
import { ZEICHEN, zeichenMit, strichePunkte, aufgabenDaten, pfadPunkte } from "../spiele/woerter/schriftzeichen.js";
import { erkenne, bereit, gespiegelt, laenge, gleichmaessig, saeubere } from "../spiele/schrift/erkennen.js";

/** Wackeln, verschieben und dünn abtasten wie ein Finger. */
function finger(striche, { dx = 0, dy = 0, wackel = 6, schritt = 9, saat = 3 } = {}) {
  let s = saat;
  const r = () => ((s = (s * 16807) % 2147483647) / 2147483647 - 0.5) * 2;
  return striche.map((st) => {
    if (st.length === 1) return [[st[0][0] + dx + r() * 3, st[0][1] + dy + r() * 3]];
    const n = Math.max(3, Math.round(laenge(st) / schritt));
    return gleichmaessig(st, n).map(([x, y]) => [x + dx + r() * wackel, y + dy + r() * wackel]);
  });
}
const vorlage = (id, reihe = false) => strichePunkte(zeichenMit(id), reihe);
const frei = (id) => zeichenMit(id).art === "schwung";

test("jedes Zeichen hat Daten, Laut und liegt im Haus", () => {
  assert.ok(ZEICHEN.length >= 15);
  for (const z of ZEICHEN) {
    const d = aufgabenDaten(z);
    assert.ok(d.striche.length > 0 && d.laut.endsWith("."), z.id);
    for (const [x, y] of d.striche.flat()) assert.ok(x >= -1 && x <= 300 && y >= -1 && y <= 300, `${z.id} ${x},${y}`);
  }
  assert.deepEqual(aufgabenDaten(zeichenMit("i")).punkte, [[40, 40]]);
});

test("pfadPunkte liest M, L, C", () => {
  assert.deepEqual(pfadPunkte("M 1 2 L 3 4"), [[1, 2], [3, 4]]);
  assert.equal(pfadPunkte("M 0 0 C 0 10 10 10 10 0").length, 11);
  assert.throws(() => pfadPunkte("M 0 0 Q 1 1 2 2"));
});

test("das eigene Zeichen, mit Wackeln und an anderer Stelle der Zeile, wird erkannt", () => {
  for (const z of ZEICHEN) {
    const v = vorlage(z.id);
    const r = erkenne(finger(v, { dx: 130, dy: frei(z.id) ? 40 : 0 }), v, { frei: frei(z.id) });
    assert.deepEqual(r, { ok: true, grund: null }, z.id);
  }
});

test("Reihen von Schwüngen werden erkannt", () => {
  for (const id of ["schwung-senkrecht", "schwung-girlande", "schwung-arkade", "schwung-kreis-linksherum"]) {
    const v = vorlage(id, true);
    assert.ok(v.flat().length > vorlage(id).flat().length, id);
    assert.deepEqual(erkenne(finger(v, { dx: 20 }), v, { frei: true }), { ok: true, grund: null }, id);
  }
});

test("o rechtsherum läuft Lena entgegen: richtung", () => {
  const v = vorlage("o");
  const kind = v.map((s) => [...s].reverse());
  assert.equal(erkenne(finger(kind), v).grund, "richtung");
});

test("l von unten nach oben: richtung; i mit dem Punkt zuerst: reihenfolge; t mit dem Querstrich zuerst: reihenfolge", () => {
  assert.equal(erkenne(finger(vorlage("l").map((s) => [...s].reverse())), vorlage("l")).grund, "richtung");
  assert.equal(erkenne(finger([...vorlage("i")].reverse()), vorlage("i")).grund, "reihenfolge");
  assert.equal(erkenne(finger([...vorlage("t")].reverse()), vorlage("t")).grund, "reihenfolge");
});

test("gespiegeltes d, a, c, 4: spiegel", () => {
  for (const id of ["d", "a", "c", "ziffer-4"]) {
    const v = vorlage(id);
    assert.equal(erkenne(finger(gespiegelt(v)), v).grund, "spiegel", id);
  }
});

test("a in einem Zug gilt, wenn Weg und Reihenfolge stimmen", () => {
  const v = vorlage("a");
  const eins = [v.flat()];
  assert.equal(erkenne(finger(eins), v).ok, true);
});

test("falscher Start und Zerrbild", () => {
  const v = vorlage("d");
  // Stab zuerst, dann Bauch: gleiche Striche, andere Reihenfolge
  assert.equal(erkenne(finger([v[1], v[0]]), v).grund, "reihenfolge");
  // ein Zickzack irgendwo
  const wirr = [[[0, 20], [90, 190], [10, 120], [100, 30], [20, 200]]];
  assert.ok(!erkenne(wirr, v).ok);
});

test("zu kurz: Tipp und halbe Linie warten, fehlender Punkt beim i", () => {
  const i = vorlage("i");
  assert.equal(bereit([[[10, 10], [12, 12]]], i), false);
  assert.equal(bereit([i[0]], i), false); // der Tupfer fehlt noch
  assert.equal(bereit([i[0], [[40, 41], [41, 40]]], i), true);
  const o = vorlage("o");
  assert.equal(bereit([o[0].slice(0, 20)], o), false);
  assert.equal(erkenne([o[0].slice(0, 20)], o).grund, "kurz");
});

test("viel zu viel ist sofort bereit, Tippen allein ist kein Strich", () => {
  const l = vorlage("l");
  const krickel = [Array.from({ length: 80 }, (_, i) => [i % 2 ? 0 : 100, i * 6])];
  assert.equal(bereit(krickel, l), true);
  assert.deepEqual(saeubere([[[5, 5], [6, 6]]], 0), { striche: [], tupfer: 0 });
  assert.equal(saeubere([[[5, 5], [6, 6]]], 1).tupfer, 1);
});
