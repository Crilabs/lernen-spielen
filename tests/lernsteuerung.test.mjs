import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../spiele/lernsteuerung.js");
const { aufgabenVon } = await import("../spiele/aufgabenarten.js");
const {
  K, neuerStand, migriereStand, bedient, spieleFuer, zustaende, sichtbar, themaFuer, startThema,
  probeAufgaben, neueSitzung, naechstesAngebot, verbucheErgebnis, luecken, migriereSpiele, faellig, tage,
} = L;

// Reproduzierbarer Zufall
const lcg = (seed) => { let s = seed >>> 0 || 1; return () => (s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32; };
const HEUTE = "2026-11-13";
const JETZT = 1_000_000;

// ---------- Fixture: vier Themen, zwei Spiele ----------
const thema = (id, voraussetzungen, aufgaben, extra = {}) => ({
  id, name: id, sprich: id, strang: "mathe", voraussetzungen, aufgaben,
  stufen: ["material", "vorstellung", "kopf"], einfuehrung: { vorlage: "einfuehrungen/x.json" }, tempo: true, eltern: "",
  ...extra,
});
const PLAN = {
  themen: [
    thema("mengen", [], { art: "menge", bis: 5 }, { einfuehrung: undefined }), // kein Spiel
    thema("z5", ["mengen"], { art: "zerlegung", zahl: 5 }, { familie: "zahl-5" }),
    thema("z7", ["z5"], { art: "zerlegung", zahl: 7 }, { familie: "zahl-7" }),
    thema("r7", ["z7"], { art: "rechnen", thema: "rechnen-7" }, { familie: "zahl-7", stufen: ["kopf"] }),
  ],
};
const SPIELE = {
  spiele: [
    { id: "pb", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["material", "vorstellung", "kopf"] }] },
    { id: "zz", arten: [{ art: "rechnen", max: 100, gleiche: false, stufen: ["kopf"] }] },
    { id: "ohne" },
  ],
};
const CTX = { plan: PLAN, spiele: SPIELE };
// Variante: ein Spiel, das nur Mengen bis 3 darstellt (Mengen 4 und 5 bleiben ohne Spiel)
const CTX_PUNKTE = {
  plan: PLAN,
  spiele: { spiele: [...SPIELE.spiele, { id: "punkte", arten: [{ art: "menge", zahlen: [1, 3], stufen: ["kopf"] }] }] },
};
const ECHT = {
  plan: JSON.parse(readFileSync(new URL("../spiele/lernplan.json", import.meta.url))),
  spiele: JSON.parse(readFileSync(new URL("../spiele/spiele.json", import.meta.url))),
};

const ZERL7 = ["zerl:7:1+6", "zerl:7:2+5", "zerl:7:3+4", "zerl:7:4+3", "zerl:7:5+2", "zerl:7:6+1"];
const sauber = { ok: true, hilfe: 0, ms: 1000, heute: HEUTE };
const falsch = { ok: false, hilfe: 0, ms: 1000, heute: HEUTE };
const opt = { jetzt: JETZT, heute: HEUTE };

// Sitzung für ein Thema, das schon geübt wird (keine Probe)
function uebend(ctx, spiel, id, stufe, rnd = lcg(1)) {
  const stand = neuerStand();
  stand.themen[id] = { z: "dran", stufe, e: HEUTE, seit: HEUTE, k: "", frei: 0, v: [] };
  const sitzung = neueSitzung(ctx, stand, spiel, { thema: id, modus: "thema" }, { jetzt: JETZT, rnd });
  return { stand, sitzung };
}

test("K: feste Werte", () => {
  assert.deepEqual(K, { ABSTAND: [0, 1, 3, 7, 21], GELERNT: 4, IN_SICHT: 2, PROBE: 5, PROBE_SCHWER: 2, AUF_FENSTER: 5,
    AUF_OK: 4, AB_FEHLER: 2, ANTEIL_THEMA: 0.7, WIEDER_NACH: [2, 4], RUNDE_MS: 240000 });
  assert.deepEqual(neuerStand(), { version: 1, themen: {}, aufgaben: {}, verlauf: [] });
});

// ---------- Zustände und Sichtbarkeit ----------
test("zustaende: frischer Stand – erstes Thema mit Spiel in Sicht, Thema ohne Spiel blockiert nicht", () => {
  assert.deepEqual(zustaende(CTX, neuerStand()), { mengen: "verborgen", z5: "in-sicht", z7: "verborgen", r7: "verborgen" });
  assert.deepEqual(spieleFuer(CTX, "mengen"), []);
  assert.deepEqual(spieleFuer(CTX, "z7"), ["pb"]);
  assert.equal(bedient(CTX, "zz", "r7"), true);
  assert.equal(bedient(CTX, "pb", "r7"), false);
  assert.equal(bedient(CTX, "ohne", "z5"), false);
  // Geplantes Thema (aufgaben: null) gilt wie ein Thema ohne Spiel
  const plan = { themen: [thema("geplant", [], null), thema("a", ["geplant"], { art: "zerlegung", zahl: 4 })] };
  assert.deepEqual(zustaende({ plan, spiele: SPIELE }, neuerStand()), { geplant: "verborgen", a: "in-sicht" });
});

