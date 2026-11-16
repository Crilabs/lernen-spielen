// M08 Stellentafel: reine Spiellogik (spiele/mathe/m08-stellentafel/logik.js) und die Sätze aus Daten (texte.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../../../spiele/mathe/m08-stellentafel/logik.js");
const { aufgabenVon, darstellbar } = await import("../../../spiele/aufgabenarten.js");
const TEXTE = JSON.parse(readFileSync(new URL("../../../spiele/mathe/m08-stellentafel/texte.json", import.meta.url), "utf8"));
const alle = ["zehn-plus", "minus-zehner"].flatMap((thema) => aufgabenVon({ art: "rechnen", thema }));

test("aufgabeAus: Plus (10 + e), Minus (c − 10, c − e); alles andere ist null", () => {
  assert.deepEqual(L.aufgabeAus("plus:4+10"), { op: "plus", e: 4, c: 14, weg: 0, antwort: 14, key: "plus:4+10" });
  assert.deepEqual(L.aufgabeAus("minus:14-10"), { op: "minus", e: 4, c: 14, weg: 10, antwort: 4, key: "minus:14-10" });
  assert.deepEqual(L.aufgabeAus("minus:14-4"), { op: "minus", e: 4, c: 14, weg: 4, antwort: 10, key: "minus:14-4" });
  assert.equal(L.aufgabeAus("plus:3+4"), null);
  assert.equal(L.aufgabeAus("minus:14-3"), null);
  assert.equal(L.aufgabeAus("mal:6*7"), null);
  assert.equal(L.aufgabeAus(null), null);
});

test("jede Aufgabe der Themen zehn-plus und minus-zehner ist darstellbar, hat Sätze und die richtige Antwort", () => {
  assert.equal(alle.length, 27);
  const spec = { art: "rechnen", max: 20, zehner: true };
  for (const x of alle) {
    assert.ok(darstellbar(x, spec), x.key);
    const a = L.aufgabeAus(x.key);
    assert.ok(a, x.key);
    assert.equal(a.antwort, x.daten.c === undefined ? a.antwort : x.daten.op === "plus" ? x.daten.c : x.daten.c - x.daten.b, x.key);
    assert.ok(TEXTE.aufgabe[x.key], `Aufgabe ${x.key}`);
    assert.ok(TEXTE.gleichung[x.key], `Gleichung ${x.key}`);
    assert.ok(a.e >= 1 && a.e <= 9);
  }
});

test("anzeige: immer 10 + x, nie x + 10; Minus mit Startzahl", () => {
  assert.equal(L.anzeige(L.aufgabeAus("plus:4+10")), "10 + 4 =");
  assert.equal(L.anzeige(L.aufgabeAus("minus:14-10")), "14 − 10 =");
  assert.equal(L.anzeige(L.aufgabeAus("minus:14-4")), "14 − 4 =");
});

test("karten: eine Karte je Stelle, fehlt die Stelle, fehlt die Karte; über 99 eine lange Karte", () => {
  assert.deepEqual(L.karten(14), { z: "10", e: "4", lang: null });
  assert.deepEqual(L.karten(40), { z: "40", e: null, lang: null });
  assert.deepEqual(L.karten(7), { z: null, e: "7", lang: null });
  assert.deepEqual(L.karten(123), { z: null, e: null, lang: "123" });
});

test("zahlendreher und Kandidaten: das Ergebnis und was ein ratendes Kind tippt", () => {
  assert.equal(L.zahlendreher(14), 41);
  assert.equal(L.zahlendreher(11), null);
  assert.equal(L.zahlendreher(10), null);
  assert.ok(L.kandidaten(14).includes(14));
  assert.ok(L.kandidaten(14).includes(41));
  assert.ok(L.kandidaten(4).every((x) => x > 0 && x <= 99));
});

test("danebenSatz: verschiedene Zehner sagen die Stangen, sonst die Perlen; über 99 ein eigener Satz", () => {
  assert.deepEqual(L.danebenSatz(41, 14), { art: "stangen", n: 4 });
  assert.deepEqual(L.danebenSatz(15, 14), { art: "perlen", n: 5 });
  assert.deepEqual(L.danebenSatz(140, 14), { art: "gross", n: 0 });
  assert.equal(TEXTE.daneben.stangen[0], "Hier liegt keine Stange.");
  assert.equal(TEXTE.daneben.perlen[1], "Hier liegt eine Perle.");
  for (let n = 0; n <= 9; n++) assert.ok(TEXTE.daneben.stangen[n] && TEXTE.daneben.perlen[n]);
});

