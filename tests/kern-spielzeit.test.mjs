// Spielzeit (spiele/kern/spielzeit.js): Grenzen der Eltern für digitale Spiele, ohne DOM, Uhrzeit von außen.
import { test } from "node:test";
import assert from "node:assert/strict";

const {
  STANDARD, regeln, tagSchluessel, wochenSchluessel, wochentag, aktuell, zaehle, gibZugabe, lage, morgenFrei, warnen,
  merkeGewarnt,
} = await import("../spiele/kern/spielzeit.js");

// Samstag, 14. November 2026, 10:00 Ortszeit (ISO-Woche 46); Montag ist der 9., Sonntag der 15.
const SA = new Date(2026, 10, 14, 10, 0);
const SO = new Date(2026, 10, 15, 10, 0);
const MO = new Date(2026, 10, 16, 10, 0);
const min = (m) => m * 60;

test("Standard: alles aus, alle Tage erlaubt", () => {
  assert.deepEqual(regeln(undefined), STANDARD);
  assert.deepEqual(STANDARD, { tage: [1, 2, 3, 4, 5, 6, 7], proTag: null, proWoche: null, ausgeblendet: false });
  const l = lage(regeln(undefined), aktuell({}, SA), SA);
  assert.equal(l.frei, true);
  assert.equal(l.rest, Infinity);
});

test("regeln: unbrauchbare Werte fallen auf den Standard zurück", () => {
  assert.deepEqual(regeln({ tage: [0, 3, 3, 9, "x", 1], proTag: -5, proWoche: "viel", ausgeblendet: "ja" }),
    { tage: [1, 3], proTag: null, proWoche: null, ausgeblendet: false });
  assert.deepEqual(regeln({ tage: [], proTag: 30, proWoche: 120, ausgeblendet: true }),
    { tage: [], proTag: 30, proWoche: 120, ausgeblendet: true });
});

test("Tag, Wochentag und ISO-Woche nach Ortszeit", () => {
  assert.equal(tagSchluessel(SA), "2026-11-14");
  assert.equal(wochentag(SA), 6);
  assert.equal(wochentag(SO), 7);
  assert.equal(wochentag(MO), 1);
  assert.equal(wochenSchluessel(SA), "2026-W46");
  assert.equal(wochenSchluessel(SO), "2026-W46");
  assert.equal(wochenSchluessel(MO), "2026-W47");
  assert.equal(wochenSchluessel(new Date(2027, 0, 1)), "2026-W53"); // Freitag nach dem 31.12.2026
  assert.equal(wochenSchluessel(new Date(2025, 11, 29)), "2026-W01");
});

test("zaehle: Sekunden je Tag, Wochenwechsel verwirft alles Alte", () => {
  let s = zaehle(aktuell({}, SA), 90, SA);
  s = zaehle(s, 30, SA);
  assert.deepEqual(s, { woche: "2026-W46", tage: { "2026-11-14": { sekunden: 120, zugabe: 0 } } });
  s = zaehle(s, 60, SO);
  assert.equal(lage(STANDARD, s, SO).woche, 180);
  const neu = zaehle(s, 10, MO);
  assert.deepEqual(neu, { woche: "2026-W47", tage: { "2026-11-16": { sekunden: 10, zugabe: 0 } } });
  assert.equal(s.tage["2026-11-14"].sekunden, 120, "zaehle verändert den alten Stand nicht");
});

test("aktuell: kaputter Stand wird zu einem leeren der laufenden Woche", () => {
  assert.deepEqual(aktuell(null, SA), { woche: "2026-W46", tage: {} });
  assert.deepEqual(aktuell({ woche: "2026-W46", tage: "x" }, SA), { woche: "2026-W46", tage: {} });
  assert.deepEqual(aktuell({ woche: "2026-W46", tage: { "2026-11-14": { sekunden: "x" } } }, SA).tage["2026-11-14"],
    { sekunden: 0, zugabe: 0 });
});

test("Tagesgrenze: frei bis zur Grenze, dann tag-voll", () => {
  const r = regeln({ proTag: 30 });
  let s = zaehle(aktuell({}, SA), min(29), SA);
  let l = lage(r, s, SA);
  assert.equal(l.frei, true);
  assert.equal(l.rest, min(1));
  s = zaehle(s, min(1), SA);
  l = lage(r, s, SA);
  assert.equal(l.frei, false);
  assert.equal(l.grund, "tag-voll");
  assert.equal(l.rest, 0);
});

