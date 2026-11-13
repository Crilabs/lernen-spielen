import { test } from "node:test";
import assert from "node:assert/strict";

const { pinHash, pinPruefen, pruefeUpdate } = await import("../spiele/eltern.js");

test("pinHash ist stabil", async () => {
  const a = await pinHash("1234");
  assert.equal(a, await pinHash("1234"));
  assert.match(a, /^[0-9a-f]{64}$/);
  assert.notEqual(a, await pinHash("1235"));
});

test("pinPruefen", async () => {
  const h = await pinHash("1234");
  assert.equal(await pinPruefen("1234", h), true);
  assert.equal(await pinPruefen("0000", h), false);
  assert.equal(await pinPruefen("1234", undefined), false);
});

test("pruefeUpdate meldet offline", async () => {
  const r = await pruefeUpdate(async () => { throw new Error("error sending request"); });
  assert.deepEqual(r, { status: "offline" });
});

test("pruefeUpdate meldet aktuell", async () => {
  assert.deepEqual(await pruefeUpdate(async () => null), { status: "aktuell" });
});

test("pruefeUpdate meldet neu", async () => {
  const update = { version: "0.2.0", body: "Neu: Dinge" };
  const r = await pruefeUpdate(async () => update);
  assert.deepEqual(r, { status: "neu", version: "0.2.0", notiz: "Neu: Dinge", update });
});

test("pruefeUpdate ohne App", async () => {
  assert.deepEqual(await pruefeUpdate(undefined), { status: "kein-app" });
});

test("pruefeUpdate hängt nicht (Zeitlimit)", async () => {
  const r = await pruefeUpdate(() => new Promise(() => {}), 20);
  assert.deepEqual(r, { status: "offline" });
});

// ---------- Elternbereich: Themen, Lücken, Eingriffe (lernsteuerung.js) ----------

const L = await import("../spiele/lernsteuerung.js");
const { elternThemen, markiereGekonnt, setzeZurueck, gibFrei, aufgabeLesbar, zustaende, neuerStand } = L;

const HEUTE = "2026-11-13";
const thema = (id, strang, voraussetzungen, aufgaben, extra = {}) => ({
  id, name: "Name " + id, sprich: id, strang, voraussetzungen, aufgaben,
  stufen: ["material", "vorstellung", "kopf"], eltern: "Hinweis " + id, ...extra,
});
const PLAN = {
  themen: [
    thema("mengen", "mathe", [], { art: "menge", bis: 5 }),          // teilweise (nur 1–3 darstellbar)
    thema("z5", "mathe", ["mengen"], { art: "zerlegung", zahl: 5 }),
    thema("z7", "mathe", ["z5"], { art: "zerlegung", zahl: 7 }),
    thema("r7", "mathe", ["z7"], { art: "rechnen", thema: "rechnen-7" }, { stufen: ["kopf"] }),
    thema("ei", "lesen", [], null),                                   // geplant, ohne Spiel
  ],
};
const SPIELE = {
  spiele: [
    { id: "pb", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["material", "vorstellung", "kopf"] }] },
    { id: "zz", arten: [{ art: "rechnen", max: 100, gleiche: false, stufen: ["kopf"] }] },
    { id: "punkte", arten: [{ art: "menge", zahlen: [1, 3], stufen: ["kopf"] }] },
  ],
};
const CTX = { plan: PLAN, spiele: SPIELE };
const ZERL7 = ["zerl:7:1+6", "zerl:7:2+5", "zerl:7:3+4", "zerl:7:4+3", "zerl:7:5+2", "zerl:7:6+1"];
const finde = (liste, id) => liste.flatMap((s) => s.themen).find((t) => t.id === id);

