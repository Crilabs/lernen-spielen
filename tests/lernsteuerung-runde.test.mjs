import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};
const { runde } = await import("../spiele/lernsteuerung.js");
const { sofortSpeichern } = await import("../spiele/lernspiel.js");

const lies = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const CTX = { plan: lies("../spiele/lernplan.json"), spiele: lies("../spiele/spiele.json") };
const lcg = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; };
let datum;
const uhr = () => ({ heute: datum, jetzt: 1_000_000 });
const start = (spiel, opt = {}) => runde(spiel, { ctx: CTX, uhr, rnd: lcg(7), ...opt });
const stand = () => JSON.parse(speicher.get("lernstand-lernplan") ?? "null");

beforeEach(() => { speicher.clear(); datum = "2026-11-13"; });

test("runde: frisch, Perlenbrücke → zerlegen-2, einfuehrungFaellig", async () => {
  const r = await start("perlenbruecke");
  assert.equal(r.thema.id, "zerlegen-2");
  assert.equal(r.thema.neu, true);
  assert.equal(r.modus, "thema");
  assert.equal(r.einfuehrungFaellig, true);
});

test("runde: abgebrochen vor einfuehrungGesehen → nächster Start wieder Einführung, Thema in Sicht", async () => {
  const r = await start("perlenbruecke");
  await r.ende();
  const s = stand();
  assert.ok(!s?.themen?.["zerlegen-2"]?.z, "Thema nicht gestartet");
  assert.ok(!s?.themen?.["zerlegen-2"]?.e);
  const r2 = await start("perlenbruecke");
  assert.equal(r2.thema.id, "zerlegen-2");
  assert.equal(r2.einfuehrungFaellig, true);
});

test("runde: Einführung gesehen, dann erstes naechste startet das Thema mit der Probe", async () => {
  const r = await start("perlenbruecke");
  r.einfuehrungGesehen();
  assert.equal(r.einfuehrungFaellig, false);
  await sofortSpeichern();
  assert.equal(stand().themen["zerlegen-2"].e, "2026-11-13");
  assert.ok(!stand().themen["zerlegen-2"].z);
  const a = r.naechste();
  assert.equal(a.stufe, "kopf");
  await r.ende();
  assert.equal(stand().themen["zerlegen-2"].z, "dran");
  const r2 = await start("perlenbruecke");
  assert.equal(r2.einfuehrungFaellig, false);
});

test("runde: halbe Probe abgebrochen → nicht gekonnt, nächster Start übt auf material", async () => {
  // zerlegen-2 und -3 gekonnt: zerlegen-4 hat drei Probe-Aufgaben
  speicher.set("lernstand-lernplan", JSON.stringify({ version: 1, migriert: 1, verlauf: [], aufgaben: {},
    themen: { "zerlegen-2": { z: "kann-ich", e: "2026-11-01", k: "2026-11-02" }, "zerlegen-3": { z: "kann-ich", e: "2026-11-01", k: "2026-11-02" } } }));
  const r = await start("perlenbruecke");
  assert.equal(r.thema.id, "zerlegen-4");
  r.einfuehrungGesehen();
  const a = r.naechste();
  r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
  await r.ende();
  assert.equal(stand().themen["zerlegen-4"].z, "dran");
  const r2 = await start("perlenbruecke");
  assert.equal(r2.thema.id, "zerlegen-4");
  assert.equal(r2.thema.neu, false);
  assert.equal(r2.thema.stufe, "material");
  assert.equal(r2.einfuehrungFaellig, false);
  assert.equal(r2.naechste().stufe, "material");
});

test("runde: melde nach Mitternacht nutzt neues Datum", async () => {
  const r = await start("perlenbruecke");
  r.einfuehrungGesehen();
  const a = r.naechste();
  datum = "2026-11-14";
  r.melde(a.ziel.key, { ok: false, hilfe: 0, ms: 4000 });
  await r.ende();
  assert.equal(stand().aufgaben[a.ziel.key].t, "2026-11-14");
});

