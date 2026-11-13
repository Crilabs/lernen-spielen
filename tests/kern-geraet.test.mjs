import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};

// plattform() cacht je Prozess; für die Plattform-Fälle läuft jeder in einem eigenen Prozess.
function inFrischemProzess(plattformName) {
  const code = `
    globalThis.window = { __TAURI__: { core: { invoke: async () => ${JSON.stringify(plattformName)} } } };
    const G = await import(${JSON.stringify(new URL("../spiele/kern/geraet.js", import.meta.url).href)});
    console.log(JSON.stringify(await G.faehigkeiten()));`;
  return JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8" }));
}

async function geraet(app) {
  if (app) globalThis.window.__TAURI__ = app;
  else delete globalThis.window.__TAURI__;
  return import("../spiele/kern/geraet.js");
}
const appMit = (p, extra = {}) => ({
  core: { invoke: async (b) => (b === "plattform" ? p : null) },
  ...extra,
});

beforeEach(() => speicher.clear());

test("faehigkeiten im Browser: alle false", async () => {
  const G = await geraet(null);
  assert.deepEqual(await G.faehigkeiten(), { update: false, beenden: false, kiosk: false });
});

test("faehigkeiten auf Android: alle false", async () => {
  assert.deepEqual(inFrischemProzess("android"), { update: false, beenden: false, kiosk: false });
});

test("faehigkeiten auf Windows: alle true", async () => {
  assert.deepEqual(inFrischemProzess("windows"), { update: true, beenden: true, kiosk: true });
});

test("kioskPause wirft nie und protokolliert", async () => {
  const G = await geraet({
    core: { invoke: async (b) => { if (b === "kiosk_pause") throw new Error("kaputt"); return "windows"; } },
  });
  await G.kioskPause(true);
  assert.match(speicher.get("protokoll"), /Kiosk-Pause: kaputt/);
});

test("updateSuche und appVersion", async () => {
  const check = async () => null;
  const G = await geraet(appMit("windows", { updater: { check }, app: { getVersion: async () => "1.2.3" } }));
  assert.equal(G.updateSuche(), check);
  assert.equal(await G.appVersion(), "1.2.3");
  const B = await geraet(null);
  assert.equal(B.updateSuche(), undefined);
  assert.equal(await B.appVersion(), null);
});

test("beende und neuStart: false und Protokoll bei Fehler, true bei Erfolg", async () => {
  const schlecht = await geraet(appMit("windows", { process: {
    exit: async () => { throw new Error("exit kaputt"); },
    relaunch: async () => { throw new Error("relaunch kaputt"); },
  } }));
  assert.equal(await schlecht.beende(), false);
  assert.equal(await schlecht.neuStart(), false);
  assert.match(speicher.get("protokoll"), /exit kaputt/);
  assert.match(speicher.get("protokoll"), /relaunch kaputt/);
  const gut = await geraet(appMit("windows", { process: { exit: async () => {}, relaunch: async () => {} } }));
  assert.equal(await gut.beende(), true);
  assert.equal(await gut.neuStart(), true);
});

test("faehigkeiten protokolliert, wenn plattform scheitert", async () => {
  const code = `
    const s = new Map();
    globalThis.localStorage = { getItem: k => s.get(k) ?? null, setItem: (k, v) => s.set(k, v) };
    globalThis.window = { __TAURI__: { core: { invoke: async () => { throw new Error("plattform kaputt"); } } } };
    const G = await import(${JSON.stringify(new URL("../spiele/kern/geraet.js", import.meta.url).href)});
    console.log(JSON.stringify({ k: await G.faehigkeiten(), p: s.get("protokoll") }));`;
  const e = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8" }));
  assert.deepEqual(e.k, { update: false, beenden: false, kiosk: false });
  assert.match(e.p, /plattform kaputt/);
});

test("faehigkeiten: schlägt plattform() fehl, entscheiden die Desktop-Plugins", () => {
  const code = `
    globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
    globalThis.window = { __TAURI__: { core: { invoke: async () => { throw new Error("weg"); } }, updater: {}, process: {} } };
    const G = await import(${JSON.stringify(new URL("../spiele/kern/geraet.js", import.meta.url).href)});
    console.log(JSON.stringify(await G.faehigkeiten()));`;
  const out = JSON.parse(execFileSync(process.execPath, ["--input-type=module", "-e", code], { encoding: "utf8" }));
  assert.deepEqual(out, { update: true, beenden: true, kiosk: true });
});