test("elternThemen: je Strang in Planreihenfolge, alle Themen samt verborgenen, Lücken markiert", () => {
  const l = elternThemen(CTX, neuerStand(), HEUTE);
  assert.deepEqual(l.map((s) => s.strang), ["mathe", "lesen"]);
  assert.deepEqual(l[0].themen.map((t) => t.id), ["mengen", "z5", "z7", "r7"]);
  assert.deepEqual(l[1].themen.map((t) => t.id), ["ei"]);
  const ei = finde(l, "ei"), mengen = finde(l, "mengen"), z7 = finde(l, "z7");
  assert.equal(ei.luecke, "ohne-spiel");
  assert.equal(ei.zustand, "verborgen");
  assert.equal(mengen.luecke, "teilweise");
  assert.equal(z7.luecke, null);
  assert.equal(z7.zustand, "verborgen");
  assert.equal(z7.name, "Name z7");
  assert.equal(z7.hinweis, "Hinweis z7");
  assert.deepEqual(z7.wackelig, []);
  assert.equal(z7.geradeDran, false);
  assert.equal(z7.stufe, "");
});

test("elternThemen: geradeDran nur bei dran und seit höchstens 7 Tagen", () => {
  const s = neuerStand();
  s.themen.mengen = { z: "kann-ich", k: "2026-11-01", stufe: "kopf" };
  s.themen.z5 = { z: "dran", seit: "2026-11-06", stufe: "vorstellung" }; // genau 7 Tage
  s.themen.z7 = { z: "dran", seit: "2026-11-05", stufe: "material" };    // 8 Tage
  const l = elternThemen(CTX, s, HEUTE);
  assert.equal(finde(l, "z5").geradeDran, true);
  assert.equal(finde(l, "z5").stufe, "vorstellung");
  assert.equal(finde(l, "z7").geradeDran, false);
  assert.equal(finde(l, "mengen").geradeDran, false);
  s.themen.z7.seit = "";
  assert.equal(finde(elternThemen(CTX, s, HEUTE), "z7").geradeDran, false);
});

test("elternThemen: wackelig = gesehene Aufgaben eines gekonnten oder dran-Themas, zuletzt nicht sauber oder in Fach 0", () => {
  const s = neuerStand();
  s.themen.z5 = { z: "kann-ich", k: HEUTE, stufe: "kopf" };
  s.aufgaben["zerl:5:1+4"] = { f: 0, t: HEUTE, h: [1, 0], ms: [] };   // wackelig: zuletzt falsch
  s.aufgaben["zerl:5:2+3"] = { f: 1, t: HEUTE, h: [1], ms: [] };      // Fach 1 nach Probe, zuletzt richtig: nicht wackelig
  s.aufgaben["zerl:5:3+2"] = { f: 1, t: HEUTE, h: [], ms: [] };       // nie gesehen (nur eingestuft)
  s.aufgaben["zerl:5:4+1"] = { f: 0, t: HEUTE, h: [1], ms: [] };      // wackelig: Fach 0 nach einer Antwort (z. B. mit Hilfe)
  // Thema in Sicht: Einträge zählen nicht
  s.aufgaben["zerl:7:3+4"] = { f: 0, t: HEUTE, h: [0], ms: [] };
  s.aufgaben["zerl:7:2+5"] = { f: 2, t: HEUTE, h: [0, 1, 1], ms: [] }; // sitzt
  let l = elternThemen(CTX, s, HEUTE);
  assert.deepEqual(finde(l, "z5").wackelig, ["zerl:5:1+4", "zerl:5:4+1"]);
  assert.deepEqual(finde(l, "z7").wackelig, []);
  s.themen.z7 = { z: "dran", seit: HEUTE, stufe: "material" };
  l = elternThemen(CTX, s, HEUTE);
  assert.deepEqual(finde(l, "z7").wackelig, ["zerl:7:3+4"]);
});

test("aufgabeLesbar", () => {
  assert.equal(aufgabeLesbar("zerl:7:3+4"), "7 = 3 + 4");
  assert.equal(aufgabeLesbar("plus:3+4"), "3 + 4");
  assert.equal(aufgabeLesbar("minus:7-4"), "7 − 4");
  assert.equal(aufgabeLesbar("menge:5"), "5");
  assert.equal(aufgabeLesbar("wort:Hund"), "wort:Hund");
});