test("runde: nurAnsehen speichert nichts", async () => {
  const r = await start("perlenbruecke", { nurAnsehen: true });
  r.einfuehrungGesehen();
  const a = r.naechste();
  r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
  await r.ende();
  assert.equal(speicher.has("lernstand-lernplan"), false);
});

test("runde: Migration läuft einmal, zweiter Start ändert nichts", async () => {
  speicher.set("lernstand-perlenbruecke", JSON.stringify({ paare: { "2:1+1": { f: 4, t: "2026-11-01", h: [1, 1], g: 1 } } }));
  const r = await start("perlenbruecke");
  await r.ende();
  const s1 = stand();
  assert.equal(s1.migriert, 1);
  assert.equal(s1.themen["zerlegen-2"].z, "kann-ich");
  speicher.set("lernstand-perlenbruecke", JSON.stringify({ paare: {} }));
  datum = "2026-11-20";
  const r2 = await start("perlenbruecke");
  await r2.ende();
  assert.deepEqual(stand(), s1);
});

test("runde: ende speichert vor dem Auflösen", async () => {
  const r = await start("perlenbruecke");
  r.einfuehrungGesehen();
  const a = r.naechste();
  r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
  await r.ende();
  assert.ok(stand().aufgaben[a.ziel.key]);
  await sofortSpeichern();
});

const mini = (id, voraus, zahl) => ({ id, name: id, sprich: id, strang: "mathe", voraussetzungen: voraus,
  aufgaben: { art: "zerlegung", zahl }, stufen: ["material", "vorstellung", "kopf"], einfuehrung: { vorlage: "x.json" }, tempo: true, eltern: "" });
const MINI = {
  plan: { themen: [mini("t1", [], 5), mini("t2", ["t1"], 6)] },
  spiele: { spiele: [
    { id: "a", arten: [{ art: "zerlegung", zahlen: [5, 5], stufen: ["material", "vorstellung", "kopf"] }] },
    { id: "b", arten: [{ art: "zerlegung", zahlen: [6, 6], stufen: ["material", "vorstellung", "kopf"] }] },
  ] },
};
const setzeStand = (themen) => speicher.set("lernstand-lernplan", JSON.stringify({ version: 1, migriert: 1, verlauf: [], aufgaben: {}, themen }));
const gekonnt = { z: "kann-ich", e: "2026-11-01", k: "2026-11-02" };

test("runde: einfuehrungGesehen ohne Thema tut nichts", async () => {
  setzeStand({ t1: gekonnt, t2: gekonnt });
  const r = await runde("a", { ctx: MINI, uhr, rnd: lcg(3) });
  assert.equal(r.thema, null);
  r.einfuehrungGesehen();
  await r.ende();
  assert.deepEqual(Object.keys(stand().themen).sort(), ["t1", "t2"]);
});

test("runde: hinweisSpiel nennt anderes Spiel mit neuem Thema", async () => {
  setzeStand({ t1: gekonnt });
  const r = await runde("a", { ctx: MINI, uhr, rnd: lcg(3) });
  assert.equal(r.modus, "wiederholung");
  assert.deepEqual(await r.ende(), { hinweisSpiel: "b" });
});

test("runde: hinweisSpiel null ohne neues Thema im anderen Spiel", async () => {
  setzeStand({ t1: gekonnt, t2: gekonnt });
  const r = await runde("a", { ctx: MINI, uhr, rnd: lcg(3) });
  assert.equal(r.modus, "wiederholung");
  assert.deepEqual(await r.ende(), { hinweisSpiel: null });
});

test("luecken-Skript: Ausgabe enthält 'ohne Spiel: Mengen bis 5 auf einen Blick'", () => {
  const out = execFileSync(process.execPath, [new URL("../scripts/luecken.mjs", import.meta.url).pathname], { encoding: "utf8" });
  assert.match(out, /ohne Spiel: Mengen bis 5 auf einen Blick/);
});
