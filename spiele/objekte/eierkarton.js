// <ls-objekt art="eierkarton">: ein offener Eierkarton aus grauer Pappe mit sechs Mulden (2 mal 3), in jeder ein Ei.
// Feld 0…100, leicht von oben gesehen: hinten der aufgeklappte Deckel, vorne die Schale mit den Mulden.
// Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const PAPPE = "#BDB3A3";
export const EI = "#F6EBD6";

/** Eine Mulde mit Ei, Mitte (cx, cy). */
function mulde(/** @type {number} */ cx, /** @type {number} */ cy) {
  const loch = flach(oval(cx, cy, 11, 8), dunkler(PAPPE, 0.28));
  const ei = form(oval(cx, cy - 2.5, 8, 7.5), EI, [cx - 3, cy - 6], { s: 0.9 });
  const glanz = naht(`M${cx - 5} ${cy - 5} Q${cx - 4} ${cy - 8} ${cx - 1} ${cy - 8.5}`, heller(EI, 0.5), 1.6);
  return zusammen(loch, ei, glanz);
}

/** Karton mit Eiern als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function eierkartonStueck() {
  const deckel = form(pfad("M10 14 L90 14 L92 40 L8 40 Z"), dunkler(PAPPE, 0.1), [30, 22], { s: 0.9 });
  const schale = form(pfad("M6 40 L94 40 L90 86 L10 86 Z"), PAPPE, [26, 52], { s: 0.9 });
  const rand = flach(pfad("M6 40 L94 40 L93.5 45 L6.5 45 Z"), heller(PAPPE, 0.2));
  const mulden = [];
  for (const cy of [58, 76]) for (const cx of [25, 50, 75]) mulden.push(mulde(cx, cy));
  const knick = naht("M8 40 L92 40", dunkler(PAPPE, 0.2), 1.6);
  return zusammen(deckel, schale, rand, knick, ...mulden);
}

meldeObjekt("eierkarton", {
  zustaende: ["karton"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: eierkartonStueck() }], ursprung: [50, 88] }),
});
