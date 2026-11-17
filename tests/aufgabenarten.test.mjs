import { test } from "node:test";
import assert from "node:assert/strict";

const { aufgabenVon, klasseRechnen, poolRechnen, schwierigkeit, darstellbar, ZIEL_MS } =
  await import("../spiele/aufgabenarten.js");

const sd = (key) => schwierigkeit(aufgabenVon({ art: "rechnen", thema: klasseRechnen(key) }).find((a) => a.key === key));

test("zerlegung: geordnete Paare der 7", () => {
  assert.deepEqual(aufgabenVon({ art: "zerlegung", zahl: 7 }).map(a => a.key),
    ["zerl:7:1+6","zerl:7:2+5","zerl:7:3+4","zerl:7:4+3","zerl:7:5+2","zerl:7:6+1"]);
});
test("klasseRechnen: Beispiele je Thema", () => {
  const f = klasseRechnen;
  assert.equal(f("plus:3+4"), "rechnen-7");     assert.equal(f("minus:7-4"), "rechnen-7");
  assert.equal(f("plus:3+10"), "zehn-plus");    assert.equal(f("plus:2+13"), "plus-ohne-20");
  assert.equal(f("plus:9+11"), "plus-zur-20");  assert.equal(f("plus:8+9"), "ueber-10-mit-9");
  assert.equal(f("plus:5+6"), "ueber-10-mit-7");assert.equal(f("minus:13-10"), "minus-zehner");
  assert.equal(f("minus:13-3"), "minus-zehner");assert.equal(f("minus:16-2"), "minus-ohne-20");
  assert.equal(f("minus:20-7"), "minus-von-20");assert.equal(f("minus:13-4"), "minus-ueber-10-bis-5");
  assert.equal(f("minus:13-6"), "minus-ueber-10-ab-6");
  assert.equal(f("plus:12+14"), "plus-bis-30"); assert.equal(f("minus:75-31"), "minus-bis-100");
});
test("rechnen: Pool bis 100 vollständig und überschneidungsfrei aufgeteilt", () => {
  const ids = [...new Set(poolRechnen().map(klasseRechnen))];
  const alle = ids.flatMap(t => aufgabenVon({ art: "rechnen", thema: t }).map(a => a.key));
  assert.equal(new Set(alle).size, alle.length);
  assert.deepEqual(new Set(alle), new Set(poolRechnen()));
  assert.ok(!alle.includes("plus:3+3"));
  assert.ok(!alle.includes("plus:38+25"));
});
test("rechnen: daten und Raum stimmen", () => {
  const a = aufgabenVon({ art: "rechnen", thema: "minus-bis-100" }).find(x => x.key === "minus:75-31");
  assert.deepEqual(a.daten, { op: "minus", a: 44, b: 31, c: 75, raum: 100 });
  assert.equal(aufgabenVon({ art: "rechnen", thema: "rechnen-7" })[0].daten.raum, 10);
});
test("menge und zwillinge: Schlüssel und daten", () => {
  assert.deepEqual(aufgabenVon({ art: "menge", bis: 3 }).map(a => a.key), ["menge:1", "menge:2", "menge:3"]);
  assert.deepEqual(aufgabenVon({ art: "menge", bis: 2 })[1].daten, { n: 2 });
  const z = aufgabenVon({ art: "zwillinge" });
  assert.deepEqual(z.map(a => a.key), ["plus:6+6", "plus:7+7", "plus:8+8", "plus:9+9"]);
  assert.deepEqual(z[0].daten, { op: "plus", a: 6, b: 6, c: 12, raum: 20 });
});
test("darstellbar: Zahlenzauber kann keine Zwillinge, Perlenbrücke nur 2–10", () => {
  const zz = { art: "rechnen", max: 100, gleiche: false };
  assert.equal(darstellbar(aufgabenVon({ art: "zwillinge" })[0], zz), false);
  assert.equal(darstellbar(aufgabenVon({ art: "zwillinge" })[0], { ...zz, gleiche: true }), true);
  assert.equal(darstellbar(aufgabenVon({ art: "rechnen", thema: "rechnen-7" })[0], zz), true);
  const pb = { art: "zerlegung", zahlen: [2, 10] };
  assert.equal(darstellbar(aufgabenVon({ art: "zerlegung", zahl: 7 })[0], pb), true);
  assert.equal(darstellbar(aufgabenVon({ art: "zerlegung", zahl: 12 })[0], pb), false);
  assert.equal(darstellbar(aufgabenVon({ art: "menge", bis: 3 })[0], pb), false);
  assert.equal(darstellbar(aufgabenVon({ art: "rechnen", thema: "plus-bis-100" })[0], { art: "rechnen", max: 20 }), false);
});
test("darstellbar: zehner (Stellentafel M08) nimmt nur Aufgaben mit einem ganzen Zehner", () => {
  const sp = { art: "rechnen", max: 20, zehner: true };
  const ja = (thema) => aufgabenVon({ art: "rechnen", thema }).every((a) => darstellbar(a, sp));
  assert.equal(ja("zehn-plus"), true);
  assert.equal(ja("minus-zehner"), true);
  assert.equal(darstellbar(aufgabenVon({ art: "rechnen", thema: "ueber-10-mit-7" })[0], sp), false);
  assert.equal(darstellbar(aufgabenVon({ art: "rechnen", thema: "minus-von-20" })[0], sp), false);
  assert.equal(darstellbar(aufgabenVon({ art: "rechnen", thema: "zehn-plus" })[0], { art: "rechnen", max: 20 }), true);
  assert.equal(darstellbar(aufgabenVon({ art: "rechnen", thema: "ueber-10-mit-7" })[0], { art: "rechnen", max: 20 }), true);
});
test("schwierigkeit: 3+4 schwerer als 1+6", () => {
  const k = (key) => schwierigkeit(aufgabenVon({ art: "zerlegung", zahl: 7 }).find(a => a.key === key));
  assert.ok(k("zerl:7:3+4") > k("zerl:7:1+6"));
});
test("schwierigkeit: Übertrag macht Plus und Minus schwerer", () => {
  assert.ok(sd("plus:8+9") > sd("plus:2+13"));        // 13 gegen 2, aber Übertrag +5
  assert.equal(sd("plus:8+9"), 8 + 5);
  assert.equal(sd("plus:2+13"), 2);
  assert.equal(sd("minus:13-6"), 6 + 5);
  assert.equal(sd("minus:16-2"), 2);
  assert.equal(schwierigkeit(aufgabenVon({ art: "menge", bis: 4 })[3]), 4);
});
test("ZIEL_MS: Zielzeiten", () => {
  assert.equal(ZIEL_MS.zerlegung, 8000);
  assert.equal(ZIEL_MS.menge, 4000);
  assert.deepEqual([10, 20, 30, 100].map(ZIEL_MS.rechnen), [12000, 16000, 20000, 30000]);
});

