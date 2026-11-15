// Sachwelten im Elternbereich (docs/superpowers/specs/2026-11-15-sachwelten-uebersicht-design.md): nur Übersicht;
// gesehen wird beim Spielen mitgeschrieben, dran und als Nächstes folgen den Lernthemen der Welt.
import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";

const speicher = new Map();
globalThis.localStorage = {
  getItem: (k) => (speicher.has(k) ? speicher.get(k) : null),
  setItem: (k, v) => speicher.set(k, String(v)),
  removeItem: (k) => speicher.delete(k),
};
globalThis.window = {};
const L = await import("../spiele/lernsteuerung.js");
const { merkeWelt, elternWelten, weltDesSpiels, migriereStand, neuerStand, runde, setzeZurueck, hakeAb } = L;
const W = await import("../scripts/welten-lernthemen.mjs");

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
    { id: "hecke", name: "Hecke", beschreibung: "Was in der Hecke lebt.", ueberschrift: "tiere", klasse: 2, lernthemen: ["z7"] },
    { id: "wiese", name: "Wiese", beschreibung: "Was auf der Wiese lebt.", ueberschrift: "tiere", klasse: 1, lernthemen: [] },
    { id: "uhr", name: "Uhr", beschreibung: "Wie die Uhr geht.", ueberschrift: "zeit", klasse: 1, lernthemen: ["z5"], eltern: "Hinweis" },
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

test("elternWelten: dran über Lernthemen und Themen der Heimatspiele, als Nächstes, gesehen geht vor", () => {
  const s = neuerStand();
  s.themen.z5 = { z: "dran", seit: HEUTE, stufe: "material", v: [] };
  // uhr: Lernthema z5 dran; wiese: Heimat von pb, das z5 übt; hecke: z7 als Nächstes
  assert.deepEqual(zustand(elternWelten(CTX, s, new Set(["z7"]))), { wiese: "dran", hecke: "naechstes", uhr: "dran" });
  assert.deepEqual(zustand(elternWelten(CTX, s)), { wiese: "dran", hecke: "offen", uhr: "dran" });
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

test("lernplan.json: jede Welt hat eine Beschreibung und gültige Lernthemen; Skript ist eingespielt", () => {
  const ids = new Set(lernplan.themen.map((t) => t.id));
  const ueber = new Set(lernplan.ueberschriften.map((u) => u.id));
  for (const w of lernplan.welten) {
    assert.ok(ueber.has(w.ueberschrift), w.id);
    assert.ok(typeof w.beschreibung === "string" && w.beschreibung.length >= 30 && w.beschreibung.length <= 220, `${w.id}: Beschreibung`);
    assert.ok(Array.isArray(w.lernthemen) && w.lernthemen.every((t) => ids.has(t)), `${w.id}: Lernthemen`);
  }
  const katalog = { welten: readFileSync(new URL("../docs/spielkatalog/welten.md", import.meta.url), "utf8"),
    faecher: readdirSync(new URL("../docs/spielkatalog/", import.meta.url)).filter((f) => f.endsWith(".md") && f !== "welten.md")
      .map((f) => readFileSync(new URL("../docs/spielkatalog/" + f, import.meta.url), "utf8")) };
  const text = readFileSync(new URL("../spiele/lernplan.json", import.meta.url), "utf8");
  const { welten, fehler } = W.ergaenzeWelten(JSON.parse(text), katalog, lies("../scripts/welten-beschreibungen.json"));
  assert.deepEqual(fehler, []);
  assert.equal(W.neuerPlanText(text, welten), text, "node scripts/welten-lernthemen.mjs ausführen");
});

test("Beschreibungen: ohne Wörter der Wortliste 3.2 und ohne Klassenbezug", () => {
  const verboten = /\b(super|toll|klasse|prima|spitze|perfekt|klug|schlau|brav|fleißig|falsch|leider|schade)\b|\bKlasse \d/; // Lobwörter klein, Schulklasse mit Zahl
  for (const w of lernplan.welten) assert.doesNotMatch(w.beschreibung, verboten, w.id);
});

test("Katalog-Parser: Welt je Spiel und umbrochene Hauptthemen", () => {
  assert.deepEqual([...W.spielZuWelt("**M01 Paare bilden** · Sinne (`sinne`) · Kl. 1\n**X** ohne").entries()], [["M01", "sinne"]]);
  const t = W.spielZuThemen("### M01 Paare\n- Hauptthemen: a-b, c (Kl. 1–2),\n  d-e\n- Weitere Zugänge: x\n### M02 Z\n- Hauptthemen: f");
  assert.deepEqual(Object.fromEntries(t), { M01: ["a-b", "c", "d-e"], M02: ["f"] });
});
