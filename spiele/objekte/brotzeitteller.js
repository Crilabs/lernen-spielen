// <ls-objekt art="brotzeitteller">: ein flacher Teller schräg von vorn, auf dem drei runde Kekse nebeneinander
// liegen (Brotzeit verteilt, drei auf jedem Teller). Feld 0…100 breit, flach und breit wie ein Teller.
// Teller hellblau mit Rand und Mulde, Kekse goldbraun mit Krümelpunkten. Keine Schrift, keine Ziffer.

import { form, flach, glanz, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const TELLER = "#CFE3F5";
export const KEKS = "#E8B062";

/** Ein Keks als flache Scheibe; (cx, cy) ist die Mitte der Oberseite. */
function keks(/** @type {number} */ cx, /** @type {number} */ cy) {
  const rx = 12;
  const ry = 5;
  const h = 4;
  const seite = form(pfad(`M${cx - rx} ${cy} L${cx - rx} ${cy + h} A${rx} ${ry} 0 0 0 ${cx + rx} ${cy + h} L${cx + rx} ${cy} Z`), dunkler(KEKS, 0.18), [cx - rx * 0.6, cy + 1], { s: 0.9 });
  const oben = form(oval(cx, cy, rx, ry), KEKS, [cx - rx * 0.4, cy - ry * 0.4], { s: 0.88 });
  const kruemel = flach(`${oval(cx - 5, cy - 0.5, 1.3, 0.8)}`, dunkler(KEKS, 0.35));
  const kruemel2 = flach(`${oval(cx + 3, cy - 1.8, 1.2, 0.7)}`, dunkler(KEKS, 0.35));
  const kruemel3 = flach(`${oval(cx + 4.5, cy + 1.8, 1.3, 0.8)}`, dunkler(KEKS, 0.35));
  const licht = glanz(`M${cx - 8} ${cy - 1.5} Q${cx - 5} ${cy - 4} ${cx} ${cy - 4.2}`, KEKS, 1.6);
  return zusammen(seite, oben, kruemel, kruemel2, kruemel3, licht);
}

/** Teller mit drei Keksen als Stück. @returns {import("../runde/kinder/stil.js").Stueck} */
export function brotzeittellerStueck() {
  const unten = form(oval(50, 71, 44, 15), dunkler(TELLER, 0.2), [30, 64], { s: 0.92 });
  const teller = form(oval(50, 67, 46, 16), TELLER, [28, 58], { s: 0.92 });
  const mulde = flach(oval(50, 68, 30, 9.5), dunkler(TELLER, 0.08));
  const muldenrand = glanz("M24 72 Q50 80 76 72", TELLER, 1.6);
  return zusammen(unten, teller, mulde, muldenrand, keks(50, 51), keks(27, 57), keks(73, 57));
}

meldeObjekt("brotzeitteller", {
  zustaende: ["drei"],
  zeichne: () => bild({ breite: 100, hoehe: 50, oben: 40, teile: [{ stueck: brotzeittellerStueck() }], ursprung: [50, 86] }),
});