test("sichtbar: höchstens zwei in Sicht je Strang, verborgene fehlen", () => {
  const plan = { themen: PLAN.themen.map((t) => ({ ...t, voraussetzungen: [] })) };
  const ctx = { plan, spiele: SPIELE };
  assert.deepEqual(sichtbar(ctx, neuerStand()), { mathe: ["z5", "z7"] });
  // gekonnte und dran zählen nicht gegen die Grenze
  const s = neuerStand();
  s.themen.z5 = { z: "kann-ich" };
  s.themen.z7 = { z: "dran" };
  assert.deepEqual(sichtbar(ctx, s), { mathe: ["z5", "z7", "r7"] });
  assert.deepEqual(sichtbar(CTX, neuerStand()), { mathe: ["z5"] });
  // Freigabe durch die Eltern
  const f = neuerStand();
  f.themen.z7 = { frei: 1 };
  assert.equal(zustaende(CTX, f).z7, "in-sicht");
  assert.equal(zustaende(CTX, f).r7, "in-sicht"); // freigegebene Voraussetzung gilt als erfüllt
});

test("zustaende: neues Thema vor gekonnten eingefügt – gekonnte bleiben gekonnt", () => {
  const s = neuerStand();
  s.themen.z5 = { z: "kann-ich", k: HEUTE };
  s.themen.z7 = { z: "kann-ich", k: HEUTE };
  const t = PLAN.themen;
  const plan = { themen: [t[0], t[1], thema("z6", ["z5"], { art: "zerlegung", zahl: 6 }), { ...t[2], voraussetzungen: ["z6"] }, t[3]] };
  assert.deepEqual(zustaende({ plan, spiele: SPIELE }, s),
    { mengen: "verborgen", z5: "kann-ich", z6: "in-sicht", z7: "kann-ich", r7: "in-sicht" });
});

test("migriereStand: kaputt, null, Array, unbekannte Themen und Schlüssel bleiben erhalten", () => {
  for (const roh of [null, undefined, "x", 5, [], [1, 2]]) assert.deepEqual(migriereStand(roh), neuerStand());
  const leer = migriereStand({ themen: [], aufgaben: "kaputt", verlauf: {} });
  assert.deepEqual(leer.themen, {}); assert.deepEqual(leer.aufgaben, {}); assert.deepEqual(leer.verlauf, []);
  assert.equal(leer.version, 1);
  const s = migriereStand({
    version: 1, wahl: "z5", extra: { a: 1 }, migriert: 1,
    themen: { unbekannt: { z: "dran", foo: 1 }, z5: { z: "quatsch", stufe: 3, v: [1, 0, "x", 1, 1, 1, 1] }, z7: "kaputt", r7: null },
    aufgaben: { "x:1": { f: 9, t: 5, zusatz: 1 }, "zerl:7:2+5": { f: -2, t: HEUTE, h: "x", ms: [100, "y"], g: 1, kk: 1 }, kaputt: 3 },
    verlauf: [1],
  });
  assert.equal(s.wahl, "z5"); assert.deepEqual(s.extra, { a: 1 }); assert.equal(s.migriert, 1);
  assert.equal(s.themen.unbekannt.z, "dran"); assert.equal(s.themen.unbekannt.foo, 1);
  assert.equal(s.themen.z5.z, undefined); assert.equal(s.themen.z5.stufe, "");
  assert.deepEqual(s.themen.z5.v, [0, 1, 1, 1, 1]); // nur 0/1, höchstens AUF_FENSTER
  assert.equal(s.themen.z7, undefined); assert.equal(s.themen.r7, undefined);
  assert.deepEqual(s.aufgaben["x:1"], { f: 4, t: "", h: [], ms: [], zusatz: 1 });
  assert.deepEqual(s.aufgaben["zerl:7:2+5"], { f: 0, t: HEUTE, h: [], ms: [100], g: 1, kk: 1 });
  assert.equal(s.aufgaben.kaputt, undefined);
  assert.deepEqual(s.verlauf, [1]);
  // Zustand eines unbekannten Themas stört die Berechnung nicht
  assert.equal(zustaende(CTX, s).z5, "in-sicht");
});

