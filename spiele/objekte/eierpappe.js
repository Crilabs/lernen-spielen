// <ls-objekt art="eierpappe">: eine flache Eierpappe ohne Deckel mit zehn Mulden (2 Reihen zu 5), in jeder ein Ei,
// davor drei einzelne Eier. Feld 0…100, leicht von oben. Keine Schrift, keine Ziffer.
// Bild der Karte „Mit echten Dingen“ für zehn-plus (ein voller Zehner und noch was). Anders als `eierkarton`
// (sechs Eier, Deckel hinten): breit, flach, ohne Deckel.

import { form, flach, naht, oval, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { PAPPE, EI } from "./eierkarton.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

/** Mulde mit Ei, Mitte (cx, cy). @param {number} cx @param {number} cy */
function mulde(cx, cy) {
  return zusammen(
    flach(oval(cx, cy, 8, 5.6), dunkler(PAPPE, 0.28)),
    form(oval(cx, cy - 2.4, 6.6, 6), EI, [cx - 2, cy - 5], { s: 0.88, kontur: false }),
    naht(`M${cx - 3.4} ${cy - 4} Q${cx - 2.6} ${cy - 6.4} ${cx - 0.4} ${cy - 6.8}`, heller(EI, 0.5), 1.3),
  );
}

/** Ein einzelnes Ei, liegend, Mitte (cx, cy). @param {number} cx @param {number} cy */
function ei(cx, cy) {
  return zusammen(
    form(oval(cx, cy, 9, 6.6), EI, [cx - 4, cy - 4], { s: 0.88 }),
    naht(`M${cx - 5.5} ${cy - 2.5} Q${cx - 4} ${cy - 5} ${cx - 1} ${cy - 5.2}`, heller(EI, 0.5), 1.4),
  );
}

/** Eierpappe mit zehn Eiern und drei Eiern davor als Stück im Feld 0…100 (Boden bei y 94). @returns {Stueck} */
export function eierpappeStueck() {
  const schale = form(pfad("M6 34 L94 34 L97 68 Q97 71 94 71 L6 71 Q3 71 3 68 Z"), PAPPE, [14, 37], { s: 0.92 });
  const rand = flach(pfad("M6 34 L94 34 L94.4 37.5 L5.6 37.5 Z"), heller(PAPPE, 0.2));
  const mulden = [];
  for (const cy of [47, 62]) for (const cx of [16, 33, 50, 67, 84]) mulden.push(mulde(cx, cy));
  const eier = [ei(27, 86), ei(50, 87), ei(73, 86)];
  return zusammen(schale, rand, ...mulden, ...eier);
}

meldeObjekt("eierpappe", {
  zustaende: ["zehn"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: eierpappeStueck() }], ursprung: [50, 94] }),
});
