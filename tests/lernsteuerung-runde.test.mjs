import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};
const { K, runde, einmal, ladeLernstand } = await import("../spiele/lernsteuerung.js");
const { sofortSpeichern } = await import("../spiele/lernspiel.js");
const AA = await import("../spiele/aufgabenarten.js");

const lies = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const CTX = { plan: lies("../spiele/lernplan.json"), spiele: lies("./daten/spiele-beispiel.json") };
const lcg = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; };
let datum;
const uhr = () => ({ heute: datum, jetzt: 1_000_000 });
const start = (spiel, opt = {}) => runde(spiel, { ctx: CTX, uhr, rnd: lcg(7), ...opt });
const stand = () => JSON.parse(speicher.get("lernstand-kind-1-lernplan") ?? "null");

beforeEach(() => { speicher.clear(); datum = "2026-11-13"; });

test("runde: frisch, Perlenbrücke → zerlegen-2, einfuehrungFaellig", async () => {
  const r = await start("perlenbruecke");
  assert.equal(r.thema.id, "zerlegen-2");
  assert.equal(r.thema.neu, true);
  assert.equal(r.modus, "thema");
  assert.equal(r.einfuehrungFaellig, true);
});

test("runde: frisch, Zahlenzauber → Vorgriff rechnen-3 mit Einführung, Thema wird dran", async () => {
  const r = await start("zahlenzauber");
  assert.equal(r.thema.id, "rechnen-3");
  assert.equal(r.modus, "vorgriff");
  assert.equal(r.einfuehrungFaellig, true);
  r.einfuehrungGesehen();
  r.naechste();
  await r.ende();
  assert.equal(stand().themen["rechnen-3"].z, "dran");
  assert.equal(stand().themen["rechnen-3"].e, "2026-11-13");
  const r2 = await start("zahlenzauber");
  assert.equal(r2.thema.id, "rechnen-3");
  assert.equal(r2.modus, "thema");
  assert.equal(r2.einfuehrungFaellig, false);
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
  speicher.set("lernstand-kind-1-lernplan", JSON.stringify({ version: 1, migriert: 1, verlauf: [], aufgaben: {},
    themen: { "zerlegen-2": { z: "kann-ich", e: "2026-11-01", k: "2026-11-02" }, "zerlegen-3": { z: "kann-ich", e: "2026-11-01", k: "2026-11-02" } } }));
  const r = await start("perlenbruecke");
  assert.equal(r.thema.id, "zerlegen-4");
  r.einfuehrungGesehen();
  const a = r.naechste();
  r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
  await r.ende();
  assert.equal(stand().themen["zerlegen-4"].z, "dran");
  assert.equal(stand().themen["zerlegen-4"].p, undefined);   // ohne Probe-offen-Kennzeichen
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
  assert.equal(speicher.has("lernstand-kind-1-lernplan"), false);
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
const setzeStand = (themen) => speicher.set("lernstand-kind-1-lernplan", JSON.stringify({ version: 1, migriert: 1, verlauf: [], aufgaben: {}, themen }));
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
  assert.deepEqual(await r.ende(), { hinweisSpiel: "b", gekonnt: null });
});

test("runde: hinweisSpiel null ohne neues Thema im anderen Spiel", async () => {
  setzeStand({ t1: gekonnt, t2: gekonnt });
  const r = await runde("a", { ctx: MINI, uhr, rnd: lcg(3) });
  assert.equal(r.modus, "wiederholung");
  assert.deepEqual(await r.ende(), { hinweisSpiel: null, gekonnt: null });
});

test("luecken-Skript: Ausgabe enthält 'ohne Spiel: Mengen bis 5 auf einen Blick'", () => {
  const out = execFileSync(process.execPath, [fileURLToPath(new URL("../scripts/luecken.mjs", import.meta.url))], { encoding: "utf8" });
  assert.match(out, /ohne Spiel: Mengen bis 5 auf einen Blick/);
});

// ---------- Befunde aus dem Gesamtreview ----------

// spielt eine Runde wie das Spiel: Einführung ansehen, sauber antworten bis Rundenende oder gekonnt
async function spieleRunde(spiel, opt = {}) {
  const r = await start(spiel, opt);
  if (r.einfuehrungFaellig) r.einfuehrungGesehen();
  let ereignis = null;
  for (let a; (a = r.naechste());) { ereignis = r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 }); if (ereignis?.typ === "gekonnt") break; }
  const ende = await r.ende();
  return { r, ereignis, ende };
}

test("Befund 1: frisch, erst Zahlenzauber, dann Perlenbrücke → nach zerlegen-2 kommt zerlegen-3 (nicht Wiederholung)", async () => {
  const z = await start("zahlenzauber");
  assert.equal(z.modus, "vorgriff");
  z.einfuehrungGesehen(); z.naechste(); await z.ende();
  assert.equal(stand().themen["rechnen-3"].z, "dran");
  const { r, ereignis, ende } = await spieleRunde("perlenbruecke");
  assert.equal(r.thema.id, "zerlegen-2"); assert.equal(r.modus, "thema");
  // ende() meldet das gekonnte Thema für den Bildschirm „Gekonnt“ (Name und Sprechname aus dem Lernplan)
  assert.equal(ende.gekonnt?.id, "zerlegen-2");
  assert.ok(ende.gekonnt.name && ende.gekonnt.sprich);
  assert.deepEqual(ereignis, { typ: "gekonnt", thema: "zerlegen-2" });
  const r2 = await start("perlenbruecke");
  assert.equal(r2.thema.id, "zerlegen-3");
  assert.equal(r2.modus, "thema");
});

