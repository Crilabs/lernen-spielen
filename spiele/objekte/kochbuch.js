// <ls-objekt art="kochbuch">: ein geschlossenes, dickes Kochbuch, schräg liegend und leicht von oben: auf dem Einband
// ein helles Bildfeld mit einem gezeichneten Kochtopf, links der gerundete Rücken, vorn der Seitenschnitt mit vielen
// Seiten; oben schauen drei schmale Papierzettel in verschiedenen Farben als Lesezeichen heraus. Feld 0…100.
// Kein Text, keine Ziffer: Inhaltsverzeichnis und Seitenzahlen liest man im echten Buch.
// Bild der Karte „Mit echten Dingen“ für dreistellige-zahlen-lesen (Seitenzahl aus dem Inhaltsverzeichnis
// aufschreiben, Zettel als Lesezeichen). Geschlossen, dick und schräg liegend, damit es sich an der Silhouette vom
// aufgeschlagenen `buch` abhebt.
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2), keine Farbe der Lernzeichen.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler, z } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const EINBAND = PALETTEN.wasser[3];
const SEITEN = PALETTEN.werkstatt[0];
const BILDFELD = PALETTEN.savanne[0];
const TOPF = PALETTEN.werkstatt[3];
const ZETTEL = [PALETTEN.nacht[3], PALETTEN.wasser[1], PALETTEN.wiese[2]];
export const LESEZEICHEN = 3;

// Einband oben: A hinten links, B hinten rechts, C vorn rechts, D vorn links; Dicke T nach unten.
const A = [22, 36];
const B = [60, 26];
const C = [88, 68];
const D = [50, 78];
const T = 13;
const U = [B[0] - A[0], B[1] - A[1]];
const V = [D[0] - A[0], D[1] - A[1]];

/** @param {number[]} p @param {number} [dy] */
const P = (p, dy = 0) => `${z(p[0])} ${z(p[1] + dy)}`;
/** Punkt auf dem Einband aus Anteilen (0…1) entlang AB und AD. @param {number} s @param {number} t */
const auf = (s, t) => [A[0] + U[0] * s + V[0] * t, A[1] + U[1] * s + V[1] * t];

/** Ein Lesezeichen, das an der Oberkante (AB) bei Anteil s herausschaut. @param {number} s @param {number} h @param {number} w @param {string} farbe */
function zettel(s, h, w, farbe) {
  const [x, y] = auf(s, 0.06);
  const b = 2;
  const kippe = Math.tan((w * Math.PI) / 180) * h;
  return form(pfad(`M${z(x - b)} ${z(y)} L${z(x - b + kippe)} ${z(y - h)} L${z(x + b + kippe)} ${z(y - h)} L${z(x + b)} ${z(y)} Z`),
    farbe, [x - b + kippe + 0.6, y - h + 1], { s: 0.86 });
}

/** Bild auf dem Einband: helles Feld mit Kochtopf, flach gezeichnet in 0…100 und auf den Einband gelegt. @returns {Stueck} */
function einbandBild() {
  const m = `matrix(${z(U[0] / 100)} ${z(U[1] / 100)} ${z(V[0] / 100)} ${z(V[1] / 100)} ${z(A[0])} ${z(A[1])})`;
  const feld = form(pfad("M18 22 L82 22 L82 72 L18 72 Z"), BILDFELD, [22, 26], { s: 0.92, kontur: false });
  const griffe = naht("M30 46 Q22 46 22 52 M70 46 Q78 46 78 52", TOPF, 3.4);
  const topf = form(pfad("M30 42 L70 42 L68 62 Q68 66 64 66 L36 66 Q32 66 32 62 Z"), TOPF, [34, 44], { s: 0.88, kontur: false });
  const deckel = form(oval(50, 41, 22, 4), heller(TOPF, 0.3), [36, 39], { s: 0.86, kontur: false });
  const knauf = flach(oval(50, 35.5, 4, 2.4), dunkler(TOPF, 0.3));
  const innen = zusammen(feld, griffe, topf, deckel, knauf);
  return { svg: `<g transform="${m}">${innen.svg}</g>`, kontur: "" };
}

/** Das Kochbuch als Stück im Feld 0…100 (Boden bei y 91). @returns {Stueck} */
export function kochbuchStueck() {
  const zettel3 = [zettel(0.26, 15, -30, ZETTEL[0]), zettel(0.5, 20, -24, ZETTEL[1]), zettel(0.76, 13, -18, ZETTEL[2])];
  // Rücken links: gerundet zwischen Einband oben und unten.
  const ruecken = form(pfad(`M${P(A)} L${P(D)} Q${z(D[0] - 4)} ${z(D[1] + T / 2)} ${P(D, T)} L${P(A, T)} Q${z(A[0] - 4)} ${z(A[1] + T / 2)} ${P(A)} Z`),
    dunkler(EINBAND, 0.12), [A[0] - 1, A[1] + 2], { s: 0.9 });
  const buende = naht(`M${z(A[0] + 3.5)} ${z(A[1] + 6)} L${z(D[0] + 3.5)} ${z(D[1] + 6)}`, EINBAND, 1.2);
  // Seitenschnitt vorn: Einbanddeckel oben und unten, dazwischen der helle Seitenblock mit vielen Linien.
  const vorn = form(pfad(`M${P(D)} L${P(C)} L${P(C, T)} L${P(D, T)} Z`), dunkler(EINBAND, 0.06), [D[0] + 2, D[1] + 1], { s: 0.9 });
  const block = flach(pfad(`M${P(D, 2.2)} L${z(C[0] - 1.2)} ${z(C[1] + 2.2)} L${z(C[0] - 1.2)} ${z(C[1] + T - 2.2)} L${P(D, T - 2.2)} Z`), SEITEN);
  let linien = "";
  for (let k = 1; k <= 5; k++) {
    const dy = 2.2 + ((T - 4.4) * k) / 6;
    linien += `M${P(D, dy)} L${z(C[0] - 1.2)} ${z(C[1] + dy)} `;
  }
  const seiten = naht(linien, SEITEN, 0.7);
  const schatten = flach(pfad(`M${P(D, 2.2)} L${z(C[0] - 1.2)} ${z(C[1] + 2.2)} L${z(C[0] - 1.2)} ${z(C[1] + 3.6)} L${P(D, 3.6)} Z`), dunkler(SEITEN, 0.2));
  const deckel = form(pfad(`M${P(A)} L${P(B)} L${P(C)} L${P(D)} Z`), EINBAND, [A[0] + 4, A[1] + 1], { s: 0.94 });
  const kante = naht(`M${z(A[0] + 4)} ${z(A[1] + 1.5)} L${z(D[0] + 4)} ${z(D[1] + 1.5)}`, EINBAND, 1.2);
  return zusammen(...zettel3, ruecken, buende, vorn, block, schatten, seiten, deckel, kante, einbandBild());
}

meldeObjekt("kochbuch", {
  zustaende: ["zettel"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: kochbuchStueck() }], ursprung: [50, 91] }),
});
