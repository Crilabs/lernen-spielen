// M06 Zahlenpost: reine Spiellogik (spiele/mathe/m06-zahlenpost/logik.js) und die Sätze aus Daten (texte.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../../../spiele/mathe/m06-zahlenpost/logik.js");
const { aufgabenVon } = await import("../../../spiele/aufgabenarten.js");
const TEXTE = JSON.parse(readFileSync(new URL("../../../spiele/mathe/m06-zahlenpost/texte.json", import.meta.url), "utf8"));
const alle = aufgabenVon({ art: "zahlwort", von: 0, bis: 100 });

test("zahlwort: die Wörter von null bis hundert (Einer zuerst ab 13, elf, zwölf, zwanzig eigene Wörter)", () => {
  assert.deepEqual([0, 1, 11, 12, 13, 17, 20, 21, 30, 43, 71, 99, 100].map(L.zahlwort),
    ["null", "eins", "elf", "zwölf", "dreizehn", "siebzehn", "zwanzig", "einundzwanzig", "dreißig", "dreiundvierzig", "einundsiebzig", "neunundneunzig", "hundert"]);
  assert.equal(L.nomen(1), "Eins");
  assert.equal(L.nomen(71), "Einundsiebzig");
  assert.equal(L.ziffernwort(7), "Sieben");
  assert.throws(() => L.zahlwort(101));
  assert.throws(() => L.zahlwort(-1));
});

test("probeVon: zuerst die Einer, dann die Zehner; bis 9 nur Perlen", () => {
  assert.deepEqual(L.probeVon(17), { einer: 7, zehner: 10 });
  assert.deepEqual(L.probeVon(5), { einer: 5, zehner: 0 });
  assert.deepEqual(L.probeVon(20), { einer: 0, zehner: 20 });
  assert.deepEqual(L.probeVon(0), { einer: 0, zehner: 0 });
});

test("felderFuer: eins bis 9, zwei ab 10, in der Stufe kopf keine Felder", () => {
  assert.deepEqual([0, 9, 10, 17, 99].map((n) => L.felderFuer(n, "material")), [1, 1, 2, 2, 2]);
  assert.deepEqual([0, 17].map((n) => L.felderFuer(n, "vorstellung")), [1, 2]);
  assert.deepEqual([0, 17].map((n) => L.felderFuer(n, "kopf")), [0, 0]);
});

test("tippe: von links nach rechts, nicht mehr als Felder, Löschen, in der freien Zeile höchstens zwei Ziffern", () => {
  assert.equal(L.tippe("", "1", 2), "1");
  assert.equal(L.tippe("1", "7", 2), "17");
  assert.equal(L.tippe("17", "3", 2), "17");
  assert.equal(L.tippe("", "5", 1), "5");
  assert.equal(L.tippe("5", "3", 1), "5");
  assert.equal(L.tippe("17", "loeschen", 2), "1");
  assert.equal(L.tippe("", "loeschen", 2), "");
  assert.equal(L.tippe("", "x", 2), "");
  assert.equal(L.tippe("", "0", 2), "0");
  assert.equal(L.tippe("0", "7", 2), "07");
  assert.equal(L.tippe("0", "7", 0), "7");
  assert.equal(L.tippe("7", "1", 0), "71");
  assert.equal(L.tippe("71", "1", 0), "71");
});

test("bereit: mit Feldern erst, wenn alle gefüllt sind; in der freien Zeile ab einer Ziffer", () => {
  assert.equal(L.bereit("1", 2), false);
  assert.equal(L.bereit("17", 2), true);
  assert.equal(L.bereit("5", 1), true);
  assert.equal(L.bereit("", 1), false);
  assert.equal(L.bereit("", 0), false);
  assert.equal(L.bereit("7", 0), true);
});

