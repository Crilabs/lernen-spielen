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

test("zahlendreher und Kandidaten: das Ergebnis und was ein ratendes Kind tippt", () => {
  assert.equal(L.zahlendreher(14), 41);
  assert.equal(L.zahlendreher(11), null);
  assert.equal(L.zahlendreher(10), null);
  assert.ok(L.kandidaten(14).includes(14));
  assert.ok(L.kandidaten(14).includes(41));
  assert.ok(L.kandidaten(4).every((x) => x > 0 && x <= 99));
});

test("danebenSatz: verschiedene Zehner sagen die Stangen, sonst die Perlen", () => {
  assert.deepEqual(L.danebenSatz(41, 14), { art: "stangen", n: 4 });
  assert.deepEqual(L.danebenSatz(15, 14), { art: "perlen", n: 5 });
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

test("Perlen: jede Perle einen Ton höher", () => {
  for (let i = 1; i < 9; i++) assert.ok(L.perlenTon(i + 1) > L.perlenTon(i));
  assert.equal(L.perleHell(4), false);
  assert.equal(L.perleHell(5), true);
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

// Review Christian 2026-11-16 (Regel spielbau.md §8): Die Einführung erzählt in Ruhe eine kleine Geschichte, nennt
// Zehner und Einer, führt das Beispiel durch das Kind aus, sagt, was bei einer anderen Zahl passiert und wie man
// korrigiert, was man lernt, und endet mit einem Übergang.
test("Einführung erzählt eine kleine Geschichte (alle Sätze wörtlich, die alte Kurzform ist weg)", () => {
  const js = readFileSync(new URL("../../../spiele/mathe/m08-stellentafel/spiel.js", import.meta.url), "utf8");
  for (const satz of [
    "Timo räumt heute das Perlenmaterial ein.",
    "Die Zehnerstangen kommen in dieses Feld.",
    "Die kleinen Stäbchen kommen zu den Einern.",
    "Oben steht eine Aufgabe.",
    "Unter jeder Zahl liegen ihre Perlen.",
    "Die Zehner tippst du hier.",
    "Die Einer tippst du hier.",
    "Zum Beispiel zehn plus drei.",
    "Zum Beispiel dreizehn minus zehn.",
    "Tippe die Eins und die Drei.",
    "Tippe die Drei.",
    "Dann tippe auf den Knopf mit dem Haken.",
    "Timo nimmt die Stange mit.",
    "Passt eine Zahl nicht, siehst du es.",
    "Dann probierst du es einfach noch einmal.",
    "Vertippt? Tippe auf den Knopf neben der Null.",
    "So lernst du Zehner und Einer.",
    "Jetzt geht es los.",
  ]) assert.ok(js.includes(`blase.sage("${satz}"`), satz);
  for (const alt of ["Jetzt tippst du.", "Du tippst das Ergebnis.", "Timo legt eine Stange und drei Perlen."]) assert.ok(!js.includes(`"${alt}"`), alt);
  // Die Hilfe wirkt in der Einführung (sagt den Schritt noch einmal).
  assert.match(js, /if \(!E\.hilfeGedrueckt\(\)\) hilfeTippen\?\.\(\)/);
});

// Review Christian 2026-11-16 (Regel spielbau.md §8 aus M06): nach einem Fehlversuch ein klarer Auftrag, kein Urteil;
// er fällt weg, wenn das Kind schon wieder tippt.
test("Fehlversuch: nach dem Daneben-Satz „Versuch es noch einmal.“, nur ohne neuen Tipp", () => {
  const js = readFileSync(new URL("../../../spiele/mathe/m08-stellentafel/spiel.js", import.meta.url), "utf8");
  assert.ok(js.includes('blase.sage("Versuch es noch einmal.")'));
  const daneben = js.slice(js.indexOf("async function wirkungDaneben"), js.indexOf("function zeigeHohl"));
  assert.match(daneben, /erzaehler\.nochmal\(\)/);
  assert.match(daneben, /tippZaehler/);
});

// --- Wanderung (Christian 2026-11-16): Ergebnis in Zehner und Einer tippen, die Aufgabe wandert in die Tafel --------
test("Stellen: Zehner zuerst, dann Einer; Einer zuerst geht auch", () => {
  let s = L.leereStellen();
  assert.deepEqual(s, { z: "", e: "", aktiv: "z" });
  s = L.tippeStelle(s, "1");
  assert.deepEqual(s, { z: "1", e: "", aktiv: "e" });
  s = L.tippeStelle(s, "8");
  assert.deepEqual(s, { z: "1", e: "8", aktiv: "e" });
  assert.equal(L.zahlAusStellen(s), 18);
  let t = L.waehleStelle(L.leereStellen(), "e");
  t = L.tippeStelle(t, "8");
  t = L.waehleStelle(t, "z");
  t = L.tippeStelle(t, "1");
  assert.equal(L.zahlAusStellen(t), 18);
  assert.equal(L.tippeStelle(L.leereStellen(), "x").z, "");
});

test("Stellen: Zahl ohne Zehner zählt, führende Null und fehlende Einer nicht", () => {
  assert.equal(L.zahlAusStellen({ z: "", e: "8", aktiv: "e" }), 8);
  assert.equal(L.zahlAusStellen({ z: "0", e: "8", aktiv: "e" }), null);
  assert.equal(L.zahlAusStellen({ z: "1", e: "", aktiv: "e" }), null);
  assert.equal(L.zahlAusStellen(L.leereStellen()), null);
  assert.equal(L.zahlAusStellen({ z: "1", e: "0", aktiv: "e" }), 10);
});

test("Stellen: Löschen leert den aktiven Platz, sonst den anderen und wechselt dorthin", () => {
  assert.deepEqual(L.loescheStelle({ z: "1", e: "8", aktiv: "e" }), { z: "1", e: "", aktiv: "e" });
  assert.deepEqual(L.loescheStelle({ z: "1", e: "", aktiv: "e" }), { z: "", e: "", aktiv: "z" });
  assert.deepEqual(L.loescheStelle(L.leereStellen()), L.leereStellen());
});

test("Stellen: welche Stelle nicht passt", () => {
  assert.deepEqual(L.falscheStellen({ z: "1", e: "7", aktiv: "e" }, 18), ["e"]);
  assert.deepEqual(L.falscheStellen({ z: "8", e: "1", aktiv: "e" }, 18), ["z", "e"]);
  assert.deepEqual(L.falscheStellen({ z: "1", e: "8", aktiv: "e" }, 8), ["z"]);
  assert.deepEqual(L.falscheStellen({ z: "", e: "8", aktiv: "e" }, 8), []);
});

test("Stellen: nächster Zug führt von jedem Stand zur Antwort (Hilfe 2, Prüfstand)", () => {
  const spiele = (s, antwort) => {
    for (let i = 0; i < 10; i++) {
      const z = L.naechsterStellenZug(s, antwort);
      if (z.art === "fertig") return s;
      if (z.art === "platz") s = L.waehleStelle(s, z.stelle);
      else s = z.taste === "loeschen" ? L.loescheStelle(s) : L.tippeStelle(s, z.taste);
    }
    throw new Error("kein Ende");
  };
  assert.equal(L.zahlAusStellen(spiele(L.leereStellen(), 18)), 18);
  assert.equal(L.zahlAusStellen(spiele(L.leereStellen(), 8)), 8);
  assert.equal(L.zahlAusStellen(spiele({ z: "8", e: "1", aktiv: "e" }, 18)), 18);
  assert.equal(L.zahlAusStellen(spiele({ z: "1", e: "3", aktiv: "e" }, 3)), 3);
  assert.deepEqual(L.naechsterStellenZug(L.leereStellen(), 8), { art: "platz", stelle: "e" });
  assert.deepEqual(L.naechsterStellenZug(L.leereStellen(), 18), { art: "taste", taste: "1" });
  const zuege = L.zuegeZu(L.leereStellen(), [18, 81, 8]);
  assert.deepEqual(zuege, [{ art: "taste", taste: "1" }, { art: "taste", taste: "8" }, { art: "platz", stelle: "e" }]);
});

test("Aufgabe aus Täfelchen: Stelle und Rolle jeder Ziffer, Material darunter", () => {
  const zif = (t) => t.taefelchen.map((x) => (x.art === "zeichen" ? x.zeichen : `${x.ziffer}${x.stelle}:${x.rolle}`));
  const plus = L.aufgabenTaefelchen(L.aufgabeAus("plus:8+10"));
  assert.deepEqual(zif(plus), ["1z:wandert", "0e:bleibt", "+", "8e:wandert", "="]);
  assert.equal(plus.nullDarunter, false);
  assert.deepEqual(plus.material, [{ wert: 10, unter: 0, stelle: "z", rolle: "wandert" }, { wert: 8, unter: 1, stelle: "e", rolle: "wandert" }]);
  const m10 = L.aufgabenTaefelchen(L.aufgabeAus("minus:18-10"));
  assert.deepEqual(zif(m10), ["1z:geht", "8e:wandert", "−", "1z:bleibt", "0e:bleibt", "="]);
  assert.deepEqual(m10.material, [{ wert: 10, unter: 0, stelle: "z", rolle: "geht" }, { wert: 8, unter: 0, stelle: "e", rolle: "wandert" }]);
  const m8 = L.aufgabenTaefelchen(L.aufgabeAus("minus:18-8"));
  assert.deepEqual(zif(m8), ["1z:wandert", "8e:geht", "−", "8e:bleibt", "="]);
  assert.equal(m8.nullDarunter, true);
  assert.deepEqual(m8.material, [{ wert: 10, unter: 0, stelle: "z", rolle: "wandert" }, { wert: 8, unter: 0, stelle: "e", rolle: "geht" }]);
  // Jede Ziffer, die wandert, gehört an die Stelle, an der sie in der Antwort steht.
  for (const key of ["plus:3+10", "minus:13-10", "minus:13-3"]) {
    const a = L.aufgabeAus(key);
    const t = L.aufgabenTaefelchen(a);
    const ziel = { z: a.antwort >= 10 ? String(Math.floor(a.antwort / 10)) : "", e: String(a.antwort % 10) };
    for (const x of t.taefelchen.filter((x) => x.rolle === "wandert")) assert.equal(x.ziffer, ziel[x.stelle], key);
    if (t.nullDarunter) assert.equal(ziel.e, "0", key);
  }
});

// Die Oberfläche ist das Spiel: Aufgabe aus Täfelchen auf der Matte, zwei Plätze für Zehner und Einer, kein hohles
// Material, keine Aufgabenkarte, keine Kartenreihe mehr.
test("Matte: Aufgabe aus Täfelchen, Plätze für Zehner und Einer, nichts vom alten Bild", () => {
  const html = readFileSync(new URL("../../../spiele/mathe/m08-stellentafel/index.html", import.meta.url), "utf8");
  assert.match(html, /class="aufgabe" id="aufgabe"/);
  assert.match(html, /class="platz" id="platz-z" data-stelle="z"/);
  assert.match(html, /class="platz" id="platz-e" data-stelle="e"/);
  for (const alt of ["hohl", "gleichung", "karten-z", "rechnung"]) assert.ok(!html.includes(alt), alt);
});

test("Richtig bei Plus: „Zehn und acht. Achtzehn.“ für jede Aufgabe 10 + e", () => {
  assert.equal(TEXTE.richtig["plus:8+10"], "Zehn und acht. Achtzehn.");
  for (let e = 1; e <= 9; e++) assert.ok(TEXTE.richtig[`plus:${e}+10`], String(e));
});

// Abschlussprüfung: Der Haken darf nie ohne Reaktion bleiben (ein Kind steckte bei 18 − 10 mit „8“ im Zehner fest).
test("vorFertig: 0 im Zehner rutscht weg, fehlende Einer werden gezeigt", () => {
  assert.deepEqual(L.vorFertig({ z: "0", e: "8", aktiv: "e" }), { s: { z: "", e: "8", aktiv: "e" }, art: "zahl", nullWeg: true });
  assert.deepEqual(L.vorFertig({ z: "1", e: "8", aktiv: "e" }), { s: { z: "1", e: "8", aktiv: "e" }, art: "zahl", nullWeg: false });
  assert.deepEqual(L.vorFertig({ z: "8", e: "", aktiv: "e" }), { s: { z: "8", e: "", aktiv: "e" }, art: "einer-fehlt", nullWeg: false });
  assert.deepEqual(L.vorFertig({ z: "", e: "", aktiv: "z" }), { s: { z: "", e: "", aktiv: "e" }, art: "einer-fehlt", nullWeg: false });
  assert.equal(L.zahlAusStellen(L.vorFertig({ z: "0", e: "8", aktiv: "e" }).s), 8);
});