// ---------- Welches Thema bekommt ein Spiel? ----------
test("themaFuer: Wunsch nur, wenn sichtbar und bedient; unbekannt/verborgen → normale Wahl", () => {
  const s = neuerStand();
  const f = (spiel, wunsch) => themaFuer(CTX, s, spiel, { wunsch, heute: HEUTE });
  assert.deepEqual(f("pb", "z5"), { thema: "z5", modus: "thema" });
  for (const w of ["z7", "r7", "gibt-es-nicht", "mengen", null, undefined]) assert.deepEqual(f("pb", w), { thema: "z5", modus: "thema" });
  // Gekonntes Thema als Wunsch → Wiederholung dieses Themas
  s.themen.z5 = { z: "kann-ich", k: HEUTE };
  assert.deepEqual(f("pb", "z5"), { thema: "z5", modus: "wiederholung" });
  // sichtbar, aber vom Spiel nicht bedient
  assert.deepEqual(f("zz", "z7"), { thema: "r7", modus: "vorgriff" });
});

test("themaFuer: dran zuerst (am längsten nicht geübt), in Sicht nur ohne dran im Strang", () => {
  const s = neuerStand();
  s.themen.z5 = { z: "dran", seit: "2026-11-10", u: "2026-11-12" };
  s.themen.z7 = { z: "dran", seit: "2026-11-11", u: "2026-11-11" };
  assert.deepEqual(themaFuer(CTX, s, "pb", { heute: HEUTE }), { thema: "z7", modus: "thema" });
  // r7 ist in Sicht (z7 freigegeben), aber im Strang ist schon ein Thema dran → Vorgriff statt neues Thema
  const t = neuerStand();
  t.themen.z5 = { z: "dran" };
  t.themen.z7 = { z: "kann-ich" };
  assert.equal(zustaende(CTX, t).r7, "in-sicht");
  assert.deepEqual(themaFuer(CTX, t, "zz", { heute: HEUTE }), { thema: "r7", modus: "vorgriff" });
  t.themen.z5 = { z: "kann-ich" };
  assert.deepEqual(themaFuer(CTX, t, "zz", { heute: HEUTE }), { thema: "r7", modus: "thema" });
});

test("themaFuer: Zahlenzauber bei frischem Stand → vorgriff rechnen-3", () => {
  assert.deepEqual(themaFuer(ECHT, neuerStand(), "zahlenzauber", { heute: HEUTE }), { thema: "rechnen-3", modus: "vorgriff" });
  assert.deepEqual(themaFuer(ECHT, neuerStand(), "perlenbruecke", { heute: HEUTE }), { thema: "zerlegen-2", modus: "thema" });
});

test("themaFuer: alles gekonnt → wiederholung", () => {
  const s = neuerStand();
  for (const t of PLAN.themen) s.themen[t.id] = { z: "kann-ich", k: HEUTE };
  assert.deepEqual(themaFuer(CTX, s, "pb", { heute: HEUTE }), { thema: null, modus: "wiederholung" });
  assert.deepEqual(themaFuer(CTX, s, "zz", { heute: HEUTE }), { thema: null, modus: "wiederholung" });
  const w = neueSitzung(CTX, s, "pb", { thema: null, modus: "wiederholung" }, { jetzt: JETZT, max: 20, rnd: lcg(3) });
  let n = 0;
  for (let a; (a = naechstesAngebot(CTX, s, w, lcg(n + 1), opt)); n++) {
    assert.equal(a.stufe, "kopf");
    assert.ok(a.ziel.key.startsWith("zerl:"));
    verbucheErgebnis(CTX, s, w, a.ziel.key, sauber);
  }
  assert.equal(n, 8); // Rundenlänge min(max ?? 8, 8)
});

// ---------- Probe ----------
test("Probe: 5 Aufgaben, die 2 schwersten dabei, auch leer; alles sauber → gekonnt-Ereignis, alle Aufgaben Fach 1", () => {
  for (let seed = 1; seed <= 10; seed++) {
    const p = probeAufgaben(CTX, "z7", "pb", lcg(seed));
    assert.equal(p.length, K.PROBE); assert.equal(new Set(p).size, K.PROBE);
    assert.ok(p.includes("zerl:7:3+4") && p.includes("zerl:7:4+3"));
  }
  assert.deepEqual(probeAufgaben(CTX, "z7", "zz", lcg(1)), []); // Spiel bedient das Thema nicht
  const s = neuerStand();
  startThema(s, "z7", HEUTE);
  assert.equal(s.themen.z7.z, "dran"); assert.equal(s.themen.z7.seit, HEUTE);
  const sitz = neueSitzung(CTX, s, "pb", { thema: "z7", modus: "thema" }, { jetzt: JETZT, rnd: lcg(2) });
  assert.equal(sitz.probe.length, K.PROBE); assert.equal(sitz.stufe, "kopf");
  let ereignis = null, n = 0;
  for (let a; (a = naechstesAngebot(CTX, s, sitz, lcg(n + 7), opt)); n++) {
    assert.deepEqual(a.auch, []); assert.equal(a.stufe, "kopf");
    ereignis = verbucheErgebnis(CTX, s, sitz, a.ziel.key, sauber);
  }
  assert.equal(n, K.PROBE);
  assert.deepEqual(ereignis, { typ: "gekonnt", thema: "z7" });
  assert.equal(s.themen.z7.z, "kann-ich"); assert.equal(s.themen.z7.k, HEUTE);
  for (const k of ZERL7) { assert.equal(s.aufgaben[k].f, 1, k); assert.equal(s.aufgaben[k].t, HEUTE); }
});

