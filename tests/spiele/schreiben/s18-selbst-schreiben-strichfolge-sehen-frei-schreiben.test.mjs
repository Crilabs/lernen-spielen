// S18 Selbst schreiben: reine Spiellogik (spiele/schreiben/s18-…/logik.js), Aufgabendaten, Sätze und Lernplan.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ORDNER = "../../../spiele/schreiben/s18-selbst-schreiben-strichfolge-sehen-frei-schreiben";
const L = await import(`${ORDNER}/logik.js`);
const { aufgabenVon, schwierigkeit, darstellbar, ZIEL_MS } = await import("../../../spiele/aufgabenarten.js");
const { ZEICHEN, zeichenMit, strichePunkte } = await import("../../../spiele/woerter/schriftzeichen.js");
const TEXTE = JSON.parse(readFileSync(new URL(`${ORDNER}/texte.json`, import.meta.url), "utf8"));
const PLAN = JSON.parse(readFileSync(new URL("../../../spiele/lernplan.json", import.meta.url), "utf8"));
const SPIELE = JSON.parse(readFileSync(new URL("../../../spiele/spiele.json", import.meta.url), "utf8"));

const daten = (id) => aufgabenVon({ art: "schreiben", zeichen: [id] })[0].daten;

test("Aufgabenart schreiben: Schlüssel, Daten, Schwierigkeit, Ziel, darstellbar", () => {
  const a = aufgabenVon({ art: "schreiben", zeichen: ["l", "i", "gibt-es-nicht"] });
  assert.deepEqual(a.map((x) => x.key), ["schreiben:l", "schreiben:i"]);
  assert.equal(a[1].daten.punkte.length, 1);
  assert.equal(a[1].daten.striche.length, 2);
  assert.equal(ZIEL_MS.schreiben, 8000);
  assert.ok(schwierigkeit(a[1]) > schwierigkeit(a[0]));
  assert.ok(darstellbar(a[0], { art: "schreiben", stufen: ["material"] }));
  assert.ok(!darstellbar(a[0], { art: "schreiben", zeichen: ["o"] }));
  assert.deepEqual(aufgabenVon({ art: "schreiben" }), []);
});

test("die elf zuerst gebauten Themen haben Aufgaben, alle auf allen drei Stufen, und das Spiel stellt sie dar", () => {
  const themen = ["schwung-senkrecht", "schwung-waagerecht", "schwung-kreis-linksherum", "schwung-girlande", "schwung-arkade", "druck-klein-l-i", "druck-klein-t", "druck-klein-c", "druck-klein-o", "druck-klein-a-d", "ziffern-schreiben-gerade"];
  const eintrag = SPIELE.spiele.find((s) => s.id === "kreidebahn");
  assert.equal(eintrag.kategorie, "schreiben");
  assert.deepEqual(eintrag.arten, [{ art: "schreiben", stufen: ["material", "vorstellung", "kopf"] }]);
  for (const id of themen) {
    const t = PLAN.themen.find((x) => x.id === id);
    assert.ok(t, id);
    assert.deepEqual(t.stufen, ["material", "vorstellung", "kopf"], id);
    const a = aufgabenVon(t.aufgaben);
    assert.ok(a.length >= 1, id);
    for (const x of a) assert.ok(eintrag.arten.some((art) => darstellbar(x, art)), x.key);
  }
});

test("jedes Zeichen hat seinen Satz in texte.json (Laut, Ziffer als Zahlwort, Schwung mit Namen)", () => {
  for (const z of ZEICHEN) assert.equal(TEXTE.aufgabe[z.id], z.laut, z.id);
  assert.equal(TEXTE.aufgabe["ziffer-4"], "vier.");
  assert.equal(TEXTE.aufgabe["schwung-senkrecht"], "Regen fällt.");
  assert.equal(Object.keys(TEXTE.aufgabe).length, ZEICHEN.length);
});

test("vorlageImBlatt: links an den Rand der Vorlage gerückt; Reihe nur für Schwünge auf vorstellung und kopf", () => {
  const o = daten("o");
  const v = L.vorlageImBlatt(o, "material");
  assert.equal(Math.min(...v.flat().map((p) => p[0])), L.LINKS);
  assert.deepEqual(L.vorlageImBlatt(o, "kopf"), v, "Buchstaben sind nie eine Reihe");
  const g = daten("schwung-girlande");
  assert.equal(L.vorlageImBlatt(g, "material").length, 1);
  assert.equal(L.alsReihe(g, "material"), false);
  assert.equal(L.alsReihe(g, "vorstellung"), true);
  const reihe = L.vorlageImBlatt(g, "kopf");
  assert.equal(reihe.length, 1);
  assert.ok(L.breiteVon(reihe) > 2.5 * L.breiteVon(L.vorlageImBlatt(g, "material")));
  assert.equal(L.vorlageImBlatt(daten("schwung-senkrecht"), "kopf").length, 3, "Regen: drei Striche");
  for (const z of ZEICHEN) for (const st of ["material", "vorstellung", "kopf"]) {
    const x = L.vorlageImBlatt(daten(z.id), st);
    for (const [px, py] of x.flat()) assert.ok(px >= 0 && px <= L.BREITE && py >= 0 && py <= L.HOEHE, `${z.id} ${st} ${px},${py}`);
  }
});

test("Lineatur: Schwünge zuerst frei auf der Fläche, Buchstaben und Ziffern immer im Buchstabenhaus", () => {
  assert.equal(L.mitLineatur(daten("schwung-arkade"), "material"), false);
  assert.equal(L.mitLineatur(daten("schwung-arkade"), "vorstellung"), true);
  assert.equal(L.mitLineatur(daten("o"), "material"), true);
});

