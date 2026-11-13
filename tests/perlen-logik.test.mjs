import { test } from "node:test";
import assert from "node:assert/strict";

const L = await import("../spiele/perlen-logik.js");
const { K, paareVon, neuerStand, migriere, angebotAus, verbucheBau, zerlegung } = L;

// Reproduzierbarer Zufall
const lcg = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; };
const zk = (n, a, b) => `zerl:${n}:${a}+${b}`;

test("paareVon: geordnete Paare inklusive Verdopplung", () => {
  const p = paareVon(6).map(x => x.key);
  assert.deepEqual(p, ["6:1+5", "6:2+4", "6:3+3", "6:4+2", "6:5+1"]);
});

test("zerlegung: Schlüssel der Lernsteuerung lesen", () => {
  assert.deepEqual(zerlegung("zerl:7:2+5"), { n: 7, a: 2, b: 5 });
  assert.equal(zerlegung("plus:2+5"), null);
  assert.equal(zerlegung(undefined), null);
});

test("migriere: leer und kaputt → neuer Stand v3", () => {
  for (const roh of [null, undefined, {}, "x", [], { version: 3, c: "x", reise: "y" }]) {
    assert.deepEqual(migriere(roh), { version: 3, reise: 0, c: {} });
  }
  assert.deepEqual(neuerStand(), { version: 3, reise: 0, c: {} });
});

test("migriere: v2 → v3 behält c und reise", () => {
  const v2 = { version: 2, reise: 41, frei: [3, 4, 5], verlauf: [1], neu: null, zahlen: {},
    paare: { "7:2+5": { f: 2, t: "2026-11-01", h: [1], c: 6 }, "4:1+3": { f: 0, c: 0 }, "unsinn": { c: 3 }, "5:2+3": null, "5:1+4": { c: "x" } } };
  assert.deepEqual(migriere(v2), { version: 3, reise: 41, c: { [zk(7, 2, 5)]: 6 } });
  // ohne Version (ganz alter Stand): nur die Reise bleibt
  assert.deepEqual(migriere({ reise: 12, pairs: { "7:3+4": { c: 3 } } }), { version: 3, reise: 12, c: {} });
});

test("migriere: v3 bleibt, Kaputtes wird verworfen", () => {
  const v3 = { version: 3, reise: 9, c: { [zk(7, 2, 5)]: 4, [zk(3, 1, 2)]: 1 } };
  assert.deepEqual(migriere(structuredClone(v3)), v3);
  assert.deepEqual(migriere({ version: 3, reise: 2, c: { [zk(7, 2, 5)]: -1, "x": 3, [zk(4, 1, 3)]: 2.6 } }),
    { version: 3, reise: 2, c: { [zk(4, 1, 3)]: 2 } });
});

test("verbucheBau zählt nur c und reise", () => {
  const s = neuerStand();
  verbucheBau(s, zk(7, 2, 5)); verbucheBau(s, zk(7, 2, 5)); verbucheBau(s, zk(3, 1, 2));
  assert.deepEqual(s, { version: 3, reise: 3, c: { [zk(7, 2, 5)]: 2, [zk(3, 1, 2)]: 1 } });
});

function zufallsStand(n, rnd) {
  const s = neuerStand();
  for (const p of paareVon(n)) if (rnd() < 0.8) s.c["zerl:" + p.key] = Math.floor(rnd() * 8);
  return s;
}

test("angebotAus: Ziel immer dabei, Spalten ergeben genau die angebotenen Paare", () => {
  for (let n = 2; n <= 10; n++) for (let seed = 1; seed <= 300; seed++) {
    const rnd = lcg(seed * 31 + n), s = zufallsStand(n, rnd);
    const alle = paareVon(n).map(p => "zerl:" + p.key);
    const ziel = alle[Math.floor(rnd() * alle.length)];
    const auch = alle.filter(k => k !== ziel && rnd() < 0.5).slice(0, 2);
    const { paare, links, rechts } = angebotAus(n, ziel, auch, s, rnd);
    assert.ok(paare.includes(ziel), `Ziel fehlt n=${n} seed=${seed}`);
    assert.ok(paare.every(k => k === ziel || auch.includes(k)), "nur Ziel und auch");
    assert.ok(paare.length >= 1 && paare.length <= (n <= 4 ? K.MAX_PAARE_KLEIN : K.MAX_PAARE));
    // kein Ablenker ergibt mit der Gegenseite n
    const gueltig = [];
    for (const a of links) for (const b of rechts) if (a + b === n) gueltig.push(zk(n, a, b));
    assert.deepEqual(gueltig.sort(), [...paare].sort(), `n=${n} seed=${seed}`);
    for (const sp of [links, rechts]) {
      assert.ok(sp.length >= 3 && sp.length <= K.SPALTE_MAX, `Länge ${sp.length} n=${n}`);
      assert.ok(sp.filter(x => x >= n).length <= (n <= 4 ? 2 : 1), "zu viele zu lange");
      assert.equal(new Set(sp).size, sp.length);
      assert.deepEqual(sp, [...sp].sort((x, y) => x - y));
      assert.ok(sp.every(x => x >= 1 && x <= 9));
    }
  }
});

test("angebotAus: oft gebautes Ziel kommt trotzdem, fremde Schlüssel werden ignoriert", () => {
  const s = neuerStand(); s.c[zk(7, 2, 5)] = 50;
  for (let seed = 1; seed <= 100; seed++) {
    const a = angebotAus(7, zk(7, 2, 5), [zk(7, 3, 4), zk(5, 1, 4), "plus:3+4"], s, lcg(seed));
    assert.ok(a.paare.includes(zk(7, 2, 5)));
    assert.ok(a.paare.every(k => k.startsWith("zerl:7:")));
  }
  assert.deepEqual(angebotAus(7, zk(7, 2, 5), [], s, lcg(1)).paare, [zk(7, 2, 5)]);
});

test("angebotAus: oft gebaute Paare aus auch kommen seltener", () => {
  const s = neuerStand();
  for (const p of paareVon(7)) s.c["zerl:" + p.key] = 2;
  s.c[zk(7, 1, 6)] = 6;
  let viel = 0, wenig = 0; const rnd = lcg(7);
  for (let i = 0; i < 2000; i++) {
    const a = angebotAus(7, zk(7, 2, 5), [zk(7, 1, 6), zk(7, 3, 4)], s, rnd).paare;
    if (a.includes(zk(7, 1, 6))) viel++; if (a.includes(zk(7, 3, 4))) wenig++;
  }
  assert.ok(viel / 2000 < 0.3, `viel ${viel}`);
  assert.ok(wenig / 2000 >= 0.9, `wenig ${wenig}`);
});

test("angebotAus: kleine Zahlen – höchstens zwei Paare, drei Stäbchen je Spalte, Ratechance ≤ 1/3", () => {
  for (const n of [2, 3, 4]) for (let seed = 1; seed <= 400; seed++) {
    const rnd = lcg(seed * 17 + n), s = zufallsStand(n, rnd);
    const alle = paareVon(n).map(p => "zerl:" + p.key);
    const { paare, links, rechts } = angebotAus(n, alle[0], alle.slice(1), s, rnd);
    assert.ok(paare.length <= K.MAX_PAARE_KLEIN);
    assert.ok(links.length >= 3 && rechts.length >= 3, `n=${n} seed=${seed}`);
    assert.ok(paare.length / (links.length * rechts.length) <= 1 / 3 + 1e-9, `Ratechance n=${n} seed=${seed}`);
  }
});
