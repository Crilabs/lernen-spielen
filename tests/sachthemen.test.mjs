// Sachthemen (docs/superpowers/specs/2026-11-15-bibliothek-design.md): Sachthemen haben eigene Geschichten und
// Spiele, keine Lernthemen (Christian 2026-11-15). Gelesen = Geschichte bis „Fertig“ geblättert,
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
const { merkeSachthema, merkeGeschichteGelesen, sachweltDesSpiels, migriereStand, neuerStand, runde, setzeZurueck, hakeAb } = L;

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

// Lesestand eines Sachbuchs (docs/geschichten.md §4, Christian 2026-11-15: Kapitel einzeln, die App merkt sich den Stand)
test("Buchstand: ohne Stand null; merken und laden; Unsinn wird bereinigt", async () => {
  assert.equal(await L.ladeBuchStand("katzen"), null);
  await L.merkeBuchStand("katzen", { kapitel: 2, seite: 3, fertig: [0, 1] }, 6);
  assert.deepEqual(await L.ladeBuchStand("katzen"), { kapitel: 2, seite: 3, fertig: [0, 1] });
  const roh = JSON.parse(speicher.get(SCHLUESSEL));
  roh.buecher.katzen = { kapitel: "x", seite: -4, fertig: [1, 1, "a", 9.5] };
  speicher.set(SCHLUESSEL, JSON.stringify(roh));
  assert.deepEqual(await L.ladeBuchStand("katzen"), { kapitel: 0, seite: 0, fertig: [1] });
});

test("Buchstand: alle Kapitel fertig → das Buch gilt als gelesen (einmal, erstes Datum)", async () => {
  await L.merkeBuchStand("katzen", { kapitel: 4, seite: 2, fertig: [0, 1, 2, 3] }, 5, "2026-11-10");
  assert.equal(JSON.parse(speicher.get(SCHLUESSEL)).sachthemen?.geschichten?.katzen, undefined);
  await L.merkeBuchStand("katzen", { kapitel: 4, seite: 4, fertig: [0, 1, 2, 3, 4] }, 5, "2026-11-12");
  await L.merkeBuchStand("katzen", { kapitel: 0, seite: 0, fertig: [0, 1, 2, 3, 4] }, 5, "2026-11-14");
  assert.deepEqual(JSON.parse(speicher.get(SCHLUESSEL)).sachthemen.geschichten.katzen, { am: "2026-11-12" });
});

test("Buchstand: fertige Kapitel gehen nie verloren (ein früher, leerer Stand überschreibt sie nicht)", async () => {
  await L.merkeBuchStand("katzen", { kapitel: 3, seite: 1, fertig: [0, 1, 2] }, 6);
  await L.merkeBuchStand("katzen", { kapitel: 0, seite: 0, fertig: [] }, 6);
  assert.deepEqual(await L.ladeBuchStand("katzen"), { kapitel: 0, seite: 0, fertig: [0, 1, 2] });
});

// „Weißt du noch?“ (docs/geschichten.md §2b): Kapitelfragen mit Abstand, höchstens zwei am Tag (Bibliothek und Pause zusammen)
test("Erinnern: erst, wenn das ganze Buch gelesen ist (Christian 2026-11-22), nicht schon nach einzelnen Kapiteln", async () => {
  const ids = ["katzen"];
  await L.merkeBuchStand("katzen", { kapitel: 1, seite: 0, fertig: [0] }, 3, "2026-11-10");
  assert.equal(await L.ladeErinnerung(ids, "2026-11-12"), null, "nur Kapitel 1 gelesen: keine Frage");
  await L.merkeBuchStand("katzen", { kapitel: 2, seite: 0, fertig: [0, 1] }, 3, "2026-11-12");
  assert.equal(await L.ladeErinnerung(ids, "2026-11-14"), null, "zwei von drei Kapiteln: keine Frage");
  await L.merkeBuchStand("katzen", { kapitel: 2, seite: 3, fertig: [0, 1, 2] }, 3, "2026-11-14");
  assert.equal(await L.ladeErinnerung(ids, "2026-11-14"), null, "am Tag, an dem das Buch fertig wurde, noch nicht");
  assert.deepEqual(await L.ladeErinnerung(ids, "2026-11-15"), { id: "katzen", kapitel: 0 }, "ab dem Tag danach");
});

test("Erinnern: Datum je fertigem Kapitel; erst ab dem Tag danach; zwei am Tag, keine doppelt; die am längsten nicht gestellte zuerst", async () => {
  const ids = ["katzen", "wal"];
  await L.merkeBuchStand("katzen", { kapitel: 1, seite: 0, fertig: [0] }, 3, "2026-11-09");
  await L.merkeBuchStand("katzen", { kapitel: 2, seite: 0, fertig: [0, 1, 2] }, 3, "2026-11-10");
  assert.deepEqual(JSON.parse(speicher.get(SCHLUESSEL)).buecher.katzen.am, { 0: "2026-11-09", 1: "2026-11-10", 2: "2026-11-10" });
  assert.equal(await L.ladeErinnerung(ids, "2026-11-10"), null, "am selben Tag noch nicht");
  assert.deepEqual(await L.ladeErinnerung(ids, "2026-11-11"), { id: "katzen", kapitel: 0 });
  assert.deepEqual(await L.ladeErinnerung(["wal"], "2026-11-12"), null, "nur Bücher mit Fragen");
  await L.merkeErinnert("katzen", 0, false, "2026-11-12");   // gezeigt
  await L.merkeErinnert("katzen", 0, true, "2026-11-12");    // beantwortet: zählt nicht doppelt
  assert.deepEqual(await L.ladeErinnerung(ids, "2026-11-12"), { id: "katzen", kapitel: 1 }, "zweite Frage am Tag, eine andere");
  await L.merkeErinnert("katzen", 1, false, "2026-11-12");   // übersprungen
  assert.equal(await L.ladeErinnerung(ids, "2026-11-12"), null, "höchstens zwei am Tag");
  assert.deepEqual(await L.ladeErinnerung(ids, "2026-11-13"), { id: "katzen", kapitel: 1 }, "übersprungen zählt nicht als gestellt");
});

test("Erinnern: alte Stände ohne Datum zählen als früher fertig", () => {
  const stand = { buecher: { wal: { kapitel: 0, seite: 0, fertig: [2] } }, sachthemen: { geschichten: { wal: {} } } };
  assert.deepEqual(L.naechsteErinnerung(stand, "2026-11-16", ["wal"]), { id: "wal", kapitel: 2 });
  assert.equal(L.naechsteErinnerung({ buecher: stand.buecher }, "2026-11-16", ["wal"]), null, "Buch nicht als gelesen gemerkt: keine Frage");
  assert.equal(L.naechsteErinnerung({ ...stand, erinnern: { am: "2026-11-16" } }, "2026-11-16", ["wal"]), null, "alter Stand von heute: heute keine mehr");
});
