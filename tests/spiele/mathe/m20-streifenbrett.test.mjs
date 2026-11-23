// M20 Streifenbrett: reine Spiellogik (spiele/mathe/m20-streifenbrett/logik.js), die Sätze aus Daten (texte.json) und die
// Aufgabenart `paket` (spiele/aufgabenarten.js).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../../../spiele/mathe/m20-streifenbrett/logik.js");
const { aufgabenVon, paketAus, paketKniff, schwierigkeit, darstellbar, ZIEL_MS } = await import("../../../spiele/aufgabenarten.js");
const TEXTE = JSON.parse(readFileSync(new URL("../../../spiele/mathe/m20-streifenbrett/texte.json", import.meta.url), "utf8"));
const THEMEN = ["plus-0-und-1", "plus-2-und-3", "plus-mit-5", "tauschaufgaben-bis-10", "plus-bis-10-gemischt", "minus-0-1-alles-weg", "minus-bis-10-gemischt", "blitzrechnen-bis-20"];
const alle = THEMEN.flatMap((t) => aufgabenVon({ art: "paket", thema: t }));

test("texte.json ist das, was texteErzeugen liefert (nichts von Hand geändert)", () => {
  assert.deepEqual(TEXTE, L.texteErzeugen());
});

test("zahlwort: null bis zwanzig, groß geschrieben; sonst ein Fehler", () => {
  assert.deepEqual([0, 1, 11, 12, 17, 20].map(L.zahlwort), ["Null", "Eins", "Elf", "Zwölf", "Siebzehn", "Zwanzig"]);
  assert.throws(() => L.zahlwort(21));
  assert.throws(() => L.zahlwort(-1));
});

test("paket: jede Aufgabe aller Themen hat Sätze, Hilfe und Steg (alle Stücke stehen in texte.json)", () => {
  const stuecke = new Set([
    ...Object.values(TEXTE.zahl), ...Object.values(TEXTE.zahlEnde), ...Object.values(TEXTE.zahlFrage), ...Object.values(TEXTE.wort),
  ]);
  for (const a of alle) {
    const d = a.daten;
    for (const teile of [L.aufgabeTeile(TEXTE, d), L.gleichungTeile(TEXTE, d), L.hilfeTeile(TEXTE, d)]) {
      assert.ok(teile.length > 0, a.key);
      for (const t of teile) assert.ok(stuecke.has(t), `${a.key}: Stück „${t}“ fehlt in texte.json`);
    }
    const steg = L.stegVon(d);
    assert.equal(steg.ergebnis, d.op === "plus" ? d.c : d.a, a.key);
    assert.ok(steg.perlen.length === (d.op === "plus" ? d.c : d.c), `${a.key}: Perlen`);
    assert.ok(TEXTE.insel[steg.ergebnis], `${a.key}: Insel`);
  }
});

test("Sätze: Aufgabe, Gleichung, Hilfe als Stücke", () => {
  const plus = { op: "plus", a: 6, b: 3, c: 9 };
  const minus = { op: "minus", a: 5, b: 4, c: 9 };
  assert.deepEqual(L.aufgabeTeile(TEXTE, plus), ["Sechs", "Plus", "Drei."]);
  assert.deepEqual(L.aufgabeTeile(TEXTE, minus), ["Neun", "Minus", "Vier."]);
  assert.deepEqual(L.gleichungTeile(TEXTE, plus), ["Sechs", "Plus", "Drei", "Gleich", "Neun."]);
  assert.deepEqual(L.gleichungTeile(TEXTE, minus), ["Neun", "Minus", "Vier", "Gleich", "Fünf."]);
  assert.deepEqual(L.hilfeTeile(TEXTE, { ...plus, kniff: "gemischt" }), ["Sechs", "Plus", "Zwei", "Gleich", "Acht.", "Und noch", "Eins?"]);
  assert.deepEqual(L.hilfeTeile(TEXTE, { op: "plus", a: 6, b: 0, c: 6, kniff: "null" }), ["Es kommt nichts dazu."]);
});

