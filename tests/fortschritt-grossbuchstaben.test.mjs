import { test } from "node:test";
import assert from "node:assert/strict";
import { fortschritt } from "../spiele/fortschritt/grossbuchstaben.js";

const holeJson = async () => { throw new Error("nicht benutzt"); };
const nah = (a, b) => Math.abs(a - b) < 1e-9;
const GESAMT = 22; // 12 Figuren + 10 Dinge in zauber-saetze.js

test("ohne Lernstand 0", async () => {
  const r = await fortschritt(null, holeJson);
  assert.equal(r.wert, 0);
});

test("fremde oder kaputte Stände ergeben 0, ohne Wurf", async () => {
  for (const s of [{}, { woerter: [] }, { woerter: "x" }, { woerter: { "der Hund": null } }, 5]) {
    assert.equal((await fortschritt(s, holeJson)).wert, 0);
  }
});

test("alter Stand ohne g zählt ab Fach 4", async () => {
  const r = await fortschritt({ woerter: { "der Hund": { f: 4 }, "die Katze": { f: 3 } } }, holeJson);
  assert.ok(nah(r.wert, 1 / GESAMT), String(r.wert));
});

test("g=1 zählt nach Rückstufung weiter", async () => {
  const r = await fortschritt({ woerter: { "der Hund": { f: 0, g: 1 } } }, holeJson);
  assert.ok(nah(r.wert, 1 / GESAMT), String(r.wert));
});

test("Kleinschreibung-Wörter (~) und unbekannte Schlüssel zählen nicht", async () => {
  const r = await fortschritt({ woerter: { "~springt": { f: 4, g: 1 }, "der Unbekannt": { f: 4 } } }, holeJson);
  assert.equal(r.wert, 0);
});

test("text nennt sichere Nomen", async () => {
  const r = await fortschritt({ woerter: { "der Hund": { f: 4, g: 1 } } }, holeJson);
  assert.equal(r.text, `1 von ${GESAMT} Nomen sicher`);
});
