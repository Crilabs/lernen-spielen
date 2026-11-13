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
  speicher.set("lernstand-kind-1-x", '{"b":2}');
  assert.deepEqual(await L.lade("x", { a: 1 }), { a: 1, b: 2 });
});

test("lade liefert Standard bei kaputtem JSON", async () => {
  speicher.set("lernstand-kind-1-x", "{");
  assert.deepEqual(await L.lade("x", { a: 1 }), { a: 1 });
});

test("lade nutzt Tauri in der App", async () => {
  fakeApp('{"b":2}');
  assert.equal(L.istApp(), true);
  assert.deepEqual(await L.lade("x", { a: 1 }), { a: 1, b: 2 });
  assert.deepEqual(aufrufe, [["lernstand_lesen", { profil: "kind-1", spiel: "x" }]]);
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
  assert.deepEqual(aufrufe[0][1], { profil: "kind-1", spiel: "x", daten: '{"n":3}' });
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

test("lade liefert tiefe Kopie", async () => {
  const standard = { a: { b: 1 } };
  const r1 = await L.lade("x", standard);
  r1.a.b = 2;
  assert.equal(standard.a.b, 1);
  const r2 = await L.lade("x", standard);
  assert.equal(r2.a.b, 1);
  assert.notEqual(r1.a, r2.a);
});

test("lade-Fehler sperrt Speichern für dieses Spiel", async () => {
  mock.timers.enable({ apis: ["setTimeout"] });
  aufrufe = [];
  globalThis.window.__TAURI__ = {
    core: {
      invoke: async (befehl, args) => {
        aufrufe.push([befehl, args]);
        if (befehl === "lernstand_lesen" && args.spiel === "gesperrt") throw new Error("Zugriff verweigert");
        return befehl === "lernstand_lesen" ? null : undefined;
      },
    },
  };
  assert.deepEqual(await L.lade("gesperrt", { a: 1 }), { a: 1 });
  await L.lade("gesperrt", { a: 1 });
  assert.equal(L.protokollLesen().filter((z) => z.includes("lade gesperrt")).length, 1);
  L.speichere("gesperrt", { a: 2 });
  mock.timers.tick(1000);
  await L.sofortSpeichern();
  assert.equal(aufrufe.filter(([b]) => b === "lernstand_schreiben").length, 0);
  // Andere Spiele speichern weiter.
  await L.lade("frei", {});
  L.speichere("frei", { a: 3 });
  await L.sofortSpeichern();
  assert.deepEqual(aufrufe.filter(([b]) => b === "lernstand_schreiben"), [
    ["lernstand_schreiben", { profil: "kind-1", spiel: "frei", daten: '{"a":3}' }],
  ]);
});

test("Schreibvorgänge eines Spiels bleiben in Reihenfolge", async () => {
  const fertig = [];
  const offen = [];
  globalThis.window.__TAURI__ = {
    core: {
      invoke: (befehl, args) => {
        if (befehl !== "lernstand_schreiben") return Promise.resolve(null);
        return new Promise((ok) => offen.push(() => { fertig.push(args.daten); ok(); }));
      },
    },
  };
  L.speichere("reihe", { n: 1 });
  const erst = L.sofortSpeichern();
  L.speichere("reihe", { n: 2 });
  const zweit = L.sofortSpeichern();
  await new Promise((r) => setImmediate(r));
  // Der zweite Aufruf darf erst starten, wenn der erste fertig ist.
  assert.equal(offen.length, 1);
  offen.shift()();
  await new Promise((r) => setImmediate(r));
  assert.equal(offen.length, 1);
  offen.shift()();
  await Promise.all([erst, zweit]);
  assert.deepEqual(fertig, ['{"n":1}', '{"n":2}']);
});

test("sofortSpeichern wartet auf laufende Schreibvorgänge", async () => {
  let loslassen;
  globalThis.window.__TAURI__ = {
    core: { invoke: () => new Promise((ok) => { loslassen = ok; }) },
  };
  L.speichere("laeuft", { n: 1 });
  L.sofortSpeichern();
  let fertig = false;
  const p = L.sofortSpeichern().then(() => { fertig = true; });
  await new Promise((r) => setImmediate(r));
  assert.equal(fertig, false);
  loslassen();
  await p;
  assert.equal(fertig, true);
});

test("Link-Tipp speichert erst und wechselt dann die Seite", async () => {
  const geschrieben = [];
  globalThis.window.__TAURI__ = {
    core: { invoke: async (b, args) => { if (b === "lernstand_schreiben") geschrieben.push(args.daten); } },
  };
  const ort = { href: "http://tauri.localhost/wimmelbild.html", origin: "http://tauri.localhost", pathname: "/wimmelbild.html", search: "" };
  globalThis.location = ort;
  const a = { href: "http://tauri.localhost/index.html", target: "", hasAttribute: () => false, contains: () => false };
  const ziel = { nodeType: 1, closest: (sel) => (sel === "a[href]" ? a : null) };
  let verhindert = false;
  const ereignis = { target: ziel, button: 0, defaultPrevented: false, preventDefault: () => { verhindert = true; } };
  // Nichts zu speichern: Link funktioniert normal.
  assert.equal(L.linkKlick(ereignis), undefined);
  assert.equal(verhindert, false);
  L.speichere("link", { letzte: "Antwort" });
  await L.linkKlick(ereignis);
  assert.equal(verhindert, true);
  assert.deepEqual(geschrieben, ['{"letzte":"Antwort"}']);
  assert.equal(ort.href, "http://tauri.localhost/index.html");
  delete globalThis.location;
});
