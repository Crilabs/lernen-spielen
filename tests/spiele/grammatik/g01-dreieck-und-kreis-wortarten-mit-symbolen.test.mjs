// G01 Dreieck und Kreis: reine Spiellogik (spiele/grammatik/g01-…/logik.js), die Sätze aus Daten und die Bilder.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ORDNER = "../../../spiele/grammatik/g01-dreieck-und-kreis-wortarten-mit-symbolen";
const L = await import(`${ORDNER}/logik.js`);
const { BILD_IDS, hatBild, bildSvg } = await import(`${ORDNER}/bilder.js`);
const { aufgabenVon } = await import("../../../spiele/aufgabenarten.js");
const { SAETZE, saetzeFuer, verbTeile, probeText, danebenText } = await import("../../../spiele/woerter/wortarten.js");
const TEXTE = JSON.parse(readFileSync(new URL(`${ORDNER}/texte.json`, import.meta.url), "utf8"));

const nomen = aufgabenVon({ art: "wortart", ziel: ["nomen"] });
const verb = aufgabenVon({ art: "wortart", ziel: ["verb"], kopf: ["verb", "nomen"] });
const adj = aufgabenVon({ art: "wortart", ziel: ["adjektiv"] });
const von = (liste, satz) => /** @type {any} */ (liste.find((a) => a.daten.satz === satz));

test("Daten: jeder Satz hat Wörter mit Wortart, Nomen mit Artikel, Verben mit gleichem Stamm in ich und du", () => {
  assert.ok(SAETZE.length >= 30);
  assert.equal(new Set(SAETZE.map((s) => s.id)).size, SAETZE.length);
  for (const s of SAETZE) {
    assert.equal(s.text, `${s.woerter.map((w) => w.wort).join(" ")}.`, s.id);
    for (const w of s.woerter) {
      if (w.art === "nomen") assert.ok(["der", "die", "das"].includes(/** @type {string} */ (w.artikel)) && w.grundform === w.wort, `${s.id} ${w.wort}`);
      if (w.art === "verb") {
        const t = verbTeile(w);
        assert.ok(t.stamm.length >= 1, `${s.id} ${w.wort}`);
        assert.equal(t.stamm + t.t, w.wort);
        assert.equal(t.stamm + t.ich, w.ich);
        assert.equal(t.stamm + t.du, w.du);
        assert.ok(w.wort.length <= 8 && w.grundform);
      }
      if (w.art === "nomen") assert.ok(w.wort.length <= 7, `${w.wort} passt nicht ins Kästchen`);
      if (w.bild) assert.ok(hatBild(w.bild), `Bild ${w.bild}`);
    }
  }
  assert.ok(BILD_IDS.length >= 13);
  assert.match(bildSvg("katze"), /^<svg /);
  assert.throws(() => bildSvg("gibtesnicht"));
});

test("Schwierigkeit 0: Wörter mit Bild; Nomen- und Verbsätze ohne Adjektive, Adjektivsätze für sich", () => {
  for (const s of SAETZE.filter((x) => x.schwierigkeit === 0)) {
    for (const w of s.woerter.filter((x) => x.art === "nomen" || x.art === "verb")) assert.ok(w.bild, `${s.id} ${w.wort}`);
  }
  assert.ok(saetzeFuer("nomen").every((s) => !s.woerter.some((w) => w.art === "adjektiv")));
  assert.equal(saetzeFuer("adjektiv").length, 6);
  assert.deepEqual(saetzeFuer("pronomen"), []);
});

test("Proben als Sprechtext: Nomen das Paar, Verb ich und du, Adjektiv Artikel, Adjektiv, Nomen; falsche Proben als Frage", () => {
  const s = SAETZE.find((x) => x.id === "katze-gaehnt");
  assert.equal(probeText(s.woerter[1]), "Die Katze.");
  assert.equal(probeText(s.woerter[2]), "Ich gähne, du gähnst.");
  assert.equal(probeText(s.woerter[0]), null);
  assert.equal(probeText(SAETZE.find((x) => x.id === "grosser-hund-bellt").woerter[1]), "Der große Hund.");
  assert.equal(danebenText("nomen", s.woerter[2]), "Der gähnt?");
  assert.equal(danebenText("verb", s.woerter[1]), "Ich Katze?");
  assert.equal(danebenText("nomen", s.woerter[0]), "Der die?");
});

test("plan: material zeigt nur Inhaltswörter einzeln mit Bild, ein Symbol je Wort der Wortart", () => {
  const p = /** @type {any} */ (L.plan(von(nomen, "katze-gaehnt"), "material"));
  assert.deepEqual(p.karten.map((k) => [k.i, k.wort.wort, k.bild]), [[1, "Katze", "katze"], [2, "gähnt", "gaehnen"]]);
  assert.deepEqual(p.symbole, ["nomen"]);
  const zwei = /** @type {any} */ (L.plan(von(nomen, "katze-jagt-ball"), "material"));
  assert.deepEqual(zwei.karten.map((k) => k.wort.wort), ["Katze", "jagt", "Ball"]);
  assert.deepEqual(zwei.symbole, ["nomen", "nomen"]);
});

