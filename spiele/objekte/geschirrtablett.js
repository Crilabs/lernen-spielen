// <ls-objekt art="geschirrtablett">: ein Holztablett mit dem Geschirr, bevor der Tisch gedeckt wird: links ein Stapel
// Teller von der Seite, rechts zwei Becher, in einem steht ein Löffel. Feld 0…100, leicht von oben gesehen.
// Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const HOLZ = "#D9A86C";
export const TELLER = "#FFFCF7";
export const RAND = "#7FB6E8";
export const BECHER = "#F59A86";
export const BECHER2 = "#8FCFB0";
export const BESTECK = "#C9CCD6";

/** Ein Teller von der Seite, Mitte (cx, cy) der Oberseite. */
function teller(/** @type {number} */ cx, /** @type {number} */ cy) {
  const unten = form(pfad(`M${cx - 24} ${cy} Q${cx - 22} ${cy + 6} ${cx - 14} ${cy + 6.5} L${cx + 14} ${cy + 6.5} Q${cx + 22} ${cy + 6} ${cx + 24} ${cy} Z`), dunkler(TELLER, 0.08), [cx - 12, cy + 2], { s: 0.9 });
  const oben = form(oval(cx, cy, 24, 4.5), TELLER, [cx - 10, cy - 1.5], { s: 0.9 });
  const band = naht(`M${cx - 18} ${cy + 1.2} Q${cx} ${cy + 3.6} ${cx + 18} ${cy + 1.2}`, heller(RAND, 0.2), 1.4);
  return zusammen(unten, oben, band);
}

/** Ein Becher, (x, y) ist die linke obere Ecke. */
function becher(/** @type {number} */ x, /** @type {number} */ y, /** @type {string} */ farbe) {
  const koerper = form(pfad(`M${x} ${y} L${x + 18} ${y} L${x + 16} ${y + 26} Q${x + 9} ${y + 29} ${x + 2} ${y + 26} Z`), farbe, [x + 4, y + 6], { s: 0.9 });
  const rand = flach(oval(x + 9, y, 9, 2.6), dunkler(farbe, 0.25));
  return zusammen(koerper, rand);
}

/** Tablett mit Geschirr als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function geschirrtablettStueck() {
  const brett = form(pfad("M4 70 Q4 66 9 66 L91 66 Q96 66 96 70 L93 84 Q92 88 87 88 L13 88 Q8 88 7 84 Z"), HOLZ, [24, 70], { s: 0.9 });
  const flaeche = flach(pfad("M11 70 L89 70 L86.5 82 L13.5 82 Z"), heller(HOLZ, 0.18));
  const maserung = naht("M18 74 Q40 72.5 60 74.5 M24 78.5 Q48 77 78 78.5", HOLZ, 1.2);
  const stapel = [72, 65, 58, 51].map((y) => teller(32, y));
  const stiel = form(pfad("M74 18 L77.5 18 L76.5 46 L74.5 46 Z"), BESTECK, [75, 22], { s: 0.9 });
  const kopf = form(oval(75.8, 14, 4.2, 6), BESTECK, [74.5, 11], { s: 0.9 });
  const mulde = flach(oval(75.8, 14.3, 2.4, 3.8), heller(BESTECK, 0.35));
  return zusammen(brett, flaeche, maserung, ...stapel, stiel, kopf, mulde, becher(66, 42, BECHER), becher(78, 48, BECHER2));
}

meldeObjekt("geschirrtablett", {
  zustaende: ["beladen"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: geschirrtablettStueck() }], ursprung: [50, 88] }),
});