test("hilfeVon: null, nachbar, Schritt mit Rest, fünf, tausch, alles – nie die Lösung selbst", () => {
  assert.deepEqual(L.hilfeVon({ op: "plus", a: 6, b: 0, c: 6, kniff: "null" }), { art: "null", marke: null });
  assert.deepEqual(L.hilfeVon({ op: "minus", a: 8, b: 0, c: 8, kniff: "null" }), { art: "null", marke: null });
  assert.deepEqual(L.hilfeVon({ op: "plus", a: 6, b: 1, c: 7, kniff: "nachbar" }), { art: "nachbar", marke: 6 });
  assert.deepEqual(L.hilfeVon({ op: "minus", a: 7, b: 1, c: 8, kniff: "nachbar" }), { art: "nachbar", marke: 8 });
  assert.deepEqual(L.hilfeVon({ op: "minus", a: 0, b: 8, c: 8, kniff: "alles" }), { art: "alles", marke: null });
  assert.deepEqual(L.hilfeVon({ op: "plus", a: 5, b: 3, c: 8, kniff: "fuenf" }), { art: "fuenf", marke: null, r: 3 });
  assert.deepEqual(L.hilfeVon({ op: "plus", a: 2, b: 7, c: 9, kniff: "tausch" }), { art: "tausch", marke: null, g: 7, k: 2 });
  assert.deepEqual(L.hilfeVon({ op: "plus", a: 6, b: 3, c: 9, kniff: "gemischt" }), { art: "schritt", marke: 8, k: 2, p: 8, r: 1 });
  assert.deepEqual(L.hilfeVon({ op: "minus", a: 4, b: 6, c: 10, kniff: "gemischt" }), { art: "schritt", marke: 7, k: 3, p: 7, r: 3 });
  for (const a of alle) {
    const h = L.hilfeVon(a.daten);
    const ergebnis = a.daten.op === "plus" ? a.daten.c : a.daten.a;
    assert.notEqual(h.marke, ergebnis, `${a.key}: die Marke wäre die Lösung`);
    if (h.art === "schritt") assert.ok(h.k >= 1 && h.r >= 1 && h.k + h.r === a.daten.b, a.key);
  }
});

test("stegVon: Plus legt zwei Stäbe hintereinander, Minus einen Stab und das Tuch über die letzten Perlen", () => {
  const p = L.stegVon({ op: "plus", a: 6, b: 3, c: 9 });
  assert.deepEqual(p.staebe.map((s) => s.wert), [6, 3]);
  assert.equal(p.perlen.length, 9);
  assert.equal(p.tuch, null);
  assert.equal(p.ergebnis, 9);
  assert.ok(p.staebe[1].x > p.staebe[0].x + p.staebe[0].laenge);
  assert.ok(p.perlen.every((x, i) => i === 0 || x > p.perlen[i - 1]));
  const m = L.stegVon({ op: "minus", a: 5, b: 4, c: 9 });
  assert.deepEqual(m.staebe.map((s) => s.wert), [9]);
  assert.equal(m.perlen.length, 9);
  assert.equal(m.ergebnis, 5);
  assert.ok(m.tuch && m.tuch.von > m.perlen[4] && m.tuch.von < m.perlen[5] && m.tuch.bis === m.ende);
  // über 10: der goldene Zehnerstab und der Rest
  assert.deepEqual(L.staebe(13), [10, 3]);
  assert.deepEqual(L.staebe(10), [10]);
  assert.deepEqual(L.staebe(0), []);
  assert.deepEqual(L.stegVon({ op: "plus", a: 7, b: 8, c: 15 }).staebe.map((s) => s.wert), [7, 8]);
  assert.deepEqual(L.stegVon({ op: "minus", a: 7, b: 6, c: 13 }).staebe.map((s) => s.wert), [10, 3]);
  // + 0: nur ein Stab; c − c: kein Stab bleibt, alles unter dem Tuch
  assert.deepEqual(L.stegVon({ op: "plus", a: 6, b: 0, c: 6 }).staebe.map((s) => s.wert), [6]);
  const alles = L.stegVon({ op: "minus", a: 0, b: 8, c: 8 });
  assert.equal(alles.ergebnis, 0);
  assert.ok(alles.tuch && alles.tuch.von < alles.perlen[0]);
});

test("platzX: auf dem Steg die Perle, dahinter in gleichen Schritten; laufPerlen: so weit wie getippt, höchstens bis zum Ende", () => {
  const steg = L.stegVon({ op: "plus", a: 6, b: 3, c: 9 });
  assert.equal(L.platzX(steg, 0), 0);
  assert.equal(L.platzX(steg, 1), steg.perlen[0]);
  assert.equal(L.platzX(steg, 9), steg.perlen[8]);
  const d1 = L.platzX(steg, 10) - L.platzX(steg, 9);
  assert.ok(Math.abs(L.platzX(steg, 11) - L.platzX(steg, 10) - d1) < 1e-9);
  assert.ok(L.platzX(steg, 10) > steg.perlen[8]);
  assert.equal(L.laufPerlen(steg, 8), 8);
  assert.equal(L.laufPerlen(steg, 12), 9);
  assert.equal(L.laufPerlen(steg, -1), 0);
});

