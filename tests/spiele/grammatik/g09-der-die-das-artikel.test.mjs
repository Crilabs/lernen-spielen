// G09 Werkzeugwand: reine Spiellogik (spiele/grammatik/g09-der-die-das-artikel/logik.js) und die Sätze aus Daten.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ORDNER = "../../../spiele/grammatik/g09-der-die-das-artikel";
const L = await import(`${ORDNER}/logik.js`);
const { aufgabenVon, darstellbar } = await import("../../../spiele/aufgabenarten.js");
const TEXTE = JSON.parse(readFileSync(new URL(`${ORDNER}/texte.json`, import.meta.url), "utf8"));
const alle = aufgabenVon({ art: "artikel", wortschatz: "werkzeug" });

test("aufgabeAus: Wort, Artikel und Kennung; alles andere ist null", () => {
  assert.deepEqual(L.aufgabeAus("artikel:hammer"), { key: "artikel:hammer", id: "hammer", wort: "Hammer", artikel: "der" });
  assert.deepEqual(L.aufgabeAus("artikel:schluessel"), { key: "artikel:schluessel", id: "schluessel", wort: "Schlüssel", artikel: "der" });
  assert.equal(L.aufgabeAus("artikel:nix"), null);
  assert.equal(L.aufgabeAus("mal:6*7"), null);
  assert.equal(L.aufgabeAus(null), null);
});

test("passt: nur der Artikel des Wortes; Plättchen in fester Reihe der, die, das", () => {
  const a = /** @type {any} */ (L.aufgabeAus("artikel:saege"));
  assert.deepEqual([...L.ARTIKEL], ["der", "die", "das"]);
  assert.deepEqual(L.ARTIKEL.map((p) => L.passt(a, p)), [false, true, false]);
  assert.equal(L.richtigesPlaettchen(a), "die");
});

test("jede Aufgabe des Themas ist darstellbar und hat ihre Sätze in texte.json", () => {
  for (const x of alle) {
    assert.ok(darstellbar(x, { art: "artikel", stufen: ["material", "vorstellung", "kopf"] }), x.key);
    const a = /** @type {any} */ (L.aufgabeAus(x.key));
    assert.equal(a.artikel, x.daten.artikel);
    assert.equal(TEXTE.aufgabe[x.key], `${a.wort}.`, `Aufgabe ${x.key}`);
    assert.equal(TEXTE.richtig[x.key], `${a.artikel[0].toUpperCase()}${a.artikel.slice(1)} ${a.wort}.`, `richtig ${x.key}`);
    assert.deepEqual(TEXTE.hilfe1[x.key], L.ARTIKEL.map((p) => `${p[0].toUpperCase()}${p.slice(1)} ${a.wort}.`), `Hilfe 1 ${x.key}`);
    assert.ok(TEXTE.kopf[x.key].includes(a.wort), `kopf ${x.key}`);
  }
});

test("satzTeile: die Lücke steht vorn, der Satz bleibt im Nominativ", () => {
  assert.deepEqual(L.satzTeile("Hammer"), { vor: "", nach: "Hammer hängt an der Wand." });
});

test("bildWechsel: nur bei einer anderen Stufe, nie bei der ersten Aufgabe", () => {
  assert.equal(L.bildWechsel(null, "material"), null);
  assert.equal(L.bildWechsel("material", "material"), null);
  assert.equal(L.bildWechsel("material", "vorstellung"), "vorstellung");
  assert.equal(L.bildWechsel("vorstellung", "kopf"), "kopf");
  assert.equal(L.bildWechsel("kopf", "material"), "material");
});

test("Wand: sechs Plätze, danach voll (neue Wand); Töne steigen", () => {
  assert.deepEqual([0, 3, 5, 6].map(L.naechsterPlatz), [0, 3, 5, null]);
  const t = [0, 1, 2, 3, 4, 5].map(L.wandTon);
  assert.deepEqual([...t].sort((a, b) => a - b), t);
});

test("Freude: nie zweimal dieselbe hintereinander, Hüpfen frühestens nach drei Aufgaben; Witz selten und nie nach Fehler", () => {
  for (const vorige of [null, "nicken", "klopfen", "huepfen"]) {
    for (let seit = 0; seit < 8; seit++) {
      for (const r of [0, 0.3, 0.7, 0.99]) {
        const f = L.naechsteFreude(vorige, seit, () => r);
        assert.notEqual(f, vorige, `${vorige} ${seit} ${r}`);
        if (seit < 3) assert.notEqual(f, "huepfen");
      }
    }
  }
  assert.equal(L.naechsteFreude("nicken", 4, () => 0.5), "huepfen");
  assert.equal(L.witz(5, true, () => 0), false);
  assert.equal(L.witz(2, false, () => 0), false);
  assert.equal(L.witz(5, false, () => 0), true);
});
