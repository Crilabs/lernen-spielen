import { test } from "node:test";
import assert from "node:assert/strict";
import { testbetrieb, meldePruefSchnittstelle, finde, PHASEN } from "../spiele/rahmen/pruefen.js";

const schnittstelle = () => ({
  zuege: () => [],
  richtigerZug: () => null,
  zustand: () => ({ phase: "aufgabe", aufgabe: null, versuche: 0, hilfeStufe: 0 }),
});

test("ohne Testbetrieb gibt es keine Schnittstelle", () => {
  const umgebung = { location: { search: "?thema=zerlegen-7" } };
  assert.equal(testbetrieb(umgebung), false);
  assert.equal(meldePruefSchnittstelle(schnittstelle(), umgebung), null);
  assert.equal("lsPruefen" in umgebung, false);
});

test("ohne location und ohne Schalter: kein Testbetrieb", () => {
  const umgebung = {};
  assert.equal(meldePruefSchnittstelle(schnittstelle(), umgebung), null);
  assert.equal("lsPruefen" in umgebung, false);
});

test("nur __LS_PRUEFEN__ === true schaltet ein, nicht ein beliebiger Wert", () => {
  assert.equal(testbetrieb({ __LS_PRUEFEN__: "ja", location: { search: "" } }), false);
  assert.equal(testbetrieb({ __LS_PRUEFEN__: true, location: { search: "" } }), true);
});

test("?pruefen meldet die Schnittstelle als lsPruefen an", () => {
  const umgebung = { location: { search: "?pruefen" } };
  const s = meldePruefSchnittstelle(schnittstelle(), umgebung);
  assert.ok(s);
  assert.equal(/** @type {any} */ (umgebung).lsPruefen, s);
  assert.deepEqual(s.zuege(), []);
  assert.equal(s.richtigerZug(), null);
  assert.equal(s.zustand().phase, "aufgabe");
  assert.equal(typeof s.fuehreAus, "function", "Vorgabe: Zug im Browser ausführen");
  assert.deepEqual(s.ergebnisse, []);
});

test("window.__LS_PRUEFEN__ meldet an; ein eigenes fuehreAus des Spiels gilt", () => {
  const eigen = async () => {};
  const umgebung = { __LS_PRUEFEN__: true, location: { search: "" } };
  const s = meldePruefSchnittstelle({ ...schnittstelle(), fuehreAus: eigen }, umgebung);
  assert.equal(s?.fuehreAus, eigen);
});

test("Ergebnisse (ls-ergebnis) sammelt die Schnittstelle mit", () => {
  /** @type {Record<string, (e: any) => void>} */
  const hoerer = {};
  const umgebung = {
    __LS_PRUEFEN__: true,
    document: { addEventListener: (/** @type {string} */ n, /** @type {any} */ f) => (hoerer[n] = f) },
  };
  const s = meldePruefSchnittstelle(schnittstelle(), umgebung);
  hoerer["ls-ergebnis"]({ detail: { key: "zerl:7:3+4", ok: true, hilfe: 0, ms: 900 } });
  assert.deepEqual(s?.ergebnisse, [{ key: "zerl:7:3+4", ok: true, hilfe: 0, ms: 900 }]);
});

test("die bekannten Phasen", () => {
  assert.deepEqual([...PHASEN].sort(), ["aufgabe", "einfuehrung", "fehler", "folge", "laden", "pause"]);
});

test("finde geht mit >>> in den Shadow-Baum", () => {
  const knopf = { name: "button" };
  const innen = { querySelector: (/** @type {string} */ s) => (s === "button" ? knopf : null) };
  const host = { shadowRoot: innen };
  const wurzel = { querySelector: (/** @type {string} */ s) => (s === "ls-hilfe" ? host : null) };
  assert.equal(finde("ls-hilfe >>> button", /** @type {any} */ (wurzel)), knopf);
  assert.equal(finde("ls-hilfe", /** @type {any} */ (wurzel)), host);
  assert.equal(finde("ls-pause >>> button", /** @type {any} */ (wurzel)), null);
  assert.equal(finde("ls-hilfe >>> a", /** @type {any} */ (wurzel)), null);
});

test("fehlversuche: Vorgabe true, false nur ausdrücklich", () => {
  const a = meldePruefSchnittstelle(schnittstelle(), { __LS_PRUEFEN__: true });
  assert.equal(a?.fehlversuche, true);
  const b = meldePruefSchnittstelle({ ...schnittstelle(), fehlversuche: false }, { __LS_PRUEFEN__: true });
  assert.equal(b?.fehlversuche, false);
});