test("naechsteTaste: der Weg zur Zahl, Löschen bei falschem Anfang, Fertig am Ende", () => {
  assert.equal(L.naechsteTaste("", 17, 2), "1");
  assert.equal(L.naechsteTaste("1", 17, 2), "7");
  assert.equal(L.naechsteTaste("17", 17, 2), "fertig");
  assert.equal(L.naechsteTaste("7", 17, 2), "loeschen");
  assert.equal(L.naechsteTaste("", 5, 1), "5");
  assert.equal(L.naechsteTaste("5", 5, 1), "fertig");
  assert.equal(L.naechsteTaste("", 5, 0), "5");
  assert.equal(L.naechsteTaste("", 10, 2), "1");
  assert.equal(L.naechsteTaste("10", 10, 2), "fertig");
});

test("kandidaten: Ergebnis zuerst, Zahlendreher gleich danach, mindestens zwei falsche Zahlen, alle tippbar", () => {
  for (const felder of [0, 1, 2]) {
    for (const a of alle.filter((x) => x.daten.n <= 99 && (felder === 1 ? x.daten.n < 10 : felder === 2 ? x.daten.n >= 10 : true))) {
      const n = a.daten.n;
      const k = L.kandidaten(n, felder);
      assert.equal(k[0], L.ziffernVon(n, felder), `${n}`);
      assert.ok(k.length >= 3, `${n} (${felder}): mindestens zwei falsche`);
      assert.equal(new Set(k).size, k.length);
      for (const z of k) {
        // jede Ziffernfolge ist mit den Tasten erreichbar: Taste für Taste bis „fertig“, in der freien Zeile ohne führende Null
        let e = "";
        for (let i = 0; i < 6 && L.naechsteTaste(e, Number(z), felder) !== "fertig"; i++) {
          const t = L.naechsteTaste(e, Number(z), felder);
          if (felder === 0) assert.ok(!z.startsWith("0") || z === "0", `${n}: ${z}`);
          e = L.tippe(e, t, felder);
        }
        assert.ok(L.bereit(e, felder), `${n}: ${z}`);
      }
    }
  }
  assert.deepEqual(L.kandidaten(17, 2).slice(0, 2), ["17", "71"]);
  assert.equal(L.kandidaten(11, 2).includes("11"), true);
  assert.deepEqual(L.kandidaten(5, 1).slice(0, 2), ["5", "6"]);
});

test("tastenZu: Tasten zu den Zielen, Fertig, Löschen nur wenn nichts anderes geht", () => {
  assert.deepEqual(L.tastenZu("", ["17", "71", "18"], 2), ["1", "7"]);
  assert.deepEqual(L.tastenZu("1", ["17", "71", "18"], 2), ["7", "8"]);
  assert.deepEqual(L.tastenZu("17", ["17", "71"], 2), ["fertig"]);
  assert.deepEqual(L.tastenZu("9", ["17", "71"], 2), ["loeschen"]);
  assert.deepEqual(L.tastenZu("1", ["1"], 2), ["loeschen"]);
});

test("Fahrt: Zehnerhäuser ticken in der Fahrtzeit, vorwärts und rückwärts, genau einmal je Zehnerhaus", () => {
  assert.deepEqual(L.tickZeiten(4, 9), []);
  assert.deepEqual(L.tickZeiten(5, 5), []);
  const vor = L.tickZeiten(4, 37);
  assert.equal(vor.length, 3);
  assert.deepEqual([...vor].sort((a, b) => a - b), vor);
  assert.ok(vor.every((t) => t > 0 && t < L.FAHRT_MS));
  const zurueck = L.tickZeiten(37, 4);
  assert.equal(zurueck.length, 3);
  assert.deepEqual([...zurueck].sort((a, b) => a - b), zurueck);
  assert.equal(L.tickZeiten(0, 99).length, 9);
  assert.equal(L.tickZeiten(12, 20).length, 1);
  assert.ok(Math.abs(L.fortschritt(0)) < 1e-6 && Math.abs(L.fortschritt(1) - 1) < 1e-6 && Math.abs(L.fortschritt(0.5) - 0.5) < 1e-6);
});