test("aufgabenVon: null und undefined (geplantes Thema) ergeben keine Aufgaben", () => {
  assert.deepEqual(aufgabenVon(null), []);
  assert.deepEqual(aufgabenVon(undefined), []);
});

// --- mal (Einmaleins; Entwurf docs/spiele/mathe/m37-kettenhuepfer.md §10) ---------------------------------
const { malAus, faktorenDerReihe, KERN_FAKTOREN } = await import("../spiele/aufgabenarten.js");
const REIHEN = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const malPool = () => [...REIHEN.map((n) => ({ art: "mal", reihe: n })), { art: "mal", kern: true }].map(aufgabenVon);

test("mal: Schlüssel und daten (a Gruppen zu je b)", () => {
  const z = aufgabenVon({ art: "mal", reihe: 2 });
  assert.deepEqual(z.map((a) => a.key), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((a) => `mal:${a}*2`));
  assert.deepEqual(aufgabenVon({ art: "mal", reihe: 7 }).find((a) => a.key === "mal:6*7").daten, { a: 6, b: 7, c: 42 });
  assert.deepEqual(malAus("mal:6*7"), { a: 6, b: 7, c: 42 });
  assert.equal(malAus("plus:6+7"), null);
});
test("mal: Reihen 2, 5, 10 ganz, übrige Reihen ohne die Kernaufgaben, Kern mal 1, 2, 5, 10 der übrigen Reihen", () => {
  for (const n of [2, 5, 10]) assert.equal(aufgabenVon({ art: "mal", reihe: n }).length, 10);
  for (const n of [3, 4, 6, 7, 8, 9]) assert.deepEqual(aufgabenVon({ art: "mal", reihe: n }).map((a) => a.daten.a), [3, 4, 6, 7, 8, 9]);
  const kern = aufgabenVon({ art: "mal", kern: true });
  assert.equal(kern.length, 24);
  assert.ok(kern.every((a) => KERN_FAKTOREN.includes(a.daten.a) && ![2, 5, 10].includes(a.daten.b)));
  assert.deepEqual(faktorenDerReihe(9), [3, 4, 6, 7, 8, 9]);
});
test("mal: alle Themen zusammen sind das ganze kleine Einmaleins (a 1–10, n 2–10), ohne Überschneidung", () => {
  const alle = malPool().flat().map((a) => a.key);
  assert.equal(alle.length, 90);
  assert.equal(new Set(alle).size, 90);
  for (const k of ["mal:1*9", "mal:2*9", "mal:5*9", "mal:10*9", "mal:7*8", "mal:10*10"]) assert.ok(alle.includes(k), k);
});
test("mal: faktoren und reihen ausdrücklich (für andere Spiele, z. B. Punktefeld)", () => {
  assert.deepEqual(aufgabenVon({ art: "mal", reihe: 4, faktoren: [2, 3] }).map((a) => a.key), ["mal:2*4", "mal:3*4"]);
  assert.deepEqual(aufgabenVon({ art: "mal", kern: true, reihen: [7], faktoren: [5] }).map((a) => a.key), ["mal:5*7"]);
  assert.deepEqual(aufgabenVon({ art: "mal" }), []);
});
test("mal: Schwierigkeit nach dem Abstand zur Kernaufgabe, Zielzeit, darstellbar nach Reihen", () => {
  const s = (key) => schwierigkeit({ art: "mal", daten: malAus(key) });
  assert.deepEqual(["mal:5*7", "mal:6*7", "mal:9*7", "mal:7*7", "mal:8*7"].map(s), [0, 1, 1, 2, 2]);
  assert.equal(ZIEL_MS.mal, 8000);
  const a = aufgabenVon({ art: "mal", reihe: 7 })[0];
  assert.equal(darstellbar(a, { art: "mal", reihen: [2, 10] }), true);
  assert.equal(darstellbar(a, { art: "mal", reihen: [2, 5] }), false);
  assert.equal(darstellbar(a, { art: "mal" }), true);
  assert.equal(darstellbar(a, { art: "rechnen", max: 100 }), false);
});