test("Befund 2: einmal() liefert den Wunsch nur beim ersten Aufruf", () => {
  const w = einmal("zerlegen-3");
  assert.equal(w(), "zerlegen-3");
  assert.equal(w(), null);
  assert.equal(w(), null);
  assert.equal(einmal(null)(), null);
});

test("Befund 2: ?thema= gilt nur für die erste Runde der Seite", async () => {
  setzeStand({ "zerlegen-2": gekonnt, "zerlegen-3": gekonnt });
  const wunsch = einmal("zerlegen-3"); // so wie das Spiel beim Laden der Seite
  const r1 = await start("perlenbruecke", { wunsch: wunsch() });
  assert.equal(r1.thema.id, "zerlegen-3"); assert.equal(r1.modus, "wiederholung");
  await r1.ende();
  const r2 = await start("perlenbruecke", { wunsch: wunsch() });
  assert.equal(r2.thema.id, "zerlegen-4"); assert.equal(r2.modus, "thema");
});

// zerlegen-2 und -3 gekonnt: zerlegen-4 hat drei Probe-Aufgaben
const vorZerlegen4 = () => setzeStand({ "zerlegen-2": gekonnt, "zerlegen-3": gekonnt });

test("Befund 3: Abbruch in der ersten Probe-Aufgabe (ohne melde) → nächster Start wieder Probe, ohne Einführung", async () => {
  vorZerlegen4();
  const r = await start("perlenbruecke");
  assert.equal(r.thema.id, "zerlegen-4");
  r.einfuehrungGesehen();
  assert.equal(r.naechste().stufe, "kopf");
  await r.ende();
  assert.equal(stand().themen["zerlegen-4"].z, "dran");
  assert.equal(stand().themen["zerlegen-4"].pb, undefined);
  const r2 = await start("perlenbruecke");
  assert.equal(r2.thema.id, "zerlegen-4");
  assert.equal(r2.einfuehrungFaellig, false);
  assert.equal(r2.thema.stufe, "kopf");
  const a = r2.naechste();
  assert.equal(a.stufe, "kopf"); assert.deepEqual(a.auch, []); // Probe: ohne weitere Wahl
});

test("Befund 3: nach einer Probe-Antwort abgebrochen → pb gesetzt, nächster Start auf der untersten Stufe; Probe-Ende löscht pb", async () => {
  vorZerlegen4();
  const r = await start("perlenbruecke");
  r.einfuehrungGesehen();
  const a = r.naechste();
  r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
  await r.ende();
  assert.equal(stand().themen["zerlegen-4"].pb, 1);
  const r2 = await start("perlenbruecke");
  assert.equal(r2.thema.stufe, "material");
  const b = r2.naechste();
  assert.equal(b.stufe, "material");
  r2.melde(b.ziel.key, { ok: true, hilfe: 0, ms: 1000 }); await r2.ende();
  assert.equal(stand().themen["zerlegen-4"].stufe, "material");
  assert.equal(stand().themen["zerlegen-4"].pb, undefined, "mit gespeicherter Stufe ist pb erledigt");
  // Probe bis zum Ende: pb weg
  speicher.clear(); vorZerlegen4();
  const { ereignis } = await spieleRunde("perlenbruecke");
  assert.deepEqual(ereignis, { typ: "gekonnt", thema: "zerlegen-4" });
  assert.equal(stand().themen["zerlegen-4"].pb, undefined);
  // Probe mit Fehler: pb weg
  speicher.clear(); vorZerlegen4();
  const r3 = await start("perlenbruecke");
  r3.einfuehrungGesehen();
  r3.melde(r3.naechste().ziel.key, { ok: false, hilfe: 0, ms: 1000 });
  await r3.ende();
  assert.equal(stand().themen["zerlegen-4"].pb, undefined);
  assert.equal(stand().themen["zerlegen-4"].stufe, "material");
});

test("Befund 7: themen.html zeigt bei Ladefehler einen kurzen Text und protokolliert", () => {
  const html = readFileSync(new URL("../spiele/themen.html", import.meta.url), "utf8");
  assert.match(html, /catch \(e\) \{ protokoll\("themen: " \+ e\); zeigeFehler\(\); return; \}/);
  assert.match(html, /function zeigeFehler\(\)/);
  assert.doesNotMatch(html, /\balert\(|\bconfirm\(/);
});

test("runde: beginneZeit setzt den Rundenbeginn neu", async () => {
  let jetzt = 1_000_000;
  const r = await runde("perlenbruecke", { ctx: CTX, uhr: () => ({ heute: datum, jetzt }), rnd: lcg(7) });
  jetzt = 1_000_000 + K.RUNDE_MS - 10_000; // Einführung hat lange gedauert
  assert.equal(r.naechste(), null, "ohne beginneZeit zählt die Einführung zur Runde");
  r.beginneZeit();
  assert.ok(r.naechste(), "ab beginneZeit läuft die volle Runde");
});
