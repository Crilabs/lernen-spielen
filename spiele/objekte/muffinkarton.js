// <ls-objekt art="muffinkarton">: ein offener Karton mit neun Muffins in drei Reihen zu drei, der Deckel hinten
// aufgeklappt. Feld 0…100, leicht von oben gesehen (hintere Reihe höher). Keine Schrift, keine Ziffer.
// Packung der Neunerreihe in M37 Kettenhüpfer (Setzung des Spiels: „Hier kommen in einen Muffinkarton neun Muffins.“).
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2), keine Farbe der Lernzeichen:
// Karton Boden „Dorf und Stadt“, Muffin Boden „Savanne“, Förmchen Akzent „Wasser und Strand“.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const KARTON = PALETTEN.dorf[2];
const TEIG = PALETTEN.savanne[2];
const FORM = PALETTEN.wasser[3];
export const REIHEN = 3;

/** Ein Muffin: Förmchen mit Rillen und Haube, Mitte x, Oberkante der Haube y, Größe k (hinten kleiner). */
function muffin(/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ k) {
  const ob = 11 * k;
  const un = 8.5 * k;
  const fy = y + 7 * k;
  const fh = 11 * k;
  const foermchen = zusammen(
    form(pfad(`M${x - ob} ${fy} L${x + ob} ${fy} L${x + un} ${fy + fh} L${x - un} ${fy + fh} Z`), FORM, [x - ob + 2, fy + 1], { s: 0.88, kontur: false, trenn: true }),
    naht(`M${x - ob * 0.45} ${fy + 1} L${x - un * 0.45} ${fy + fh - 0.5} M${x} ${fy + 1} L${x} ${fy + fh - 0.5} M${x + ob * 0.45} ${fy + 1} L${x + un * 0.45} ${fy + fh - 0.5}`, FORM, 1.3),
  );
  const haube = form(pfad(`M${x - ob - 1.2 * k} ${fy + 1} Q${x - ob - 1.5 * k} ${y} ${x} ${y} Q${x + ob + 1.5 * k} ${y} ${x + ob + 1.2 * k} ${fy + 1} Q${x} ${fy + 3 * k} ${x - ob - 1.2 * k} ${fy + 1} Z`),
    TEIG, [x - ob * 0.5, y + 2], { s: 0.86, kontur: false, trenn: true, glanz: true });
  return zusammen(foermchen, haube);
}

/** Muffinkarton als Stück im Feld 0…100 (Boden bei y 94). @returns {Stueck} */
export function muffinkartonStueck() {
  const deckel = form(pfad("M10 16 L90 16 L94 40 L6 40 Z"), dunkler(KARTON, 0.1), [24, 18], { s: 0.92 });
  const boden = form(pfad("M6 40 L94 40 L97 82 L3 82 Z"), KARTON, [16, 44], { s: 0.94 });
  const knick = naht("M7 40 L93 40", dunkler(KARTON, 0.2), 1.6);
  const vorn = zusammen(
    form(pfad("M3 80 L97 80 L95 92 Q95 95 92 95 L8 95 Q5 95 5 92 Z"), dunkler(KARTON, 0.05), [10, 82], { s: 0.9 }),
    flach(pfad("M3 80 L97 80 L96.8 83 L3.2 83 Z"), heller(KARTON, 0.2)),
  );
  // Reihen von hinten nach vorn: hinten höher und kleiner, vorn tiefer und größer.
  const reihen = [
    { y: 37, k: 0.86, xs: [26, 50, 74] },
    { y: 50, k: 0.93, xs: [24, 50, 76] },
    { y: 63, k: 1, xs: [22, 50, 78] },
  ];
  const muffins = reihen.flatMap((r) => r.xs.map((x) => muffin(x, r.y, r.k)));
  return zusammen(deckel, boden, knick, ...muffins, vorn);
}

meldeObjekt("muffinkarton", {
  zustaende: ["offen"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: muffinkartonStueck() }], ursprung: [50, 95] }),
});
