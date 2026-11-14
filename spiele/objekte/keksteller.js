// <ls-objekt art="keksteller">: ein flacher Teller von der Seite mit einem kleinen Haufen runder Kekse (3, 2, 1
// übereinander, leicht schräg von oben gesehen). Feld 0…100. Kekse goldbraun mit dunklen Stückchen, Teller hell mit
// farbigem Rand. Keine Schrift, keine Ziffer.

import { form, flach, naht, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const TELLER = "#FFFCF7";
export const RAND = "#8FC9B8";
export const KEKS = "#DDA35E";
export const STUECKCHEN = "#6E4529";

/** Ein Keks mit Mitte (cx, cy), leicht von oben gesehen. */
function keks(/** @type {number} */ cx, /** @type {number} */ cy) {
  const kante = form(oval(cx, cy + 3, 14, 8.5), dunkler(KEKS, 0.18), [cx - 6, cy], { s: 0.92, trenn: true });
  const oben = form(oval(cx, cy, 14, 8.5), KEKS, [cx - 6, cy - 4], { s: 0.9, trenn: true });
  const punkte = [[-6, -2], [3, -4], [6, 2], [-2, 3]].map(([dx, dy]) => flach(oval(cx + dx, cy + dy, 1.8, 1.3), STUECKCHEN));
  const glanz = naht(`M${cx - 10} ${cy - 1} Q${cx - 8} ${cy - 6} ${cx - 2} ${cy - 7}`, heller(KEKS, 0.55), 1.6);
  return zusammen(kante, oben, ...punkte.map((p) => ({ svg: p.svg, kontur: "" })), glanz);
}

/** Teller mit Keksen als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function kekstellerStueck() {
  const fuss = form(oval(50, 86, 26, 5), dunkler(TELLER, 0.12), [36, 84], { s: 0.9 });
  const teller = form(oval(50, 78, 46, 11), TELLER, [24, 72], { s: 0.92 });
  const rand = naht("M10 80 Q50 93 90 80", heller(RAND, 0.3), 2);
  const mulde = flach(oval(50, 77, 32, 7), heller(RAND, 0.6));
  const unten = [keks(28, 68), keks(50, 70), keks(72, 68)];
  const mitte = [keks(39, 55), keks(61, 55)];
  const spitze = keks(50, 42);
  return zusammen(fuss, teller, rand, mulde, ...unten, ...mitte, spitze);
}

meldeObjekt("keksteller", {
  zustaende: ["haufen"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: kekstellerStueck() }], ursprung: [50, 90] }),
});
