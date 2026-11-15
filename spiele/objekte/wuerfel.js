// <ls-objekt art="wuerfel">: ein Spielwürfel, der auf dem Tisch liegt, schräg von oben gesehen (drei Seiten sichtbar).
// Feld 0…100. Licht von oben links: die Oberseite am hellsten, links mittel, rechts im Schatten.
// Augen als dunkle Punkte, flach in der Ebene ihrer Seite (oben fünf, links drei, rechts eins; keine Gegenseiten).
// Keine Ziffer, keine Schrift.

import { form, glanz, pfad, zusammen, dunkler, INK, z } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const WUERFEL = "#FBF5EA";

/** @typedef {[number, number]} Punkt */

/** Ecken des Würfels: oben (T), rechts (R), vorne (B), links (L), unten links/vorne/rechts. */
const T = /** @type {Punkt} */ ([50, 10]);
const R = /** @type {Punkt} */ ([88, 30]);
const B = /** @type {Punkt} */ ([50, 50]);
const L = /** @type {Punkt} */ ([12, 30]);
const L2 = /** @type {Punkt} */ ([12, 72]);
const B2 = /** @type {Punkt} */ ([50, 92]);
const R2 = /** @type {Punkt} */ ([88, 72]);

const p = (/** @type {Punkt} */ q) => `${z(q[0])} ${z(q[1])}`;
const viereck = (/** @type {Punkt[]} */ e) => pfad(`M${e.map(p).join(" L")} Z`);

/**
 * Augen auf einer Seite: Ursprung o, Kanten u und v (Einheitsquadrat), Augen als Punkte im Quadrat.
 * @param {Punkt} o @param {Punkt} u @param {Punkt} v @param {Punkt[]} punkte
 * @returns {import("../runde/kinder/stil.js").Stueck}
 */
function augen(o, u, v, punkte) {
  const m = `matrix(${[u[0], u[1], v[0], v[1], o[0], o[1]].map(z).join(" ")})`;
  const kreise = punkte.map(([a, b]) => `<circle cx="${a}" cy="${b}" r="0.095" fill="${INK}" stroke="none" transform="${m}"/>`);
  return { svg: kreise.join(""), kontur: "" };
}

const minus = (/** @type {Punkt} */ a, /** @type {Punkt} */ b) => /** @type {Punkt} */ ([a[0] - b[0], a[1] - b[1]]);

/** Der Würfel als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function wuerfelStueck() {
  const oben = form(viereck([T, R, B, L]), WUERFEL, [38, 24], { s: 0.92, kontur: false });
  const links = form(viereck([L, B, B2, L2]), dunkler(WUERFEL, 0.1), [18, 40], { s: 0.92, kontur: false });
  const rechts = form(viereck([B, R, R2, B2]), dunkler(WUERFEL, 0.24), [56, 58], { s: 0.92, kontur: false });
  const umriss = { svg: "", kontur: `<${viereck([T, R, R2, B2, L2, L])}/>` };
  const fuenf = augen(T, minus(R, T), minus(L, T), [[0.24, 0.24], [0.76, 0.24], [0.5, 0.5], [0.24, 0.76], [0.76, 0.76]]);
  const drei = augen(L, minus(B, L), minus(L2, L), [[0.24, 0.24], [0.5, 0.5], [0.76, 0.76]]);
  const eins = augen(B, minus(R, B), minus(B2, B), [[0.5, 0.5]]);
  const kante = glanz(`M${p([16, 31])} L${p([48, 47])}`, WUERFEL, 2);
  return zusammen(umriss, oben, links, rechts, kante, fuenf, drei, eins);
}

meldeObjekt("wuerfel", {
  zustaende: ["liegt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: wuerfelStueck() }], ursprung: [50, 92] }),
});