test("Freude: nie zweimal dieselbe, Wheelie selten; Witz höchstens jede fünfte Aufgabe, daneben nie (nur nach Lösung gefragt)", () => {
  let vorige = null;
  const zaehler = { fahne: 0, pirouette: 0, wheelie: 0 };
  for (let i = 0; i < 3000; i++) {
    const f = L.naechsteFreude(vorige);
    assert.notEqual(f, vorige);
    zaehler[f]++;
    vorige = f;
  }
  assert.ok(zaehler.wheelie < zaehler.fahne && zaehler.wheelie < zaehler.pirouette && zaehler.wheelie > 300, JSON.stringify(zaehler));
  for (let seit = 0; seit < 4; seit++) assert.equal(L.witz(seit, 0, 5, () => 0), null, `seit ${seit}`);
  assert.equal(L.witz(4, 0, 5, () => 0), "kreis");
  assert.equal(L.witz(4, 7, 30, () => 0), "wangen");
  assert.equal(L.witz(4, 7, 3, () => 0), "fangen");
  assert.equal(L.witz(9, 7, 3, () => 0.99), null);
});

test("texte.json: Sätze zu jeder Zahl, Wörter stimmen mit dem Erzeuger überein, Satzlänge und Wortliste", () => {
  const e = L.texteErzeugen();
  for (const k of Object.keys(e)) assert.deepEqual(TEXTE[k], e[k], k);
  // Wort, Ort und Hilfe für die Zahlen, die dran sein können (0 bis 20, Thema 11 bis 20); daneben für jedes Haus der Straße (0 bis 99)
  assert.equal(Object.keys(TEXTE.wort).length, 21);
  for (const k of ["bei", "hilfe1", "hilfe2"]) assert.equal(Object.keys(TEXTE[k]).length, 21, k);
  assert.equal(Object.keys(TEXTE.daneben).length, 100);
  assert.equal(Object.keys(L.texteErzeugen(100).wort).length, 101);
  assert.equal(L.texteErzeugen(100).hilfe1[43], "Drei und vierzig.");
  const verboten = /(^|[^\p{L}])(super|toll|prima|falsch|leider|fehler|schade|gut)(?=$|[^\p{L}])/iu;
  for (const gruppe of ["wort", "bei", "daneben", "hilfe1", "hilfe2"]) {
    for (const [n, satz] of Object.entries(TEXTE[gruppe])) {
      assert.doesNotMatch(satz, verboten, `${gruppe} ${n}`);
      assert.ok(satz.split(/\s+/).length <= 8, `${gruppe} ${n}: höchstens 8 Wörter`);
    }
  }
  assert.equal(TEXTE.bei[0], "Der Brief ist bei der Post.");
  assert.equal(TEXTE.daneben[71], "Timo steht bei Nummer Einundsiebzig.");
  assert.equal(TEXTE.bei[13], "Der Brief ist bei Nummer Dreizehn.");
  // Nie „bei der Dreizehn“: die Stimme spricht daraus eine Ordnungszahl („bei der dreizehnten“).
  for (const gruppe of ["bei", "daneben"]) for (const satz of Object.values(TEXTE[gruppe])) assert.doesNotMatch(satz, /\b(der|zur) (?!Post)\p{Lu}/u, satz);
  assert.equal(TEXTE.hilfe1[13], "Drei und zehn.");
  assert.equal(TEXTE.hilfe1[20], "Zwei Zehner.");
  assert.equal(TEXTE.hilfe1[12], "Zwei und zehn.");
  assert.equal(TEXTE.hilfe1[4], "Vier Perlen.");
  assert.equal(TEXTE.hilfe2[17], "Erst die Eins, dann die Sieben.");
  assert.equal(TEXTE.hilfe2[5], "Die Fünf tippen.");
});

test("klein (Themen bis 10): nur bis 10, Kandidaten sind einzelne Tasten bis 10 (auch „10“)", () => {
  assert.equal(L.istKlein(10), true);
  assert.equal(L.istKlein(20), false);
  assert.equal(L.istKlein(null), false);
  assert.deepEqual(L.kandidatenKlein(5), ["5", "6", "4", "7", "3"]);
  assert.deepEqual(L.kandidatenKlein(10), ["10", "9", "8"]);
  assert.deepEqual(L.kandidatenKlein(0), ["0", "1", "2"]);
});

