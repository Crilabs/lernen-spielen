// <ls-objekt art="erdbeerschale">: eine Schüssel voller Erdbeeren, bevor sie geteilt werden. Feld 0…100, leicht von
// oben gesehen: hinten der Rand der Öffnung, darin ein Berg Erdbeeren (Spitze nach unten, grünes Blattwerk oben), vorne
// die Wand der Schüssel mit einem blauen Band. Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler, z } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const SCHUESSEL = "#FFFCF7";
export const BAND = "#7FB6E8";
export const ERDBEERE = "#E8594F";
export const BLATT = "#6DBE7B";
export const KERN = "#F6D77A";

/** Dreht den Punkt (x, y) um (cx, cy) um w Grad. */
function dreh(/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ w) {
  const r = (w * Math.PI) / 180;
  const dx = x - cx;
  const dy = y - cy;
  return `${z(cx + dx * Math.cos(r) - dy * Math.sin(r))} ${z(cy + dx * Math.sin(r) + dy * Math.cos(r))}`;
}

/** Eine Erdbeere: (cx, cy) Mitte der Oberkante, Breite b, Höhe h, Neigung w Grad. */
function erdbeere(/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ b, /** @type {number} */ h, /** @type {number} */ w) {
  const p = (/** @type {number} */ x, /** @type {number} */ y) => dreh(cx + x, cy + y, cx, cy, w);
  const r = b / 2;
  const koerper = form(
    pfad(`M${p(-r, 0)} Q${p(0, -h * 0.22)} ${p(r, 0)} C${p(r, h * 0.55)} ${p(b * 0.16, h)} ${p(0, h)} C${p(-b * 0.16, h)} ${p(-r, h * 0.55)} ${p(-r, 0)} Z`),
    ERDBEERE,
    [cx - r * 0.4, cy + h * 0.25],
    { s: 0.9 },
  );
  const kerne = [
    [-r * 0.45, h * 0.25], [r * 0.1, h * 0.2], [r * 0.55, h * 0.3], [-r * 0.15, h * 0.5], [r * 0.3, h * 0.6], [-r * 0.05, h * 0.78],
  ].map(([x, y]) => {
    const [kx, ky] = p(x, y).split(" ").map(Number);
    return flach(oval(kx, ky, 0.9, 1.3), KERN);
  });
  const blatt = form(
    pfad(`M${p(-r * 0.9, -h * 0.02)} Q${p(-r * 0.5, -h * 0.2)} ${p(-r * 0.25, -h * 0.08)} Q${p(0, -h * 0.32)} ${p(r * 0.25, -h * 0.08)} Q${p(r * 0.5, -h * 0.2)} ${p(r * 0.9, -h * 0.02)} Q${p(r * 0.4, h * 0.14)} ${p(0, h * 0.06)} Q${p(-r * 0.4, h * 0.14)} ${p(-r * 0.9, -h * 0.02)} Z`),
    BLATT,
    [cx - r * 0.3, cy - h * 0.1],
    { s: 0.9 },
  );
  const stiel = form(pfad(`M${p(-0.9, -h * 0.12)} L${p(0.9, -h * 0.12)} L${p(1.2, -h * 0.3)} L${p(-0.4, -h * 0.32)} Z`), dunkler(BLATT, 0.15), [cx, cy - h * 0.2], { s: 0.9 });
  return zusammen(koerper, ...kerne, blatt, stiel);
}

/** Schüssel mit Erdbeeren als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function erdbeerschaleStueck() {
  const oeffnung = form(oval(50, 52, 39, 10), dunkler(SCHUESSEL, 0.1), [40, 49], { s: 0.9 });
  const berg = [
    erdbeere(32, 38, 17, 21, -18),
    erdbeere(66, 36, 17, 21, 16),
    erdbeere(49, 26, 18, 22, 4),
    erdbeere(24, 48, 15, 18, -30),
    erdbeere(76, 47, 15, 18, 28),
    erdbeere(41, 43, 17, 20, -6),
    erdbeere(59, 44, 17, 20, 10),
  ];
  const wand = form(pfad("M11 52 Q50 64 89 52 Q87 78 66 86 L34 86 Q13 78 11 52 Z"), SCHUESSEL, [32, 62], { s: 0.9 });
  const band = naht("M16 64 Q50 75 84 64", heller(BAND, 0.1), 2.2);
  const fuss = form(pfad("M36 85 L64 85 L62 91 Q50 93 38 91 Z"), dunkler(SCHUESSEL, 0.08), [44, 87], { s: 0.9 });
  return zusammen(oeffnung, ...berg, fuss, wand, band);
}

meldeObjekt("erdbeerschale", {
  zustaende: ["voll"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: erdbeerschaleStueck() }], ursprung: [50, 92] }),
});
