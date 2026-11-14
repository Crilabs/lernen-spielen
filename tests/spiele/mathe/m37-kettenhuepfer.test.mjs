// M37 Kettenhüpfer: reine Spiellogik (spiele/mathe/m37-kettenhuepfer/logik.js) und die Sätze aus Daten (texte.json).
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const L = await import("../../../spiele/mathe/m37-kettenhuepfer/logik.js");
const { aufgabenVon } = await import("../../../spiele/aufgabenarten.js");
const TEXTE = JSON.parse(readFileSync(new URL("../../../spiele/mathe/m37-kettenhuepfer/texte.json", import.meta.url), "utf8"));
const REIHEN = [2, 3, 4, 5, 6, 7, 8, 9, 10];
const alle = [...REIHEN.map((n) => ({ art: "mal", reihe: n })), { art: "mal", kern: true }].flatMap(aufgabenVon);

test("vergleiche: passt, weiter hinten, weiter vorn, hinter dem Ende der Kette", () => {
  assert.equal(L.vergleiche(42, { a: 6, b: 7 }), "passt");
  assert.equal(L.vergleiche(49, { a: 6, b: 7 }), "hinten");
  assert.equal(L.vergleiche(35, { a: 6, b: 7 }), "vorn");
  assert.equal(L.vergleiche(71, { a: 6, b: 7 }), "ueber");
  assert.equal(L.vergleiche(70, { a: 6, b: 7 }), "hinten");
});

test("hilfeVon: über Kernaufgaben, Nachbaraufgabe nur bei einem Stäbchen Abstand, nie Hochzählen", () => {
  for (const [a, kern, schritt] of [[3, 2, 1], [4, 5, -1], [6, 5, 1], [9, 10, -1]]) {
    const h = L.hilfeVon(a, 7);
    assert.deepEqual([h.art, h.kern, h.schritt], ["nachbar", kern, schritt], `a = ${a}`);
    assert.equal(h.hell.length, 1);
  }
  assert.deepEqual(L.hilfeVon(7, 6), { art: "zwei", kern: 5, schritt: 2, rechnung: "30 + 12 = ▢", hell: [6, 7] });
  assert.deepEqual(L.hilfeVon(8, 6).rechnung, "60 − 12 = ▢");
  assert.equal(L.hilfeVon(5, 4).art, "haelfte");
  assert.equal(L.hilfeVon(2, 4).art, "doppelt");
  assert.equal(L.hilfeVon(10, 4).rechnung, "4 · 10 = ▢");
  assert.equal(L.hilfeVon(1, 4).art, "eins");
  // Die Rechnung verrät das Ergebnis nicht.
  for (const { daten: { a, b, c } } of alle) assert.ok(!L.hilfeVon(a, b).rechnung.includes(`= ${c}`), `${a} · ${b}`);
});

test("Eingabe: Ziffern, Löschen, höchstens drei Ziffern, keine führende Null", () => {
  assert.equal(L.tippe("", "0"), "");
  assert.equal(L.tippe("4", "2"), "42");
  assert.equal(L.tippe("100", "1"), "100");
  assert.equal(L.tippe("42", "loeschen"), "4");
  assert.equal(L.tippe("", "x"), "");
});

test("naechsteTaste und tastenZu: der Weg zur Zahl, Löschen bei falschem Anfang", () => {
  assert.equal(L.naechsteTaste("", 42), "4");
  assert.equal(L.naechsteTaste("4", 42), "2");
  assert.equal(L.naechsteTaste("42", 42), "fertig");
  assert.equal(L.naechsteTaste("5", 42), "loeschen");
  assert.deepEqual(L.tastenZu("", [14, 7, 21]), ["1", "2", "7"]);
  assert.deepEqual(L.tastenZu("7", [14, 7, 70]), ["0", "fertig"]);
  assert.deepEqual(L.tastenZu("9", [14, 7, 21]), ["loeschen"]);
  assert.deepEqual(L.kandidaten(1, 7), [7, 14]);
});

test("Ratendes Kind: über die Kandidaten ist jede Aufgabe mit wenigen Tasten erreichbar", () => {
  for (const { daten: { a, b, c } } of alle) {
    let e = "";
    for (let i = 0; i < 5 && L.naechsteTaste(e, c) !== "fertig"; i++) {
      const t = L.naechsteTaste(e, c);
      assert.ok(L.tastenZu(e, L.kandidaten(a, b)).includes(t), `${a} · ${b}: ${t} fehlt bei „${e}“`);
      e = L.tippe(e, t);
    }
    assert.ok(L.tastenZu(e, L.kandidaten(a, b)).includes("fertig"), `${a} · ${b}`);
  }
});

test("pfeileWaehrend: gelöste mit Zahl, das eigene Pfeilchen ohne Zahl", () => {
  assert.deepEqual(L.pfeileWaehrend([1, 6, 3], 6), { pfeile: [1, 3], leer: [6] });
  assert.deepEqual(L.pfeileWaehrend([1], 4), { pfeile: [1], leer: [] });
});