test("Probe: erster Fehler beendet Probe, Stufe material in der Perlenbrücke", () => {
  const s = neuerStand();
  startThema(s, "z7", HEUTE);
  const sitz = neueSitzung(CTX, s, "pb", { thema: "z7", modus: "thema" }, { jetzt: JETZT, rnd: lcg(2) });
  const a = naechstesAngebot(CTX, s, sitz, lcg(1), opt);
  assert.equal(verbucheErgebnis(CTX, s, sitz, a.ziel.key, sauber), null);
  const b = naechstesAngebot(CTX, s, sitz, lcg(1), opt);
  assert.deepEqual(verbucheErgebnis(CTX, s, sitz, b.ziel.key, { ...falsch, rnd: lcg(1) }), { typ: "stufe", stufe: "material" });
  assert.equal(sitz.probe, null); assert.equal(sitz.stufe, "material");
  assert.equal(s.themen.z7.stufe, "material"); assert.equal(s.themen.z7.z, "dran");
  assert.equal(s.aufgaben[b.ziel.key].f, 0);
  const c = naechstesAngebot(CTX, s, sitz, lcg(1), opt);
  assert.equal(c.stufe, "material"); assert.ok(c.auch.length > 0);
  // Hilfe beendet die Probe ebenso; im Zahlenzauber ist die niedrigste Stufe kopf → kein Stufen-Ereignis
  const t = neuerStand();
  startThema(t, "r7", HEUTE);
  const z = neueSitzung(CTX, t, "zz", { thema: "r7", modus: "vorgriff" }, { jetzt: JETZT, rnd: lcg(2) });
  const d = naechstesAngebot(CTX, t, z, lcg(1), opt);
  assert.equal(verbucheErgebnis(CTX, t, z, d.ziel.key, { ...sauber, hilfe: 1 }), null);
  assert.equal(z.probe, null); assert.equal(t.themen.r7.stufe, "kopf");
  // Ein Spiel ohne kopf macht keine Probe
  const ctx = { plan: PLAN, spiele: { spiele: [{ id: "nurmat", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["material"] }] }] } };
  const u = neuerStand();
  startThema(u, "z7", HEUTE);
  const m = neueSitzung(ctx, u, "nurmat", { thema: "z7", modus: "thema" }, { jetzt: JETZT, rnd: lcg(2) });
  assert.equal(m.probe, null); assert.equal(m.stufe, "material");
});

test("Probe: mühsam (ms > ZIEL_MS) bei tempo-Thema zählt als nicht bestanden", () => {
  const s = neuerStand();
  startThema(s, "z7", HEUTE);
  const sitz = neueSitzung(CTX, s, "pb", { thema: "z7", modus: "thema" }, { jetzt: JETZT, rnd: lcg(2) });
  const a = naechstesAngebot(CTX, s, sitz, lcg(1), opt);
  assert.equal(verbucheErgebnis(CTX, s, sitz, a.ziel.key, { ...sauber, ms: 8000 }), null); // genau Zielzeit: gut
  const b = naechstesAngebot(CTX, s, sitz, lcg(1), opt);
  assert.deepEqual(verbucheErgebnis(CTX, s, sitz, b.ziel.key, { ...sauber, ms: 8001 }), { typ: "stufe", stufe: "material" });
  assert.equal(s.aufgaben[b.ziel.key].kk, undefined);
  assert.equal(s.aufgaben[b.ziel.key].f, 0); // mühsam: kein Aufstieg
  // ohne tempo zählt mühsam in der Probe nicht
  const plan = { themen: PLAN.themen.map((t) => (t.id === "z7" ? { ...t, tempo: false } : t)) };
  const ctx = { plan, spiele: SPIELE };
  const t = neuerStand();
  startThema(t, "z7", HEUTE);
  const z = neueSitzung(ctx, t, "pb", { thema: "z7", modus: "thema" }, { jetzt: JETZT, rnd: lcg(2) });
  const c = naechstesAngebot(ctx, t, z, lcg(1), opt);
  assert.equal(verbucheErgebnis(ctx, t, z, c.ziel.key, { ...sauber, ms: 60000 }), null);
  assert.equal(z.probe.length, K.PROBE - 1);
});