// --- zahlwort (Zahlenpost M06, Idee docs/spiele/mathe/m06-zahlenpost.md §8) --------------------------------
test("zahlwort: alle Zahlen von bis bis mit Schlüssel zahl:n, ungültige Angaben ergeben nichts", async () => {
  const { zahlAus } = await import("../spiele/aufgabenarten.js");
  const z = aufgabenVon({ art: "zahlwort", von: 11, bis: 20 });
  assert.deepEqual(z.map((a) => a.key), Array.from({ length: 10 }, (_, i) => `zahl:${11 + i}`));
  assert.deepEqual(z[6], { key: "zahl:17", art: "zahlwort", daten: { n: 17 } });
  assert.equal(aufgabenVon({ art: "zahlwort", von: 0, bis: 10 }).length, 11);
  assert.deepEqual(aufgabenVon({ art: "zahlwort", von: 5, bis: 4 }), []);
  assert.deepEqual(aufgabenVon({ art: "zahlwort", von: 0, bis: 101 }), []);
  assert.deepEqual(aufgabenVon({ art: "zahlwort" }), []);
  assert.deepEqual(zahlAus("zahl:17"), { n: 17 });
  assert.equal(zahlAus("mal:6*7"), null);
  assert.equal(zahlAus("zahl:101"), null);
});
test("zahlwort: Schwierigkeit (Einer zuerst ist schwer), Zielzeit, darstellbar nach Zahlenraum", () => {
  const s = (n) => schwierigkeit({ art: "zahlwort", daten: { n } });
  assert.deepEqual([0, 7, 10].map(s), [0, 0, 0]);
  assert.deepEqual([11, 12, 20].map(s), [1, 1, 1]);
  assert.deepEqual([13, 17, 19].map(s), [2, 2, 2]);
  assert.deepEqual([30, 22, 43].map(s), [1, 2, 3]);
  assert.equal(ZIEL_MS.zahlwort, 6000);
  const a = aufgabenVon({ art: "zahlwort", von: 0, bis: 100 });
  assert.equal(darstellbar(a[17], { art: "zahlwort", zahlen: [0, 20] }), true);
  assert.equal(darstellbar(a[43], { art: "zahlwort", zahlen: [0, 20] }), false);
  assert.equal(darstellbar(a[43], { art: "mal" }), false);
});

