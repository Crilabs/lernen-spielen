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
const { runde, einmal, ladeLernstand } = await import("../spiele/lernsteuerung.js");
const { sofortSpeichern } = await import("../spiele/lernspiel.js");
const AA = await import("../spiele/aufgabenarten.js");

const lies = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const CTX = { plan: lies("../spiele/lernplan.json"), spiele: lies("../spiele/spiele.json") };
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

// alter Zahlenzauber-Stand Stufe 3 mit einer Aufgabe aus minus-bis-30
const altStufe3 = () => {
  const { aufgabenVon } = AA;
  const key = aufgabenVon({ art: "rechnen", thema: "minus-bis-30" })[0].key.replace(/^minus:/, "");
  speicher.set("lernstand-kind-1-zahlenzauber", JSON.stringify({ stufe: 3, wiese: 40, fakten: { [key]: { f: 1, t: "2026-11-10", h: [1] } } }));
};

test("runde: übernommenes Thema (alter Zahlenzauber Stufe 3) startet ohne Einführung mit Probe von 5", async () => {
  altStufe3();
  const r = await start("zahlenzauber");
  assert.equal(r.thema.id, "minus-bis-30");
  assert.equal(r.modus, "thema");
  assert.equal(r.einfuehrungFaellig, false);
  assert.equal(r.thema.stufe, "kopf");
  let ereignis = null;
  for (let i = 0; i < 5; i++) {
    const a = r.naechste();
    assert.ok(a, "Angebot " + (i + 1));
    assert.equal(a.ziel.thema, "minus-bis-30");
    assert.equal(a.stufe, "kopf");
    assert.deepEqual(a.auch, []);
    ereignis = r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
    if (i < 4) assert.equal(ereignis, null);
  }
  assert.deepEqual(ereignis, { typ: "gekonnt", thema: "minus-bis-30" });
  await r.ende();
  assert.equal(stand().themen["minus-bis-30"].z, "kann-ich");
  assert.equal(stand().themen["minus-bis-30"].p, undefined, "Probe erledigt: p gelöscht");
});

