// Sachthemen im Elternbereich (docs/superpowers/specs/2026-11-15-sachthemen-eltern-design.md): Sachthemen haben eigene
// Geschichten und Spiele, keine Lernthemen (Christian 2026-11-15). Gelesen = Geschichte bis „Fertig“ geblättert,
// gespielt = in einem Sachspiel (spiele.json: sachwelt) gespielt; nur Übersicht, kein „gekonnt“.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};
const L = await import("../spiele/lernsteuerung.js");
const { merkeSachthema, merkeGeschichteGelesen, elternSachthemen, sachweltDesSpiels, migriereStand, neuerStand, runde, setzeZurueck, hakeAb } = L;

const lies = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const lernplan = lies("../spiele/lernplan.json");
const HEUTE = "2026-11-15";
const SCHLUESSEL = "lernstand-kind-1-lernplan";

const thema = (id, voraussetzungen, aufgaben) => ({ id, name: "Name " + id, sprich: id, strang: "mathe", voraussetzungen,
  aufgaben, bereich: "B", stufen: ["material", "vorstellung", "kopf"] });
const PLAN = {
  themen: [thema("mengen", [], { art: "menge", bis: 5 }), thema("z5", ["mengen"], { art: "zerlegung", zahl: 5 }),
    thema("z7", ["z5"], { art: "zerlegung", zahl: 7 })],
  ueberschriften: [{ id: "tiere", name: "Tiere" }, { id: "zeit", name: "Zeit" }, { id: "leer", name: "Leer" }],
  welten: [
    { id: "hecke", name: "Hecke", beschreibung: "Was in der Hecke lebt.", ueberschrift: "tiere", klasse: 2 },
    { id: "wiese", name: "Wiese", beschreibung: "Was auf der Wiese lebt.", ueberschrift: "tiere", klasse: 1 },
    { id: "uhr", name: "Uhr", beschreibung: "Wie die Uhr geht.", ueberschrift: "zeit", klasse: 1, eltern: "Hinweis" },
  ],
};
const SPIELE = { spiele: [
  // pb: Rechenspiel mit alter Heimatwelt – zählt nicht als Sachspiel
  { id: "pb", titel: "Perlenbrücke", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["material", "vorstellung", "kopf"] }], karte: { welt: "wiese" } },
  { id: "spuren", titel: "Spuren", datei: "sache/spuren/index.html", sachwelt: "hecke" },
] };
const CTX = { plan: PLAN, spiele: SPIELE };
const INHALT = {
  beurteilung: { welten: { hecke: { form: "beides" }, wiese: { form: "geschichte" }, uhr: { form: "spiel" } } },
  geschichten: [{ id: "hecke-tag", titel: "Ein Tag in der Hecke", art: "sachgeschichte", welt: "hecke" },
    { id: "zehner", titel: "Zehner", art: "struktur", welt: null }],
};
const welt = (g, id) => g.flatMap((x) => x.welten).find((w) => w.id === id);
const zustand = (g) => Object.fromEntries(g.flatMap((x) => x.welten.map((w) => [w.id, w.zustand])));

beforeEach(() => speicher.clear());

test("sachweltDesSpiels: nur sachwelt zählt, nicht die alte Heimatwelt", () => {
  assert.equal(sachweltDesSpiels(CTX, "spuren"), "hecke");
  assert.equal(sachweltDesSpiels(CTX, "pb"), null);
  assert.equal(sachweltDesSpiels(CTX, "fehlt"), null);
});

test("merkeSachthema: einmal, das erste Datum bleibt, unbekannte Art oder ohne Id nichts", () => {
  const s = neuerStand();
  assert.equal(merkeSachthema(s, "geschichten", "hecke-tag", "2026-11-01"), true);
  assert.equal(merkeSachthema(s, "geschichten", "hecke-tag", HEUTE), false);
  assert.equal(merkeSachthema(s, "spiele", "spuren", HEUTE), true);
  assert.deepEqual(s.sachthemen, { geschichten: { "hecke-tag": { am: "2026-11-01" } }, spiele: { spuren: { am: HEUTE } } });
  assert.equal(merkeSachthema(s, "welten", "x", HEUTE), false);
  assert.equal(merkeSachthema(s, "spiele", null, HEUTE), false);
});

test("migriereStand: altes welten fällt weg, sachthemen bleiben, Kaputtes fällt weg", () => {
  const s = migriereStand({ themen: {}, welten: { wiese: { seit: "2026-11-01" } },
    sachthemen: { geschichten: { a: { am: "2026-11-02", x: 1 }, kaputt: 3, leer: {} }, spiele: [1], fremd: {} } });
  assert.equal("welten" in s, false);
  assert.deepEqual(s.sachthemen, { geschichten: { a: { am: "2026-11-02" } }, spiele: {} });
  assert.equal("sachthemen" in migriereStand({ themen: {} }), false);
});

test("elternSachthemen: Gruppen in Planreihenfolge, Welten nach Klasse, leere Gruppen fehlen", () => {
  const g = elternSachthemen(CTX, neuerStand(), INHALT);
  assert.deepEqual(g.map((x) => x.id), ["tiere", "zeit"]);
  assert.deepEqual(g[0].welten.map((w) => w.id), ["wiese", "hecke"]);
  const uhr = welt(g, "uhr");
  assert.equal(uhr.beschreibung, "Wie die Uhr geht.");
  assert.equal(uhr.eltern, "Hinweis");
});