test("texte.json: zu jeder Aufgabe ein ausgeschriebener Auftrag, je Reihe Anfang, Wechsel, Timo; keine Ziffern, keine Wörter aus 3.2", () => {
  for (const { daten: { a, b } } of alle) assert.ok(TEXTE.auftrag[b]?.[a], `${a} · ${b}`);
  for (const n of REIHEN) for (const t of [TEXTE.anfang[n].reihe, TEXTE.anfang[n].setzung, TEXTE.wechsel[n], TEXTE.timo[n]]) assert.ok(t, `n = ${n}`);
  const saetze = JSON.stringify({ ...TEXTE, hinweis: "" });
  assert.doesNotMatch(saetze.replace(/"\d+":/g, ""), /\d/);
  assert.doesNotMatch(saetze, /\b(super|toll|klasse|prima|falsch|leider|Fehler|schon wieder|endlich)\b/i);
  assert.doesNotMatch(saetze, /…/);
  // Fakten nur mit „In echt“ (Paar, Woche, Zehn-Cent-Münze), Setzungen mit „Hier“ (K4, K11).
  for (const n of REIHEN) assert.match(TEXTE.anfang[n].setzung, /Hier /);
  assert.deepEqual(REIHEN.filter((n) => /In echt/.test(TEXTE.anfang[n].reihe)), [2, 7, 10]);
  assert.equal(TEXTE.auftrag[6][1], "Ein Eierkarton. Wie viele Eier sind es?");
  assert.equal(TEXTE.auftrag[7][6], "Sechs Wochenschachteln. Wie viele Fächer sind es zusammen?");
});

test("vorzeigeAufgabe: Timo zeigt 1 · n auf der Kette der ersten Lieferung, 10 · n, wenn diese selbst 1 · n ist", () => {
  assert.deepEqual(L.vorzeigeAufgabe({ ziel: { key: "mal:6*7" } }), { a: 1, b: 7, key: "mal:1*7" });
  assert.deepEqual(L.vorzeigeAufgabe({ ziel: { key: "mal:1*2" } }), { a: 10, b: 2, key: "mal:10*2" });
  assert.equal(L.vorzeigeAufgabe(null), null);
  assert.equal(L.vorzeigeAufgabe({ ziel: { key: "rechnen:3+4" } }), null);
});

// Prüfstand B, Runde 2 (kritisch): Das Spiel verwarf jede Lieferung 1 · n ohne Meldung. Das kürzte die Runde, holte
// dieselbe Aufgabe direkt hintereinander und sperrte 1 · n für die Lernsteuerung. Jetzt bekommt das Kind jede
// Lieferung, so wie spieleRunde in spiel.js: erste Lieferung → Timo zeigt vorzeigeAufgabe() vor, dann alle Lieferungen
// der Reihe nach, bis die Lernsteuerung null gibt (max = AUFGABEN_JE_RUNDE). Simuliert über viele Runden und Tage, mit
// der echten Lernsteuerung, Fehlern und den Stufen des Prototyps und des Ausbaus.
test("Runden mit der echten Lernsteuerung: AUFGABEN_JE_RUNDE Aufgaben, keine zweimal direkt hintereinander, Timos Aufgabe nie als erste, 1 · n kommt", async () => {
  const LS = await import("../../../spiele/lernsteuerung.js");
  const lies = (/** @type {string} */ f) => JSON.parse(readFileSync(new URL(`../../../spiele/${f}`, import.meta.url), "utf8"));
  const plan = lies("lernplan.json");
  let saat = 7;
  const rnd = () => ((saat = (saat * 16807) % 2147483647) / 2147483647);
  for (const stufen of [["material"], ["material", "vorstellung", "kopf"]]) {
    for (const wunsch of ["zweierreihe", "zehnerreihe", "kernaufgaben-einmaleins"]) {
      const spiele = lies("spiele.json");
      spiele.spiele.find((/** @type {any} */ s) => s.id === "kettenhuepfer").arten[0].stufen = stufen;
      const ctx = { plan, spiele };
      const stand = LS.neuerStand();
      const einsGestellt = new Set();
      let volleRunden = 0;
      for (let tag = 1; tag <= 12; tag++) {
        for (let r = 0; r < 2; r++) {
          const heute = `2026-12-${String(tag).padStart(2, "0")}`;
          const { thema, modus } = LS.themaFuer(ctx, stand, "kettenhuepfer", { wunsch });
          if ((modus === "thema" || modus === "vorgriff") && stand.themen[thema]?.z !== "dran") LS.startThema(stand, thema, heute);
          const s = LS.neueSitzung(ctx, stand, "kettenhuepfer", { thema, modus }, { jetzt: 0, max: L.AUFGABEN_JE_RUNDE, rnd });
          const naechste = () => LS.naechstesAngebot(ctx, stand, s, rnd, { jetzt: 0, heute });
          const erste = naechste();
          const timo = L.vorzeigeAufgabe(erste);
          /** @type {string[]} */
          const kind = [];
          for (let a = erste; a; a = naechste()) {
            kind.push(a.ziel.key);
            LS.verbucheErgebnis(ctx, stand, s, a.ziel.key, { ok: rnd() >= 0.15, hilfe: 0, ms: 3000, heute, rnd });
          }
          const wo = `${wunsch} ${stufen.join("/")} Tag ${tag}.${r}: ${kind.join(" ")}`;
          assert.ok(timo && kind[0] !== timo.key, `Timos Aufgabe als erste: ${wo}`);
          for (let i = 1; i < kind.length; i++) assert.notEqual(kind[i], kind[i - 1], `direkt wiederholt: ${wo}`);
          assert.ok(kind.length <= L.AUFGABEN_JE_RUNDE, wo);
          if (modus === "thema" && s.ereignis?.typ !== "gekonnt") {
            assert.equal(kind.length, L.AUFGABEN_JE_RUNDE, `zu kurz: ${wo}`);
            volleRunden++;
          }
          for (const k of kind) if (k.startsWith("mal:1*")) einsGestellt.add(k);
        }
      }
      assert.ok(volleRunden >= 3, `${wunsch}: nur ${volleRunden} volle Runden`);
      assert.ok(einsGestellt.size > 0, `${wunsch} ${stufen.join("/")}: 1 · n kam nie`);
    }
  }
});