test("satzZu: die fünf Sätze der Idee, je nach Befund und Zeichen", () => {
  assert.equal(L.satzZu("richtung", "o"), "andersherum");
  assert.equal(L.satzZu("spiegel", "d"), "bogen");
  assert.equal(L.satzZu("spiegel", "o"), "andersherum", "beim o ist das Spiegelbild der andere Umlauf");
  assert.equal(L.satzZu("start", "l"), "oben");
  assert.equal(L.satzZu("richtung", "l"), "oben");
  assert.equal(L.satzZu("reihenfolge", "t"), "stab");
  assert.equal(L.satzZu("reihenfolge", "d"), "anders");
  assert.equal(L.satzZu("form", "o"), "anders");
  assert.equal(L.satzZu("kurz", "i"), "anders");
  assert.equal(L.satzZu("start", "schwung-waagerecht"), "anders");
});

test("ecken: die Spitzen der 7 und der 4, keine im Bogen", () => {
  const sieben = strichePunkte(zeichenMit("ziffer-7"))[0];
  assert.equal(L.ecken(sieben).length, 1);
  const vier = strichePunkte(zeichenMit("ziffer-4"))[0];
  assert.equal(L.ecken(vier).length, 1);
  assert.equal(L.ecken(strichePunkte(zeichenMit("o"))[0]).length, 0);
});

test("fahrplan: gleiches Tempo, Hüpfer zwischen den Strichen, Tupfer nur ein Aufsetzen, Dauer wie verlangt", () => {
  const i = strichePunkte(zeichenMit("i"));
  const p = L.fahrplan(i, { fahrtMs: 600 });
  assert.equal(p.striche.length, 2);
  assert.equal(p.striche[1].von, p.striche[1].bis, "der Punkt ist nur ein Aufsetzen");
  assert.ok(p.stellen.some((s) => s.hoch > 10), "Hüpfer zum Punkt");
  assert.ok(p.dauer > 600 && p.dauer < 600 + 400);
  assert.deepEqual(p.stellen.map((s) => s.t), [...p.stellen.map((s) => s.t)].sort((a, b) => a - b));
  const langsam = L.fahrplan(strichePunkte(zeichenMit("ziffer-7")), { fahrtMs: 800, eckenMs: 200 });
  assert.ok(langsam.dauer >= 1000, "an der Spitze hält sie");
  const mitte = L.ortZu(p, p.dauer / 2);
  assert.ok(Number.isFinite(mitte.x) && Number.isFinite(mitte.y));
  assert.equal(L.ortZu(p, 1e9), p.stellen.at(-1));
});

test("Ela fährt höchstens so lange, wie die Wirkung erlaubt (≈ 1,2 s Fahrt auch bei langsamem Kind)", () => {
  assert.equal(L.fahrtZeit(100), L.FAHRT_MS.min);
  assert.equal(L.fahrtZeit(20000), L.FAHRT_MS.max);
  assert.ok(L.fahrtZeit(1100) >= L.FAHRT_MS.min && L.fahrtZeit(1100) <= L.FAHRT_MS.max);
  for (const z of ZEICHEN) {
    const p = L.fahrplan(L.vorlageImBlatt(daten(z.id), "material"), { fahrtMs: L.FAHRT_MS.max });
    assert.ok(p.dauer <= 1200 + 140 * 2 + 200, `${z.id} ${p.dauer}`);
  }
});

test("begegnung: o rechtsherum läuft Lena entgegen, richtig herum fahren beide miteinander", () => {
  const o = L.vorlageImBlatt(daten("o"), "material");
  const lena = L.fahrplan(o, { fahrtMs: 1500 });
  const gegen = L.fahrplan(o.map((s) => [...s].reverse()), { fahrtMs: 1500 });
  const t = L.begegnung(gegen, lena);
  assert.ok(t !== null && t > 200 && t < lena.dauer, `Begegnung ${t}`);
  assert.equal(L.begegnung(lena, lena), null, "Start nebeneinander zählt nicht");
});

test("aufKind: Lena fährt genau auf die Linie des Kindes; Prüfzüge sind richtig oder wirklich falsch", () => {
  const d = L.vorlageImBlatt(daten("d"), "material");
  const kind = d.map((s) => s.map(([x, y]) => [x + 200, y]));
  assert.equal(Math.round(L.aufKind(d, kind, false).flat()[0][0]), Math.round(kind.flat()[0][0]));
  const zuege = L.pruefZuege(d, false);
  assert.deepEqual(zuege.map((z) => [z.wie, z.ok]), [["richtig", true], ["rueckwaerts", false], ["gespiegelt", false], ["kopfueber", false], ["gekritzel", false]]);
  assert.equal(L.pruefZuege(L.vorlageImBlatt(daten("l"), "material"), false).find((z) => z.wie === "gespiegelt")?.ok, true, "ein gespiegeltes l ist ein l");
});

test("jede Aufgabe hat für den Prüfstand mindestens einen falschen Zug", () => {
  const ids = new Set(Object.values(PLAN.themen ?? PLAN).flatMap((t) => (t?.aufgaben?.zeichen ?? [])));
  assert.ok(ids.size > 0);
  for (const id of ids) {
    const a = aufgabenVon({ art: "schreiben", zeichen: [id] })[0];
    if (!a) continue;
    for (const frei of [false, true]) {
      const z = L.pruefZuege(L.vorlageImBlatt(a.daten, "material"), frei);
      assert.ok(z.some((x) => !x.ok), `${id} (frei ${frei}): kein falscher Zug`);
    }
  }
});
