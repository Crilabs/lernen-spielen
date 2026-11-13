import { test } from "node:test";
import assert from "node:assert/strict";

const L = await import("../spiele/einmaleins-logik.js");
const { K, stufeVon, paketVon, aufgabenVon, alleAufgaben, neuerStand, migriere, eintrag, verbuche, freischaltbar,
  naechsteAufgabe, hilfeVon, ortVon } = L;

const lcg = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; };
const HEUTE = "2026-11-13", MORGEN = "2026-11-14";

test("Aufgabenmenge, Stufen und Pakete", () => {
  assert.equal(alleAufgaben().length, 90);
  assert.equal(new Set(alleAufgaben().map(x => x.key)).size, 90);
  assert.equal(stufeVon(5), "K"); assert.equal(stufeVon(9), "A"); assert.equal(stufeVon(8), "B");
  assert.equal(paketVon(6, 7), "A7"); assert.equal(paketVon(10, 3), "K3");
  assert.deepEqual(aufgabenVon("B5").map(x => x.key), ["7x5", "8x5"]);
  assert.deepEqual(aufgabenVon("K2").map(x => x.key), ["1x2", "2x2", "5x2", "10x2"]);
  assert.equal(K.REIHENFOLGE.length, 27);
  assert.equal(new Set(K.REIHENFOLGE).size, 27);
});

test("migriere: leer, kaputt, unbekannte Pakete", () => {
  for (const roh of [null, undefined, {}, "x", []]) assert.deepEqual(migriere(roh).frei, ["K2", "K10"]);
  const s = migriere({ version: 1, aufgaben: { "6x7": { f: "x" }, "unsinn": 1, "3x1": { f: 2 } }, frei: ["K5", "Z9"], verlauf: "x" });
  assert.deepEqual(s.aufgaben["6x7"], { f: 0, t: "", h: [] });
  assert.equal(s.aufgaben.unsinn, undefined);
  assert.equal(s.aufgaben["3x1"], undefined);              // Kette von 1 gibt es nicht
  assert.deepEqual(s.frei, ["K2", "K10", "K5"]);
  assert.deepEqual(s.verlauf, []);
  const n = neuerStand(); n.aufgaben["2x2"] = { f: 2, t: HEUTE, h: [1] };
  assert.deepEqual(migriere(structuredClone(n)), n);
});

test("verbuche: Fächer über Tage, Fehler setzt zurück", () => {
  const s = neuerStand();
  verbuche(s, 2, 2, { heute: HEUTE }); verbuche(s, 2, 2, { heute: HEUTE });
  assert.equal(eintrag(s, "2x2").f, 1);
  verbuche(s, 2, 2, { heute: MORGEN });
  assert.equal(eintrag(s, "2x2").f, 2);
  verbuche(s, 2, 2, { fehler: 1, heute: MORGEN });
  assert.equal(eintrag(s, "2x2").f, 0);
  verbuche(s, 5, 2, { hilfe: true, heute: MORGEN });
  assert.equal(eintrag(s, "5x2").f, 0);
  assert.deepEqual(eintrag(s, "2x2").h, [1, 1, 1, 0]);
});

test("Freischalten: 80 % Fach ≥ 2 und 80 % fehlerfrei", () => {
  const s = neuerStand();
  for (const p of ["K2", "K10"]) for (const x of aufgabenVon(p)) s.aufgaben[x.key] = { f: 2, t: "2026-11-01", h: [] };
  s.verlauf = Array(9).fill(1);
  assert.equal(freischaltbar(s), null);            // erst 9 von 10 Aufgaben im Fenster
  const r = verbuche(s, 2, 2, { heute: HEUTE });
  assert.equal(r.frei, "K5");
  assert.deepEqual(s.frei, ["K2", "K10", "K5"]);
  assert.equal(s.verlauf.length, 0);
  assert.equal(s.neu.paket, "K5");
  assert.equal(freischaltbar(s), null);
});