test("probeVon: nie die Lösung, nur das Material; bei Minus der Ring auf dem Weggenommenen", () => {
  assert.deepEqual(L.probeVon(L.aufgabeAus("plus:4+10")), { stange: true, perlen: 4, ring: null, satz: "plus:4" });
  assert.equal(L.probeVon(L.aufgabeAus("minus:14-10")).ring, "stange");
  assert.equal(L.probeVon(L.aufgabeAus("minus:14-4")).ring, "perlen");
  for (let e = 1; e <= 9; e++) assert.ok(TEXTE.hilfe1.plus[e]);
  assert.ok(TEXTE.hilfe1.stange && TEXTE.hilfe1.perlen);
});

test("Tasten: nächste Taste, Eingabe, höchstens drei Ziffern, keine führende Null", () => {
  assert.equal(L.naechsteTaste("", 14), "1");
  assert.equal(L.naechsteTaste("1", 14), "4");
  assert.equal(L.naechsteTaste("14", 14), "fertig");
  assert.equal(L.naechsteTaste("2", 14), "loeschen");
  assert.equal(L.tippe("", "0"), "");
  assert.equal(L.tippe("1", "4"), "14");
  assert.equal(L.tippe("123", "4"), "123");
  assert.equal(L.tippe("14", "loeschen"), "1");
  assert.deepEqual(L.tastenZu("1", [14, 41]), ["4"]);
  assert.deepEqual(L.tastenZu("14", [14]), ["fertig"]);
  assert.deepEqual(L.tastenZu("9", [14]), ["loeschen"]);
});

test("Perlen: jede Perle einen Ton höher, alle zusammen höchstens etwa 1,1 s", () => {
  for (let i = 1; i < 9; i++) assert.ok(L.perlenTon(i + 1) > L.perlenTon(i));
  assert.equal(L.perleHell(4), false);
  assert.equal(L.perleHell(5), true);
  for (let e = 1; e <= 9; e++) assert.ok(L.perlenAbstand(e) * e <= 1150, `e=${e}`);
});

test("Freude: nie zweimal dieselbe hintereinander; Witz höchstens jede fünfte Aufgabe, nie zu früh", () => {
  let v = null;
  for (let i = 0; i < 200; i++) {
    const f = L.naechsteFreude(v);
    assert.notEqual(f, v);
    v = f;
  }
  assert.equal(L.witz(L.aufgabeAus("plus:4+10"), 1, () => 0), null);
  assert.equal(L.witz(L.aufgabeAus("minus:14-10"), 4, () => 0), "winken");
  assert.equal(L.witz(L.aufgabeAus("plus:9+10"), 4, () => 0), "perle");
  assert.equal(L.witz(L.aufgabeAus("plus:4+10"), 4, () => 0), "linsen");
  assert.equal(L.witz(L.aufgabeAus("plus:4+10"), 4, () => 0.9), null);
});

test("bildWechsel: nur beim Wechsel von Plus zu Minus und zurück ein Satz", () => {
  assert.equal(L.bildWechsel(null, "plus"), null);
  assert.equal(L.bildWechsel("plus", "plus"), null);
  assert.equal(L.bildWechsel("plus", "minus"), "wegnehmen");
  assert.equal(L.bildWechsel("minus", "plus"), "dazulegen");
});

// Review Christian 2026-11-16: Ein Kind der Klasse 1 kennt „Z“ und „E“ nicht – die Köpfe heißen ausgeschrieben.
test("Spaltenköpfe ausgeschrieben: Zehner und Einer, nicht Z und E", () => {
  const html = readFileSync(new URL("../../../spiele/mathe/m08-stellentafel/index.html", import.meta.url), "utf8");
  assert.match(html, /class="kopf z"[^>]*>Zehner</);
  assert.match(html, /class="kopf e"[^>]*>Einer</);
  assert.doesNotMatch(html, /class="kopf [ze]"[^>]*>\s*[ZE]\s*</);
});

// Farbwelt C3: Die Welt schmückt nie mit Bedeutungsfarben (Perlen, Stellenwerte).
test("Raum ohne Bedeutungsfarben (C3)", async () => {
  const { raumSvg } = await import("../../../spiele/mathe/m08-stellentafel/raum.js");
  const svg = raumSvg().toUpperCase();
  assert.match(svg, /^<SVG/);
  for (const f of ["#E5484D", "#3FA34D", "#F4A3C0", "#F7D038", "#6CB8F0", "#9B5DE5", "#2F5BC4", "#D9A520", "#0FA3A3", "#F07C1E", "#5B6478"])
    assert.ok(!svg.includes(f), f);
});

// Review Christian 2026-11-16 (wie M06): Zehner sind goldene Stangen, die Einer ein farbiges Perlenstäbchen
// (Montessori-Farben: 4 gelb, 7 weiß …), nicht einzelne goldene Perlen.
test("Einer als farbiges Stäbchen: kein gold an Einer-Stäben", () => {
  const js = readFileSync(new URL("../../../spiele/mathe/m08-stellentafel/spiel.js", import.meta.url), "utf8");
  assert.doesNotMatch(js, /wert: String\((a\.e|wert|e)\), gold/);
  assert.doesNotMatch(js, /gold: ""/);
});
