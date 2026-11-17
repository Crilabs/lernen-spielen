// G02 Ich, du, wir: reine Spiellogik (spiele/grammatik/g02-ich-du-wir-person-und-verb/logik.js) und die Sätze aus Daten.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const ORDNER = "../../../spiele/grammatik/g02-ich-du-wir-person-und-verb";
const L = await import(`${ORDNER}/logik.js`);
const { aufgabenVon, darstellbar } = await import("../../../spiele/aufgabenarten.js");
const V = await import("../../../spiele/woerter/verben.js");
const TEXTE = JSON.parse(readFileSync(new URL(`${ORDNER}/texte.json`, import.meta.url), "utf8"));
const gross = (s) => s[0].toUpperCase() + s.slice(1);
const ziel = (z) => aufgabenVon({ art: "verbform", ziel: z });
const a = (key) => L.aufgabeAus(key);

test("aufgabeAus: Ziel, Verb, Person, Form; alles andere ist null", () => {
  assert.deepEqual(a("verbform:endung:malen:du"), {
    key: "verbform:endung:malen:du", ziel: "endung", verb: "malen", stamm: "mal", grundform: "malen", person: "du", pronomen: "du",
    form: "malst", endung: "st", wer: ["kofi"],
  });
  assert.equal(a("verbform:endung:basteln:du"), null);
  assert.equal(a("verbform:grundform:malen:du")?.ziel, "grundform"); // die Art kennt es noch, G02 spielt es nicht
  assert.equal(a("verbform:endung:malen:es"), null);
  assert.equal(a("artikel:hammer"), null);
  assert.equal(a(null), null);
});

test("Wortschatz: sieben regelmäßige Verben ohne -t/-d/-s am Stamm, basteln nur als Grundform", () => {
  assert.equal(V.VERBEN_PERSON.length, 7);
  for (const v of V.VERBEN_PERSON) {
    assert.equal(`${v.stamm}en`, v.grundform, v.id);
    assert.doesNotMatch(v.stamm, /[tds]$/, v.id);
  }
  assert.deepEqual(ziel("endung").length, 49);
  assert.deepEqual(ziel("pronomen").length, 49);
  assert.ok(!ziel("endung").some((x) => x.daten.verb === "basteln"));
});

test("Endungen: ich -e, du -st, er/sie/ihr -t, wir/sie (Mehrzahl) -en", () => {
  const e = (p) => a(`verbform:endung:malen:${p}`).endung;
  assert.deepEqual(V.PERSONEN.map(e), ["e", "st", "t", "t", "en", "t", "en"]);
  assert.equal(a("verbform:endung:malen:sie-pl").pronomen, "sie");
});

test("Wer handelt: ich die eigene Hand, du Kofi oder Lena, er Timo, sie Ela, wir alle fünf, ihr Kofi und Lena, sie (Mehrzahl) Timo und Ela", () => {
  assert.deepEqual(V.werVon("ich", "malen"), ["ich"]);
  assert.deepEqual(V.werVon("du", "malen"), ["kofi"]);
  assert.deepEqual(V.werVon("du", "kleben"), ["lena"]);
  assert.deepEqual(V.werVon("er", "malen"), ["timo"]);
  assert.deepEqual(V.werVon("sie", "malen"), ["ela"]);
  assert.equal(V.werVon("wir", "malen").length, 5);
  assert.deepEqual(V.werVon("ihr", "malen"), ["kofi", "lena"]);
  assert.deepEqual(V.werVon("sie-pl", "malen"), ["timo", "ela"]);
  assert.ok(V.werVon("wir", "malen").length <= L.MAX_AUF_EINMAL);
});

test("passt (Endung): auf material nur die genaue Endung, sonst bei „sie“ -t und -en", () => {
  const du = a("verbform:endung:malen:du");
  assert.deepEqual(L.plaettchenFuer(du), ["e", "st", "t", "en"]);
  assert.deepEqual(L.plaettchenFuer(du).map((e) => L.passt(du, e)), [false, true, false, false]);
  const sie = a("verbform:endung:malen:sie");
  assert.deepEqual(L.plaettchenFuer(sie).map((e) => L.passt(sie, e, "material")), [false, false, true, false]);
  assert.deepEqual(L.plaettchenFuer(sie).map((e) => L.passt(sie, e, "vorstellung")), [false, false, true, true]);
  assert.deepEqual(L.plaettchenFuer(du).map((e) => L.passt(a("verbform:endung:malen:ihr"), e, "kopf")), [false, false, true, false]);
  assert.equal(L.richtigesPlaettchen(sie), "t");
});

