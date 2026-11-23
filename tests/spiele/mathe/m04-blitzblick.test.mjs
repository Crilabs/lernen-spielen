// M04 Blitzblick: reine Spiellogik (spiele/mathe/m04-blitzblick/logik.js) und die Sätze aus Daten (texte.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../../../spiele/mathe/m04-blitzblick/logik.js");
const { aufgabenVon, darstellbar } = await import("../../../spiele/aufgabenarten.js");
const TEXTE = JSON.parse(readFileSync(new URL("../../../spiele/mathe/m04-blitzblick/texte.json", import.meta.url), "utf8"));
const SPIELE = JSON.parse(readFileSync(new URL("../../../spiele/spiele.json", import.meta.url), "utf8"));
const alle = aufgabenVon({ art: "menge", bis: 20 });

test("mengeAus: menge:7 → 7, alles andere null (0 und über 20 gibt es nicht)", () => {
  assert.deepEqual(L.mengeAus("menge:7"), { n: 7 });
  assert.deepEqual(L.mengeAus("menge:20"), { n: 20 });
  assert.equal(L.mengeAus("menge:0"), null);
  assert.equal(L.mengeAus("menge:21"), null);
  assert.equal(L.mengeAus("zahl:7"), null);
  assert.equal(L.mengeAus(undefined), null);
});

test("mulde: die Lichter füllen die Reihen von oben nach unten, je Reihe fünf; das zweite Feld liegt darunter", () => {
  assert.deepEqual([0, 4, 5, 9, 10, 19].map(L.mulde), [
    { feld: 0, reihe: 0, spalte: 0 }, { feld: 0, reihe: 0, spalte: 4 },
    { feld: 0, reihe: 1, spalte: 0 }, { feld: 0, reihe: 1, spalte: 4 },
    { feld: 1, reihe: 0, spalte: 0 }, { feld: 1, reihe: 1, spalte: 4 },
  ]);
});

test("perle: zehn Perlen je Schnur, die sechste bis zehnte stehen hinter der Lücke", () => {
  assert.deepEqual(L.perle(0), { schnur: 0, platz: 0, hinterLuecke: false });
  assert.deepEqual(L.perle(4), { schnur: 0, platz: 4, hinterLuecke: false });
  assert.deepEqual(L.perle(5), { schnur: 0, platz: 5, hinterLuecke: true });
  assert.deepEqual(L.perle(10), { schnur: 1, platz: 0, hinterLuecke: false });
  assert.deepEqual(L.perle(19), { schnur: 1, platz: 9, hinterLuecke: true });
});

test("Felder und Schnüre: bis 10 eins, darüber zwei", () => {
  assert.deepEqual([1, 10, 11, 20].map(L.schnuereFuer), [1, 1, 2, 2]);
  assert.deepEqual([1, 10, 11, 20].map(L.felderFuer), [1, 1, 2, 2]);
});

test("gruppen: Fünfer für Fünfer, der Rest zuletzt", () => {
  assert.deepEqual(L.gruppen(0), []);
  assert.deepEqual(L.gruppen(3), [3]);
  assert.deepEqual(L.gruppen(5), [5]);
  assert.deepEqual(L.gruppen(7), [5, 2]);
  assert.deepEqual(L.gruppen(20), [5, 5, 5, 5]);
});

test("wirkung: passt, zu wenig Perlen (Glühwürmchen ohne Perle), zu viele (Perlen bleiben dunkel)", () => {
  assert.deepEqual(L.wirkung(4, 4), { passt: true, landen: 4, ohnePerle: 0, dunkel: 0 });
  assert.deepEqual(L.wirkung(3, 4), { passt: false, landen: 3, ohnePerle: 1, dunkel: 0 });
  assert.deepEqual(L.wirkung(5, 4), { passt: false, landen: 4, ohnePerle: 0, dunkel: 1 });
  assert.deepEqual(L.wirkung(9, 2), { passt: false, landen: 2, ohnePerle: 0, dunkel: 7 });
});

