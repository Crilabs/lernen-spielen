// Herunterfahren des Versanddienstes: wartet auf eine laufende Prüfung (höchstens die Frist), stoppt dann.
import { test } from "node:test";
import assert from "node:assert/strict";
import { fahreHerunter } from "../dienste/tagesbrief/herunterfahren.js";

test("wartet auf die laufende Prüfung, bevor der Dienst stoppt", async () => {
  const ereignisse = [];
  let fertig;
  const lauf = new Promise((ok) => { fertig = ok; }).then(() => ereignisse.push("versand fertig"));
  const ende = fahreHerunter({
    stoppeZeitgeber: () => ereignisse.push("zeitgeber aus"),
    laufend: () => lauf,
    stop: async () => { ereignisse.push("stop"); },
  });
  await new Promise((ok) => setTimeout(ok, 20));
  assert.deepEqual(ereignisse, ["zeitgeber aus"], "stop wartet noch");
  fertig();
  await ende;
  assert.deepEqual(ereignisse, ["zeitgeber aus", "versand fertig", "stop"]);
});

test("ohne laufende Prüfung stoppt der Dienst sofort", async () => {
  const ereignisse = [];
  await fahreHerunter({ stoppeZeitgeber: () => ereignisse.push("aus"), laufend: () => null, stop: async () => { ereignisse.push("stop"); } });
  assert.deepEqual(ereignisse, ["aus", "stop"]);
});

test("hängt die Prüfung, stoppt der Dienst nach der Frist; ein Fehler der Prüfung hält nicht auf", async () => {
  let gestoppt = false;
  const t0 = Date.now();
  await fahreHerunter({ stoppeZeitgeber() {}, laufend: () => new Promise(() => {}), stop: async () => { gestoppt = true; }, grenzeMs: 50 });
  assert.ok(gestoppt && Date.now() - t0 >= 40);
  gestoppt = false;
  await fahreHerunter({ stoppeZeitgeber() {}, laufend: () => Promise.reject(new Error("x")), stop: async () => { gestoppt = true; } });
  assert.ok(gestoppt);
});
