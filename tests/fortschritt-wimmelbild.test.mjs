import { test } from "node:test";
import assert from "node:assert/strict";
import { fortschritt } from "../spiele/fortschritt/wimmelbild.js";

const DATEN = {
  "bilder/index.json": ["a", "b"],
  "bilder/a.json": { dinge: [{ wort: "Hund", artikel: "der", formen: [] }, { wort: "Katze", artikel: "die", formen: [] }] },
  "bilder/b.json": { dinge: [{ wort: "Hund", artikel: "der", formen: [] }, { wort: "Ball", artikel: "der", formen: [] }] },
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

test("zählt Nomen über alle Bilder einmal", async () => {
  const r = await fortschritt({ woerter: { "der Hund": { f: 4, g: 1 } } }, holeJson);
  assert.ok(nah(r.wert, 1 / 3), String(r.wert));
});

test("zählt zurückgestufte gelernte weiter", async () => {
  const r = await fortschritt({ woerter: { "der Hund": { f: 0, g: 1 } } }, holeJson);
  assert.ok(nah(r.wert, 1 / 3), String(r.wert));
});

test("zählt f>=4 ohne g", async () => {
  const r = await fortschritt({ woerter: { "die Katze": { f: 4 } } }, holeJson);
  assert.ok(nah(r.wert, 1 / 3), String(r.wert));
});

test("ignoriert Nicht-Nomen", async () => {
  const r = await fortschritt({ woerter: { "~rennt": { f: 4, g: 1 } } }, holeJson);
  assert.equal(r.wert, 0);
});

test("text nennt sichere Dinge", async () => {
  const r = await fortschritt({ woerter: { "der Hund": { f: 4, g: 1 } } }, holeJson);
  assert.equal(r.text, "1 von 3 Dingen sicher");
});