test("hilfeSatz: bis 5 eine Reihe, 6 bis 10 volle Reihe und noch, 11 bis 20 oben voll", () => {
  assert.equal(L.hilfeSatz(1), "Ein Licht in einer Reihe.");
  assert.equal(L.hilfeSatz(4), "Vier Lichter in einer Reihe.");
  assert.equal(L.hilfeSatz(5), "Fünf Lichter in einer Reihe.");
  assert.equal(L.hilfeSatz(7), "Eine volle Reihe und noch zwei.");
  assert.equal(L.hilfeSatz(10), "Eine volle Reihe und noch fünf.");
  assert.equal(L.hilfeSatz(13), "Oben voll, unten drei.");
  assert.equal(L.hilfeSatz(20), "Oben voll, unten zehn.");
});

test("zahlwort: null bis zwanzig; außerhalb wirft", () => {
  assert.deepEqual([0, 1, 12, 17, 20].map(L.zahlwort), ["null", "eins", "zwölf", "siebzehn", "zwanzig"]);
  assert.throws(() => L.zahlwort(21));
  assert.throws(() => L.zahlwort(-1));
});

test("texte.json: zu jeder Menge ein Satz „richtig“ und „hilfe2“, zu jedem Unterschied „zuWenig“ und „zuViel“; wie die Logik sie erzeugt", () => {
  assert.deepEqual(Object.fromEntries(Object.entries(TEXTE).filter(([k]) => k !== "hinweis")), L.texteErzeugen());
  for (let n = 1; n <= 20; n++) {
    assert.ok(TEXTE.richtig[n], `richtig ${n}`);
    assert.ok(TEXTE.hilfe2[n], `hilfe2 ${n}`);
  }
  for (let k = 1; k < 20; k++) {
    assert.ok(TEXTE.zuWenig[k], `zuWenig ${k}`);
    assert.ok(TEXTE.zuViel[k], `zuViel ${k}`);
  }
  assert.equal(TEXTE.richtig[1], "Ein Glühwürmchen, eine Perle.");
  assert.equal(TEXTE.richtig[4], "Vier Glühwürmchen, vier Perlen.");
  assert.equal(TEXTE.zuWenig[1], "Ein Glühwürmchen hat keine Perle.");
  assert.equal(TEXTE.zuWenig[3], "Drei Glühwürmchen haben keine Perle.");
  assert.equal(TEXTE.zuViel[1], "Eine Perle bleibt dunkel.");
  assert.equal(TEXTE.zuViel[2], "Zwei Perlen bleiben dunkel.");
});

test("kandidaten: die Menge und ihre Nachbarn, innerhalb der sichtbaren Perlen", () => {
  assert.deepEqual(L.kandidaten(4), [4, 3, 5, 2, 6]);
  assert.deepEqual(L.kandidaten(1), [1, 2, 3]);
  assert.deepEqual(L.kandidaten(10), [10, 9, 8]);
  assert.deepEqual(L.kandidaten(10, 20), [10, 9, 11, 8, 12]);
});

test("tippeZiffer und naechsteTaste: höchstens zwei Ziffern, Zehn als eine Taste, Löschen, Fertig", () => {
  assert.equal(L.tippeZiffer("", "1"), "1");
  assert.equal(L.tippeZiffer("1", "3"), "13");
  assert.equal(L.tippeZiffer("13", "4"), "13");
  assert.equal(L.tippeZiffer("0", "4"), "4");
  assert.equal(L.tippeZiffer("13", "loeschen"), "1");
  assert.equal(L.tippeZiffer("", "10"), "10");
  assert.equal(L.tippeZiffer("1", "x"), "1");
  assert.equal(L.naechsteTaste("", 13), "1");
  assert.equal(L.naechsteTaste("1", 13), "3");
  assert.equal(L.naechsteTaste("13", 13), "fertig");
  assert.equal(L.naechsteTaste("2", 13), "loeschen");
  assert.equal(L.naechsteTaste("", 7), "7");
});

test("Aufgabenart menge: 1 bis 20, spiele.json trägt sie auf allen drei Stufen", () => {
  assert.equal(alle.length, 20);
  const eintrag = SPIELE.spiele.find((s) => s.id === "blitzblick");
  assert.ok(eintrag, "blitzblick steht in spiele.json");
  assert.equal(eintrag.datei, "mathe/m04-blitzblick/index.html");
  assert.deepEqual(eintrag.arten[0].stufen, ["material", "vorstellung", "kopf"]);
  assert.ok(alle.every((a) => darstellbar(a, eintrag.arten[0])));
  assert.ok(alle.every((a) => L.mengeAus(a.key)?.n === a.daten.n));
});