test("laufMs: 0,09 s je Perle, bei sehr langen Wegen höchstens 1,6 s; pfahlX liegt fest und wächst", () => {
  assert.equal(L.laufMs(9), 810);
  assert.equal(L.laufMs(20), 1600);
  assert.equal(L.laufMs(0), 0);
  assert.ok([1, 2, 3, 4].every((k) => L.pfahlX(k + 1 > 4 ? 4 : k + 1) >= L.pfahlX(k)));
  assert.ok(L.tonHoehe(2) > L.tonHoehe(1));
});

test("tippe: höchstens zwei Ziffern, eine einzelne Null wird ersetzt, Löschen nimmt die letzte", () => {
  assert.equal(L.tippe("", "9"), "9");
  assert.equal(L.tippe("1", "7"), "17");
  assert.equal(L.tippe("17", "3"), "17");
  assert.equal(L.tippe("0", "7"), "7");
  assert.equal(L.tippe("17", "loeschen"), "1");
  assert.equal(L.tippe("", "loeschen"), "");
  assert.equal(L.tippe("", "x"), "");
  assert.equal(L.bereit(""), false);
  assert.equal(L.bereit("0"), true);
});

test("naechsteTaste und tastenZu: der Weg zur Zahl, Löschen bei falschem Anfang, Haken am Ende", () => {
  assert.equal(L.naechsteTaste("", 9), "9");
  assert.equal(L.naechsteTaste("9", 9), "fertig");
  assert.equal(L.naechsteTaste("", 12), "1");
  assert.equal(L.naechsteTaste("1", 12), "2");
  assert.equal(L.naechsteTaste("12", 12), "fertig");
  assert.equal(L.naechsteTaste("3", 12), "loeschen");
  assert.deepEqual(L.tastenZu("", [9, 10, 8]), ["1", "8", "9"]);
  assert.deepEqual(L.tastenZu("1", [9, 10, 8]), ["0"]);
  assert.deepEqual(L.tastenZu("9", [9, 10]), ["fertig"]);
  assert.deepEqual(L.tastenZu("5", [9, 10]), ["loeschen"]);
});

test("kandidaten: Ergebnis, Nachbarn und das verwechselte Rechenzeichen, im Brett bis 20", () => {
  assert.deepEqual(L.kandidaten({ op: "plus", a: 6, b: 3, c: 9 }), [9, 10, 8, 3]);
  assert.deepEqual(L.kandidaten({ op: "minus", a: 5, b: 4, c: 9 }), [5, 6, 4, 13]);
  assert.ok(L.kandidaten({ op: "plus", a: 20, b: 0, c: 20 }).every((x) => x >= 0 && x <= 20));
});

test("naechsteFreude: nie zweimal gleich; witz: höchstens jede fünfte Lösung, nie ohne Anlass", () => {
  for (const v of [null, "hocke", "reiher", "gross"]) for (let i = 0; i < 40; i++) assert.notEqual(L.naechsteFreude(v), v);
  assert.equal(L.naechsteFreude("hocke", () => 0), "gross");
  assert.equal(L.witz(3, { op: "plus", a: 6, b: 0 }), null);
  assert.equal(L.witz(4, { op: "plus", a: 6, b: 0 }), "null");
  assert.equal(L.witz(4, { op: "minus", a: 0, b: 8 }), "alles");
  assert.equal(L.witz(4, { op: "plus", a: 6, b: 3 }, () => 0.9), null);
  assert.equal(L.witz(4, { op: "plus", a: 6, b: 3 }, () => 0.1), "tropfen");
});

// --- Aufgabenart paket ------------------------------------------------------------------------------------------------

