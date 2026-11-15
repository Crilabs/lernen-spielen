// Sachwelten im Elternbereich (docs/superpowers/specs/2026-11-15-sachwelten-uebersicht-design.md): nur Übersicht;
// gesehen wird beim Spielen mitgeschrieben; Welten sind nicht mit Lernthemen verknüpft (Christian 2026-11-15).
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
const { merkeWelt, elternWelten, weltDesSpiels, migriereStand, neuerStand, runde, setzeZurueck, hakeAb } = L;

const lies = (p) => JSON.parse(readFileSync(new URL(p, import.meta.url), "utf8"));
const lernplan = lies("../spiele/lernplan.json");
const HEUTE = "2026-11-15";

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
  { id: "pb", titel: "Perlenbrücke", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["material", "vorstellung", "kopf"] }], karte: { welt: "wiese" } },
  { id: "punkte", titel: "Punkte", arten: [{ art: "menge", zahlen: [1, 5], stufen: ["kopf"] }], welt: "uhr" },
] };
const CTX = { plan: PLAN, spiele: SPIELE };
const zustand = (gruppen) => Object.fromEntries(gruppen.flatMap((g) => g.welten.map((w) => [w.id, w.zustand])));

beforeEach(() => speicher.clear());

test("weltDesSpiels: karte.welt, sonst welt, sonst null", () => {
  assert.equal(weltDesSpiels(CTX, "pb"), "wiese");
  assert.equal(weltDesSpiels(CTX, "punkte"), "uhr");
  assert.equal(weltDesSpiels(CTX, "fehlt"), null);
});

test("merkeWelt: einmal, das erste Datum bleibt, ohne Welt nichts", () => {
  const s = neuerStand();
  assert.equal(merkeWelt(s, "wiese", "2026-11-01"), true);
  assert.equal(merkeWelt(s, "wiese", HEUTE), false);
  assert.deepEqual(s.welten, { wiese: { seit: "2026-11-01" } });
  assert.equal(merkeWelt(s, null, HEUTE), false);
});

test("migriereStand: welten bleiben, Kaputtes fällt weg, ohne welten kein Feld", () => {
  const s = migriereStand({ themen: {}, welten: { wiese: { seit: "2026-11-01", x: 1 }, kaputt: 3, leer: {} } });
  assert.deepEqual(s.welten, { wiese: { seit: "2026-11-01" } });
  assert.equal("welten" in migriereStand({ themen: {} }), false);
  assert.deepEqual(migriereStand({ welten: [1] }).welten, {});
});

test("elternWelten: Gruppen in Planreihenfolge, Welten nach Klasse, leere Gruppen fehlen", () => {
  const g = elternWelten(CTX, neuerStand());
  assert.deepEqual(g.map((x) => x.id), ["tiere", "zeit"]);
  assert.deepEqual(g[0].welten.map((w) => w.id), ["wiese", "hecke"]);
  const uhr = g[1].welten[0];
  assert.equal(uhr.beschreibung, "Wie die Uhr geht.");
  assert.equal(uhr.eltern, "Hinweis");
  assert.deepEqual(uhr.spiele, [{ id: "punkte", titel: "Punkte" }]);
});

test("elternWelten: nur gesehen oder offen, unabhängig von Lernthemen", () => {
  const s = neuerStand();
  s.themen.z5 = { z: "dran", seit: HEUTE, stufe: "material", v: [] }; // pb (Heimat wiese) übt z5 – zählt nicht
  assert.deepEqual(zustand(elternWelten(CTX, s)), { wiese: "offen", hecke: "offen", uhr: "offen" });
  merkeWelt(s, "uhr", HEUTE);
  const g = elternWelten(CTX, s);
  assert.equal(zustand(g).uhr, "gesehen");
  assert.equal(g[1].welten[0].seit, HEUTE);
});

test("Abhaken und Zurücksetzen im Lernplan fassen gesehene Welten nicht an", () => {
  const s = neuerStand();
  hakeAb(CTX, s, ["z7"], HEUTE);
  assert.equal(s.welten, undefined, "Abhaken ist kein Sehen");
  merkeWelt(s, "uhr", HEUTE);
  setzeZurueck(CTX, s, "z5");
  assert.deepEqual(s.welten, { uhr: { seit: HEUTE } });
});

test("runde: melde merkt die Heimatwelt, nurAnsehen nicht", async () => {
  const ctx = { plan: lernplan, spiele: { ...lies("./daten/spiele-beispiel.json") } };
  ctx.spiele.spiele = ctx.spiele.spiele.map((x) => (x.id === "perlenbruecke" ? { ...x, karte: { welt: "wiese-und-hecke" } } : x));
  const uhr = () => ({ heute: HEUTE, jetzt: 1_000_000 });
  const vorschau = await runde("perlenbruecke", { ctx, uhr, nurAnsehen: true });
  vorschau.einfuehrungGesehen();
  let a = vorschau.naechste();
  vorschau.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
  await vorschau.ende();
  assert.equal(speicher.has("lernstand-kind-1-lernplan"), false);
  const r = await runde("perlenbruecke", { ctx, uhr });
  r.einfuehrungGesehen();
  a = r.naechste();
  r.melde(a.ziel.key, { ok: true, hilfe: 0, ms: 1000 });
  await r.ende();
  const s = JSON.parse(speicher.get("lernstand-kind-1-lernplan"));
  assert.deepEqual(s.welten, { "wiese-und-hecke": { seit: HEUTE } });
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