// ---------- Stufen ----------
test("Stufen: 4 von 5 → Aufstieg, 2 Fehler in Folge → Abstieg, nie über die Stufen des Spiels", () => {
  const { stand: s, sitzung: sitz } = uebend(CTX, "pb", "z7", "material");
  assert.equal(sitz.probe, null); assert.equal(sitz.stufe, "material");
  const spiele = (folge) => folge.map((ok, i) => {
    const a = naechstesAngebot(CTX, s, sitz, lcg(i + 1), opt);
    return verbucheErgebnis(CTX, s, sitz, a.ziel.key, { ...sauber, ok: !!ok, rnd: lcg(i) });
  });
  assert.deepEqual(spiele([1, 1, 0, 1]), [null, null, null, null]);
  assert.deepEqual(spiele([1]), [{ typ: "stufe", stufe: "vorstellung" }]);
  assert.deepEqual(s.themen.z7.v, []); assert.equal(s.themen.z7.stufe, "vorstellung"); assert.equal(sitz.stufe, "vorstellung");
  assert.deepEqual(spiele([0, 0]), [null, { typ: "stufe", stufe: "material" }]);
  assert.deepEqual(spiele([0, 0]), [null, null]); // tiefer geht es nicht
  sitz.max = null; sitz.start = JETZT;
  // Fehler-Reste im Fenster zählen mit: der Aufstieg kommt spätestens mit der fünften richtigen
  assert.deepEqual(spiele([1, 1, 1, 1, 1]).filter(Boolean), [{ typ: "stufe", stufe: "vorstellung" }]);
  assert.deepEqual(spiele([1, 1, 1, 1, 1]).filter(Boolean), [{ typ: "stufe", stufe: "kopf" }]);
  // höchste Stufe: kein Aufstieg mehr
  const { stand: t, sitzung: z } = uebend(CTX, "zz", "r7", "kopf");
  for (let i = 0; i < 5; i++) {
    const a = naechstesAngebot(CTX, t, z, lcg(i + 1), opt);
    assert.equal(verbucheErgebnis(CTX, t, z, a.ziel.key, sauber), null);
  }
  // fehlende Stufen werden übersprungen: gespeichert vorstellung, das Spiel kann nur kopf
  const { sitzung: w } = uebend(CTX, "zz", "r7", "vorstellung");
  assert.equal(w.stufe, "kopf");
  const ctx = { plan: PLAN, spiele: { spiele: [{ id: "mk", arten: [{ art: "zerlegung", zahlen: [2, 10], stufen: ["material", "kopf"] }] }] } };
  const { stand: u, sitzung: m } = uebend(ctx, "mk", "z7", "material");
  let e;
  for (let i = 0; i < 5; i++) {
    const a = naechstesAngebot(ctx, u, m, lcg(i + 1), opt);
    e = verbucheErgebnis(ctx, u, m, a.ziel.key, sauber);
  }
  assert.deepEqual(e, { typ: "stufe", stufe: "kopf" });
});

// ---------- Kann ich nach dem Üben ----------
test("kann ich nach Üben: erst wenn jede darstellbare Aufgabe kk hat; nicht darstellbare zählen nicht", () => {
  const { stand: s, sitzung: sitz } = uebend(CTX_PUNKTE, "punkte", "mengen", "kopf");
  assert.equal(verbucheErgebnis(CTX_PUNKTE, s, sitz, "menge:1", sauber), null);
  assert.equal(verbucheErgebnis(CTX_PUNKTE, s, sitz, "menge:2", { ...sauber, hilfe: 1, rnd: lcg(1) }), null);
  assert.equal(s.aufgaben["menge:2"].kk, undefined);
  assert.equal(verbucheErgebnis(CTX_PUNKTE, s, sitz, "menge:2", { ...sauber, ms: 5000 }), null); // mühsam
  assert.equal(s.aufgaben["menge:2"].kk, undefined);
  assert.equal(verbucheErgebnis(CTX_PUNKTE, s, sitz, "menge:2", sauber), null);
  assert.equal(s.aufgaben["menge:1"].kk, 1);
  assert.deepEqual(verbucheErgebnis(CTX_PUNKTE, s, sitz, "menge:3", sauber), { typ: "gekonnt", thema: "mengen" });
  assert.equal(s.themen.mengen.z, "kann-ich"); assert.equal(s.themen.mengen.k, HEUTE);
  assert.equal(naechstesAngebot(CTX_PUNKTE, s, sitz, lcg(1), opt), null);
  // auf Stufe material zählt richtig nicht für kk
  const { stand: t, sitzung: z } = uebend(CTX, "pb", "z5", "material");
  verbucheErgebnis(CTX, t, z, "zerl:5:2+3", sauber);
  assert.equal(t.aufgaben["zerl:5:2+3"].kk, undefined);
  assert.equal(t.aufgaben["zerl:5:2+3"].f, 1);
});

