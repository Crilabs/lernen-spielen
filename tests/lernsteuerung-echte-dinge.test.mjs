import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const { echteDingeFuer, themenMitEchtenDingen, markiereGekonnt, startThema, neuerStand, zustaende } = await import("../spiele/lernsteuerung.js");

const thema = (id, voraussetzungen, aufgaben, extra = {}) => ({
  id, name: `Name ${id}`, sprich: `Sprich ${id}`, strang: "mathe", voraussetzungen, aufgaben,
  stufen: ["kopf"], tempo: false, eltern: `Eltern ${id}`, ...extra,
});
const PLAN = {
  themen: [
    thema("zaehlen", [], null),                                   // kein Spiel, keine Voraussetzung
    thema("weiter", ["zaehlen"], null),                           // kein Spiel
    thema("z5", [], { art: "zerlegung", zahl: 5 }),
    thema("z6", ["z5"], { art: "zerlegung", zahl: 6 }),
    thema("z7", ["z6"], { art: "zerlegung", zahl: 7 }),
    thema("z8", ["z7"], { art: "zerlegung", zahl: 8 }),
    thema("z9", ["z8"], { art: "zerlegung", zahl: 9 }),
    thema("a1", [], null, { strang: "lesen", eltern: "" }),
    thema("a2", [], null, { strang: "lesen" }),
    thema("a3", [], null, { strang: "lesen" }),
    thema("a4", [], null, { strang: "lesen" }),
  ],
};
const SPIELE = { spiele: [{ id: "s", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["kopf"] }] }] };
const VERZEICHNIS = { themen: {
  z7: { fach: "mathe", name: "Name z7", titel: "Die 7 in zwei Teile", entwurf: true,
    formen: [{ situation: "tisch", name: "Nudeln" }, { situation: "unterwegs", name: "Steine" }, { situation: "wolke", name: "x" }, { situation: "bewegung", name: "" }] },
  a2: { fach: "mathe", titel: "falsches Fach", formen: [] },
} };
const CTX = { plan: PLAN, spiele: SPIELE, echteDinge: VERZEICHNIS };

test("echteDingeFuer: mit Anleitung (nur gültige Formen), ohne Anleitung, falsches Fach, unbekannt", () => {
  assert.deepEqual(echteDingeFuer(CTX, "z7"), {
    id: "z7", name: "Name z7", sprich: "Sprich z7", fach: "mathe", datei: "mathe/z7.md", titel: "Die 7 in zwei Teile",
    formen: [{ situation: "tisch", wort: "Am Tisch", name: "Nudeln" }, { situation: "unterwegs", wort: "Unterwegs", name: "Steine" }],
    eltern: "Eltern z7", entwurf: true,
  });
  const ohne = echteDingeFuer(CTX, "z5");
  assert.equal(ohne.datei, null);
  assert.deepEqual(ohne.formen, []);
  assert.equal(ohne.eltern, "Eltern z5");
  assert.equal(echteDingeFuer(CTX, "a2").datei, null); // Verzeichnis sagt mathe, Thema ist lesen
  assert.equal(echteDingeFuer(CTX, "gibtsnicht"), null);
  assert.equal(echteDingeFuer({ plan: PLAN, spiele: SPIELE }, "z7").datei, null); // ohne Verzeichnis
});

test("themenMitEchtenDingen leer: nur Themen in Sicht (mit Spiel), keine Themen ohne Spiel in unberührten Fächern", () => {
  const r = themenMitEchtenDingen(CTX, neuerStand());
  assert.deepEqual(r.dran, []);
  assert.deepEqual(r.bald.map((t) => [t.id, t.zustand, t.spiel]), [["z5", "in-sicht", true]]);
  assert.deepEqual(r.wiederholen, []);
});

test("themenMitEchtenDingen: in einem begonnenen Fach das erste Thema ohne Spiel dran, höchstens eins mehr bald", () => {
  const stand = neuerStand();
  startThema(stand, "a2", "2026-11-10"); // lesen begonnen (gespeichert dran, auch ohne Spiel)
  const r = themenMitEchtenDingen(CTX, stand);
  assert.deepEqual(r.dran.map((t) => [t.id, t.zustand]), [["a1", "dran"], ["a2", "dran"]]);
  assert.deepEqual(r.bald.map((t) => t.id), ["z5", "a3"]); // mathe unberührt: kein Thema ohne Spiel; lesen: a3, nicht a4
});

test("themenMitEchtenDingen: dran mit Spiel, gekonnte zum Wiederholen (neueste zuerst, höchstens drei), schreibt nichts", () => {
  const stand = neuerStand();
  markiereGekonnt(stand, "zaehlen", "2026-11-01");
  markiereGekonnt(stand, "z5", "2026-11-03");
  markiereGekonnt(stand, "a1", "2026-11-05");
  markiereGekonnt(stand, "a2", "2026-11-04");
  markiereGekonnt(stand, "z6", "2026-11-02");
  startThema(stand, "z7", "2026-11-10");
  const vorher = JSON.stringify(stand);
  const r = themenMitEchtenDingen(CTX, stand);
  assert.equal(JSON.stringify(stand), vorher);
  assert.deepEqual(r.dran.map((t) => t.id), ["weiter", "z7", "a3"]);
  assert.equal(r.dran[1].datei, "mathe/z7.md"); // z7 hat die Anleitung
  assert.deepEqual(r.bald.map((t) => t.id), ["a4"]); // z8 braucht z7 gekonnt; a4 ist das eine weitere ohne Spiel
  assert.deepEqual(r.wiederholen.map((t) => [t.id, t.zustand]), [["a1", "kann-ich"], ["a2", "kann-ich"], ["z5", "kann-ich"]]);
  assert.equal(themenMitEchtenDingen(CTX, stand, { wiederholen: 1 }).wiederholen.length, 1);
});

test("themenMitEchtenDingen ändert die Zustände des Kindes nicht (Themen ohne Spiel bleiben dort verborgen)", () => {
  const stand = neuerStand();
  themenMitEchtenDingen(CTX, stand);
  assert.equal(zustaende(CTX, stand).zaehlen, "verborgen");
});

test("mit dem echten Lernplan und dem Entwurfs-Verzeichnis: die Beispiele haben Formen", () => {
  const plan = JSON.parse(readFileSync(new URL("../spiele/lernplan.json", import.meta.url), "utf8"));
  const echteDinge = JSON.parse(readFileSync(new URL("../spiele/mit-echten-dingen/verzeichnis-entwurf.json", import.meta.url), "utf8"));
  const ctx = { plan, spiele: { spiele: [] }, echteDinge };
  for (const id of Object.keys(echteDinge.themen)) assert.ok(echteDingeFuer(ctx, id).formen.length >= 1, id);
  const r = themenMitEchtenDingen(ctx, neuerStand());
  assert.deepEqual(r.dran, []); // ohne Lernstand ist kein Fach begonnen
  const stand = neuerStand();
  markiereGekonnt(stand, "mehr-weniger-gleich-viele", "2026-11-01");
  const m = themenMitEchtenDingen(ctx, stand);
  assert.deepEqual(m.dran.map((t) => t.fach), ["mathe"]);
  assert.ok(m.bald.length <= 1);
});
