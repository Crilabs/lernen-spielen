import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";

const { aufgabenVon, klasseRechnen, poolRechnen, darstellbar } = await import("../spiele/aufgabenarten.js");

const lade = (pfad) => JSON.parse(readFileSync(new URL(pfad, import.meta.url), "utf8"));
const plan = lade("../spiele/lernplan.json");
const katalog = lade("../spiele/spiele.json");
const themen = plan.themen;

const hatSpiel = (katalog, thema) => {
  const aufgaben = aufgabenVon(thema.aufgaben);
  return katalog.spiele.some((s) => (s.arten ?? []).some((art) => aufgaben.some((a) => darstellbar(a, art))));
};

const zahlwoerter = "null eins ein eine einer zwei drei vier fünf sechs sieben acht neun zehn elf zwölf dreizehn vierzehn fünfzehn sechzehn siebzehn achtzehn neunzehn zwanzig hundert".split(" ");
// ganze Wörter: „Zehner“ ist kein Zahlwort
const zahlRegel = new RegExp(`(?<![\\p{L}])(${zahlwoerter.join("|")})(?![\\p{L}])`, "iu");

// Alle Plan-Prüfungen; wirft bei der ersten Verletzung. Themen mit `aufgaben: null` sind „geplant“.
function pruefePlan(plan, katalog, vorlageExistiert = (v) => existsSync(new URL(`../spiele/${v}`, import.meta.url))) {
  const themen = plan.themen;
  const kategorien = katalog.kategorien.map((k) => k.id);
  const gesehen = new Set();
  const besitzer = new Map();
  for (const t of themen) {
    assert.ok(!gesehen.has(t.id), `doppelte ID ${t.id}`);
    for (const v of t.voraussetzungen) assert.ok(gesehen.has(v), `${t.id}: Voraussetzung ${v} fehlt oder steht später`);
    gesehen.add(t.id);

    assert.ok(kategorien.includes(t.strang), `${t.id}: Strang ${t.strang}`);
    assert.ok(t.name, `${t.id} ohne name`);
    assert.ok(t.sprich, `${t.id} ohne sprich`);
    assert.doesNotMatch(t.sprich, /\d/, `${t.id}: Ziffer in sprich`);
    assert.doesNotMatch(t.sprich, zahlRegel, `${t.id}: Zahlwort in sprich`);
    assert.equal(typeof t.eltern, "string", `${t.id}: eltern fehlt`);

    const geplant = t.aufgaben === null;
    if (!geplant) {
      assert.ok(t.stufen?.length > 0, `${t.id} ohne Stufen`);
      for (const s of t.stufen) assert.ok(["material", "vorstellung", "kopf"].includes(s), `${t.id}: Stufe ${s}`);
      assert.ok(t.eltern.length > 0, `${t.id} ohne eltern`);
      const aufgaben = aufgabenVon(t.aufgaben);
      assert.ok(aufgaben.length > 0, `${t.id}: keine Aufgaben (unbekannte Art?)`);
      for (const a of aufgaben) {
        assert.ok(!besitzer.has(a.key), `${a.key} in ${besitzer.get(a.key)} und ${t.id}`);
        besitzer.set(a.key, t.id);
      }
      if (hatSpiel(katalog, t)) {
        assert.ok(t.einfuehrung?.vorlage, `${t.id} ohne Einführung`);
        assert.ok(vorlageExistiert(t.einfuehrung.vorlage), `${t.id}: Vorlage fehlt`);
      }
    } else {
      for (const s of t.stufen ?? []) assert.ok(["material", "vorstellung", "kopf"].includes(s), `${t.id}: Stufe ${s}`);
    }
  }
}

test("Plan: IDs eindeutig, Voraussetzungen existieren und stehen davor, keine Zyklen", () => {
  assert.equal(new Set(themen.map((t) => t.id)).size, themen.length);
  const gesehen = new Set();
  for (const t of themen) {
    for (const v of t.voraussetzungen) assert.ok(gesehen.has(v), `${t.id}: Voraussetzung ${v} fehlt oder steht später`);
    gesehen.add(t.id);
  }
});

test("Plan: jede Aufgabe gehört zu genau einem Thema", () => {
  const besitzer = new Map();
  for (const t of themen) {
    const aufgaben = aufgabenVon(t.aufgaben);
    assert.ok(aufgaben.length > 0, `${t.id} hat keine Aufgaben`);
    for (const a of aufgaben) {
      assert.ok(!besitzer.has(a.key), `${a.key} in ${besitzer.get(a.key)} und ${t.id}`);
      besitzer.set(a.key, t.id);
    }
  }
});

test("Plan: jedes Thema mit Spiel hat eine Einführung, deren Vorlage existiert", () => {
  for (const t of themen) {
    if (!hatSpiel(katalog, t)) continue;
    assert.ok(t.einfuehrung?.vorlage, `${t.id} ohne Einführung`);
    assert.ok(existsSync(new URL(`../spiele/${t.einfuehrung.vorlage}`, import.meta.url)), `${t.id}: Vorlage fehlt`);
  }
  assert.ok(themen.some((t) => hatSpiel(katalog, t)));
});

test("Plan: Stufen nur aus material/vorstellung/kopf, Strang aus den Kategorien von spiele.json", () => {
  pruefePlan(plan, katalog);
});

test("Plan: jedes Thema hat `sprich` ohne Ziffern und ohne Zahlwörter (null … zwanzig, hundert)", () => {
  for (const t of themen) {
    assert.ok(t.sprich && t.sprich.length > 0, `${t.id} ohne sprich`);
    assert.doesNotMatch(t.sprich, /\d/, `${t.id}: Ziffer in sprich`);
    assert.doesNotMatch(t.sprich, zahlRegel, `${t.id}: Zahlwort in sprich`);
    assert.ok(t.eltern && t.eltern.length > 0, `${t.id} ohne eltern`);
  }
});

test("Plan: deckt alle Zahlenzauber-Schlüssel bis 100 ab", () => {
  const ids = new Set(themen.map((t) => t.id));
  for (const id of new Set(poolRechnen().map(klasseRechnen))) assert.ok(ids.has(id), `Thema ${id} fehlt`);
});

test("Plan: geplantes Thema (aufgaben null) wird akzeptiert, unbekannte Art nicht", () => {
  const kat = { kategorien: [{ id: "mathe" }], spiele: [] };
  const basis = { id: "a", name: "A", sprich: "Anfang", strang: "mathe", voraussetzungen: [], eltern: "" };
  const geplant = { id: "b", name: "Die 5 kommt", sprich: "Bald", strang: "mathe", voraussetzungen: ["a"], aufgaben: null, eltern: "" };
  const ersteAufgabe = { ...basis, aufgaben: { art: "menge", bis: 3 }, stufen: ["kopf"], eltern: "Hinweis" };
  pruefePlan({ themen: [ersteAufgabe, geplant] }, kat);
  assert.throws(() => pruefePlan({ themen: [{ ...ersteAufgabe, aufgaben: { art: "gibt-es-nicht" } }] }, kat));
});