test("markiereGekonnt: kann ich, k = heute, ungesehene Aufgaben in Fach 1, Probe erledigt", () => {
  const s = neuerStand();
  s.themen.z7 = { z: "dran", seit: "2026-11-01", stufe: "material", e: "2026-11-01", k: "", frei: 0, v: [1, 0], p: 1 };
  s.aufgaben["zerl:7:1+6"] = { f: 0, t: "2026-11-02", h: [0], ms: [] };
  s.aufgaben["zerl:7:2+5"] = { f: 3, t: "2026-11-02", h: [1], ms: [] };
  markiereGekonnt(s, "z7", HEUTE, CTX);
  const t = s.themen.z7;
  assert.equal(t.z, "kann-ich");
  assert.equal(t.k, HEUTE);
  assert.equal(t.stufe, "kopf");
  assert.equal("p" in t, false);
  assert.equal(t.e, "2026-11-01");
  assert.equal(zustaende(CTX, s).z7, "kann-ich");
  for (const k of ZERL7) assert.ok(s.aufgaben[k].f >= 1, k);
  assert.deepEqual(s.aufgaben["zerl:7:1+6"], { f: 1, t: HEUTE, h: [0], ms: [] });
  assert.equal(s.aufgaben["zerl:7:2+5"].f, 3);
  assert.equal(s.aufgaben["zerl:7:2+5"].t, "2026-11-02");
  // ohne Eintrag im Stand (Thema in Sicht) und ohne ctx: nur der Themen-Eintrag
  const s2 = neuerStand();
  markiereGekonnt(s2, "z5", HEUTE);
  assert.equal(s2.themen.z5.z, "kann-ich");
  assert.deepEqual(s2.aufgaben, {});
});

test("setzeZurueck: Themen-Eintrag weg, Aufgaben des Themas in Fach 0 ohne kk und g, Verlauf bleibt", () => {
  const s = neuerStand();
  s.themen.z5 = { z: "kann-ich", k: "2026-11-01", stufe: "kopf" };
  s.themen.z7 = { z: "kann-ich", k: HEUTE, stufe: "kopf", frei: 1 };
  s.aufgaben["zerl:7:3+4"] = { f: 4, t: "2026-11-02", h: [1, 1], ms: [900], g: 1, kk: 1 };
  s.aufgaben["zerl:5:1+4"] = { f: 3, t: "2026-11-02", h: [1], ms: [], kk: 1 };
  setzeZurueck(CTX, s, "z7");
  assert.equal("z7" in s.themen, false);
  assert.deepEqual(s.aufgaben["zerl:7:3+4"], { f: 0, t: "2026-11-02", h: [1, 1], ms: [900] });
  assert.equal(s.aufgaben["zerl:7:1+6"], undefined); // ohne Eintrag bleibt ohne Eintrag (Fach 0)
  assert.deepEqual(s.aufgaben["zerl:5:1+4"], { f: 3, t: "2026-11-02", h: [1], ms: [], kk: 1 }); // anderes Thema unberührt
  assert.equal(s.themen.z5.z, "kann-ich");
  assert.equal(zustaende(CTX, s).z7, "in-sicht");
});

test("gibFrei: verborgenes Thema kommt in Sicht, gilt aber nicht als erfüllte Voraussetzung", () => {
  const s = neuerStand();
  assert.equal(zustaende(CTX, s).z7, "verborgen");
  gibFrei(s, "z7");
  assert.equal(s.themen.z7.frei, 1);
  const z = zustaende(CTX, s);
  assert.equal(z.z7, "in-sicht");
  assert.equal(z.r7, "verborgen");
  // vorhandener Eintrag bleibt erhalten
  s.themen.r7 = { u: "2026-11-02" };
  gibFrei(s, "r7");
  assert.deepEqual(s.themen.r7, { u: "2026-11-02", frei: 1 });
  // Plan und Spiele werden nie verändert
  assert.equal(PLAN.themen[2].frei, undefined);
});