// ---------- Fächer ----------
test("Fächer: fällig steigt auf bis GELERNT (g = 1), nicht fällig bleibt, Fehler → Fach 0", () => {
  assert.equal(tage("2026-11-10", HEUTE), 3); assert.equal(tage("", HEUTE), Infinity);
  assert.equal(faellig({ f: 2, t: "2026-11-11" }, HEUTE), false);
  assert.equal(faellig({ f: 2, t: "2026-11-10" }, HEUTE), true);
  const { stand: s, sitzung: sitz } = uebend(CTX, "pb", "z5", "kopf");
  s.aufgaben["zerl:5:2+3"] = { f: 3, t: "2026-11-01", h: [], ms: [] };
  verbucheErgebnis(CTX, s, sitz, "zerl:5:2+3", sauber);
  assert.equal(s.aufgaben["zerl:5:2+3"].f, 4); assert.equal(s.aufgaben["zerl:5:2+3"].g, 1);
  verbucheErgebnis(CTX, s, sitz, "zerl:5:2+3", sauber);
  assert.equal(s.aufgaben["zerl:5:2+3"].f, 4);
  s.aufgaben["zerl:5:1+4"] = { f: 2, t: HEUTE, h: [], ms: [] };
  verbucheErgebnis(CTX, s, sitz, "zerl:5:1+4", sauber); // nicht fällig
  assert.equal(s.aufgaben["zerl:5:1+4"].f, 2);
  verbucheErgebnis(CTX, s, sitz, "zerl:5:1+4", { ...falsch, rnd: lcg(1) });
  assert.equal(s.aufgaben["zerl:5:1+4"].f, 0); assert.equal(s.aufgaben["zerl:5:1+4"].t, HEUTE);
  assert.deepEqual(s.aufgaben["zerl:5:1+4"].h, [1, 0]); assert.deepEqual(s.aufgaben["zerl:5:1+4"].ms, [1000, 1000]);
  assert.equal(s.themen.z5.u, HEUTE);
});

// ---------- Angebot ----------
test("Angebot: Fehler kommt nach 2–4 Angeboten wieder; letzte offene Aufgabe ohne auch", () => {
  const abstaende = new Set();
  for (let seed = 1; seed <= 30; seed++) {
    const { stand: s, sitzung: sitz } = uebend(CTX, "pb", "z7", "material");
    const rnd = lcg(seed);
    const erst = naechstesAngebot(CTX, s, sitz, rnd, opt);
    verbucheErgebnis(CTX, s, sitz, erst.ziel.key, { ...falsch, rnd });
    let n = 0;
    for (;;) {
      const a = naechstesAngebot(CTX, s, sitz, rnd, opt);
      if (a.ziel.key === erst.ziel.key) break;
      n++;
      verbucheErgebnis(CTX, s, sitz, a.ziel.key, { ...sauber, rnd });
      assert.ok(n <= 4, `seed ${seed}: zu spät`);
    }
    assert.ok(n >= 2, `seed ${seed}: zu früh (${n})`);
    abstaende.add(n);
  }
  assert.deepEqual([...abstaende].sort(), [2, 3, 4]);
  // auch: höchstens zwei weitere Aufgaben desselben Themas
  const { stand: s, sitzung: sitz } = uebend(CTX, "pb", "z7", "kopf");
  const a = naechstesAngebot(CTX, s, sitz, lcg(4), opt);
  assert.ok(a.auch.length >= 1 && a.auch.length <= 2);
  assert.ok(a.auch.every((x) => x.key.startsWith("zerl:7:") && x.key !== a.ziel.key));
  assert.equal(a.ziel.thema, "z7"); assert.equal(a.ziel.art, "zerlegung"); assert.deepEqual(a.ziel.daten, { n: 7, a: Number(a.ziel.key[7]), b: 7 - Number(a.ziel.key[7]) });
  // nur noch eine Aufgabe ohne kk → genau diese, ohne auch
  for (let seed = 1; seed <= 10; seed++) {
    const { stand: t, sitzung: z } = uebend(CTX, "pb", "z7", "kopf");
    for (const k of ZERL7) if (k !== "zerl:7:5+2") t.aufgaben[k] = { f: 1, t: HEUTE, h: [1], ms: [], kk: 1 };
    const b = naechstesAngebot(CTX, t, z, lcg(seed), opt);
    assert.equal(b.ziel.key, "zerl:7:5+2"); assert.deepEqual(b.auch, []);
  }
});