test("elternSachthemen: Inhalte nach Form, fehlende als „entsteht noch“, Zustand da/kommt/gesehen", () => {
  const s = neuerStand();
  let g = elternSachthemen(CTX, s, INHALT);
  assert.deepEqual(welt(g, "hecke").inhalte, [
    { art: "geschichte", id: "hecke-tag", titel: "Ein Tag in der Hecke", am: "" },
    { art: "spiel", id: "spuren", titel: "Spuren", datei: "sache/spuren/index.html", am: "" }]);
  assert.deepEqual(welt(g, "wiese").inhalte, [{ art: "geschichte", fehlt: true }], "Rechenspiel pb mit Heimatwelt wiese zählt nicht");
  assert.deepEqual(welt(g, "uhr").inhalte, [{ art: "spiel", fehlt: true }]);
  assert.deepEqual(zustand(g), { wiese: "kommt", hecke: "da", uhr: "kommt" });
  s.themen.z5 = { z: "dran", seit: HEUTE, stufe: "material", v: [] }; // Lernthemen spielen keine Rolle
  merkeSachthema(s, "geschichten", "hecke-tag", HEUTE);
  g = elternSachthemen(CTX, s, INHALT);
  assert.deepEqual(zustand(g), { wiese: "kommt", hecke: "gesehen", uhr: "kommt" });
  assert.equal(welt(g, "hecke").inhalte[0].am, HEUTE);
});

test("elternSachthemen: ohne Beurteilung gilt Form „geschichte“; vorhandene Inhalte erscheinen auch außerhalb der Form", () => {
  const g = elternSachthemen(CTX, neuerStand(), { beurteilung: { welten: { hecke: { form: "spiel" } } }, geschichten: INHALT.geschichten });
  assert.deepEqual(welt(g, "hecke").inhalte.map((x) => x.art), ["geschichte", "spiel"]);
  assert.deepEqual(welt(g, "wiese").inhalte, [{ art: "geschichte", fehlt: true }]);
});

test("Abhaken und Zurücksetzen im Lernplan fassen Sachthemen nicht an", () => {
  const s = neuerStand();
  hakeAb(CTX, s, ["z7"], HEUTE);
  assert.equal(s.sachthemen, undefined);
  merkeSachthema(s, "geschichten", "hecke-tag", HEUTE);
  setzeZurueck(CTX, s, "z5");
  assert.deepEqual(s.sachthemen.geschichten, { "hecke-tag": { am: HEUTE } });
});

test("merkeGeschichteGelesen: speichert im Lernstand, das erste Datum bleibt", async () => {
  assert.equal(await merkeGeschichteGelesen("haustiere", "2026-11-01"), true);
  assert.equal(await merkeGeschichteGelesen("haustiere", HEUTE), false);
  assert.deepEqual(JSON.parse(speicher.get(SCHLUESSEL)).sachthemen.geschichten, { haustiere: { am: "2026-11-01" } });
});

test("runde: melde merkt ein Sachspiel als gespielt, ein Rechenspiel mit Heimatwelt nicht, nurAnsehen nichts", async () => {
  const uhr = () => ({ heute: HEUTE, jetzt: 1_000_000 });
  const spiele = lies("./daten/spiele-beispiel.json");
  const mit = (extra) => ({ plan: lernplan, spiele: { ...spiele, spiele: spiele.spiele.map((x) => (x.id === "perlenbruecke" ? { ...x, ...extra } : x)) } });
  const spiele1 = async (ctx, opts = {}) => {
    const r = await runde("perlenbruecke", { ctx, uhr, ...opts });
    r.einfuehrungGesehen();
    const a = r.naechste();
    r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
    await r.ende();
  };
  await spiele1(mit({ sachwelt: "haustiere" }), { nurAnsehen: true });
  assert.equal(speicher.has(SCHLUESSEL), false);
  await spiele1(mit({ karte: { welt: "wiese-und-hecke" } }));
  assert.equal(JSON.parse(speicher.get(SCHLUESSEL)).sachthemen, undefined, "Heimatwelt ist kein Sachspiel");
  await spiele1(mit({ sachwelt: "haustiere" }));
  assert.deepEqual(JSON.parse(speicher.get(SCHLUESSEL)).sachthemen.spiele, { perlenbruecke: { am: HEUTE } });
});

test("lernplan.json: jede Welt hat eine Beschreibung und keine Verknüpfung zu Lernthemen", () => {
  const ueber = new Set(lernplan.ueberschriften.map((u) => u.id));
  for (const w of lernplan.welten) {
    assert.ok(ueber.has(w.ueberschrift), w.id);
    assert.ok(typeof w.beschreibung === "string" && w.beschreibung.length >= 30 && w.beschreibung.length <= 220, `${w.id}: Beschreibung`);
    for (const f of ["lernthemen", "themen", "anbindung"]) assert.ok(!(f in w), `${w.id}: Feld ${f} gehört nicht mehr zur Welt`);
  }
});

test("Beschreibungen: ohne Wörter der Wortliste 3.2 und ohne Klassenbezug", () => {
  const verboten = /\b(super|toll|klasse|prima|spitze|perfekt|klug|schlau|brav|fleißig|falsch|leider|schade)\b|\bKlasse \d/; // Lobwörter klein, Schulklasse mit Zahl
  for (const w of lernplan.welten) assert.doesNotMatch(w.beschreibung, verboten, w.id);
});

test("spiele.json: sachwelt nennt eine Welt des Lernplans", () => {
  const ids = new Set(lernplan.welten.map((w) => w.id));
  for (const s of lies("../spiele/spiele.json").spiele) if ("sachwelt" in s) assert.ok(ids.has(s.sachwelt), `${s.id}: sachwelt ${s.sachwelt}`);
});