test("passt (Fürwort): „malt“ gehört zu er, sie und ihr, aber auf material nur zu den Gemeinten", () => {
  const sie = a("verbform:pronomen:malen:sie");
  assert.deepEqual(L.FUERWOERTER.map((p) => L.passt(sie, p, "material")), [false, false, false, true, false, false]);
  assert.deepEqual(L.FUERWOERTER.map((p) => L.passt(sie, p, "vorstellung")), [false, false, true, true, false, true]);
  const wir = a("verbform:pronomen:malen:wir");
  assert.deepEqual(L.passendePlaettchen(wir, "kopf"), ["sie", "wir"]);
  assert.deepEqual(L.passendePlaettchen(a("verbform:pronomen:malen:ich"), "kopf"), ["ich"]);
  assert.deepEqual(L.passendePlaettchen(a("verbform:pronomen:malen:du"), "kopf"), ["du"]);
});

test("Hilfe 2 und Prüfstand: das richtige Plättchen passt immer, auf jeder Stufe", () => {
  for (const z of ["endung", "pronomen"]) {
    for (const x of ziel(z)) {
      const d = a(x.key);
      for (const stufe of ["material", "vorstellung", "kopf"]) assert.ok(L.passt(d, L.richtigesPlaettchen(d), stufe), `${x.key} ${stufe}`);
    }
  }
});

test("Wirkende: bei „sie“ entscheidet die Endung, ob Ela allein oder Ela und Timo malen", () => {
  const sie = a("verbform:endung:malen:sie");
  assert.deepEqual(L.wirkende(sie, "t"), ["ela"]);
  assert.deepEqual(L.wirkende(sie, "en"), ["timo", "ela"]);
  assert.deepEqual(L.wirkende(a("verbform:endung:malen:wir"), "en").length, 5);
  assert.deepEqual(L.wirkende(a("verbform:pronomen:malen:sie-pl"), "sie"), ["timo", "ela"]);
  assert.deepEqual(L.wirkende(a("verbform:pronomen:malen:sie"), "sie"), ["ela"]);
  assert.deepEqual(L.wirkende(a("verbform:pronomen:malen:ihr"), "ihr"), ["kofi", "lena"]);
});

test("Wer hebt bei einer falschen Endung den Stift? Zu wem sie gehört, nie die Gemeinten; zu niemandem: niemand", () => {
  const du = a("verbform:endung:malen:du");
  assert.deepEqual(L.hebenStift(du, "t").sort(), ["ela", "lena", "timo"]);
  assert.deepEqual(L.hebenStift(du, "e"), ["ich"]);
  assert.deepEqual(L.hebenStift(du, "n"), []);
  assert.deepEqual(L.hebenStift(du, "st"), []);
  assert.deepEqual(L.hebenStift(a("verbform:endung:malen:ihr"), "t").sort(), ["ela", "timo"]);
  assert.deepEqual(L.hebenStift(a("verbform:pronomen:malen:sie"), "er"), ["timo"]);
});

test("Stufe kopf: Buchstaben nur auf einem richtigen Weg; fertig mit dem vollständigen Wort", () => {
  const du = a("verbform:endung:malen:du");
  assert.deepEqual(L.richtigeWoerter(du), ["malst"]);
  assert.deepEqual(L.tippeBuchstabe(du, "mal", "t"), { ok: false, eingabe: "mal", fertig: false });
  assert.deepEqual(L.tippeBuchstabe(du, "mal", "s"), { ok: true, eingabe: "mals", fertig: false });
  assert.deepEqual(L.tippeBuchstabe(du, "mals", "t"), { ok: true, eingabe: "malst", fertig: true });
  assert.equal(L.naechsterBuchstabe(du, ""), "m");
  assert.equal(L.naechsterBuchstabe(du, "mals"), "t");
  assert.equal(L.naechsterBuchstabe(du, "malst"), null);
  const sie = a("verbform:endung:malen:sie");
  assert.deepEqual(L.richtigeWoerter(sie), ["malt", "malen"]);
  assert.equal(L.tippeBuchstabe(sie, "malt", "x").ok, false);
  assert.deepEqual(L.richtigeWoerter(a("verbform:pronomen:malen:wir")), ["sie", "wir"]);
  // jeder richtige Weg ist mit den angebotenen Tasten tippbar
  for (const z of ["endung", "pronomen"]) {
    for (const x of ziel(z)) {
      const d = a(x.key);
      const tasten = L.tastenFuer(d);
      assert.ok(tasten.length <= L.MAX_TASTEN, x.key);
      // das Lösungswort ist nicht an den Tasten abzulesen: es liegen mehr Buchstaben da als nur seine eigenen
      if (z !== "pronomen") assert.ok(new Set(tasten).size > new Set(L.richtigeWoerter(d).join("")).size, x.key);
      if (z !== "pronomen") for (const c of "estn") assert.ok(tasten.includes(c), `${x.key} ${c}`);
      for (const w of L.richtigeWoerter(d)) assert.ok([...w].every((c) => tasten.includes(c)), `${x.key} ${w}`);
      let eingabe = "";
      for (let i = 0; i < 12 && eingabe !== L.richtigeWoerter(d)[0]; i++) {
        const n = L.naechsterBuchstabe(d, eingabe);
        if (!n) break;
        eingabe = L.tippeBuchstabe(d, eingabe, n).eingabe;
      }
      assert.ok(L.richtigeWoerter(d).includes(eingabe), x.key);
    }
  }
});

