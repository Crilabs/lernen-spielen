import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};
const S = await import("../spiele/kern/speicher.js");
const D = await import("../spiele/kern/dienste.js");

let aufrufe;
function fakeApp(antworten = {}) {
  aufrufe = [];
  globalThis.window.__TAURI__ = {
    core: {
      invoke: async (befehl, args) => {
        aufrufe.push([befehl, args]);
        return antworten[befehl] ?? null;
      },
    },
  };
}

beforeEach(() => {
  speicher.clear();
  delete globalThis.window.__TAURI__;
});

test("speichere schreibt ins Profil", async () => {
  S.speichere("wimmelbild", { a: 2 });
  await S.sofortSpeichern();
  assert.equal(speicher.get("lernstand-kind-1-wimmelbild"), '{"a":2}');
  assert.equal(speicher.has("lernstand-wimmelbild"), false);
});

test("Geräte-Schlüssel ohne Profil", async () => {
  fakeApp();
  await S.lade("eltern", {});
  assert.deepEqual(aufrufe, [["lernstand_lesen", { profil: null, spiel: "eltern" }]]);
  delete globalThis.window.__TAURI__;
  S.speichere("eltern", { pin: 1 });
  await S.sofortSpeichern();
  assert.equal(speicher.get("lernstand-eltern"), '{"pin":1}');
  assert.equal(speicher.has("lernstand-kind-1-eltern"), false);
});

test("Profil-Schlüssel in der App", async () => {
  fakeApp();
  await S.lade("lernplan", {});
  assert.deepEqual(aufrufe, [["lernstand_lesen", { profil: "kind-1", spiel: "lernplan" }]]);
  S.speichere("lernplan", { n: 1 });
  await S.sofortSpeichern();
  assert.deepEqual(aufrufe[1], ["lernstand_schreiben", { profil: "kind-1", spiel: "lernplan", daten: '{"n":1}' }]);
});

test("Konstanten", () => {
  assert.equal(S.PROFIL, "kind-1");
  assert.deepEqual([...S.GERAET].sort(), ["eltern", "geraet"]);
});

test("befehl wirft außerhalb der App", async () => {
  assert.equal(D.istApp(), false);
  assert.equal(D.tauri(), null);
  await assert.rejects(D.befehl("plattform"));
});

test("plattform im Browser und in der App", async () => {
  // Frisches Modul je Fall, weil plattform() einmal ermittelt und dann cacht.
  const B = await import("../spiele/kern/dienste.js?browser");
  assert.equal(await B.plattform(), "browser");

  fakeApp({ plattform: "windows" });
  const A = await import("../spiele/kern/dienste.js?app");
  assert.equal(await A.plattform(), "windows");
  assert.equal(await A.plattform(), "windows");
  assert.deepEqual(aufrufe, [["plattform", undefined]]);
});
