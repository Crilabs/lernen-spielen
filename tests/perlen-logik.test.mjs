import { test } from "node:test";
import assert from "node:assert/strict";

const L = await import("../spiele/perlen-logik.js");
const { K, paareVon, neuerStand, migriere, eintrag, angebot, verbuche, freischaltbar, naechsteZahl } = L;

// Reproduzierbarer Zufall
const lcg = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; };
const HEUTE = "2026-11-13", MORGEN = "2026-11-14";

test("paareVon: geordnete Paare inklusive Verdopplung", () => {
  const p = paareVon(6).map(x => x.key);
  assert.deepEqual(p, ["6:1+5", "6:2+4", "6:3+3", "6:4+2", "6:5+1"]);
});

test("migriere: leer, kaputt und alter Stand", () => {
  for (const roh of [null, undefined, {}, "x"]) {
    const s = migriere(roh);
    assert.deepEqual(s.frei, [3, 4]); assert.equal(s.reise, 0); assert.equal(s.version, 2);
  }
  const alt = migriere({ reise: 12, pairs: { "7:3+4": { h: [], c: 3 } } });
  assert.equal(alt.reise, 12); assert.equal(alt.pairs, undefined); assert.deepEqual(alt.paare, {});
  const neu = neuerStand(); neu.frei = [3, 4, 5]; neu.paare["3:1+2"] = { f: 2, t: HEUTE, h: [1], c: 4 };
  assert.deepEqual(migriere(structuredClone(neu)), neu);
});

test("migriere: kaputter v2-Stand wird repariert, Spiel läuft weiter", () => {
  const s = migriere({ version: 2, frei: [], paare: { "7:2+5": { f: "x" }, "unsinn": 1, "4:1+3": null }, zahlen: { "7": null }, verlauf: "x", neu: { zahl: 5 } });
  assert.deepEqual(s.frei, [3, 4]);
  assert.deepEqual(s.paare["7:2+5"], { f: 0, t: "", h: [], c: 0 });
  assert.equal(s.paare.unsinn, undefined); assert.equal(s.paare["4:1+3"], undefined);
  assert.deepEqual(s.verlauf, []); assert.equal(s.neu, null);
  verbuche(s, 7, 2, 5, { fehler: 0, hilfe: false, ms: 1000, heute: HEUTE });   // wirft nicht
  verbuche(s, 7, 2, 5, { fehler: 1, hilfe: false, ms: 1000, heute: HEUTE });
  assert.equal(s.paare["7:2+5"].f, 0);
  assert.ok([3, 4].includes(naechsteZahl(s, { vorher: 0, heute: HEUTE })));
  assert.deepEqual(migriere({ version: 2, frei: [4, 99, 5], paare: {} }).frei, [3, 4, 5]);
});

function zufallsStand(n, rnd) {
  const s = neuerStand();
  for (const p of paareVon(n)) if (rnd() < 0.8) s.paare[p.key] = { f: Math.floor(rnd() * 5), t: "2026-11-01", h: [], c: Math.floor(rnd() * 8) };
  return s;
}

test("angebot: Spalten ergeben genau die angebotenen Paare", () => {
  for (let n = 3; n <= 10; n++) for (let seed = 1; seed <= 300; seed++) {
    const rnd = lcg(seed * 31 + n), s = zufallsStand(n, rnd);
    const { paare, links, rechts } = angebot(n, s, HEUTE, rnd);
    const gueltig = [];
    for (const a of links) for (const b of rechts) if (a + b === n) gueltig.push(`${n}:${a}+${b}`);
    assert.deepEqual(gueltig.sort(), [...paare].sort(), `n=${n} seed=${seed}`);
    assert.ok(paare.length >= 1 && paare.length <= K.MAX_PAARE);
    const cs = paareVon(n).map(p => eintrag(s, p.key).c), cmin = Math.min(...cs);
    assert.ok(paare.some(k => eintrag(s, k).c === cmin), "seltenstes Paar fehlt");
    const min = n <= 5 ? 2 : 3;
    for (const sp of [links, rechts]) {
      assert.ok(sp.length >= min && sp.length <= K.SPALTE_MAX, `Länge ${sp.length} n=${n}`);
      assert.ok(sp.filter(x => x >= n).length <= 1, "mehr als ein zu langes");
      assert.equal(new Set(sp).size, sp.length);
      assert.deepEqual(sp, [...sp].sort((x, y) => x - y));
      assert.ok(sp.every(x => x >= 1 && x <= 9));
    }
  }
});

test("angebot: fälliges Paar ist immer dabei", () => {
  const s = neuerStand();
  for (const p of paareVon(7)) s.paare[p.key] = { f: 3, t: HEUTE, h: [], c: 0 };
  s.paare["7:2+5"] = { f: 0, t: HEUTE, h: [], c: 9 };
  for (let seed = 1; seed <= 300; seed++) assert.ok(angebot(7, s, HEUTE, lcg(seed)).paare.includes("7:2+5"));
});

test("angebot: oft gebaute Paare kommen seltener", () => {
  const s = neuerStand();
  for (const p of paareVon(7)) s.paare[p.key] = { f: 4, t: HEUTE, h: [], c: 2 };
  s.paare["7:1+6"].c = 6;
  let viel = 0, wenig = 0; const rnd = lcg(7);
  for (let i = 0; i < 2000; i++) { const a = angebot(7, s, HEUTE, rnd).paare; if (a.includes("7:1+6")) viel++; if (a.includes("7:3+4")) wenig++; }
  assert.ok(viel / 2000 < 0.3, `viel ${viel}`);
  assert.ok(wenig / 2000 >= 0.4, `wenig ${wenig}`);
});

