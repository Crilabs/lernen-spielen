// Auswahl der Karten auf der Startseite (spiele/start/auswahl.js), Spec 2026-11-14-startseite-karten-design.md §3.1.
import { test } from "node:test";
import assert from "node:assert/strict";

const auswahl = await import("../spiele/start/auswahl.js");
const { neuerStand, markiereGekonnt, startThema, uebersicht } = await import("../spiele/lernsteuerung.js");
const startKarten = (ctx, stand, heute) => auswahl.startKarten(uebersicht(ctx, stand), ctx, stand, heute);

const thema = (id, extra = {}) => ({
  id, name: `Name ${id}`, sprich: `Sprich ${id}`, strang: "mathe", voraussetzungen: [],
  aufgaben: { art: "zerlegung", zahl: Number(id.replace(/\D/g, "")) || 2 }, stufen: ["kopf"], tempo: false, eltern: "", ...extra,
});
const spiel = (id, zahlen, extra = {}) => ({ id, titel: `Spiel ${id}`, kategorie: "mathe", datei: `${id}.html`, symbol: `symbole/${id}.svg`,
  arten: [{ art: "zerlegung", zahlen, stufen: ["kopf"] }], ...extra });
const KAT = [{ id: "mathe", name: "Mathe" }, { id: "lesen", name: "Lesen" }];
const ctxMit = (themen, spiele) => ({ plan: { themen }, spiele: { kategorien: KAT, spiele } });

test("startKarten: ohne Spiele oder Lernstand leer", () => {
  assert.deepEqual(startKarten(ctxMit([thema("z2")], []), neuerStand(), "2026-11-14"), []);
});

test("startKarten: dran vor in Sicht vor gekonnt; jedes Spiel nur einmal mit dem wichtigsten Thema", () => {
  const themen = [thema("z2"), thema("z3"), thema("z4"), thema("z5")];
  const spiele = [spiel("nurGekonnt", [2, 2]), spiel("sicht", [4, 4]), spiel("dran", [3, 3]), spiel("beides", [2, 3])];
  const stand = neuerStand();
  markiereGekonnt(stand, "z2", "2026-11-10");
  startThema(stand, "z3", "2026-11-13");
  const k = startKarten(ctxMit(themen, spiele), stand, "2026-11-14");
  assert.equal(k.length, 1);
  assert.equal(k[0].fach, "mathe");
  const ids = k[0].spiele.map((s) => s.spiel.id);
  assert.deepEqual(ids.slice(0, 2).sort(), ["beides", "dran"]);      // beide mit Thema dran
  assert.equal(ids[2], "sicht");
  assert.equal(ids[3], "nurGekonnt");
  assert.equal(new Set(ids).size, ids.length);
  assert.equal(k[0].spiele.find((s) => s.spiel.id === "beides").thema.id, "z3"); // das dran-Thema, nicht das gekonnte
});

test("startKarten: höchstens 5 Spiele je Fach", () => {
  const themen = [thema("z2")];
  const spiele = [1, 2, 3, 4, 5, 6, 7].map((i) => spiel(`s${i}`, [2, 2]));
  const stand = neuerStand();
  startThema(stand, "z2", "2026-11-13");
  assert.equal(startKarten(ctxMit(themen, spiele), stand, "2026-11-14")[0].spiele.length, 5);
});

test("startKarten: nur gekonnte Spiele fallen nach 14 Tagen heraus", () => {
  const themen = [thema("z2")];
  const stand = neuerStand();
  markiereGekonnt(stand, "z2", "2026-11-01");
  const ctx = ctxMit(themen, [spiel("a", [2, 2])]);
  assert.equal(startKarten(ctx, stand, "2026-11-15")[0].spiele.length, 1);   // 14 Tage: bleibt
  assert.deepEqual(startKarten(ctx, stand, "2026-11-16"), []);               // 15 Tage: fällt heraus
});

test("startKarten: Mit echten Dingen nur für Themen dran mit Anleitung, höchstens 2 je Fach", () => {
  const themen = ["z2", "z3", "z4", "z5"].map((id) => thema(id, { eltern: id === "z5" ? "" : `Anleitung ${id}` }));
  const stand = neuerStand();
  for (const id of ["z2", "z3", "z4", "z5"]) startThema(stand, id, "2026-11-13");
  const k = startKarten(ctxMit(themen, [spiel("a", [2, 5])]), stand, "2026-11-14");
  assert.equal(k[0].echt.length, 2);
  assert.ok(k[0].echt.every((e) => e.thema.eltern.startsWith("Anleitung")));
});

test("startKarten: Fächer in der Reihenfolge der Kategorien", () => {
  const themen = [thema("w1", { strang: "lesen", aufgaben: { art: "zerlegung", zahl: 9 } }), thema("z2")];
  const spiele = [spiel("l", [9, 9], { kategorie: "lesen" }), spiel("m", [2, 2])];
  const stand = neuerStand();
  startThema(stand, "w1", "2026-11-13");
  startThema(stand, "z2", "2026-11-13");
  assert.deepEqual(startKarten(ctxMit(themen, spiele), stand, "2026-11-14").map((f) => f.fach), ["mathe", "lesen"]);
});
