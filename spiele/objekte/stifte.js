// <ls-objekt art="stifte">: fünf Buntstifte, mit einem Gummiband zu einem Bündel zusammengefasst (Fächer, Spitzen oben).
// Feld 0…100. Jeder Stift ein langes Sechseck-Stück mit Holzspitze und Mine; die Bänder sind Nähte (figuren.md §4).
// Keine Schrift, keine Ziffer: nur Farben.

import { form, flach, naht, pfad, zusammen, heller } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const STIFT_FARBEN = ["#F59A86", "#F0CF7A", "#8FD3B2", "#7FB6E8", "#C9A8E8"];
const HOLZ = "#F2D7B0";

/**
 * Ein Stift als Stück: Fuß bei (fx, fy), um `grad` aus der Senkrechten geneigt, Länge l, Breite b.
 * @param {number} fx @param {number} fy @param {number} grad @param {number} l @param {number} b @param {string} farbe
 */
function stift(fx, fy, grad, l, b, farbe) {
  const w = (grad * Math.PI) / 180;
  const p = (/** @type {number} */ a, /** @type {number} */ h) => {
    const x = fx + a * Math.cos(w) + h * Math.sin(w);
    const y = fy + a * Math.sin(w) - h * Math.cos(w);
    return `${x.toFixed(1)} ${y.toFixed(1)}`;
  };
  const k = l * 0.78;
  const hb = b / 2;
  const schaft = form(pfad(`M${p(-hb, 0)} L${p(hb, 0)} L${p(hb, k)} L${p(-hb, k)} Z`), farbe, [fx, fy - l * 0.5], { s: 0.9 });
  const holz = form(pfad(`M${p(-hb, k)} L${p(hb, k)} L${p(hb * 0.28, l)} L${p(-hb * 0.28, l)} Z`), HOLZ, [fx, fy - l * 0.9], { s: 0.9 });
  const mine = flach(pfad(`M${p(-hb * 0.28, l - 0.2)} L${p(hb * 0.28, l - 0.2)} L${p(0, l + 4)} Z`), "#7A5C9E");
  const glanz = naht(`M${p(-hb * 0.45, 4)} L${p(-hb * 0.45, k - 3)}`, heller(farbe, 0.45), 1.6);
  return zusammen(schaft, holz, mine, glanz);
}

/** Das Bündel als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function stifteStueck() {
  const winkel = [-24, -12, 0, 12, 24];
  const laenge = [58, 64, 68, 64, 58];
  const stifte = winkel.map((g, i) => stift(50 + g * 0.45, 92, g, laenge[i], 11, STIFT_FARBEN[i]));
  const band = naht("M36 62 Q50 67 64 62 M35 69 Q50 74 65 69", "#E35D4F", 3.4);
  return zusammen(...stifte, band);
}

meldeObjekt("stifte", {
  zustaende: ["buendel"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: stifteStueck() }], ursprung: [50, 92] }),
});