test("Gesperrter Wochentag: grund tag; Zugabe öffnet ihn für heute", () => {
  const r = regeln({ tage: [1, 2, 3, 4, 5] });
  let s = aktuell({}, SA);
  assert.equal(lage(r, s, SA).grund, "tag");
  s = gibZugabe(s, 15, SA);
  let l = lage(r, s, SA);
  assert.equal(l.frei, true);
  assert.equal(l.rest, min(15));
  assert.equal(l.zugabe, 15);
  s = zaehle(s, min(15), SA);
  l = lage(r, s, SA);
  assert.equal(l.frei, false);
  assert.equal(l.grund, "tag-voll");
});

test("Wochengrenze: was an anderen Tagen gespielt wurde, zählt mit; Zugabe geht darüber hinaus", () => {
  const r = regeln({ proTag: 60, proWoche: 100 });
  let s = zaehle(aktuell({}, SA), min(80), new Date(2026, 10, 13, 9));
  s = zaehle(s, min(10), SA);
  let l = lage(r, s, SA);
  assert.equal(l.rest, min(10), "Woche: 100 − 80 − 10");
  s = zaehle(s, min(10), SA);
  l = lage(r, s, SA);
  assert.equal(l.frei, false);
  assert.equal(l.grund, "woche-voll");
  s = gibZugabe(gibZugabe(s, 15, SA), 15, SA);
  l = lage(r, s, SA);
  assert.equal(l.frei, true);
  assert.equal(l.rest, min(30));
  assert.equal(l.heute, min(20));
  assert.equal(l.woche, min(100));
});

test("Ausgeblendet: nie frei, auch nicht mit Zugabe", () => {
  const r = regeln({ ausgeblendet: true });
  const s = gibZugabe(aktuell({}, SA), 15, SA);
  const l = lage(r, s, SA);
  assert.equal(l.frei, false);
  assert.equal(l.grund, "aus");
});

test("morgenFrei: Wochentag erlaubt, nicht ausgeblendet, Woche nicht voll (außer morgen beginnt eine neue)", () => {
  assert.equal(morgenFrei(STANDARD, aktuell({}, SA), SA), true);
  assert.equal(morgenFrei(regeln({ tage: [1, 2, 3, 4, 5] }), aktuell({}, SA), SA), false, "Sonntag gesperrt");
  assert.equal(morgenFrei(regeln({ tage: [1, 2, 3, 4, 5] }), aktuell({}, SO), SO), true, "Montag erlaubt");
  assert.equal(morgenFrei(regeln({ ausgeblendet: true }), aktuell({}, SA), SA), false);
  const voll = zaehle(aktuell({}, SA), min(60), SA);
  assert.equal(morgenFrei(regeln({ proWoche: 60 }), voll, SA), false, "Sonntag in derselben Woche");
  const vollSo = zaehle(aktuell({}, SO), min(60), SO);
  assert.equal(morgenFrei(regeln({ proWoche: 60 }), vollSo, SO), true, "Montag beginnt eine neue Woche");
});

test("warnen: unter fünf Minuten Rest einmal je Tag, nie ohne Grenze", () => {
  const r = regeln({ proTag: 30 });
  let s = zaehle(aktuell({}, SA), min(25), SA);
  assert.equal(warnen(lage(r, s, SA), s, SA), false, "genau 5 Minuten übrig: noch nicht");
  s = zaehle(s, 1, SA);
  assert.equal(warnen(lage(r, s, SA), s, SA), true);
  s = merkeGewarnt(s, SA);
  assert.equal(warnen(lage(r, s, SA), s, SA), false, "schon gewarnt heute");
  s = zaehle(s, min(5), SA);
  assert.equal(warnen(lage(r, s, SA), s, SA), false, "Zeit um: dann Schluss statt Warnung");
  const ohne = zaehle(aktuell({}, SA), min(500), SA);
  assert.equal(warnen(lage(STANDARD, ohne, SA), ohne, SA), false);
});