test("paket: Schlüssel mit Thema, daten wie rechnen plus Kniff; paketAus liest ihn zurück", () => {
  const a = aufgabenVon({ art: "paket", thema: "plus-2-und-3" });
  assert.ok(a.length > 0);
  const x = a.find((t) => t.key === "paket:plus-2-und-3:5+2");
  assert.deepEqual(x, { key: "paket:plus-2-und-3:5+2", art: "paket", daten: { op: "plus", a: 5, b: 2, c: 7, raum: 10, kniff: "zwei-drei" } });
  const m = aufgabenVon({ art: "paket", thema: "minus-bis-10-gemischt" }).find((t) => t.key === "paket:minus-bis-10-gemischt:9-4");
  assert.deepEqual(m?.daten, { op: "minus", a: 5, b: 4, c: 9, raum: 10, kniff: "gemischt" });
  assert.deepEqual(paketAus("paket:minus-bis-10-gemischt:9-4"), { thema: "minus-bis-10-gemischt", op: "minus", a: 5, b: 4, c: 9 });
  assert.deepEqual(paketAus("paket:plus-2-und-3:5+2"), { thema: "plus-2-und-3", op: "plus", a: 5, b: 2, c: 7 });
  for (const k of ["paket:gibt-es-nicht:1+1", "paket:plus-2-und-3:15+9", "paket:minus-bis-10-gemischt:3-4", "plus:1+1", "", null]) assert.equal(paketAus(k), null, String(k));
  assert.deepEqual(aufgabenVon({ art: "paket", thema: "gibt-es-nicht" }), []);
  assert.deepEqual(aufgabenVon({ art: "paket" }), []);
  assert.equal(paketKniff("plus-mit-5", "plus", 5, 3, 8), "fuenf");
  assert.equal(paketKniff("gibt-es-nicht", "plus", 5, 3, 8), "gemischt");
});

test("paket: die Pools der Themen (Pakete, Tausch mit der kleinen Zahl zuerst, c − 0, c − 1, c − c, alles bis 20 ohne ± 0)", () => {
  const keys = (t) => aufgabenVon({ art: "paket", thema: t }).map((x) => x.key.split(":")[2]);
  assert.ok(keys("plus-0-und-1").includes("6+0") && keys("plus-0-und-1").includes("6+1") && keys("plus-0-und-1").includes("0+6") && keys("plus-0-und-1").includes("1+6"));
  assert.ok(keys("plus-2-und-3").every((k) => /\+(2|3)$/.test(k)));
  assert.ok(keys("plus-mit-5").includes("5+3") && keys("plus-mit-5").includes("2+5") && keys("plus-mit-5").includes("5+5"));
  assert.ok(keys("tauschaufgaben-bis-10").every((k) => { const [a, b] = k.split("+").map(Number); return a <= 3 && b > 3 && a + b <= 10; }));
  assert.ok(keys("plus-bis-10-gemischt").every((k) => k.split("+").map(Number).reduce((s, x) => s + x, 0) <= 10));
  assert.ok(keys("plus-bis-10-gemischt").includes("0+9") && keys("plus-bis-10-gemischt").includes("5+5"));
  assert.ok(keys("minus-0-1-alles-weg").every((k) => { const [c, b] = k.split("-").map(Number); return b === 0 || b === 1 || b === c; }));
  assert.ok(keys("minus-0-1-alles-weg").includes("8-0") && keys("minus-0-1-alles-weg").includes("8-1") && keys("minus-0-1-alles-weg").includes("8-8"));
  assert.ok(keys("minus-bis-10-gemischt").includes("10-6") && keys("minus-bis-10-gemischt").includes("7-0"));
  const blitz = keys("blitzrechnen-bis-20");
  assert.ok(blitz.includes("7+8") && blitz.includes("13-6") && blitz.includes("9+9") && blitz.includes("16-7"));
  assert.ok(!blitz.some((k) => /[+-]0$/.test(k) || /^0\+/.test(k)));
  // jede Aufgabe kommt je Thema nur einmal vor, und der Schlüssel ist über alle Themen eindeutig
  assert.equal(new Set(alle.map((a) => a.key)).size, alle.length);
});

test("paket: Schwierigkeit, Zielzeit und darstellbar nach Zahlenraum", () => {
  assert.equal(ZIEL_MS.paket, 6000);
  const a = aufgabenVon({ art: "paket", thema: "blitzrechnen-bis-20" });
  const leicht = a.find((x) => x.key.endsWith(":1+1"));
  const schwer = a.find((x) => x.key.endsWith(":9+9"));
  assert.ok(schwierigkeit(schwer) > schwierigkeit(leicht));
  assert.equal(darstellbar(leicht, { art: "paket", max: 20 }), true);
  assert.equal(darstellbar(schwer, { art: "paket", max: 10 }), false);
  assert.equal(darstellbar(leicht, { art: "rechnen", max: 20 }), false);
});
