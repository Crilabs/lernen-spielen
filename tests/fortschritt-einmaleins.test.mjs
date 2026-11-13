import { test } from "node:test";
import assert from "node:assert/strict";

const { fortschritt } = await import("../spiele/fortschritt/einmaleins.js");
const { alleAufgaben } = await import("../spiele/einmaleins-logik.js");

test("ohne Stand 0", async () => {
  assert.equal((await fortschritt(null)).wert, 0);
  assert.equal((await fortschritt({ aufgaben: { "2x2": { f: 4 } } })).wert, 0);   // ohne version
});

test("Anteil sicherer Aufgaben", async () => {
  const aufgaben = {};
  const alle = alleAufgaben();
  alle.slice(0, 9).forEach(x => (aufgaben[x.key] = { f: 4, t: "", h: [] }));
  aufgaben[alle[9].key] = { f: 0, t: "", h: [], g: 1 };
  aufgaben[alle[10].key] = { f: 3, t: "", h: [] };
  const r = await fortschritt({ version: 1, aufgaben });
  assert.equal(r.wert, 10 / 90);
  assert.equal(r.text, "10 von 90 Aufgaben sicher");
});