test("runde: übernommenes Thema, Probe mit Fehler → p gelöscht, Üben auf der untersten Stufe", async () => {
  altStufe3();
  const r = await start("zahlenzauber");
  assert.equal(r.thema.id, "minus-bis-30");
  const a = r.naechste();
  r.melde(a.ziel.key, { ok: false, hilfe: 0, ms: 1000 });
  await r.ende();
  const t = stand().themen["minus-bis-30"];
  assert.equal(t.z, "dran"); assert.equal(t.stufe, "kopf"); assert.equal(t.p, undefined);
  const r2 = await start("zahlenzauber");
  const b = r2.naechste();
  assert.ok(b.auch.length > 0, "keine Probe mehr: Angebot mit weiteren Aufgaben");
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

test("runde: Migration läuft einmal, zweiter Start ändert nichts", async () => {
  speicher.set("lernstand-kind-1-perlenbruecke", JSON.stringify({ paare: { "2:1+1": { f: 4, t: "2026-11-01", h: [1, 1], g: 1 } } }));
  const r = await start("perlenbruecke");
  await r.ende();
  const s1 = stand();
  assert.equal(s1.migriert, 1);
  assert.equal(s1.themen["zerlegen-2"].z, "kann-ich");
  speicher.set("lernstand-kind-1-perlenbruecke", JSON.stringify({ paare: {} }));
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

// ---------- Befunde aus dem Gesamtreview ----------

// spielt eine Runde wie das Spiel: Einführung ansehen, sauber antworten bis Rundenende oder gekonnt
async function spieleRunde(spiel, opt = {}) {
  const r = await start(spiel, opt);
  if (r.einfuehrungFaellig) r.einfuehrungGesehen();
  let ereignis = null;
  for (let a; (a = r.naechste());) { ereignis = r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 }); if (ereignis?.typ === "gekonnt") break; }
  await r.ende();
  return { r, ereignis };
}

test("Befund 1: frisch, erst Zahlenzauber, dann Perlenbrücke → nach zerlegen-2 kommt zerlegen-3 (nicht Wiederholung)", async () => {
  const z = await start("zahlenzauber");
  assert.equal(z.modus, "vorgriff");
  z.einfuehrungGesehen(); z.naechste(); await z.ende();
  assert.equal(stand().themen["rechnen-3"].z, "dran");
  const { r, ereignis } = await spieleRunde("perlenbruecke");
  assert.equal(r.thema.id, "zerlegen-2"); assert.equal(r.modus, "thema");
  assert.deepEqual(ereignis, { typ: "gekonnt", thema: "zerlegen-2" });
  const r2 = await start("perlenbruecke");
  assert.equal(r2.thema.id, "zerlegen-3");
  assert.equal(r2.modus, "thema");
});

test("Befund 1: übernommenes Kind mit beiden Ständen → nach rechnen-7 bekommt der Zahlenzauber ein neues Thema", async () => {
  speicher.set("lernstand-kind-1-zahlenzauber", JSON.stringify({ stufe: 2, fakten: { "3+4": { f: 2, t: "2026-11-01", h: [1] }, "7-4": { f: 1, t: "2026-11-01", h: [1] } } }));
  speicher.set("lernstand-kind-1-perlenbruecke", JSON.stringify({ version: 2, paare: { "5:2+3": { f: 4, t: "2026-11-01", h: [1], g: 1 }, "7:3+4": { f: 1, t: "x", h: [0] } } }));
  const { r, ereignis } = await spieleRunde("zahlenzauber");
  assert.equal(r.thema.id, "rechnen-7");
  assert.deepEqual(ereignis, { typ: "gekonnt", thema: "rechnen-7" });
  assert.equal(stand().themen["zerlegen-5"].z, "dran", "in der Perlenbrücke ist noch ein Thema dran");
  const r2 = await start("zahlenzauber");
  assert.equal(r2.modus, "thema");
  assert.notEqual(r2.thema.id, "rechnen-7");
  assert.equal(r2.thema.neu, true);
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

for (const datei of ["perlenbruecke", "zahlenzauber"]) {
  test(`Befund 2: ${datei}.html verbraucht ?thema= einmal`, () => {
    const html = readFileSync(new URL(`../spiele/${datei}.html`, import.meta.url), "utf8");
    assert.match(html, /import \{[^}]*\beinmal\b[^}]*\} from "\.\/lernsteuerung\.js"/);
    assert.match(html, /const wunsch = einmal\(params\.get\("thema"\)\)/);
    assert.match(html, new RegExp(`runde\\("${datei}", \\{ wunsch: wunsch\\(\\)`));
    assert.doesNotMatch(html, /wunsch: params\.get/);
  });
}

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

test("Befund 3: übernommenes Thema (p = 1), Abbruch vor der ersten Antwort → wieder Probe", async () => {
  altStufe3();
  const r = await start("zahlenzauber");
  assert.equal(r.thema.id, "minus-bis-30");
  r.naechste(); await r.ende();
  const r2 = await start("zahlenzauber");
  assert.equal(r2.thema.id, "minus-bis-30");
  assert.deepEqual(r2.naechste().auch, [], "Probe");
});

test("Befund 5: ladeLernstand übernimmt alte Stände, schreibt aber nichts", async () => {
  speicher.set("lernstand-kind-1-perlenbruecke", JSON.stringify({ paare: { "2:1+1": { f: 4, t: "2026-11-01", h: [1, 1], g: 1 } } }));
  const s = await ladeLernstand(CTX, "2026-11-13");
  assert.equal(s.migriert, 1);
  assert.equal(s.themen["zerlegen-2"].z, "kann-ich");
  await sofortSpeichern();
  assert.equal(speicher.has("lernstand-kind-1-lernplan"), false);
  // schon übernommen: alte Stände werden nicht noch einmal gelesen
  setzeStand({ "zerlegen-3": gekonnt });
  const t = await ladeLernstand(CTX, "2026-11-13");
  assert.equal(t.themen["zerlegen-2"], undefined);
  assert.equal(t.themen["zerlegen-3"].z, "kann-ich");
  // runde() speichert die Übernahme weiter sofort
  speicher.clear();
  speicher.set("lernstand-kind-1-perlenbruecke", JSON.stringify({ paare: { "2:1+1": { f: 4, t: "2026-11-01", h: [1, 1], g: 1 } } }));
  await (await start("perlenbruecke")).ende();
  assert.equal(stand().migriert, 1);
});

for (const datei of ["themen", "eltern"]) {
  test(`Befund 5: ${datei}.html lädt den Lernstand über ladeLernstand`, () => {
    const html = readFileSync(new URL(`../spiele/${datei}.html`, import.meta.url), "utf8");
    assert.match(html, /import \{[^}]*\bladeLernstand\b[^}]*\}\s*from "\.\/lernsteuerung\.js"/);
    assert.match(html, /await ladeLernstand\(/);
    assert.doesNotMatch(html, /migriereSpiele\(/);
  });
}

for (const [datei, sag] of [["perlenbruecke", "sag"], ["zahlenzauber", "sag"]]) {
  test(`Befund 7: ${datei}.html fängt Ladefehler beim Rundenstart ab (Protokoll, Text, kein Dialog)`, () => {
    const html = readFileSync(new URL(`../spiele/${datei}.html`, import.meta.url), "utf8");
    assert.match(html, /import \{[^}]*\bprotokoll\b[^}]*\} from "\.\/lernspiel\.js"/);
    assert.match(html, new RegExp(`try\\{ r = await runde\\("${datei}"[^\\n]*\\}\\s*catch\\(e\\)\\{[^\\n]*protokoll\\([^\\n]*${sag}\\("[^"\\d]+"\\)[^\\n]*return; \\}`));
    assert.doesNotMatch(html, /\balert\(|\bconfirm\(/);
  });
}

test("Befund 7: themen.html zeigt bei Ladefehler einen kurzen Text und protokolliert", () => {
  const html = readFileSync(new URL("../spiele/themen.html", import.meta.url), "utf8");
  assert.match(html, /catch \(e\) \{ protokoll\("themen: " \+ e\); zeigeFehler\(\); return; \}/);
  assert.match(html, /function zeigeFehler\(\)/);
  assert.doesNotMatch(html, /\balert\(|\bconfirm\(/);
});