test("staebe: Zehnerstäbe wie Zehner, die Einer als ein Stäbchen (Seguin-Tafel)", () => {
  assert.deepEqual(L.staebe(0), []);
  assert.deepEqual(L.staebe(7), [7]);
  assert.deepEqual(L.staebe(10), [10]);
  assert.deepEqual(L.staebe(17), [10, 7]);
  assert.deepEqual(L.staebe(45), [10, 10, 10, 10, 5]);
});

test("stabDicke: Zehnerstab passt in die Höhe, viele Stäbe in die Breite, nie dicker als max", () => {
  const feld = { breite: 12, hoehe: 20.5, luecke: 0.5, max: 2.3 };
  assert.equal(L.stabDicke(1, feld), 2.3);
  const neun = L.stabDicke(10, feld);
  assert.ok(10 * neun + 9 * 0.5 <= 12 + 1e-9, "zehn Stäbe passen in die Breite");
  assert.ok(L.stabDicke(1, { ...feld, hoehe: 10 }) * L.STAB_VERHAELTNIS <= 10 + 1e-9, "ein Zehnerstab passt in die Höhe");
});

test("fahrtDauer: immer gleich schnell, weit dauert länger (die Dauer zeigt den Weg)", () => {
  assert.equal(L.fahrtDauer(5, 5), 0);
  assert.equal(L.fahrtDauer(0, 10), L.FAHRT_START_MS + 10 * L.FAHRT_JE_HAUS_MS);
  assert.equal(L.fahrtDauer(45, 4), L.fahrtDauer(4, 45));
  assert.ok(L.fahrtDauer(0, 45) > 2 * L.fahrtDauer(0, 17));
  // Ticks an den Zehnerhäusern liegen auch in langen Fahrten in der Fahrtzeit
  const ms = L.fahrtDauer(3, 97);
  const t = L.tickZeiten(3, 97, ms);
  assert.equal(t.length, 9);
  assert.ok(t.every((x) => x > 0 && x < ms));
});

// Review M08 (2026-11-16): Die erzählte Einführung dauert über 30 s; zählte sie zur Rundenzeit, endete die Runde eines
// sicheren Kindes vor „gekonnt“ (G14). Die Rundenzeit beginnt deshalb erst nach der Einführung – in M06 wie in M08:
// die Einführung bekommt die Runde, rahmen/einfuehrung-lauf.js ruft danach r.beginneZeit(); die 30-s-Reserve hält die
// Lernsteuerung (keine eigene Zeitrechnung im Spiel).
test("Rundenzeit beginnt nach der Einführung (M06 und M08)", async () => {
  const { readFileSync } = await import("node:fs");
  for (const ordner of ["m06-zahlenpost", "m08-stellentafel"]) {
    const js = readFileSync(new URL(`../../../spiele/mathe/${ordner}/spiel.js`, import.meta.url), "utf8");
    const runde = js.slice(js.indexOf("async function spieleRunde"));
    assert.match(runde, /await einfuehrung\([^)]*, r\);/, `${ordner}: Einführung mit der Runde`);
    assert.match(js, /E\.spiele\(/, ordner);
    assert.doesNotMatch(js, /LETZTE_AUFGABE_MS|zeitDa|beginn = Date\.now\(\)/, `${ordner}: keine eigene Rundenzeit`);
  }
});

// Christian 2026-11-16: Die längste Fahrt dauert höchstens 8 s („das reicht als Lerneffekt“) – Timo fährt weiter
// gleich schnell, damit die Dauer den Weg zeigt; nur die Geschwindigkeit ist höher.
test("fahrtDauer: die längste Fahrt (Post 0 bis Haus 99) dauert höchstens 8 s", () => {
  assert.ok(L.fahrtDauer(0, 99) <= 8000, String(L.fahrtDauer(0, 99)));
  assert.ok(L.fahrtDauer(0, 99) > 7000);
  assert.equal(L.fahrtDauer(0, 50) - L.fahrtDauer(0, 40), 10 * L.FAHRT_JE_HAUS_MS);
});
