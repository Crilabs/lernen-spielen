// <ls-objekt art="erdbeerschale">: eine Schale voll Erdbeeren, wie man sie zum Auftun auf den Tisch stellt.
// Feld 0…100, leicht von vorn oben gesehen: weiße Schale mit blauem Rand, darin drei Lagen Erdbeeren mit grünem
// Kelch und hellen Samen. Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const BEERE = "#F0675C";
export const KELCH = "#7CBF6A";
export const SCHALE = "#FFFCF7";
export const RAND = "#7FB6E8";

/** @param {number} n */
const r = (n) => Math.round(n * 100) / 100;

/** Eine Erdbeere mit Mitte (cx, cy) und Halbbreite s, Spitze nach unten. */
function erdbeere(/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ s) {
  const koerper = form(pfad(`M${r(cx - s)} ${r(cy - s * 0.3)} Q${r(cx - s * 0.95)} ${r(cy + s * 0.75)} ${cx} ${r(cy + s * 1.35)}`
    + ` Q${r(cx + s * 0.95)} ${r(cy + s * 0.75)} ${r(cx + s)} ${r(cy - s * 0.3)} Q${cx} ${r(cy - s * 0.85)} ${r(cx - s)} ${r(cy - s * 0.3)} Z`),
  BEERE, [r(cx - s * 0.45), r(cy - s * 0.2)], { s: 0.86 });
  const samen = [[-0.45, 0.05], [0.1, -0.05], [0.5, 0.15], [-0.2, 0.45], [0.3, 0.6]]
    .map(([dx, dy]) => flach(oval(r(cx + dx * s), r(cy + dy * s), r(s * 0.07), r(s * 0.11)), heller(BEERE, 0.55)));
  const kelch = form(pfad(`M${r(cx - s * 0.8)} ${r(cy - s * 0.5)} L${r(cx - s * 0.25)} ${r(cy - s * 0.3)} L${cx} ${r(cy - s * 0.15)}`
    + ` L${r(cx + s * 0.25)} ${r(cy - s * 0.3)} L${r(cx + s * 0.8)} ${r(cy - s * 0.5)} Q${cx} ${r(cy - s * 0.95)} ${r(cx - s * 0.8)} ${r(cy - s * 0.5)} Z`),
  KELCH, [r(cx - s * 0.3), r(cy - s * 0.65)], { s: 0.85 });
  const stiel = naht(`M${cx} ${r(cy - s * 0.7)} L${r(cx + s * 0.12)} ${r(cy - s * 1.05)}`, KELCH, 2);
  return zusammen(koerper, ...samen.map((x) => ({ svg: x.svg, kontur: "" })), kelch, stiel);
}

/** Schale mit Erdbeeren als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function erdbeerschaleStueck() {
  const innen = flach(oval(50, 58, 39, 9), dunkler(SCHALE, 0.2));
  const beeren = [
    erdbeere(27, 54, 10), erdbeere(49, 55, 10.5), erdbeere(71, 54, 10),
    erdbeere(38, 44, 10.5), erdbeere(61, 45, 10.5),
    erdbeere(50, 33, 11),
  ];
  const schale = form(pfad("M11 58 Q50 70 89 58 Q87 88 62 92 L38 92 Q13 88 11 58 Z"), SCHALE, [24, 64], { s: 0.9 });
  const band = form(pfad("M12.5 66 Q50 78 87.5 66 L86 72 Q50 84 14 72 Z"), RAND, [24, 68], { s: 0.9, kontur: false });
  const fuss = form(pfad("M36 91 L64 91 L62 96 L38 96 Z"), SCHALE, [40, 92], { s: 0.9 });
  const lippe = naht("M12 58.5 Q50 70.5 88 58.5", SCHALE, 1.6);
  return zusammen(fuss, innen, ...beeren, schale, band, lippe);
}

meldeObjekt("erdbeerschale", {
  zustaende: ["voll"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: erdbeerschaleStueck() }], ursprung: [50, 96] }),
});
