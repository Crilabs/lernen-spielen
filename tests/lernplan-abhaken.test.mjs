// Lernplan zum Abhaken (docs/superpowers/specs/2026-11-14-lernstand-lernplan-abhaken-design.md): Eltern haken
// Themen samt Voraussetzungen ab; das „kann“ ist gemerkt (q: "eltern"), still und nie in der Wiederholung.
import { test } from "node:test";
import assert from "node:assert/strict";

const L = await import("../spiele/lernsteuerung.js");
const { mitVoraussetzungen, hakeAb, gekonnteThemen, elternThemen, zustaende, themaFuer, neueSitzung, migriereStand,
  neuerStand } = L;

const HEUTE = "2026-11-14";
const thema = (id, strang, voraussetzungen, aufgaben, extra = {}) => ({
  id, name: "Name " + id, sprich: id, strang, voraussetzungen, aufgaben, bereich: "B-" + strang,
  stufen: ["material", "vorstellung", "kopf"], ...extra,
});
const PLAN = {
  themen: [
    thema("mengen", "mathe", [], { art: "menge", bis: 5 }, { bereich: "Zahlbegriff" }),
    thema("z5", "mathe", ["mengen"], { art: "zerlegung", zahl: 5 }, { bereich: "Zerlegen" }),
    thema("z7", "mathe", ["z5", "ei"], { art: "zerlegung", zahl: 7 }, { bereich: "Zerlegen" }),
    thema("ei", "lesen", ["fehlt-im-plan"], null),       // ohne Spiel, Voraussetzung über Fächer, unbekannte Id
    thema("kreis-a", "lesen", ["kreis-b"], null),
    thema("kreis-b", "lesen", ["kreis-a"], null),
  ],
};
const SPIELE = { spiele: [
  { id: "pb", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["material", "vorstellung", "kopf"] }] },
  { id: "punkte", arten: [{ art: "menge", zahlen: [1, 5], stufen: ["kopf"] }] },
] };
const CTX = { plan: PLAN, spiele: SPIELE };
const erspielt = (k) => ({ z: "kann-ich", k, stufe: "kopf", v: [], e: "", seit: k, u: k, frei: 0 });

test("mitVoraussetzungen: transitiv, über Fächer, ohne schon gekonnte, Planreihenfolge, Zyklen und fremde Ids stören nicht", () => {
  const s = neuerStand();
  assert.deepEqual(mitVoraussetzungen(CTX, s, ["z7"]), ["mengen", "z5", "z7", "ei"]);
  s.themen.mengen = erspielt("2026-11-01");
  assert.deepEqual(mitVoraussetzungen(CTX, s, ["z7"]), ["z5", "z7", "ei"]);
  assert.deepEqual(mitVoraussetzungen(CTX, s, ["kreis-a"]), ["kreis-a", "kreis-b"]);
  assert.deepEqual(mitVoraussetzungen(CTX, s, ["mengen"]), []);
});

test("hakeAb: kann-ich mit q eltern, auch ohne Spiel, legt keine Aufgaben in die Wiederholung, erspielte bleiben erspielt", () => {
  const s = neuerStand();
  s.themen.mengen = erspielt("2026-11-01");
  const gesetzt = hakeAb(CTX, s, ["z7"], HEUTE);
  assert.deepEqual(gesetzt, ["z5", "z7", "ei"]);
  for (const id of gesetzt) assert.deepEqual({ z: s.themen[id].z, k: s.themen[id].k, q: s.themen[id].q }, { z: "kann-ich", k: HEUTE, q: "eltern" });
  assert.equal(s.themen.mengen.q, undefined);
  assert.deepEqual(s.aufgaben, {});
  const z = zustaende(CTX, s);
  assert.equal(z.ei, "kann-ich");
  assert.equal(z.z7, "kann-ich");
});

test("gekonnteThemen: vonEltern gemerkt; Eltern-kann zuerst (still), dann Erspieltes nach Datum", () => {
  const s = neuerStand();
  s.themen.z5 = erspielt("2026-11-10");
  hakeAb(CTX, s, ["ei"], HEUTE);
  const g = gekonnteThemen(CTX, s);
  assert.deepEqual(g.map((t) => [t.id, t.vonEltern]), [["ei", true], ["z5", false]]);
});

test("elternThemen: Bereich und vonEltern je Thema", () => {
  const s = neuerStand();
  hakeAb(CTX, s, ["mengen"], HEUTE);
  const m = elternThemen(CTX, s, HEUTE).flatMap((x) => x.themen).find((t) => t.id === "mengen");
  assert.equal(m.bereich, "Zahlbegriff");
  assert.equal(m.vonEltern, true);
});

test("Wiederholung übergeht Eltern-kann: kein Wiederholungsmodus nur wegen abgehakter Themen", () => {
  const s = neuerStand();
  hakeAb(CTX, s, ["z7"], HEUTE); // mengen, z5, z7 abgehakt: nichts mehr in Sicht für pb
  const wahl = themaFuer(CTX, s, "pb");
  assert.notEqual(wahl.modus, "wiederholung");
  s.themen.z5 = erspielt("2026-11-10");
  assert.equal(themaFuer(CTX, s, "pb").modus, "wiederholung");
  const sitzung = neueSitzung(CTX, s, "pb", { thema: null, modus: "wiederholung" });
  assert.ok(sitzung.max > 0);
});

test("Reparatur: q bleibt nur bei kann-ich mit q eltern", () => {
  const s = migriereStand({ version: 1, themen: {
    a: { z: "kann-ich", q: "eltern", k: HEUTE }, b: { z: "dran", q: "eltern" }, c: { z: "kann-ich", q: "anders" },
  }, aufgaben: {}, verlauf: [] });
  assert.equal(s.themen.a.q, "eltern");
  assert.equal("q" in s.themen.b, false);
  assert.equal("q" in s.themen.c, false);
});

test("alsNaechstes: je Thema dran drei folgende – erst die, die darauf aufbauen, dann die nächsten im Fach; ohne gekonnte und dran", () => {
  const { alsNaechstes } = L;
  const plan = { themen: [
    thema("a", "mathe", [], null), thema("b", "mathe", ["a"], null), thema("x", "mathe", [], null),
    thema("c", "mathe", ["a"], null), thema("d", "mathe", [], null), thema("e", "mathe", [], null), thema("l", "lesen", ["a"], null),
  ] };
  const ctx = { plan, spiele: { spiele: [] } };
  const s = neuerStand();
  s.themen.a = { z: "dran", seit: HEUTE, u: HEUTE };
  s.themen.c = erspielt("2026-11-01");
  assert.deepEqual([...alsNaechstes(ctx, s)], ["b", "l", "x"]);
  assert.deepEqual([...alsNaechstes(ctx, neuerStand())], []);
  s.themen.d = { z: "dran", seit: HEUTE, u: HEUTE };
  assert.deepEqual([...alsNaechstes(ctx, s)].sort(), ["b", "e", "l", "x"]);
});
