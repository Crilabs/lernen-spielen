// <ls-objekt art="schuhpaar">: ein Paar Kinderschuhe (zwei Turnschuhe von der Seite, der hintere ein Stück höher und
// versetzt). Feld 0…100, das Paar sitzt mittig. Sohle in Weiß, Schuhe in Blau und Koralle, damit sie wie ein Paar
// zusammengehören, aber an der Farbe zu trennen sind; Schnürung als Nähte (figuren.md §4).

import { form, naht, pfad, zusammen, heller } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const SCHUH_A = "#7FB6E8";
export const SCHUH_B = "#F59A86";
const SOHLE = "#FFFCF7";

/**
 * Ein Schuh von der Seite, Spitze rechts; (x, y) ist die linke obere Ecke des Schafts.
 * @param {number} x @param {number} y @param {string} farbe @returns {import("../runde/kinder/stil.js").Stueck}
 */
function schuh(x, y, farbe) {
  const p = (/** @type {number} */ a, /** @type {number} */ b) => `${x + a} ${y + b}`;
  const schaft = form(
    pfad(`M${p(0, 4)} Q${p(0, 0)} ${p(5, 0)} L${p(15, 0)} Q${p(19, 10)} ${p(28, 12)} Q${p(40, 13)} ${p(44, 22)} L${p(44, 26)} L${p(0, 26)} Z`),
    farbe, [x + 6, y + 4], { s: 0.88 },
  );
  const sohle = form(pfad(`M${p(-1, 24)} L${p(46, 24)} Q${p(48, 24)} ${p(48, 27)} L${p(48, 29)} Q${p(48, 31)} ${p(46, 31)} L${p(1, 31)} Q${p(-1, 31)} ${p(-1, 29)} Z`), SOHLE, [x + 4, y + 25], { s: 0.9 });
  const kappe = form(pfad(`M${p(32, 14)} Q${p(41, 16)} ${p(44, 22)} L${p(44, 25)} L${p(30, 25)} Q${p(33, 20)} ${p(32, 14)} Z`), heller(farbe, 0.3), [x + 34, y + 18], { s: 0.86, kontur: false });
  const naehte = naht(`M${p(17, 4)} L${p(20, 7)} M${p(21, 7)} L${p(24, 10)} M${p(15, 7)} L${p(19, 10)} M${p(0, 15)} L${p(12, 15)}`, farbe, 1.8);
  return zusammen(sohle, schaft, kappe, naehte);
}

/** Das Paar als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function schuhpaarStueck() {
  return zusammen(schuh(28, 22, SCHUH_A), schuh(20, 38, SCHUH_B));
}

meldeObjekt("schuhpaar", {
  zustaende: ["liegt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: schuhpaarStueck() }], ursprung: [50, 74] }),
});
