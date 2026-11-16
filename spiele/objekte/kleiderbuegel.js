// <ls-objekt art="kleiderbuegel">: ein Kleiderbügel aus Holz mit Haken, an der unteren Stange zehn Wäscheklammern
// nebeneinander. Feld 0…100, von vorn. Keine Schrift, keine Ziffer.
// Bild der Karte „Mit echten Dingen“ für zehnerzahlen-bis-100 (ein Bügel trägt einen Zehner Klammern).
//
// Farben: Holz Ahorn (Token), Haken Schatten der „Werkstatt“, Klammern helle Töne der Welt-Paletten.

import { form, flach, naht, pfad, zusammen, dunkler } from "../runde/kinder/stil.js";
import { FARBE } from "../rahmen/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const HOLZ = dunkler(FARBE.ahorn, 0.08);
const HAKEN = PALETTEN.werkstatt[4];
const KLAMMER = [PALETTEN.wasser[1], PALETTEN.wiese[2], PALETTEN.wasser[3], PALETTEN.savanne[1], PALETTEN.dorf[3]];
export const ANZAHL = 10;

/** Eine Klammer an der Stange (Oberkante y), Mitte x. @param {number} x @param {number} y @param {string} farbe */
function klammer(x, y, farbe) {
  return zusammen(
    form(pfad(`M${x - 2.6} ${y - 4} L${x + 2.6} ${y - 4} L${x + 2.2} ${y + 17} Q${x} ${y + 19} ${x - 2.2} ${y + 17} Z`), farbe, [x - 2, y - 3], { s: 0.86 }),
    naht(`M${x} ${y + 7} L${x} ${y + 17}`, farbe, 1.1),
    flach(pfad(`M${x - 1} ${y + 9} Q${x} ${y + 11.5} ${x + 1} ${y + 9} L${x + 1} ${y + 12} L${x - 1} ${y + 12} Z`), dunkler(farbe, 0.35)),
    flach(pfad(`M${x - 3.2} ${y + 3} L${x + 3.2} ${y + 3} L${x + 3.2} ${y + 5.4} L${x - 3.2} ${y + 5.4} Z`), dunkler(HAKEN, 0.05)),
  );
}

/** Bügel mit zehn Klammern als Stück im Feld 0…100 (Unterkante der Klammern bei y 84). @returns {Stueck} */
export function kleiderbuegelStueck() {
  const haken = { svg: `<path d="M50 30 L50 20 Q50 10 58 10 Q65 10 65 17" fill="none" stroke="${HAKEN}" stroke-width="3.4"/>`,
    kontur: `<path d="M50 30 L50 20 Q50 10 58 10 Q65 10 65 17" fill="none" stroke-width="7"/>` };
  const buegel = form(pfad("M50 26 Q54 26 58 29 L94 56 Q97 58.5 95 61 Q94 62 92 62 L8 62 Q6 62 5 61 Q3 58.5 6 56 L42 29 Q46 26 50 26 Z M50 33 L14 56 L86 56 Z"),
    HOLZ, [20, 40], { s: 0.9 });
  const fuss = naht("M10 59 L90 59", HOLZ, 1.2);
  const klammern = Array.from({ length: ANZAHL }, (_, i) => klammer(14.5 + i * 7.9, 62, KLAMMER[i % KLAMMER.length]));
  return zusammen(haken, buegel, fuss, ...klammern);
}

meldeObjekt("kleiderbuegel", {
  zustaende: ["klammern"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: kleiderbuegelStueck() }], ursprung: [50, 84] }),
});
