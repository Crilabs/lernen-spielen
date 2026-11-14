// <ls-objekt art="hausfassade">: die Vorderseite eines hohen Wohnhauses mit Giebeldach und Schornstein; die Fenster
// stehen in Reihen und Spalten (drei Stockwerke mit je drei Fenstern), unten zwei Fenster und die Haustür.
// Feld 0…100, von vorn. Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const WAND = "#EFD9B4";
export const DACH = "#D98872";
export const GLAS = "#A7D6EE";
export const RAHMEN = "#FFFCF7";
export const TUER = "#4F8FB3";

/** Ein Fenster mit Rahmen, Kreuz und Glanz; (x, y) ist die Ecke oben links. */
function fenster(/** @type {number} */ x, /** @type {number} */ y) {
  const b = 11;
  const h = 10;
  const rahmen = flach(pfad(`M${x - 1.2} ${y - 1.2} L${x + b + 1.2} ${y - 1.2} L${x + b + 1.2} ${y + h + 1.2} L${x - 1.2} ${y + h + 1.2} Z`), RAHMEN);
  const glas = flach(pfad(`M${x} ${y} L${x + b} ${y} L${x + b} ${y + h} L${x} ${y + h} Z`), GLAS);
  const schatten = flach(pfad(`M${x} ${y} L${x + b} ${y} L${x + b} ${y + 2.4} L${x} ${y + 2.4} Z`), dunkler(GLAS, 0.22));
  const kreuz = flach(pfad(`M${x + b / 2 - 0.7} ${y} L${x + b / 2 + 0.7} ${y} L${x + b / 2 + 0.7} ${y + h} L${x + b / 2 - 0.7} ${y + h} Z M${x} ${y + h / 2 - 0.7} L${x + b} ${y + h / 2 - 0.7} L${x + b} ${y + h / 2 + 0.7} L${x} ${y + h / 2 + 0.7} Z`), RAHMEN);
  const licht = flach(pfad(`M${x + 1.2} ${y + h / 2 - 1.6} L${x + 3.8} ${y + 3} L${x + 4.8} ${y + 3} L${x + 2.2} ${y + h / 2 - 1.6} Z`), heller(GLAS, 0.55));
  const bank = flach(pfad(`M${x - 2} ${y + h + 1.2} L${x + b + 2} ${y + h + 1.2} L${x + b + 2} ${y + h + 2.8} L${x - 2} ${y + h + 2.8} Z`), dunkler(WAND, 0.18));
  return zusammen(rahmen, glas, schatten, kreuz, licht, bank);
}

/** Das Haus als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function hausfassadeStueck() {
  const schornstein = form(pfad("M62 6 L70 6 L70 22 L62 22 Z"), dunkler(DACH, 0.15), [64, 8], { s: 0.9 });
  const dach = form(pfad("M50 4 L84 30 L16 30 Z"), DACH, [44, 14], { s: 0.9 });
  const wand = form(pfad("M22 28 L78 28 L78 96 L22 96 Z"), WAND, [32, 40], { s: 0.92 });
  const traufe = flach(pfad("M20 28 L80 28 L80 32 L20 32 Z"), dunkler(WAND, 0.12));
  const fenstersatz = [];
  for (const y of [36, 50, 64]) for (const x of [27, 44.5, 62]) fenstersatz.push(fenster(x, y));
  for (const x of [27, 62]) fenstersatz.push(fenster(x, 79));
  const tuer = form(pfad("M44 96 L44 82 Q50 76 56 82 L56 96 Z"), TUER, [47, 84], { s: 0.9 });
  const griff = naht("M53.4 89 L53.4 91", heller(TUER, 0.6), 1.4);
  const sockel = flach(pfad("M22 93 L78 93 L78 96 L22 96 Z"), dunkler(WAND, 0.25));
  return zusammen(schornstein, dach, wand, traufe, ...fenstersatz, tuer, griff, sockel);
}

meldeObjekt("hausfassade", {
  zustaende: ["fenster"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: hausfassadeStueck() }], ursprung: [50, 96] }),
});
