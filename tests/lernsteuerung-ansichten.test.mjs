import { test } from "node:test";
import assert from "node:assert/strict";

const { gekonnteThemen, dranThemen, markiereGekonnt, startThema, neuerStand } = await import("../spiele/lernsteuerung.js");

const thema = (id, voraussetzungen, aufgaben, extra = {}) => ({
  id, name: `Name ${id}`, sprich: `Sprich ${id}`, strang: "mathe", voraussetzungen, aufgaben,
  stufen: ["kopf"], tempo: false, eltern: "", ...extra,
});
const PLAN = {
  themen: [
    thema("mengen", [], { art: "menge", bis: 5 }),                          // kein Spiel
    thema("z5", [], { art: "zerlegung", zahl: 5 }),
    thema("z7", [], { art: "zerlegung", zahl: 7 }),
    thema("z8", [], { art: "zerlegung", zahl: 8 }),
    thema("z9", [], { art: "zerlegung", zahl: 9 }),
    thema("sub", [], null, { strang: "grammatik", bereich: "Satzglieder" }), // kein Spiel, keine Aufgaben
  ],
};
const SPIELE = {
  spiele: [
    { id: "a", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["kopf"] }] },
    { id: "b", arten: [{ art: "zerlegung", zahlen: [5, 7], stufen: ["kopf"] }] },
  ],
};
const CTX = { plan: PLAN, spiele: SPIELE };

test("gekonnteThemen: nach Datum des Gekonnt-Werdens, älteste zuerst, auch ohne Spiel", () => {
  const stand = neuerStand();
  markiereGekonnt(stand, "z7", "2026-11-12");
  markiereGekonnt(stand, "mengen", "2026-11-10");
  markiereGekonnt(stand, "sub", "2026-11-11");
  markiereGekonnt(stand, "z5", "2026-11-12");
  const liste = gekonnteThemen(CTX, stand);
  assert.deepEqual(liste.map((x) => x.id), ["mengen", "sub", "z5", "z7"]); // Gleichstand: Planreihenfolge
  assert.deepEqual(liste[0], { id: "mengen", name: "Name mengen", sprich: "Sprich mengen", strang: "mathe", art: "menge", zahl: 5, seit: "2026-11-10", bereich: "" });
  assert.equal(liste[1].art, null);
  assert.equal(liste[1].zahl, null);
  assert.equal(liste[1].bereich, "Satzglieder");
  assert.equal(liste[3].zahl, 7);
});

test("gekonnteThemen: dran und unberührte Themen fehlen; leerer Stand → leer", () => {
  const stand = neuerStand();
  startThema(stand, "z8", "2026-11-12");
  assert.deepEqual(gekonnteThemen(CTX, stand), []);
  assert.deepEqual(gekonnteThemen(CTX, undefined), []);
});

test("gekonnteThemen: ohne Datum zuerst (ältester Bestand)", () => {
  const stand = neuerStand();
  markiereGekonnt(stand, "z7", "2026-11-12");
  stand.themen.z5 = { z: "kann-ich" };
  assert.deepEqual(gekonnteThemen(CTX, stand).map((x) => x.id), ["z5", "z7"]);
  assert.equal(gekonnteThemen(CTX, stand)[0].seit, "");
});

test("gekonnteThemen: Zahl aus dem Namen bei rechnen, wenn aufgaben keine nennt", () => {
  const ctx = { plan: { themen: [thema("rechnen-7", [], { art: "rechnen", thema: "rechnen-7" }, { name: "Rechnen mit der 7" })] }, spiele: { spiele: [] } };
  const stand = neuerStand();
  markiereGekonnt(stand, "rechnen-7", "2026-11-12");
  assert.equal(gekonnteThemen(ctx, stand)[0].zahl, 7);
});

test("dranThemen: nur Themen dran mit Spiel, Thema ohne Spiel fehlt", () => {
  const stand = neuerStand();
  startThema(stand, "mengen", "2026-11-10"); // dran, aber kein Spiel
  startThema(stand, "z7", "2026-11-10");
  const liste = dranThemen(CTX, stand);
  assert.deepEqual(liste.map((x) => x.id), ["z7"]);
  assert.deepEqual(liste[0], { id: "z7", name: "Name z7", sprich: "Sprich z7", strang: "mathe", spiel: "a" });
});

test("dranThemen: höchstens max (Vorgabe 3), zuletzt geübt zuerst", () => {
  const stand = neuerStand();
  for (const id of ["z5", "z7", "z8", "z9"]) startThema(stand, id, "2026-11-01");
  stand.themen.z5.u = "2026-11-05";
  stand.themen.z7.u = "2026-11-09";
  stand.themen.z8.u = "2026-11-07";
  // z9 nie geübt: zählt nach seit
  assert.deepEqual(dranThemen(CTX, stand).map((x) => x.id), ["z7", "z8", "z5"]);
  assert.deepEqual(dranThemen(CTX, stand, { max: 1 }).map((x) => x.id), ["z7"]);
  assert.equal(dranThemen(CTX, stand, { max: 10 }).length, 4);
});

test("dranThemen: zuletzt gespieltes Spiel, das das Thema bedient, sonst das erste", () => {
  const stand = neuerStand();
  startThema(stand, "z7", "2026-11-10");
  startThema(stand, "z8", "2026-11-10");
  const liste = dranThemen(CTX, stand, { zuletzt: { z7: "b", z8: "b" } }); // b bedient z8 nicht
  assert.equal(liste.find((x) => x.id === "z7").spiel, "b");
  assert.equal(liste.find((x) => x.id === "z8").spiel, "a");
});

test("dranThemen: gekonnte Themen und leerer Stand → leer", () => {
  const stand = neuerStand();
  markiereGekonnt(stand, "z7", "2026-11-12");
  assert.deepEqual(dranThemen(CTX, stand), []);
  assert.deepEqual(dranThemen(CTX, undefined), []);
});

test("gekonnteThemen: Aufgabenart ohne Zahl und ohne Ziffer im Namen → zahl null", () => {
  const ctx = { plan: { themen: [thema("zw", [], { art: "zwillinge" }, { name: "Zwillingsaufgaben" })] }, spiele: { spiele: [] } };
  const stand = neuerStand();
  markiereGekonnt(stand, "zw", "2026-11-12");
  assert.equal(gekonnteThemen(ctx, stand)[0].zahl, null);
});
