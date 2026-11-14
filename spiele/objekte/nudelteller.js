// <ls-objekt art="nudelteller">: zwei flache Teller nebeneinander, leicht von oben gesehen, mit Nudeln (Penne)
// verteilt: links drei, rechts vier (eine Zahl in zwei Teilen). Feld 0…100. Keine Schrift, keine Ziffer.

import { form, flach, naht, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const TELLER = "#FFFCF7";
export const RAND = "#7FB6E8";
export const NUDEL = "#F2C766";

/** Ein flacher Teller, Mitte (cx, cy). */
function teller(/** @type {number} */ cx, /** @type {number} */ cy) {
  const platte = form(oval(cx, cy, 22, 19), TELLER, [cx - 8, cy - 7], { s: 0.9 });
  const ring = flach(oval(cx, cy - 0.5, 16.5, 14), heller(RAND, 0.45));
  const mulde = flach(oval(cx, cy - 0.5, 14, 12), TELLER);
  return zusammen(platte, ring, mulde);
}

/** Eine Penne von a nach b: Röhre mit schräg geschnittenen Enden, Rillen der Länge nach, Öffnung am Ende b. */
function nudel(/** @type {[number, number]} */ a, /** @type {[number, number]} */ b) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const u = [dx / l, dy / l];
  const n = [-u[1], u[0]];
  const r = 2.9;
  const k = 1.5; // Schräge des Schnitts
  /** @param {number[]} p @param {number} sn @param {number} su */
  const P = (p, sn, su) => `${(p[0] + n[0] * sn + u[0] * su).toFixed(2)} ${(p[1] + n[1] * sn + u[1] * su).toFixed(2)}`;
  const roehre = form(`path d="M${P(a, r, k)} L${P(b, r, k)} L${P(b, -r, -k)} L${P(a, -r, -k)} Z"`, NUDEL, [a[0] + n[0] * 1.5, a[1] + n[1] * 1.5], { s: 0.84 });
  const rillen = naht(`M${P(a, 1, 1.9)} L${P(b, 1, 1.1)} M${P(a, -1, -0.1)} L${P(b, -1, -0.9)}`, NUDEL, 0.9);
  const loch = flach(`path d="M${P(b, 1.9, 0.9)} Q${P(b, 0, -1.1)} ${P(b, -1.9, -0.9)} Q${P(b, 0, 1.3)} ${P(b, 1.9, 0.9)} Z"`, dunkler(NUDEL, 0.45));
  return zusammen(roehre, rillen, loch);
}

const LINKS = [[[12, 50], [26, 46]], [[22, 58], [36, 56]], [[13, 64], [26, 67]]];
const RECHTS = [[[61, 47], [74, 44]], [[80, 46], [88, 57]], [[61, 59], [74, 62]], [[72, 67], [85, 64]]];

/** Beide Teller mit Nudeln als Teile im Feld 0…100. */
function teile() {
  const nudeln = [...LINKS, ...RECHTS].map(([a, b]) => nudel(/** @type {[number, number]} */ (a), /** @type {[number, number]} */ (b)));
  return [
    { stueck: zusammen(teller(25, 55), teller(75, 55)) },
    { stueck: zusammen(...nudeln) },
  ];
}

meldeObjekt("nudelteller", {
  zustaende: ["verteilt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: teile(), ursprung: [50, 73] }),
});