test("Angebot: Wiederholung gekonnter Themen kommt dazu, Familie zuerst", () => {
  const { stand: s, sitzung: sitz } = uebend(CTX, "zz", "r7", "kopf");
  s.themen.z5 = { z: "kann-ich" };
  s.themen.z7 = { z: "kann-ich" };
  // zwei gekonnte Rechen-Themen: eines aus der Familie von r7, eines nicht
  const plan = { themen: [...PLAN.themen,
    thema("r5", [], { art: "rechnen", thema: "rechnen-5" }, { familie: "zahl-5", stufen: ["kopf"] }),
    thema("r10", [], { art: "rechnen", thema: "rechnen-10" }, { familie: "zahl-7", stufen: ["kopf"] })] };
  const ctx = { plan, spiele: SPIELE };
  s.themen.r5 = { z: "kann-ich" };
  s.themen.r10 = { z: "kann-ich" };
  const zaehle = () => {
    const n = {}, rnd = lcg(5);
    for (let i = 0; i < 60; i++) {
      const a = naechstesAngebot(ctx, s, sitz, rnd, opt);
      n[a.ziel.thema] = (n[a.ziel.thema] || 0) + 1;
      sitz.gezeigt = 0; sitz.wieder = [];
    }
    return n;
  };
  const n = zaehle();
  assert.deepEqual(Object.keys(n).sort(), ["r10", "r7"]); // z5/z7 bedient der Zahlenzauber nicht, r5 erst nach der Familie
  assert.ok(n.r7 > n.r10);
  // Familie nicht mehr fällig → andere gekonnte Themen
  for (const x of aufgabenVon({ art: "rechnen", thema: "rechnen-10" })) s.aufgaben[x.key] = { f: 2, t: HEUTE, h: [], ms: [] };
  assert.ok(zaehle().r5 > 0);
});

test("Angebot: null nach gekonnt, nach max, nach RUNDE_MS", () => {
  const { stand: s, sitzung: sitz } = uebend(CTX, "pb", "z7", "material");
  sitz.max = 3;
  for (let i = 0; i < 3; i++) {
    const a = naechstesAngebot(CTX, s, sitz, lcg(i + 1), opt);
    assert.ok(a); verbucheErgebnis(CTX, s, sitz, a.ziel.key, sauber);
  }
  assert.equal(naechstesAngebot(CTX, s, sitz, lcg(9), opt), null);
  const { stand: t, sitzung: z } = uebend(CTX, "pb", "z7", "material");
  assert.ok(naechstesAngebot(CTX, t, z, lcg(1), { jetzt: JETZT + K.RUNDE_MS - 1, heute: HEUTE }));
  assert.equal(naechstesAngebot(CTX, t, z, lcg(1), { jetzt: JETZT + K.RUNDE_MS, heute: HEUTE }), null);
  // gekonnt (siehe auch Probe- und kk-Test)
  const { stand: u, sitzung: m } = uebend(CTX, "pb", "z5", "kopf");
  for (const k of ["zerl:5:1+4", "zerl:5:2+3", "zerl:5:3+2"]) verbucheErgebnis(CTX, u, m, k, sauber);
  assert.ok(naechstesAngebot(CTX, u, m, lcg(1), opt));
  assert.deepEqual(verbucheErgebnis(CTX, u, m, "zerl:5:4+1", sauber), { typ: "gekonnt", thema: "z5" });
  assert.equal(naechstesAngebot(CTX, u, m, lcg(1), opt), null);
});

// ---------- Lücken ----------
test("luecken (echter Plan): mengen-5 und zwillinge ohne Spiel; rechnen-* haben keine Stufe material", () => {
  const l = luecken(ECHT);
  assert.ok(l.ohneSpiel.includes("mengen-5")); assert.ok(l.ohneSpiel.includes("zwillinge"));
  for (const id of ["zerlegen-2", "zerlegen-10", "rechnen-3", "plus-bis-100"]) assert.ok(!l.ohneSpiel.includes(id), id);
  for (let n = 3; n <= 10; n++) {
    assert.ok(l.ohneStufe.some((x) => x.thema === `rechnen-${n}` && x.stufe === "material"), `rechnen-${n}`);
    assert.ok(!l.ohneStufe.some((x) => x.thema === `rechnen-${n}` && x.stufe === "kopf"));
  }
  assert.ok(!l.ohneStufe.some((x) => x.thema.startsWith("zerlegen-")));
  assert.ok(!l.ohneStufe.some((x) => x.thema === "mengen-5")); // ohne Spiel steht nur unter ohneSpiel
  for (const id of ["zerlegen-7", "rechnen-7", "minus-bis-100"]) {
    assert.ok(!l.teilweise.some((x) => x.thema === id), id);
    assert.ok(!l.ohneEinfuehrung.includes(id), id);
  }
  // Fixture: teilweise darstellbar und ohne Einführung
  const f = luecken({ plan: { themen: [...PLAN.themen, thema("z4", [], { art: "zerlegung", zahl: 4 }, { einfuehrung: undefined })] }, spiele: CTX_PUNKTE.spiele });
  assert.deepEqual(f.teilweise, [{ thema: "mengen", fehlen: 2 }]);
  assert.deepEqual(f.ohneEinfuehrung, ["mengen", "z4"]);
  assert.deepEqual(f.ohneSpiel, []);
});

