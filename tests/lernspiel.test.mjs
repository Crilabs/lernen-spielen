import { test, mock, beforeEach } from "node:test";
import assert from "node:assert/strict";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};
const L = await import("../spiele/lernspiel.js");

let aufrufe;
function fakeApp(antwort = null) {
  aufrufe = [];
  globalThis.window.__TAURI__ = {
    core: {
      invoke: async (befehl, args) => {
        aufrufe.push([befehl, args]);
        return befehl === "lernstand_lesen" ? antwort : undefined;
      },
    },
  };
}

beforeEach(() => {
  speicher.clear();
  delete globalThis.window.__TAURI__;
  mock.timers.reset();
});

test("lade liefert Standard ohne Daten", async () => {
  assert.deepEqual(await L.lade("x", { a: 1 }), { a: 1 });
});

test("lade mischt gespeicherte Daten über Standard", async () => {
  speicher.set("lernstand-x", '{"b":2}');
  assert.deepEqual(await L.lade("x", { a: 1 }), { a: 1, b: 2 });
});

test("lade liefert Standard bei kaputtem JSON", async () => {
  speicher.set("lernstand-x", "{");
  assert.deepEqual(await L.lade("x", { a: 1 }), { a: 1 });
});

test("lade nutzt Tauri in der App", async () => {
  fakeApp('{"b":2}');
  assert.equal(L.istApp(), true);
  assert.deepEqual(await L.lade("x", { a: 1 }), { a: 1, b: 2 });
  assert.deepEqual(aufrufe, [["lernstand_lesen", { spiel: "x" }]]);
});

test("speichere bündelt Aufrufe", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  fakeApp();
  L.speichere("x", { n: 1 });
  L.speichere("x", { n: 2 });
  L.speichere("x", { n: 3 });
  mock.timers.tick(299);
  assert.equal(aufrufe.length, 0);
  mock.timers.tick(1);
  assert.equal(aufrufe.length, 1);
  assert.equal(aufrufe[0][0], "lernstand_schreiben");
  assert.deepEqual(aufrufe[0][1], { spiel: "x", daten: '{"n":3}' });
});

test("sofortSpeichern schreibt ausstehende Daten", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  fakeApp();
  L.speichere("x", { n: 1 });
  await L.sofortSpeichern();
  assert.equal(aufrufe.length, 1);
  mock.timers.tick(1000);
  assert.equal(aufrufe.length, 1);
});

test("merkeGelernt setzt g und nimmt es nie zurück", () => {
  const e = { f: 4 };
  L.merkeGelernt(e, 4);
  assert.equal(e.g, 1);
  e.f = 0;
  L.merkeGelernt(e, 4);
  assert.equal(e.g, 1);
  const k = { f: 3 };
  L.merkeGelernt(k, 4);
  assert.equal("g" in k, false);
});

test("protokoll behält die letzten 30", () => {
  for (let i = 1; i <= 35; i++) L.protokoll("eintrag " + i);
  const p = L.protokollLesen();
  assert.equal(p.length, 30);
  assert.match(p[29], /eintrag 35$/);
});

test("esc maskiert HTML", () => {
  assert.equal(L.esc('<b a="x">&\''), "&lt;b a=&quot;x&quot;&gt;&amp;&#39;");
  assert.equal(L.esc(5), "5");
  assert.equal(L.esc(null), "");
});
