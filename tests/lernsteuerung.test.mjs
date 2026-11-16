import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../spiele/lernsteuerung.js");
const { aufgabenVon, schwierigkeit } = await import("../spiele/aufgabenarten.js");
const {
  K, neuerStand, migriereStand, bedient, spieleFuer, zustaende, sichtbar, themaFuer, startThema,
  probeAufgaben, neueSitzung, naechstesAngebot, verbucheErgebnis, luecken, faellig, tage,
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
  spiele: JSON.parse(readFileSync(new URL("./daten/spiele-beispiel.json", import.meta.url))),
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
    AUF_OK: 4, AB_FEHLER: 2, ANTEIL_THEMA: 0.7, WIEDER_NACH: [2, 4], RUNDE_MS: 240000, LETZTE_AUFGABE_MS: 30000, GROSS: 40, STICHPROBE: 20 });
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
  assert.equal(zustaende(CTX, f).r7, "verborgen"); // Freigabe gilt nicht als erfüllte Voraussetzung
});

test("Freigabe: verborgenes Thema wird in Sicht, sein Nachfolger bleibt verborgen", () => {
  const s = neuerStand();
  assert.equal(zustaende(CTX, s).z7, "verborgen");
  s.themen.z7 = { frei: 1 };
  const z = zustaende(CTX, s);
  assert.equal(z.z7, "in-sicht"); assert.equal(z.r7, "verborgen"); assert.equal(z.z5, "in-sicht");
  assert.deepEqual(sichtbar(CTX, s), { mathe: ["z5", "z7"] });
  s.themen.z7 = { frei: 1, z: "kann-ich" };
  assert.equal(zustaende(CTX, s).r7, "in-sicht"); // erst gekonnt öffnet den Nachfolger
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

test("themaFuer: dran zuerst (am längsten nicht geübt); dran in einem anderen Spiel blockiert nicht", () => {
  const s = neuerStand();
  s.themen.z5 = { z: "dran", seit: "2026-11-10", u: "2026-11-12" };
  s.themen.z7 = { z: "dran", seit: "2026-11-11", u: "2026-11-11" };
  assert.deepEqual(themaFuer(CTX, s, "pb", { heute: HEUTE }), { thema: "z7", modus: "thema" });
  // r7 ist in Sicht (z7 gekonnt); z5 ist dran, aber nur in der Perlenbrücke → der Zahlenzauber bekommt r7 als Thema
  const t = neuerStand();
  t.themen.z5 = { z: "dran" };
  t.themen.z7 = { z: "kann-ich" };
  assert.equal(zustaende(CTX, t).r7, "in-sicht");
  assert.deepEqual(themaFuer(CTX, t, "zz", { heute: HEUTE }), { thema: "r7", modus: "thema" });
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
  // Wiederholungen kommen gebündelt am Rundenende (Christian, 2026-11-15): hier spät in der Runde fragen
  sitz.start = opt.jetzt - 0.8 * K.RUNDE_MS;
  const zaehle = () => {
    const n = {}, rnd = lcg(5);
    for (let i = 0; i < 60; i++) {
      const a = naechstesAngebot(ctx, s, sitz, rnd, opt);
      n[a.ziel.thema] = (n[a.ziel.thema] || 0) + 1;
      sitz.gezeigt = 0; sitz.wieder = []; delete sitz.wdhThema;
    }
    return n;
  };
  const n = zaehle();
  // spät in der Runde nur Wiederholung, solange etwas fällig ist; z5/z7 bedient der Zahlenzauber nicht, r5 erst nach der Familie
  assert.deepEqual(Object.keys(n).sort(), ["r10"]);
  // Familie nicht mehr fällig → andere gekonnte Themen
  for (const x of aufgabenVon({ art: "rechnen", thema: "rechnen-10" })) s.aufgaben[x.key] = { f: 2, t: HEUTE, h: [], ms: [] };
  assert.ok(zaehle().r5 > 0);
});

test("naechstesAngebot: keine neue Aufgabe in den letzten 30 s", () => {
  const { stand: s, sitzung: sitz } = uebend(CTX, "pb", "z7", "material");
  sitz.start = 0;
  assert.equal(naechstesAngebot(CTX, s, sitz, lcg(1), { jetzt: K.RUNDE_MS - 29_999, heute: HEUTE }), null);
  assert.ok(naechstesAngebot(CTX, s, sitz, lcg(1), { jetzt: K.RUNDE_MS - 30_001, heute: HEUTE }));
});

test("naechstesAngebot: bei kurzer Testrunde höchstens ein Viertel Reserve", () => {
  const g = /** @type {any} */ (globalThis);
  g.__LS_PRUEFEN__ = true; g.__LS_RUNDE_MS__ = 60000;
  try {
    const { stand: s, sitzung: sitz } = uebend(CTX, "pb", "z7", "material");
    sitz.start = 0;
    assert.ok(naechstesAngebot(CTX, s, sitz, lcg(1), { jetzt: 44_999, heute: HEUTE }));
    assert.equal(naechstesAngebot(CTX, s, sitz, lcg(1), { jetzt: 45_000, heute: HEUTE }), null);
  } finally {
    delete g.__LS_RUNDE_MS__; delete g.__LS_PRUEFEN__;
  }
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
  assert.ok(naechstesAngebot(CTX, t, z, lcg(1), { jetzt: JETZT + K.RUNDE_MS - K.LETZTE_AUFGABE_MS - 1, heute: HEUTE }));
  assert.equal(naechstesAngebot(CTX, t, z, lcg(1), { jetzt: JETZT + K.RUNDE_MS - K.LETZTE_AUFGABE_MS, heute: HEUTE }), null);
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

// ---------- Befunde aus dem Gesamtreview ----------

const plusBis = (id) => aufgabenVon(ECHT.plan.themen.find((t) => t.id === id).aufgaben);
const kkEintrag = () => ({ f: 1, t: HEUTE, h: [1], ms: [1000], kk: 1 });

test("Befund 1: dran-Thema des einen Spiels blockiert das andere nicht (echter Plan)", () => {
  const s = neuerStand();
  startThema(s, "rechnen-3", HEUTE);                      // Zahlenzauber-Vorgriff
  s.themen["zerlegen-2"] = { z: "kann-ich", e: HEUTE, k: HEUTE, stufe: "kopf" };
  assert.deepEqual(themaFuer(ECHT, s, "perlenbruecke", { heute: HEUTE }), { thema: "zerlegen-3", modus: "thema" });
  // ein dran-Thema, das die Perlenbrücke selbst übt, blockiert weiter
  startThema(s, "zerlegen-3", HEUTE);
  assert.deepEqual(themaFuer(ECHT, s, "perlenbruecke", { heute: HEUTE }), { thema: "zerlegen-3", modus: "thema" });
});

const klassenVon = (id) => L.schwierigkeitsKlassen(ECHT, id);
const klasseVon = (kl, a) => kl.findIndex((l) => l.some((x) => x.key === a.key));

test("Befund 4a: große Themen in höchstens vier Schwierigkeitsklassen (Quartile, stabil)", () => {
  for (const id of ["minus-ohne-20", "plus-bis-30", "minus-bis-30", "plus-bis-100", "minus-bis-100"]) {
    const kl = klassenVon(id), alle = plusBis(id);
    assert.ok(kl.length >= 1 && kl.length <= 4, `${id}: ${kl.length} Klassen`);
    assert.deepEqual(kl.flat().map((a) => a.key).sort(), alle.map((a) => a.key).sort(), id);
    for (let i = 1; i < kl.length; i++)
      assert.ok(Math.max(...kl[i - 1].map(schwierigkeit)) < Math.min(...kl[i].map(schwierigkeit)), `${id}: gleiche Schwierigkeit in einer Klasse`);
    assert.deepEqual(klassenVon(id).map((l) => l.map((a) => a.key)), kl.map((l) => l.map((a) => a.key)), "stabil");
  }
  assert.equal(klassenVon("plus-bis-100").length, 4);
  assert.deepEqual(L.schwierigkeitsKlassen(ECHT, "zerlegen-7").length, 0, "kleines Thema: keine Klassen");
});

test("Befund 4a: großes Thema gekonnt nach genau max(STICHPROBE, 2 × Klassen) kk, je Klasse zwei", () => {
  for (const id of ["plus-bis-100", "minus-bis-100", "plus-bis-30"]) {
    const kl = klassenVon(id);
    const noetig = Math.max(K.STICHPROBE, kl.reduce((n, l) => n + Math.min(2, l.length), 0));
    if (id === "plus-bis-100") assert.equal(noetig, 20);
    // je Klasse zwei, dann aufgefüllt aus der ersten Klasse bis noetig
    const je = kl.flatMap((l) => l.slice(0, Math.min(2, l.length)));
    const rest = kl.flat().filter((a) => !je.includes(a));
    const wahl = [...je, ...rest.slice(0, noetig - je.length)];
    assert.equal(wahl.length, noetig);
    const { stand: s, sitzung: sitz } = uebend(ECHT, "zahlenzauber", id, "kopf");
    for (const a of wahl.slice(2)) s.aufgaben[a.key] = kkEintrag();
    assert.equal(verbucheErgebnis(ECHT, s, sitz, wahl[0].key, sauber), null, `${id}: noetig − 1 kk reicht nicht`);
    assert.deepEqual(verbucheErgebnis(ECHT, s, sitz, wahl[1].key, sauber), { typ: "gekonnt", thema: id }, id);
  }
  const id = "plus-bis-100", kl = klassenVon(id);
  // viele kk, aber alle aus einer Klasse → nicht gekonnt
  {
    const { stand: s, sitzung: sitz } = uebend(ECHT, "zahlenzauber", id, "kopf");
    const eine = kl[0].slice(0, 30);
    for (const a of eine.slice(1)) s.aufgaben[a.key] = kkEintrag();
    assert.equal(verbucheErgebnis(ECHT, s, sitz, eine[0].key, sauber), null);
    assert.equal(s.themen[id].z, "dran");
  }
  // 30 kk, aber eine Klasse nur mit einem → nicht gekonnt
  {
    const { stand: s, sitzung: sitz } = uebend(ECHT, "zahlenzauber", id, "kopf");
    const wahl = [...kl[0].slice(0, 14), ...kl[1].slice(0, 14), kl[2][0], kl[3][0], kl[3][1]];
    for (const a of wahl.slice(1)) s.aufgaben[a.key] = kkEintrag();
    assert.equal(verbucheErgebnis(ECHT, s, sitz, wahl[0].key, sauber), null);
    assert.deepEqual(verbucheErgebnis(ECHT, s, sitz, kl[2][1].key, sauber), { typ: "gekonnt", thema: id });
  }
});

test("Befund 4b: bestandene Probe in großem Thema legt nur die beantworteten Aufgaben an (Stand bleibt klein)", () => {
  const s = neuerStand();
  startThema(s, "plus-bis-100", HEUTE);
  const sitz = neueSitzung(ECHT, s, "zahlenzauber", { thema: "plus-bis-100", modus: "thema" }, { jetzt: JETZT, rnd: lcg(2) });
  assert.equal(sitz.probe.length, K.PROBE);
  let ereignis = null, n = 0;
  for (let a; (a = naechstesAngebot(ECHT, s, sitz, lcg(n + 7), opt)); n++) ereignis = verbucheErgebnis(ECHT, s, sitz, a.ziel.key, sauber);
  assert.deepEqual(ereignis, { typ: "gekonnt", thema: "plus-bis-100" });
  const keys = Object.keys(s.aufgaben);
  assert.ok(keys.length < 50, `zu viele Einträge: ${keys.length}`);
  assert.equal(keys.length, K.PROBE);
  for (const k of keys) assert.ok(s.aufgaben[k].f >= 1, k);
  assert.ok(JSON.stringify(s).length < 5000);
  // kleines Thema: weiter alle Aufgaben in Fach 1 (siehe Probe-Test oben)
});

test("Befund 4b: markiereGekonnt legt in großen Themen keine neuen Einträge an", () => {
  const s = neuerStand();
  s.aufgaben["plus:23+45"] = { f: 0, t: "2026-11-01", h: [0], ms: [] };
  L.markiereGekonnt(s, "plus-bis-100", HEUTE, ECHT);
  assert.equal(s.themen["plus-bis-100"].z, "kann-ich");
  assert.deepEqual(Object.keys(s.aufgaben), ["plus:23+45"]);
  assert.equal(s.aufgaben["plus:23+45"].f, 1);
  // kleines Thema: wie bisher alle Aufgaben in Fach 1
  L.markiereGekonnt(s, "zerlegen-7", HEUTE, ECHT);
  for (const k of ZERL7) assert.equal(s.aufgaben[k].f, 1, k);
});

test("Angebot: Wiederholungen gekonnter Themen kommen gebündelt am Rundenende, Thema für Thema (Christian 2026-11-15)", () => {
  const { stand: s, sitzung: sitz } = uebend(CTX, "zz", "r7", "kopf");
  const plan = { themen: [...PLAN.themen,
    thema("r5", [], { art: "rechnen", thema: "rechnen-5" }, { familie: "zahl-5", stufen: ["kopf"] }),
    thema("r10", [], { art: "rechnen", thema: "rechnen-10" }, { familie: "zahl-7", stufen: ["kopf"] })] };
  const ctx = { plan, spiele: SPIELE };
  s.themen.r5 = { z: "kann-ich" };
  s.themen.r10 = { z: "kann-ich" };
  sitz.start = opt.jetzt;
  const rnd = lcg(7), folge = [];
  // erster Teil der Runde: nur das Thema
  for (let i = 0; i < 10; i++) { folge.push(naechstesAngebot(ctx, s, sitz, rnd, opt).ziel.thema); sitz.wieder = []; }
  assert.ok(folge.every((t) => t === "r7"), folge.join(" "));
  // spät in der Runde: Wiederholungen, und zwar zusammenhängend (ein Thema bleibt, bis es nichts Fälliges mehr hat)
  sitz.start = opt.jetzt - 0.8 * K.RUNDE_MS;
  const spaet = [];
  for (let i = 0; i < 8; i++) { spaet.push(naechstesAngebot(ctx, s, sitz, rnd, opt).ziel.thema); sitz.wieder = []; }
  const wechsel = spaet.filter((t, i) => i > 0 && t !== spaet[i - 1]).length;
  assert.ok(spaet.some((t) => t !== "r7"), spaet.join(" "));
  assert.ok(wechsel <= 2, `zu viele Wechsel: ${spaet.join(" ")}`);
});

test("Befund 4c: Wiederholung großer gekonnter Themen nur aus Aufgaben mit Eintrag", () => {
  const s = neuerStand();
  s.themen["plus-bis-100"] = { z: "kann-ich", k: "2026-11-01", stufe: "kopf" };
  const mit = ["plus:23+45", "plus:31+52", plusBis("plus-bis-100").at(-1).key];
  for (const k of mit) s.aufgaben[k] = { f: 1, t: "2026-11-01", h: [1], ms: [] };
  // Wiederholung genau dieses Themas (Wunsch aus der Übersicht)
  const w = neueSitzung(ECHT, s, "zahlenzauber", { thema: "plus-bis-100", modus: "wiederholung" }, { jetzt: JETZT, rnd: lcg(3) });
  for (let a, i = 0; (a = naechstesAngebot(ECHT, s, w, lcg(i + 1), opt)); i++) assert.ok(mit.includes(a.ziel.key), a.ziel.key);
  // fällige Aufgaben beim Üben eines anderen Themas: nur die mit Eintrag
  s.themen["rechnen-3"] = { z: "dran", stufe: "kopf", e: HEUTE, seit: HEUTE, k: "", frei: 0, v: [] };
  const sitz = neueSitzung(ECHT, s, "zahlenzauber", { thema: "rechnen-3", modus: "thema" }, { jetzt: JETZT, rnd: lcg(3) });
  const rnd = lcg(11), gesehen = new Set();
  sitz.start = opt.jetzt - 0.8 * K.RUNDE_MS; // Wiederholungen gebündelt am Rundenende
  for (let i = 0; i < 80; i++) {
    const a = naechstesAngebot(ECHT, s, sitz, rnd, opt);
    gesehen.add(a.ziel.thema);
    if (a.ziel.thema !== "rechnen-3") assert.ok(mit.includes(a.ziel.key), a.ziel.key);
    sitz.gezeigt = 0; sitz.wieder = []; delete sitz.wdhThema;
  }
  assert.ok(gesehen.has("plus-bis-100"), "fällige Aufgaben mit Eintrag kommen dran");
  // ohne einen einzigen Eintrag bleibt die Wiederholungsrunde nicht leer
  const leer = neuerStand();
  leer.themen["plus-bis-100"] = { z: "kann-ich", k: "2026-11-01", stufe: "kopf" };
  const wl = neueSitzung(ECHT, leer, "zahlenzauber", { thema: "plus-bis-100", modus: "wiederholung" }, { jetzt: JETZT, rnd: lcg(3) });
  assert.ok(naechstesAngebot(ECHT, leer, wl, lcg(1), opt));
});

test("Befund 4d: beim Üben eines großen Themas kommen Klassen ohne genug kk zuerst", () => {
  for (const id of ["plus-bis-30", "plus-bis-100"]) {
    const kl = klassenVon(id), offen = [1, kl.length - 1]; // zwei Klassen mit je einem kk, die anderen gedeckt
    for (let seed = 1; seed <= 20; seed++) {
      const { stand: s, sitzung: sitz } = uebend(ECHT, "zahlenzauber", id, "kopf", lcg(seed));
      kl.forEach((l, i) => { for (const a of l.slice(0, offen.includes(i) ? 1 : 2)) s.aufgaben[a.key] = kkEintrag(); });
      const a = naechstesAngebot(ECHT, s, sitz, lcg(seed), opt);
      assert.ok(offen.includes(klasseVon(kl, a.ziel)), `${id} seed ${seed}: Klasse ${klasseVon(kl, a.ziel)}`);
      assert.ok(!s.aufgaben[a.ziel.key]?.kk);
    }
  }
});

test("Befund 6: Wiederholungsrunde winziger Themen höchstens doppelt so lang wie verschiedene Aufgaben", () => {
  const s = neuerStand();
  s.themen["zerlegen-2"] = { z: "kann-ich", k: HEUTE, stufe: "kopf" };
  const zaehle = (sitz) => { let n = 0; for (let a; (a = naechstesAngebot(ECHT, s, sitz, lcg(n + 1), opt)); n++) verbucheErgebnis(ECHT, s, sitz, a.ziel.key, sauber); return n; };
  assert.equal(zaehle(neueSitzung(ECHT, s, "perlenbruecke", { thema: null, modus: "wiederholung" }, { jetzt: JETZT, max: 10, rnd: lcg(1) })), 2);
  s.themen["zerlegen-3"] = { z: "kann-ich", k: HEUTE, stufe: "kopf" };
  assert.equal(zaehle(neueSitzung(ECHT, s, "perlenbruecke", { thema: "zerlegen-3", modus: "wiederholung" }, { jetzt: JETZT, max: 10, rnd: lcg(1) })), 4);
  assert.equal(zaehle(neueSitzung(ECHT, s, "perlenbruecke", { thema: null, modus: "wiederholung" }, { jetzt: JETZT, max: 10, rnd: lcg(1) })), 6);
  // größere Auswahl: wie bisher höchstens 8
  s.themen["zerlegen-7"] = { z: "kann-ich", k: HEUTE, stufe: "kopf" };
  assert.equal(zaehle(neueSitzung(ECHT, s, "perlenbruecke", { thema: null, modus: "wiederholung" }, { jetzt: JETZT, max: 10, rnd: lcg(1) })), 8);
});

test("ladeCtx sucht lernplan.json und spiele.json neben lernsteuerung.js, nicht neben der Seite (Spiele liegen tiefer)", () => {
  const quelle = readFileSync(new URL("../spiele/lernsteuerung.js", import.meta.url), "utf8");
  const ladeCtx = quelle.slice(quelle.indexOf("async function ladeCtx()"), quelle.indexOf("return ctxCache;"));
  assert.match(ladeCtx, /fetch\(new URL\(f, import\.meta\.url\)\)/);
});

test("rundenMs: echte Rundenlänge, kürzer nur im Testbetrieb des Prüfstands", async () => {
  const { rundenMs } = await import("../spiele/lernsteuerung.js");
  const g = globalThis;
  assert.equal(rundenMs(), K.RUNDE_MS);
  g.__LS_RUNDE_MS__ = 60000;
  assert.equal(rundenMs(), K.RUNDE_MS, "ohne __LS_PRUEFEN__ zählt nur die echte Länge");
  g.__LS_PRUEFEN__ = true;
  assert.equal(rundenMs(), 60000);
  g.__LS_RUNDE_MS__ = 0;
  assert.equal(rundenMs(), K.RUNDE_MS);
  delete g.__LS_RUNDE_MS__; delete g.__LS_PRUEFEN__;
});