test("naechsteAufgabe: Kette bleibt, nie zweimal dieselbe, nur Freigeschaltetes", () => {
  const rnd = lcg(7);
  const s = neuerStand(); s.frei = ["K2", "K10", "K5", "A2"];
  const frei = new Set(s.frei.flatMap(aufgabenVon).map(x => x.key));
  let kette = 0, rest = 0, vorher = "";
  for (let i = 0; i < 300; i++) {
    const alt = { kette, rest };
    const x = naechsteAufgabe(s, { kette, rest, vorher, heute: HEUTE, rnd });
    assert.notEqual(x.key, vorher);
    assert.ok(frei.has(x.key), x.key);
    assert.equal(x.key, `${x.a}x${x.n}`);
    if (alt.rest > 0) assert.equal(x.n, alt.kette);
    else assert.ok(x.rest >= 2 && x.rest <= 3, "neue Kette: noch 2–3 weitere Aufgaben");
    assert.equal(x.kette, x.n);
    ({ kette, rest } = x); vorher = x.key;
    if (rnd() < 0.5) verbuche(s, x.a, x.n, { heute: HEUTE });
  }
});

test("naechsteAufgabe: nichts fällig und nur eine Aufgabe in der Kette – hängt nicht", () => {
  const s = neuerStand(); s.frei = ["K2"];
  for (const x of aufgabenVon("K2")) s.aufgaben[x.key] = { f: 4, t: HEUTE, h: [1] };
  let vorher = "";
  for (let i = 0; i < 20; i++) {
    const x = naechsteAufgabe(s, { kette: 2, rest: 3, vorher, heute: HEUTE, rnd: lcg(i + 1) });
    assert.notEqual(x.key, vorher); vorher = x.key;
  }
});

test("hilfeVon: Ableitung über die nächste Kernaufgabe", () => {
  assert.deepEqual(hilfeVon(6, 7), { kernA: 5, schritt: 1 });
  assert.deepEqual(hilfeVon(9, 4), { kernA: 10, schritt: -1 });
  assert.deepEqual(hilfeVon(3, 8), { kernA: 2, schritt: 1 });
  assert.deepEqual(hilfeVon(4, 8), { kernA: 5, schritt: -1 });
  assert.deepEqual(hilfeVon(7, 6), { kernA: 5, schritt: 2 });
  assert.deepEqual(hilfeVon(8, 6), { kernA: 10, schritt: -2 });
  assert.deepEqual(hilfeVon(5, 6), { kernA: 10, schritt: 0 });
  for (const a of [1, 2, 10]) assert.deepEqual(hilfeVon(a, 6), { kernA: null, schritt: 0 });
});

test("ortVon: wo eine Zahl auf der Kette liegt", () => {
  assert.deepEqual(ortVon(48, 7), { staebchen: 6, rest: 6, ueber: false });
  assert.deepEqual(ortVon(42, 7), { staebchen: 6, rest: 0, ueber: false });
  assert.deepEqual(ortVon(0, 7), { staebchen: 0, rest: 0, ueber: false });
  assert.deepEqual(ortVon(70, 7), { staebchen: 10, rest: 0, ueber: false });
  assert.equal(ortVon(71, 7).ueber, true);
  assert.equal(ortVon(999, 7).ueber, true);
});

test("migriere: kaputte Zeiten und Daten blockieren nichts", () => {
  const s = migriere({ version: 1, aufgaben: { "2x2": { f: 1, t: "x", h: [1], z: 5 }, "5x2": { f: 2, t: "2026-11-01", h: [], z: [1200, "y", 800] } } });
  assert.equal(s.aufgaben["2x2"].t, "");
  assert.equal(s.aufgaben["2x2"].z, undefined);
  assert.deepEqual(s.aufgaben["5x2"].z, [1200, 800]);
  verbuche(s, 2, 2, { ms: 900, heute: HEUTE });          // wirft nicht
  assert.equal(eintrag(s, "2x2").f, 2);                   // ungültiges Datum gilt als fällig
});

test("naechsteAufgabe: in derselben Kette nie der nächstgrößere Faktor (kein Reihen-Drill)", () => {
  const s = neuerStand(); s.frei = ["K2", "A2"];
  const rnd = lcg(11), gesehen = new Set();
  for (let i = 0; i < 300; i++) {
    const x = naechsteAufgabe(s, { kette: 2, rest: 3, vorher: "3x2", heute: HEUTE, rnd });
    gesehen.add(x.key);
    assert.notEqual(x.key, "4x2");
  }
  assert.ok(gesehen.size >= 5, "sonst ist der Zufall zu schwach: " + [...gesehen]);
});
