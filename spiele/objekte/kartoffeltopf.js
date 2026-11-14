// <ls-objekt art="kartoffeltopf">: ein Kochtopf voller Kartoffeln, bevor für alle aufgetan wird. Feld 0…100, leicht
// von oben gesehen: gerade Wand aus Emaille (Koralle) mit hellem Rand, links und rechts je ein Griff, oben ein Berg
// Kartoffeln (Schale mit dunklen Augen). Keine Schrift, keine Ziffer, kein Herd, kein Dampf.

import { form, flach, naht, glanz, pfad, oval, zusammen, heller, dunkler, z } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const TOPF = "#F2876B";
export const RAND = "#FFF3E6";
export const KARTOFFEL = "#E3B567";

/** Eine Kartoffel als knubbelige Form: Mitte (cx, cy), Halbachsen rx, ry, Neigung w Grad, Beulen je Punkt. */
function kartoffel(/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ rx, /** @type {number} */ ry, /** @type {number} */ w, /** @type {number[]} */ beulen) {
  const r = (w * Math.PI) / 180;
  const n = beulen.length;
  const punkte = beulen.map((b, i) => {
    const t = (i / n) * 2 * Math.PI;
    const x = Math.cos(t) * rx * b;
    const y = Math.sin(t) * ry * b;
    return [cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r)];
  });
  // Weich durch die Mitten der Kanten, die Punkte als Kontrollpunkte.
  const mitte = (/** @type {number[]} */ a, /** @type {number[]} */ b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mitte(punkte[n - 1], punkte[0]);
  let d = `M${z(m0[0])} ${z(m0[1])}`;
  for (let i = 0; i < n; i++) {
    const p = punkte[i];
    const m = mitte(p, punkte[(i + 1) % n]);
    d += ` Q${z(p[0])} ${z(p[1])} ${z(m[0])} ${z(m[1])}`;
  }
  d += " Z";
  const koerper = form(pfad(d), KARTOFFEL, [cx - rx * 0.35, cy - ry * 0.35], { s: 0.86 });
  const augen = [[0.45, -0.1], [-0.4, 0.3]].map(([ax, ay]) => {
    const x = ax * rx;
    const y = ay * ry;
    return flach(oval(cx + x * Math.cos(r) - y * Math.sin(r), cy + x * Math.sin(r) + y * Math.cos(r), 1.3, 0.6), dunkler(KARTOFFEL, 0.4));
  });
  return zusammen(koerper, ...augen.map((a) => ({ svg: a.svg, kontur: "" })));
}

/** Topf mit Kartoffeln als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function kartoffeltopfStueck() {
  const griff = (/** @type {number} */ s) => {
    const x = (/** @type {number} */ v) => z(50 + s * v);
    return form(pfad(`M${x(33)} 47 L${x(45)} 45 Q${x(50)} 45 ${x(49)} 50 Q${x(48)} 55 ${x(43)} 55 L${x(33)} 55 Z`), dunkler(TOPF, 0.08), [50 + s * 38, 47], { s: 0.86 });
  };
  const kante = form(oval(50, 40, 38, 10), RAND, [40, 36], { s: 0.92 });
  const innen = flach(oval(50, 40.6, 34.5, 7.8), dunkler(TOPF, 0.4));
  const berg = [
    kartoffel(27, 35, 11, 6, -22, [1, 1.1, 0.9, 1.12, 1, 0.86, 1.08, 0.94]),
    kartoffel(73, 35, 11.5, 6.2, 24, [1.08, 0.9, 1.1, 0.95, 1.12, 0.88, 1, 1.05]),
    kartoffel(41, 28, 12, 6.8, 14, [1.1, 0.95, 0.88, 1.1, 1, 1.12, 0.9, 0.98]),
    kartoffel(60, 27, 11.5, 6.5, -18, [0.92, 1.1, 1, 0.88, 1.1, 0.96, 0.9, 1.12]),
    kartoffel(50, 18, 11, 6.2, 6, [0.9, 1.08, 1, 1.12, 0.88, 1, 1.1, 0.95]),
    kartoffel(38, 41, 11, 5.2, -8, [1.06, 0.92, 1.1, 1, 0.88, 1.08, 0.96, 1.02]),
    kartoffel(62, 41, 11, 5.2, 10, [1.1, 1, 0.9, 1.08, 1, 0.9, 1.06, 0.95]),
  ];
  const wand = form(pfad("M13 41 Q50 56 87 41 L84 82 Q50 92 16 82 Z"), TOPF, [22, 50], { s: 0.9, glanz: true });
  const lippe = form(pfad("M12 39 Q50 53 88 39 L88 43 Q50 58 12 43 Z"), RAND, [20, 41], { s: 0.9, kontur: false });
  const boden = naht("M18 76 Q50 85 82 76", TOPF, 2);
  const licht = glanz("M21 50 L22 72", TOPF, 3);
  return zusammen(griff(-1), griff(1), kante, innen, ...berg, wand, lippe, boden, licht);
}

meldeObjekt("kartoffeltopf", {
  zustaende: ["voll"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: kartoffeltopfStueck() }], ursprung: [50, 90] }),
});
