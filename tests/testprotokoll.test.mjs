// Test-Protokoll in der App (docs/testprotokoll.md): spiele/kern/testprotokoll.js und die Einträge aus runde(),
// Büchern und Eingriffen der Eltern.
import { test, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};
const TP = await import("../spiele/kern/testprotokoll.js");
const { runde, hakeAb, merkeBuchStand } = await import("../spiele/lernsteuerung.js");

const lies = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const CTX = { plan: lies("../spiele/lernplan.json"), spiele: lies("./daten/spiele-beispiel.json") };
const lcg = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; };
const uhr = () => ({ heute: "2026-11-22", jetzt: 1_000_000 });

/** @type {{ name: string, args: any }[]} */
let aufrufe;
const eintraege = () => aufrufe.filter((a) => a.name === "testprotokoll_notieren").map((a) => a.args.eintrag);
const arten = () => eintraege().map((e) => e.art);

beforeEach(() => {
  speicher.clear();
  aufrufe = [];
  TP.testHaken.setze(async (name, args) => { aufrufe.push({ name, args }); });
});
afterEach(() => TP.testHaken.setze(null));

test("außerhalb der App wird nichts notiert", () => {
  TP.testHaken.setze(async (name, args) => { aufrufe.push({ name, args }); }, false);
  TP.notiere("antwort", { ok: true });
  TP.notiereStand({ a: 1 }, "x");
  TP.sendeProtokoll();
  assert.deepEqual(aufrufe, []);
});

test("notiere: erst „seite“, dann der Eintrag; Profil, Zeit, Seite und laufende Nummer", () => {
  TP.notiere("antwort", { key: "2x3", ok: true });
  TP.notiere("antwort", { key: "2x4", ok: false });
  const e = eintraege();
  assert.deepEqual(e.map((x) => x.art), ["seite", "antwort", "antwort"]);
  assert.deepEqual(e.map((x) => x.n), [1, 2, 3]);
  assert.ok(e.every((x) => x.s === e[0].s && typeof x.t === "string"));
  assert.equal(e[2].key, "2x4");
  assert.ok(aufrufe.every((a) => a.args.profil === "kind-1"));
});

test("notiereStand nur bei geändertem Stand; eigene Kopie", () => {
  const stand = { themen: { a: { z: "dran" } } };
  TP.notiereStand(stand, "eins");
  TP.notiereStand(stand, "zwei");
  stand.themen.a.z = "kann-ich";
  TP.notiereStand(stand, "drei");
  const s = eintraege().filter((x) => x.art === "stand");
  assert.deepEqual(s.map((x) => x.anlass), ["eins", "drei"]);
  assert.equal(s[0].stand.themen.a.z, "dran");
});

test("ein fehlschlagender Befehl stört nie", async () => {
  TP.testHaken.setze(async () => { throw new Error("weg"); });
  assert.doesNotThrow(() => { TP.notiere("antwort"); TP.sendeProtokoll(); TP.notiereStand({}, "x"); });
  TP.testHaken.setze(() => { throw new Error("sofort"); });
  assert.doesNotThrow(() => TP.notiere("antwort"));
  await new Promise((r) => setTimeout(r, 0));
});

test("runde: Start mit Kandidaten, Angebot, Antwort, Ende mit Zählern, Lernstand und Senden", async () => {
  const r = await runde("perlenbruecke", { ctx: CTX, uhr, rnd: lcg(7) });
  r.einfuehrungGesehen();
  const a = r.naechste();
  r.melde(a.ziel.key, { ok: false, hilfe: 1, ms: 4000 });   // Probe nicht bestanden: die Runde geht weiter
  const b = r.naechste();
  r.melde(b.ziel.key, { ok: true, ms: 1200 });
  await r.ende();

  const e = eintraege();
  assert.deepEqual(arten().filter((x) => x !== "stand"), ["seite", "runde-start", "einfuehrung", "thema-start", "angebot", "antwort", "angebot", "antwort", "runde-ende"]);
  const start = e.find((x) => x.art === "runde-start");
  assert.equal(start.spiel, "perlenbruecke");
  assert.equal(start.thema, "zerlegen-2");
  assert.equal(start.modus, "thema");
  assert.equal(start.kandidaten["zerlegen-2"], "in-sicht");
  const antwort = e.filter((x) => x.art === "antwort");
  assert.deepEqual(antwort.map((x) => [x.key, x.ok, x.hilfe, x.ms]), [[a.ziel.key, false, 1, 4000], [b.ziel.key, true, 0, 1200]]);
  assert.equal(e.find((x) => x.art === "angebot").key, a.ziel.key);
  const ende = e.find((x) => x.art === "runde-ende");
  assert.deepEqual([ende.antworten, ende.richtig, ende.hilfe, ende.gezeigt], [2, 1, 1, 2]);
  assert.equal(ende.themaNachher.z, "dran");
  const staende = e.filter((x) => x.art === "stand");
  assert.deepEqual(staende.map((x) => x.anlass), ["runde-start:perlenbruecke", "runde-ende:perlenbruecke"]);
  assert.equal(staende[1].stand.themen["zerlegen-2"].z, "dran");
  assert.equal(aufrufe.at(-1).name, "testprotokoll_senden");
});

test("runde in der Vorschau der Eltern (nurAnsehen) notiert nichts", async () => {
  const r = await runde("perlenbruecke", { ctx: CTX, uhr, rnd: lcg(7), nurAnsehen: true });
  const a = r.naechste();
  r.melde(a.ziel.key, { ok: true, ms: 1000 });
  await r.ende();
  assert.deepEqual(aufrufe, []);
});

test("Eltern haken ab: Eintrag mit gewählten und gesetzten Themen", () => {
  const stand = { themen: {}, aufgaben: {} };
  const gesetzt = hakeAb(CTX, stand, ["zerlegen-2"], "2026-11-22");
  const e = eintraege().find((x) => x.art === "eltern");
  assert.equal(e.aktion, "abhaken");
  assert.deepEqual(e.gewaehlt, ["zerlegen-2"]);
  assert.deepEqual(e.themen, gesetzt);
});

test("Buch: neu fertiges Kapitel und erstes vollständiges Lesen werden notiert", async () => {
  await merkeBuchStand("katze", { kapitel: 0, seite: 3, fertig: [0] }, 2, "2026-11-22");
  await merkeBuchStand("katze", { kapitel: 1, seite: 1, fertig: [] }, 2, "2026-11-22");
  await merkeBuchStand("katze", { kapitel: 1, seite: 4, fertig: [1] }, 2, "2026-11-22");
  const b = eintraege().filter((x) => x.art === "buch");
  assert.deepEqual(b.map((x) => [x.kapitelFertig, x.gelesen]), [[[0], false], [[1], true]]);
});
