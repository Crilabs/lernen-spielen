// <ls-objekt art="broetchen">: eine Papiertüte vom Bäcker, aus der zwei Brötchen schauen.
// Feld 0…100. Tüte in Packpapierbraun mit Falz und umgeschlagenem Rand, Brötchen goldbraun mit einem Schnitt
// (Naht, figuren.md §4). Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const TUETE = "#E3C497";
export const KRUME = "#EBB86A";

/** Ein Brötchen mit Mitte (cx, cy) und Halbmessern rx, ry. */
function broetchen(/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ rx, /** @type {number} */ ry) {
  const koerper = form(oval(cx, cy, rx, ry), KRUME, [cx - rx * 0.4, cy - ry * 0.4], { s: 0.9 });
  const schnitt = naht(`M${cx - rx * 0.5} ${cy - ry * 0.1} Q${cx} ${cy - ry * 0.75} ${cx + rx * 0.5} ${cy - ry * 0.1}`, dunkler(KRUME, 0.3), 2.2);
  const glanz = naht(`M${cx - rx * 0.7} ${cy - ry * 0.2} Q${cx - rx * 0.6} ${cy - ry * 0.6} ${cx - rx * 0.2} ${cy - ry * 0.7}`, heller(KRUME, 0.5), 1.8);
  return zusammen(koerper, schnitt, glanz);
}

/** Tüte mit Brötchen als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function broetchenStueck() {
  const hinten = broetchen(38, 40, 17, 13);
  const vorne = broetchen(62, 36, 18, 14);
  const tuete = form(pfad("M18 48 L82 48 L76 92 L24 92 Z"), TUETE, [34, 62], { s: 0.9 });
  const rand = form(pfad("M16 44 L84 44 L82 54 L18 54 Z"), heller(TUETE, 0.2), [30, 47], { s: 0.9 });
  const falz = naht("M50 56 L50 90", dunkler(TUETE, 0.2), 1.6);
  const knick = flach(pfad("M18 54 L82 54 L81.5 57 L18.5 57 Z"), dunkler(TUETE, 0.12));
  return zusammen(hinten, vorne, tuete, knick, rand, falz);
}

meldeObjekt("broetchen", {
  zustaende: ["tuete"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: broetchenStueck() }], ursprung: [50, 92] }),
});
