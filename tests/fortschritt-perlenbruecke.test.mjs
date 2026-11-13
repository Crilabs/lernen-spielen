import { test } from "node:test";
import assert from "node:assert/strict";

const { fortschritt } = await import("../spiele/fortschritt/perlenbruecke.js");
const { paareVon } = await import("../spiele/perlen-logik.js");

test("ohne Stand 0", async () => {
  assert.equal((await fortschritt(null)).wert, 0);
  assert.equal((await fortschritt({ reise: 3, pairs: { "7:3+4": { c: 9 } } })).wert, 0);
});

test("Anteil sicherer Zerlegungen von 3 bis 10", async () => {
  const paare = {};
  const alle = [3, 4, 5, 6, 7, 8, 9, 10].flatMap(paareVon);
  assert.equal(alle.length, 44);
  alle.slice(0, 10).forEach(p => (paare[p.key] = { f: 4, t: "", h: [], c: 1 }));
  paare[alle[10].key] = { f: 0, t: "", h: [], c: 1, g: 1 };     // einmal gelernt bleibt gelernt
  paare[alle[11].key] = { f: 3, t: "", h: [], c: 1 };
  const r = await fortschritt({ version: 2, paare });
  assert.equal(r.wert, 11 / 44);
  assert.equal(r.text, "11 von 44 Zerlegungen sicher");
});