test("plan: vorstellung und kopf zeigen den ganzen Satz ohne Bilder; kopf trägt die Wortarten aus kopfZiel", () => {
  const v = /** @type {any} */ (L.plan(von(verb, "katze-jagt-ball"), "vorstellung"));
  assert.equal(v.karten.length, 5);
  assert.ok(v.karten.every((k) => k.bild === null));
  assert.deepEqual(v.symbole, ["verb"]);
  const k = /** @type {any} */ (L.plan(von(verb, "katze-jagt-ball"), "kopf"));
  assert.deepEqual(k.symbole, ["nomen", "nomen", "verb"], "Dreiecke vor dem Kreis in fester Reihe");
  const n = /** @type {any} */ (L.plan(von(nomen, "katze-jagt-ball"), "kopf"));
  assert.deepEqual(n.symbole, ["nomen", "nomen"]);
  const a = /** @type {any} */ (L.plan(von(adj, "grosser-hund-bellt"), "vorstellung"));
  assert.deepEqual(a.symbole, ["adjektiv"]);
  assert.equal(L.plan({ key: "mal:6*7" }), null);
  assert.equal(L.plan({ key: "wortart:nomen:gibtesnicht" }), null);
});

test("passt: nur die Wortart des Wortes; richtigesKaestchen: das erste freie Wort der Art; Gegenprobe an Inhaltswörtern", () => {
  const p = /** @type {any} */ (L.plan(von(nomen, "katze-jagt-ball"), "kopf"));
  const katze = p.karten[1];
  assert.equal(L.passt(katze, "nomen"), true);
  assert.equal(L.passt(katze, "verb"), false);
  assert.equal(L.passt(p.karten[0], "nomen"), false, "der Artikel trägt kein Symbol");
  assert.equal(L.richtigesKaestchen(p.karten, new Set(), "nomen").wort.wort, "Katze");
  assert.equal(L.richtigesKaestchen(p.karten, new Set([1]), "nomen").wort.wort, "Ball");
  assert.equal(L.richtigesKaestchen(p.karten, new Set([1, 4]), "nomen"), null);
  assert.deepEqual(L.probeKaesten(p.karten, new Set([1])).map((k) => k.wort.wort), ["jagt", "Ball"]);
});

test("jede Aufgabe der Themen ist darstellbar, hat ihre Sätze in texte.json und stimmt mit den Proben überein", () => {
  for (const x of [...nomen, ...verb, ...adj]) {
    const p = /** @type {any} */ (L.plan(x, "kopf"));
    assert.ok(p, x.key);
    assert.equal(TEXTE.satz[x.daten.satz], p.text, `Satz ${x.key}`);
    const adjSatz = x.daten.woerter.some((w) => w.art === "adjektiv");
    for (const w of x.daten.woerter) {
      assert.equal(TEXTE.wort[w.wort], `${w.wort}.`, `Wort ${w.wort}`);
      if (w.art === "nomen" || w.art === "verb" || w.art === "adjektiv") assert.equal(TEXTE.richtig[w.wort], L.richtigText(w), `Probe ${w.wort}`);
      if (!adjSatz) {
        if (w.art !== "nomen") assert.equal(TEXTE.dreieck[w.wort], L.falschText("nomen", w), `Dreieck ${w.wort}`);
        if (w.art !== "verb") assert.equal(TEXTE.kreis[w.wort], L.falschText("verb", w), `Kreis ${w.wort}`);
      } else if (w.art !== "adjektiv") assert.equal(TEXTE.adjektiv[w.wort], L.falschText("adjektiv", w), `Adjektiv ${w.wort}`);
    }
  }
});

test("Kreide der Probe: Artikelwort, ich, du, Artikel und Adjektiv", () => {
  const n = SAETZE.find((x) => x.id === "katze-gaehnt");
  assert.equal(L.probeKreide(n.woerter[1]), "die");
  assert.equal(L.probeKreide(n.woerter[2], "ich"), "ich");
  assert.equal(L.probeKreide(n.woerter[2], "du"), "du");
  assert.equal(L.probeKreide(SAETZE.find((x) => x.id === "roter-ball-rollt").woerter[1]), "der rote");
  assert.equal(L.probeKreide(n.woerter[0]), "");
});

test("bildWechsel: nur bei einer anderen Stufe, nie bei der ersten Aufgabe", () => {
  assert.equal(L.bildWechsel(null, "material", ["nomen"], ["nomen"]), null);
  assert.equal(L.bildWechsel("material", "material", ["nomen"], ["nomen"]), null);
  assert.equal(L.bildWechsel("material", "vorstellung", ["nomen"], ["nomen"]), "ohneBilder");
  assert.equal(L.bildWechsel("vorstellung", "material", ["nomen"], ["nomen"]), "mitBildern");
  assert.equal(L.bildWechsel("vorstellung", "kopf", ["verb"], ["verb", "nomen"]), "zweitesSymbol");
  assert.equal(L.bildWechsel("vorstellung", "kopf", ["nomen"], ["nomen"]), null);
  assert.equal(L.bildWechsel("kopf", "vorstellung", ["verb"], ["verb", "nomen"]), null);
});

test("Hüpftöne steigen; Freude: nie zweimal dieselbe, Sprung frühestens nach drei Aufgaben; Witz selten und nie nach Fehler", () => {
  const t = [0, 1, 2, 3, 4, 5].map(L.huepfTon);
  assert.deepEqual([...t].sort((a, b) => a - b), t);
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
  const gaehnt = SAETZE.find((x) => x.id === "katze-gaehnt").woerter;
  const lang = SAETZE.find((x) => x.id === "katze-springt-baum").woerter;
  assert.equal(L.witz(5, true, gaehnt, () => 0), null);
  assert.equal(L.witz(2, false, gaehnt, () => 0), null);
  assert.equal(L.witz(5, false, gaehnt, () => 0), "gaehnen");
  assert.equal(L.witz(5, false, lang, () => 0), "fast-umfallen");
  assert.equal(L.witz(5, false, SAETZE.find((x) => x.id === "hund-bellt").woerter, () => 0), null);
});