// --- artikel (Werkzeugwand G09, Idee docs/spiele/grammatik/g09-der-die-das-artikel.md §8) -------------------
test("artikel: 18 Werkzeuge, je sechs mit der, die, das; Schlüssel artikel:<id>, daten mit Wort, Artikel, Bild", async () => {
  const { artikelAus } = await import("../spiele/aufgabenarten.js");
  const a = aufgabenVon({ art: "artikel", wortschatz: "werkzeug" });
  assert.equal(a.length, 18);
  for (const art of ["der", "die", "das"]) assert.equal(a.filter((x) => x.daten.artikel === art).length, 6, art);
  assert.deepEqual(a[0], { key: "artikel:hammer", art: "artikel", daten: { wort: "Hammer", artikel: "der", bild: "hammer" } });
  assert.equal(new Set(a.map((x) => x.key)).size, 18);
  assert.deepEqual(artikelAus("artikel:saege"), { id: "saege", wort: "Säge", artikel: "die" });
  assert.equal(artikelAus("artikel:gibtesnicht"), null);
  assert.equal(artikelAus("mal:6*7"), null);
  assert.deepEqual(aufgabenVon({ art: "artikel", wortschatz: "gibtesnicht" }), []);
  assert.deepEqual(aufgabenVon({ art: "artikel" }), []);
});
test("artikel: Schwierigkeit (Endung verrät den Artikel 0, Verwechsler 2), Zielzeit, darstellbar nur für die eigene Art", () => {
  const s = (id) => schwierigkeit(aufgabenVon({ art: "artikel", wortschatz: "werkzeug" }).find((x) => x.daten.bild === id));
  assert.deepEqual(["saege", "schere", "zange", "buerste"].map(s), [0, 0, 0, 0]);
  assert.deepEqual(["hammer", "seil", "glas"].map(s), [1, 1, 1]);
  assert.deepEqual(["leiter", "nadel", "messer"].map(s), [2, 2, 2]);
  assert.equal(ZIEL_MS.artikel, 6000);
  const a = aufgabenVon({ art: "artikel", wortschatz: "werkzeug" })[0];
  assert.equal(darstellbar(a, { art: "artikel", stufen: ["material"] }), true);
  assert.equal(darstellbar(a, { art: "zahlwort", zahlen: [0, 20] }), false);
});

// --- verbform (Ich, du, wir G02, Idee docs/spiele/grammatik/g02-ich-du-wir-person-und-verb.md §8) ----------------
test("verbform: Schlüssel verbform:<ziel>:<verb>:<person>, je Ziel die richtigen Aufgaben", async () => {
  const { verbformAus } = await import("../spiele/aufgabenarten.js");
  const e = aufgabenVon({ art: "verbform", ziel: "endung" });
  assert.equal(e.length, 49);
  assert.deepEqual(e[0], { key: "verbform:endung:malen:ich", art: "verbform", daten: { ziel: "endung", verb: "malen", stamm: "mal", grundform: "malen", person: "ich", pronomen: "ich", form: "male", endung: "e", wer: ["ich"] } });
  assert.equal(new Set(e.map((x) => x.key)).size, 49);
  assert.equal(aufgabenVon({ art: "verbform", ziel: "pronomen" }).length, 49);
  assert.equal(aufgabenVon({ art: "verbform", ziel: "grundform" }).length, 16);
  assert.deepEqual(aufgabenVon({ art: "verbform", ziel: "gibtesnicht" }), []);
  assert.deepEqual(aufgabenVon({ art: "verbform" }), []);
  assert.equal(verbformAus("verbform:endung:malen:du").form, "malst");
  assert.equal(verbformAus("verbform:endung:basteln:du"), null);
  assert.equal(verbformAus("mal:6*7"), null);
});
test("verbform: Schwierigkeit (ich, du leicht; ihr und sie in der Mehrzahl schwer), Zielzeit, darstellbar nach Ziel", () => {
  const s = (ziel, verb, person) => schwierigkeit(aufgabenVon({ art: "verbform", ziel }).find((x) => x.key === `verbform:${ziel}:${verb}:${person}`));
  assert.deepEqual(["ich", "du", "er", "wir", "ihr", "sie-pl"].map((p) => s("endung", "malen", p)), [0, 0, 1, 1, 2, 2]);
  assert.deepEqual([s("grundform", "malen", "er"), s("grundform", "basteln", "er")], [1, 2]);
  assert.equal(ZIEL_MS.verbform, 6000);
  const a = aufgabenVon({ art: "verbform", ziel: "endung" })[0];
  assert.equal(darstellbar(a, { art: "verbform", ziele: ["endung", "pronomen"] }), true);
  assert.equal(darstellbar(a, { art: "verbform", ziele: ["grundform"] }), false);
  assert.equal(darstellbar(a, { art: "artikel" }), false);
});