// ---------- Migration alter Spielstände ----------
test("migriereSpiele: Perlenbrücke-Paare und Zahlenzauber-Fakten mit Stufe 2", () => {
  const perlenbruecke = {
    version: 2, frei: [3, 4, 5, 6, 7], reise: 40,
    paare: {
      "7:2+5": { f: 2, t: "2026-11-01", h: [1, 1], c: 3 },
      "3:1+2": { f: 4, t: "2026-11-01", h: [1], c: 5, g: 1 },
      "3:2+1": { f: 4, t: "2026-11-01", h: [1], c: 5 },
      "4:1+3": { f: 1, t: "2026-11-01", h: [0], c: 2 },
    },
  };
  const zahlenzauber = {
    stufe: 2,
    fakten: {
      "3+4": { f: 1, t: "2026-11-02", h: [1] },
      "7-4": { f: 0, t: "2026-11-02", h: [0] },
      "1+2": { f: 4, t: "2026-11-01", h: [1], g: 1 },
      "3-2": { f: 4, t: "2026-11-01", h: [1] },
      "3-1": { f: 2, t: "2026-11-01", h: [1], g: 1 },
    },
  };
  const s = migriereSpiele(ECHT, neuerStand(), { perlenbruecke, zahlenzauber, heute: HEUTE });
  assert.equal(s.migriert, 1);
  assert.deepEqual(s.aufgaben["zerl:7:2+5"], { f: 2, t: "2026-11-01", h: [1, 1], ms: [] });
  assert.equal(s.aufgaben["zerl:3:1+2"].g, 1);
  assert.deepEqual(s.aufgaben["plus:3+4"], { f: 1, t: "2026-11-02", h: [1], ms: [] });
  assert.equal(s.aufgaben["minus:7-4"].f, 0);
  const z = (id) => s.themen[id]?.z;
  // Perlenbrücke: zerlegen-3 vollständig gelernt, zerlegen-4 erstes mit Teilstand
  assert.equal(z("zerlegen-3"), "kann-ich"); assert.equal(s.themen["zerlegen-3"].k, HEUTE); assert.equal(s.themen["zerlegen-3"].e, HEUTE);
  assert.equal(z("zerlegen-4"), "dran"); assert.equal(s.themen["zerlegen-4"].e, HEUTE); assert.equal(s.themen["zerlegen-4"].stufe, "kopf");
  assert.equal(z("zerlegen-7"), undefined);
  assert.equal(z("zerlegen-2"), undefined);
  // Zahlenzauber-Stufe 2: alles aus Stufe 0 und 1 ist gekonnt
  for (const id of ["zehn-plus", "plus-ohne-20", "plus-zur-20", "ueber-10-mit-9", "ueber-10-mit-8", "ueber-10-mit-7"]) {
    assert.equal(z(id), "kann-ich", id); assert.equal(s.themen[id].k, HEUTE);
  }
  // rechnen-3 nach g/f gelernt, rechnen-7 erstes mit Teilstand
  assert.equal(z("rechnen-3"), "kann-ich");
  assert.equal(z("rechnen-7"), "dran"); assert.equal(s.themen["rechnen-7"].stufe, "kopf");
  for (const id of ["rechnen-4", "rechnen-5", "rechnen-10", "minus-zehner", "minus-ohne-20", "plus-bis-30"]) assert.equal(z(id), undefined, id);
  // nur einmal
  const vorher = JSON.stringify(s);
  migriereSpiele(ECHT, s, { perlenbruecke: { version: 2, paare: { "5:1+4": { f: 4, g: 1 } } }, zahlenzauber: { stufe: 4, fakten: {} }, heute: HEUTE });
  assert.equal(JSON.stringify(s), vorher);
  // ohne alte Stände: nichts außer dem Kennzeichen
  const leer = migriereSpiele(ECHT, neuerStand(), { heute: HEUTE });
  assert.deepEqual(leer.themen, {}); assert.equal(leer.migriert, 1);
});