test("verbuche: Fächer steigen nur an neuen Tagen, Fehler setzt zurück", () => {
  const s = neuerStand();
  verbuche(s, 7, 2, 5, { fehler: 0, hilfe: false, ms: 3000, heute: HEUTE });
  verbuche(s, 7, 2, 5, { fehler: 0, hilfe: false, ms: 3000, heute: HEUTE });
  assert.equal(s.paare["7:2+5"].f, 1); assert.equal(s.paare["7:2+5"].c, 2);
  verbuche(s, 7, 2, 5, { fehler: 0, hilfe: false, ms: 3000, heute: MORGEN });
  assert.equal(s.paare["7:2+5"].f, 2);
  verbuche(s, 7, 2, 5, { fehler: 1, hilfe: false, ms: 9000, heute: MORGEN });
  assert.equal(s.paare["7:2+5"].f, 0); assert.equal(s.paare["7:2+5"].c, 3);
  assert.equal(s.zahlen["7"].w, 1);
  verbuche(s, 7, 3, 4, { fehler: 0, hilfe: true, ms: 9000, heute: MORGEN });
  assert.equal(s.paare["7:3+4"].f, 0); assert.equal(s.paare["7:3+4"].c, 0);
  assert.equal(s.reise, 5); assert.deepEqual(s.verlauf, [1, 1, 1, 0, 0]);
});

function alleSitzen(s, zahlen) { for (const n of zahlen) for (const p of paareVon(n)) s.paare[p.key] = { f: 2, t: HEUTE, h: [1], c: 1 }; }

test("freischaltbar: braucht Fächer und gute letzte Brücken", () => {
  const s = neuerStand(); alleSitzen(s, [3, 4]);
  assert.equal(freischaltbar(s), null);           // noch keine 10 Brücken
  s.verlauf = Array(10).fill(1); assert.equal(freischaltbar(s), 5);
  s.verlauf = [0, 0, 0, 1, 1, 1, 1, 1, 1, 1]; assert.equal(freischaltbar(s), null);
  s.verlauf = Array(10).fill(1); s.paare["4:2+2"].f = 0; s.paare["4:1+3"].f = 1;
  assert.equal(freischaltbar(s), null);           // 3 von 5 Paaren = 60 % < 80 %
  const t = neuerStand(); t.frei = [3, 4, 5, 6, 7]; alleSitzen(t, t.frei); t.verlauf = Array(10).fill(1);
  assert.equal(freischaltbar(t), 10);
});

test("verbuche meldet Freischalten und startet Einführung", () => {
  const s = neuerStand(); alleSitzen(s, [3, 4]); s.verlauf = Array(9).fill(1); s.reise = 40;
  const r = verbuche(s, 4, 1, 3, { fehler: 0, hilfe: false, ms: 2000, heute: HEUTE });
  assert.equal(r.frei, 5); assert.deepEqual(s.frei, [3, 4, 5]);
  assert.deepEqual(s.neu, { zahl: 5, bis: 41 + K.NEU_RUNDEN * K.RUNDE });
  assert.equal(s.verlauf.length, 0);              // neuer Abschnitt, neue Bewährung
});

test("naechsteZahl: nie zweimal, Einführung, Gewicht der 10", () => {
  const s = neuerStand(); s.frei = [3, 4, 5, 6, 7, 10]; alleSitzen(s, s.frei);
  for (const n of s.frei) for (const p of paareVon(n)) s.paare[p.key] = { f: 4, t: HEUTE, h: [], c: 1 };
  const rnd = lcg(3), z = {};
  let vorher = 3;
  for (let i = 0; i < 4000; i++) { const n = naechsteZahl(s, { vorher, heute: HEUTE, rnd }); assert.notEqual(n, vorher); z[n] = (z[n] || 0) + 1; vorher = n; }
  // Gewicht 2, durch „nie zweimal hintereinander“ effektiv etwa 1,6-mal so oft wie die 6
  const q = z[10] / z[6]; assert.ok(q > 1.4 && q < 2.5, `Verhältnis ${q}`);
  s.neu = { zahl: 7, bis: s.reise + 16 }; let sieben = 0; vorher = 3;
  for (let i = 0; i < 2000; i++) { const n = naechsteZahl(s, { vorher, heute: HEUTE, rnd }); if (n === 7) sieben++; vorher = n === 7 ? 3 : n; }
  assert.ok(sieben / 2000 > 0.4, `neu ${sieben}`);
});

test("naechsteZahl: fällige Zahlen kommen häufiger", () => {
  const s = neuerStand(); s.frei = [3, 4, 5];
  for (const n of s.frei) for (const p of paareVon(n)) s.paare[p.key] = { f: 4, t: HEUTE, h: [], c: 1 };
  s.zahlen["4"] = { w: 1, t: HEUTE, z: [] };
  const rnd = lcg(11); let vier = 0;
  for (let i = 0; i < 3000; i++) if (naechsteZahl(s, { vorher: 0, heute: HEUTE, rnd }) === 4) vier++;
  assert.ok(vier / 3000 > 0.6, `vier ${vier}`);
});
