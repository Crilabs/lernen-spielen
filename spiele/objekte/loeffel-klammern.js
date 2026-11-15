// <ls-objekt art="loeffel-klammern">: ein Löffel, der quer liegt, und darunter zwei Wäscheklammern aus Holz, eine
// für jede Silbe von „Löf-fel“ (Grundform von „Wörter in Silben klatschen“). Feld 0…100. Klammern von der Seite:
// zwei Holzschenkel mit Mittelfuge, Loch an der Zange, Feder aus Draht als Band mit Windungen (Nähte, figuren.md §4).
// Keine Schrift, keine Ziffer.

import { form, flach, naht, falte, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const BESTECK = "#C9CCD6";
export const HOLZ = "#EBC48C";
export const FEDER = "#AEB4C2";

/** Löffel quer, Mulde links; (x, y) ist die Mitte der Mulde. */
function loeffel(/** @type {number} */ x, /** @type {number} */ y) {
  const stiel = form(pfad(`M${x + 12} ${y - 2.6} Q${x + 40} ${y - 3.4} ${x + 64} ${y - 4.6} Q${x + 69} ${y - 4.6} ${x + 69} ${y} Q${x + 69} ${y + 4.6} ${x + 64} ${y + 4.6} Q${x + 40} ${y + 3.4} ${x + 12} ${y + 2.6} Z`), BESTECK, [x + 20, y - 2], { s: 0.9 });
  const kopf = form(oval(x, y, 15, 10.5), BESTECK, [x - 6, y - 4], { s: 0.9 });
  const mulde = flach(oval(x - 0.5, y + 0.5, 10.5, 6.8), heller(BESTECK, 0.35));
  const muldeSchatten = falte(`M${x - 10.9} ${y + 1.2} Q${x - 11} ${y - 6.3} ${x - 0.5} ${y - 6.3} Q${x + 5} ${y - 6.3} ${x + 8} ${y - 4.2} Q${x + 2} ${y - 4.6} ${x - 2} ${y - 4} Q${x - 8} ${y - 3} ${x - 10.9} ${y + 1.2} Z`, BESTECK, 0.16);
  return zusammen(stiel, kopf, mulde, muldeSchatten);
}

/** Wäscheklammer von der Seite, Zange oben, Griff unten; (x, y) ist die Mitte oben. */
function klammer(/** @type {number} */ x, /** @type {number} */ y) {
  const p = (/** @type {number} */ a, /** @type {number} */ b) => `${x + a} ${y + b}`;
  const koerper = form(
    pfad(`M${p(-3.5, 0)} Q${p(0, -1.6)} ${p(3.5, 0)} L${p(5.2, 18)} L${p(7.2, 39)} Q${p(7.4, 42)} ${p(4.6, 42)} L${p(1.2, 42)} L${p(0, 38)} L${p(-1.2, 42)} L${p(-4.6, 42)} Q${p(-7.4, 42)} ${p(-7.2, 39)} L${p(-5.2, 18)} Z`),
    HOLZ, [x - 2, y + 6], { s: 0.9 },
  );
  const fuge = naht(`M${p(0, 0.6)} L${p(0, 37.5)}`, HOLZ, 1.2);
  const loch = flach(oval(x, y + 9.5, 2.1, 3.4), dunkler(HOLZ, 0.42));
  const band = form(pfad(`M${p(-6.4, 18.5)} L${p(6.4, 18.5)} L${p(6.7, 25.5)} L${p(-6.7, 25.5)} Z`), FEDER, [x - 4, y + 19.5], { s: 0.86 });
  const windungen = naht(`M${p(-3.6, 19)} L${p(-3.6, 25)} M${p(-1.2, 19)} L${p(-1.2, 25)} M${p(1.2, 19)} L${p(1.2, 25)} M${p(3.6, 19)} L${p(3.6, 25)}`, FEDER, 1);
  return zusammen(koerper, fuge, loch, band, windungen);
}

/** Löffel und zwei Klammern als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function loeffelKlammernStueck() {
  return zusammen(loeffel(24, 28), klammer(38, 48), klammer(62, 48));
}

meldeObjekt("loeffel-klammern", {
  zustaende: ["liegt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: loeffelKlammernStueck() }], ursprung: [50, 90] }),
});
