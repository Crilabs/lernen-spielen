// <ls-objekt art="flaschen-sechserpack">: ein Sechserpack Wasserflaschen in Folie, wie man ihn im Laden mitnimmt.
// Feld 0…100, leicht von oben vorn gesehen: hinten drei Flaschen, vorne drei, eine Folienbahn um die vordere Reihe
// und oben die Tragschlaufe aus Folie. Keine Schrift, keine Ziffer, kein Etikett.

import { form, flach, naht, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const FLASCHE = "#A9D8E8";
export const DECKEL = "#FF9F8A";
export const FOLIE = "#E6F3F7";

/** @param {number} n */
const r = (n) => Math.round(n * 100) / 100;

/** Eine Flasche mit Mitte cx, Boden y, Breite w, Höhe h (bis zum oberen Rand des Deckels). */
function flasche(/** @type {number} */ cx, /** @type {number} */ boden, /** @type {number} */ w, /** @type {number} */ h) {
  const x0 = r(cx - w / 2), x1 = r(cx + w / 2);
  const schulter = r(boden - h * 0.58);
  const hals = r(w * 0.3);
  const halsUnten = r(schulter - h * 0.2);
  const halsOben = r(boden - h * 0.88);
  const deckelOben = r(boden - h);
  const koerper = form(pfad(`M${x0} ${r(boden - 3)} Q${x0} ${boden} ${r(x0 + 3)} ${boden} L${r(x1 - 3)} ${boden}`
    + ` Q${x1} ${boden} ${x1} ${r(boden - 3)} L${x1} ${schulter} Q${x1} ${r(schulter - h * 0.14)} ${r(cx + hals / 2)} ${halsUnten}`
    + ` L${r(cx + hals / 2)} ${halsOben} L${r(cx - hals / 2)} ${halsOben} L${r(cx - hals / 2)} ${halsUnten}`
    + ` Q${x0} ${r(schulter - h * 0.14)} ${x0} ${schulter} Z`), FLASCHE, [r(cx - w * 0.25), r(schulter - 4)], { s: 0.86 });
  const dw = r(hals * 1.35);
  const deckel = form(pfad(`M${r(cx - dw / 2)} ${halsOben} L${r(cx - dw / 2)} ${r(deckelOben + 1.5)}`
    + ` Q${r(cx - dw / 2)} ${deckelOben} ${r(cx - dw / 2 + 1.5)} ${deckelOben} L${r(cx + dw / 2 - 1.5)} ${deckelOben}`
    + ` Q${r(cx + dw / 2)} ${deckelOben} ${r(cx + dw / 2)} ${r(deckelOben + 1.5)} L${r(cx + dw / 2)} ${halsOben} Z`),
  DECKEL, [r(cx - dw * 0.3), r(deckelOben + 1)], { s: 0.85 });
  const rillen = naht(`M${r(cx - w * 0.36)} ${r(boden - h * 0.22)} L${r(cx + w * 0.36)} ${r(boden - h * 0.22)}`, FLASCHE, 1.4);
  const licht = naht(`M${r(x0 + w * 0.2)} ${r(boden - 8)} L${r(x0 + w * 0.2)} ${r(schulter + 2)}`, heller(FLASCHE, 0.6), 2);
  return zusammen(koerper, deckel, rillen, licht);
}

/** Sechserpack als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function sechserpackStueck() {
  const hinten = [32, 58, 84].map((cx) => flasche(cx, 84, 24, 60));
  const vorne = [20, 46, 72].map((cx) => flasche(cx, 95, 24, 60));
  const bahn = form(pfad("M7 58 L85 58 L85 78 L7 78 Z"), FOLIE, [12, 60], { s: 0.9 });
  const seite = flach(pfad("M85 58 L95.5 49.5 L95.5 69.5 L85 78 Z"), dunkler(FOLIE, 0.18));
  const bahnKante = zusammen(
    naht("M8 58.5 L84 58.5", FOLIE, 1.6),
    naht("M8 77.5 L84 77.5", FOLIE, 1.6),
    naht("M33 60 L33 76 M59 60 L59 76", FOLIE, 1.2),
  );
  const schlaufe = form(pfad("M33 44 Q50 6 67 44 L61 44 Q50 18 39 44 Z"), FOLIE, [39, 24], { s: 0.88 });
  return zusammen(...hinten, ...vorne, seite, bahn, bahnKante, schlaufe);
}

meldeObjekt("flaschen-sechserpack", {
  zustaende: ["pack"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: sechserpackStueck() }], ursprung: [50, 95] }),
});
