// <ls-objekt art="muenzglas">: ein Schraubglas mit Deckel, unten voll goldfarbener Münzen (das Kleingeld-Glas).
// Feld 0…100, von vorn: hohes Glas mit Schulter, oben der Deckel mit Rillen, im Glas ein Haufen Münzen mit einigen
// Münzen obenauf, links ein Lichtstreifen auf dem Glas. Keine Schrift, keine Ziffer, kein Wappen.

import { form, flach, naht, glanz, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";
import { GOLD } from "./muenze.js";

export const GLAS = "#DCEEF2";
export const DECKEL = "#E58C7A";

/** Eine Münze, flach von oben gesehen, Mitte (cx, cy). */
function muenzeOben(/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ r) {
  const kante = flach(oval(cx, cy + 1.4, r, r * 0.38), dunkler(GOLD, 0.25));
  const oben = flach(oval(cx, cy, r, r * 0.38), GOLD);
  const ring = flach(oval(cx, cy, r * 0.62, r * 0.24), heller(GOLD, 0.2));
  return zusammen(kante, oben, ring);
}

/** Glas mit Münzen und Deckel als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function muenzglasStueck() {
  const glas = form(pfad("M30 26 L70 26 L70 32 Q77 34 77 43 L77 86 Q77 94 69 94 L31 94 Q23 94 23 86 L23 43 Q23 34 30 32 Z"),
    GLAS, [30, 38], { s: 0.9 });
  const haufen = form(pfad("M26 62 Q33 56 41 60 Q49 53 58 58 Q66 54 74 61 L74 86 Q74 91 68 91 L32 91 Q26 91 26 86 Z"),
    GOLD, [32, 64], { s: 0.9, kontur: false });
  const drin = zusammen(muenzeOben(34, 71, 6), muenzeOben(50, 68, 6.5), muenzeOben(65, 73, 6), muenzeOben(41, 83, 6.5),
    muenzeOben(59, 85, 6), muenzeOben(70, 87, 4.5), muenzeOben(29, 88, 4));
  const obenauf = zusammen(muenzeOben(35, 59, 7), muenzeOben(52, 56, 7.5), muenzeOben(66, 58.5, 6.5));
  const licht = glanz("M30.5 44 L30.5 82", "#FFFFFF", 3.4);
  const deckel = form(pfad("M28 14 Q28 11 31 11 L69 11 Q72 11 72 14 L72 28 L28 28 Z"), DECKEL, [33, 14], { s: 0.9 });
  const rillen = naht("M35 15 L35 25 M42 15 L42 25 M49 15 L49 25 M56 15 L56 25 M63 15 L63 25", DECKEL, 1.4);
  const kante = flach(pfad("M28.5 25 L71.5 25 L71.5 28 L28.5 28 Z"), dunkler(DECKEL, 0.15));
  return zusammen(glas, haufen, drin, obenauf, licht, deckel, rillen, kante);
}

meldeObjekt("muenzglas", {
  zustaende: ["voll"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: muenzglasStueck() }], ursprung: [50, 94] }),
});
