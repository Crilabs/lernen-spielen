// <ls-objekt art="gedeck">: ein gedeckter Platz von oben: Teller in der Mitte, links die Gabel, rechts der Löffel,
// oben rechts der Becher (vier Dinge, zweimal zwei). Feld 0…100. Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const TELLER = "#FFFCF7";
export const RAND = "#7FB6E8";
export const BESTECK = "#C9CCD6";
export const BECHER = "#F59A86";

/** Gabel, Griff nach unten; (x, y) ist die Mitte oben. */
function gabel(/** @type {number} */ x, /** @type {number} */ y) {
  const stiel = form(pfad(`M${x - 2} ${y + 12} L${x + 2} ${y + 12} L${x + 2.5} ${y + 46} Q${x} ${y + 49} ${x - 2.5} ${y + 46} Z`), BESTECK, [x - 1, y + 20], { s: 0.9 });
  const kopf = form(pfad(`M${x - 7} ${y} L${x + 7} ${y} L${x + 7} ${y + 10} Q${x} ${y + 16} ${x - 7} ${y + 10} Z`), BESTECK, [x - 3, y + 3], { s: 0.9 });
  const zinken = naht(`M${x - 3.5} ${y + 1} L${x - 3.5} ${y + 9} M${x} ${y + 1} L${x} ${y + 10} M${x + 3.5} ${y + 1} L${x + 3.5} ${y + 9}`, dunkler(BESTECK, 0.3), 1.4);
  return zusammen(stiel, kopf, zinken);
}

/** Löffel, Griff nach unten; (x, y) ist die Mitte oben. */
function loeffel(/** @type {number} */ x, /** @type {number} */ y) {
  const stiel = form(pfad(`M${x - 2} ${y + 12} L${x + 2} ${y + 12} L${x + 2.5} ${y + 46} Q${x} ${y + 49} ${x - 2.5} ${y + 46} Z`), BESTECK, [x - 1, y + 20], { s: 0.9 });
  const kopf = form(oval(x, y + 8, 7, 9.5), BESTECK, [x - 2, y + 5], { s: 0.9 });
  const mulde = flach(oval(x, y + 8.5, 4, 6), heller(BESTECK, 0.35));
  return zusammen(stiel, kopf, mulde);
}

/** Der Platz als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function gedeckStueck() {
  const teller = form(oval(50, 56, 22, 22), TELLER, [42, 46], { s: 0.9 });
  const rand = flach(oval(50, 56, 15, 15), heller(RAND, 0.4));
  const mitte = flach(oval(50, 56, 11, 11), TELLER);
  const becher = form(pfad("M76 12 L92 12 L90 34 Q84 37 78 34 Z"), BECHER, [80, 18], { s: 0.9 });
  const brand = flach(pfad("M76.5 12 L91.5 12 L91.2 16 L76.8 16 Z"), heller(BECHER, 0.4));
  return zusammen(gabel(14, 30), teller, rand, mitte, loeffel(86, 46), becher, brand);
}

meldeObjekt("gedeck", {
  zustaende: ["gedeckt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: gedeckStueck() }], ursprung: [50, 90] }),
});
