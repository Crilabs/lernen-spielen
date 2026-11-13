import { test } from "node:test";
import assert from "node:assert/strict";
import { fortschritt } from "../spiele/fortschritt/einhorn-steine.js";

const DATEN = {
  "saetze/saetze.json": { saetze: [
    { text: "Der Hund bellt.", stufe: 1 },
    { text: "Die Kuh muht.", stufe: 2 },
    { text: "Das Pony läuft.", stufe: 3 },
    { text: "Der Hund bellt." },
    { text: "  " },
  ] },
};
const holeJson = async (p) => {
  if (!(p in DATEN)) throw new Error("unbekannt: " + p);
  return structuredClone(DATEN[p]);
};
const nah = (a, b) => Math.abs(a - b) < 1e-9;

test("ohne Lernstand 0", async () => {
  const r = await fortschritt(null, holeJson);
  assert.equal(r.wert, 0);
});

test("alter Stand ohne g: Fach 3 zählt, Fach 2 nicht", async () => {
  const r = await fortschritt({ saetze: { "Der Hund bellt.": { f: 3 }, "Die Kuh muht.": { f: 2 } } }, holeJson);
  assert.ok(nah(r.wert, 1 / 3), String(r.wert));
});

test("g=1 zählt nach Rückstufung weiter", async () => {
  const r = await fortschritt({ saetze: { "Das Pony läuft.": { f: 0, g: 1 } } }, holeJson);
  assert.ok(nah(r.wert, 1 / 3), String(r.wert));
});

test("fremde Sätze und kaputte Stände zählen nicht, kein Wurf", async () => {
  assert.equal((await fortschritt({ saetze: { "Fremd": { f: 3 } } }, holeJson)).wert, 0);
  assert.equal((await fortschritt({ saetze: [] }, holeJson)).wert, 0);
  assert.equal((await fortschritt({ saetze: { "Der Hund bellt.": null } }, holeJson)).wert, 0);
  assert.equal((await fortschritt("x", holeJson)).wert, 0);
});

test("fehlende Satzdatei: 0", async () => {
  const r = await fortschritt({ saetze: {} }, async () => { throw new Error("weg"); });
  assert.equal(r.wert, 0);
});

test("text nennt sichere Sätze", async () => {
  const r = await fortschritt({ saetze: { "Der Hund bellt.": { f: 3, g: 1 } } }, holeJson);
  assert.equal(r.text, "1 von 3 Sätzen sicher");
});