test("Bogen: zehn große Plätze in fünf Spalten, jede Person hat ihre Spalte, danach der nächste freie Platz", () => {
  assert.equal(L.BOGEN_PLAETZE, 10);
  const leer = Array(10).fill(false);
  assert.equal(L.platzFuer(leer, "kofi"), 0);
  assert.equal(L.platzFuer(leer, "ela"), 4);
  assert.equal(L.platzFuer(leer, "wort"), 2);
  const halb = leer.map((_, i) => i === 4);
  assert.equal(L.platzFuer(halb, "ela"), 9);
  const voll = Array(10).fill(true);
  assert.equal(L.platzFuer(voll, "kofi"), null);
  assert.equal(L.bogenReicht(5, 5), true);
  assert.equal(L.bogenReicht(6, 5), false);
  // fünf Marken (wir) bekommen fünf verschiedene Plätze
  const bel = Array(10).fill(false);
  const plaetze = V.werVon("wir", "malen").map((w) => { const p = L.platzFuer(bel, w); bel[p] = true; return p; });
  assert.equal(new Set(plaetze).size, 5);
});

test("jede Aufgabe ist darstellbar, hat ihre Sätze in texte.json und eine passende Plättchenzahl", () => {
  const arten = { art: "verbform", ziele: ["endung", "pronomen"], stufen: ["material", "vorstellung", "kopf"] };
  for (const z of ["endung", "pronomen"]) {
    for (const x of ziel(z)) {
      assert.ok(darstellbar(x, arten), x.key);
      const d = a(x.key);
      assert.ok(TEXTE.aufgabe[x.key], `aufgabe ${x.key}`);
      assert.ok(TEXTE.hilfe1[x.key]?.length >= 1, `hilfe1 ${x.key}`);
      assert.equal(TEXTE.richtig[`${d.verb}:${d.person}`], `${gross(d.pronomen)} ${d.form}.`);
    }
  }
  assert.equal(darstellbar(ziel("endung")[0], { art: "verbform", ziele: ["pronomen"] }), false);
  assert.equal(darstellbar(ziel("endung")[0], { art: "artikel" }), false);
});

test("Sätze aus Daten: Hörprobe der Endungen und der Fürwörter; keine Ziffern, kein Lob", () => {
  assert.deepEqual(TEXTE.hilfe1["verbform:endung:malen:du"], ["Du male.", "Du malst.", "Du malt.", "Du malen."]);
  assert.deepEqual(TEXTE.hilfe1["verbform:pronomen:malen:sie"], ["Er malt.", "Sie malt.", "Ihr malt."]);
  assert.deepEqual(TEXTE.hilfe1["verbform:pronomen:malen:ich"], ["Ich male."]);
  assert.equal(TEXTE.aufgabe["verbform:endung:malen:du"], "Du … malen.");
  assert.equal(TEXTE.aufgabe["verbform:pronomen:malen:wir"], "… malen.");
  const saetze = [];
  const sammle = (o) => (typeof o === "string" ? saetze.push(o) : o && typeof o === "object" ? Object.entries(o).forEach(([k, v]) => k !== "hinweis" && sammle(v)) : null);
  sammle(TEXTE);
  for (const s of saetze) {
    assert.doesNotMatch(s, /\d/, s);
    assert.doesNotMatch(s, /\b(super|toll|falsch|leider|schlau|Fehler)\b/i, s);
    assert.ok(s.split(/\s+/).length <= 8, s);
  }
});

test("bildWechsel: nur bei einer anderen Stufe, nie bei der ersten Aufgabe", () => {
  assert.equal(L.bildWechsel(null, "material"), null);
  assert.equal(L.bildWechsel("material", "material"), null);
  assert.equal(L.bildWechsel("material", "vorstellung"), "vorstellung");
  assert.equal(L.bildWechsel("vorstellung", "kopf"), "kopf");
  assert.equal(L.bildWechsel("kopf", "material"), "material");
});

test("Freude: nie zweimal dieselbe hintereinander, Hüpfen frühestens nach drei Aufgaben; Witz selten und nie nach Fehler", () => {
  for (const vorige of [null, "nicken", "winken", "huepfen"]) {
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
  const t = [0, 1, 2, 3, 4].map(L.akkordTon);
  assert.deepEqual([...t].sort((x, y) => x - y), t);
});
