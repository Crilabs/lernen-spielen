// <ls-objekt art="keksblech">: ein flaches Backblech, leicht von oben gesehen, mit runden Keksen in gleich langen
// Reihen (4 Reihen mit je 6, kein Keks übrig). Feld 100 breit, 70 hoch: breit und flach, damit es sich an der Silhouette
// von Eierkarton, Gedeck und Münzen unterscheidet. Keine Schrift, keine Ziffer.

import { form, flach, glanz, pfad, oval, zusammen, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const BLECH = "#AEB4C2";
export const KEKS = "#E8B868";

/** Ein runder Keks, Mitte (cx, cy), Halbmesser r (in der Tiefe flacher). */
function keks(/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ r) {
  const ry = r * 0.62;
  const schatten = flach(oval(cx + 0.6, cy + 1.4, r, ry), dunkler(BLECH, 0.3));
  const teig = form(oval(cx, cy, r, ry), KEKS, [cx - r * 0.35, cy - ry * 0.35], { s: 0.86 });
  const licht = glanz(`M${cx - r * 0.5} ${cy - ry * 0.15} Q${cx - r * 0.4} ${cy - ry * 0.55} ${cx - r * 0.05} ${cy - ry * 0.6}`, KEKS, 1.3);
  return zusammen(schatten, teig, licht);
}

/** Blech mit Keksen als Stück im Feld 0…100 × 0…70. @returns {import("../runde/kinder/stil.js").Stueck} */
export function keksblechStueck() {
  // Rand: hinten schmaler als vorne (Blick leicht von oben).
  const rand = form(pfad("M9 10 L91 10 L99 62 L1 62 Z"), BLECH, [20, 12], { s: 0.94 });
  const lippe = flach(pfad("M1 62 L99 62 L98 66 L2 66 Z"), dunkler(BLECH, 0.3));
  const boden = flach(pfad("M13 14 L87 14 L94 57 L6 57 Z"), dunkler(BLECH, 0.08));
  const kekse = [];
  const reihen = [21, 30.5, 40, 50];
  for (const [i, y] of reihen.entries()) {
    const t = (y - 14) / (57 - 14); // 0 hinten, 1 vorne
    const links = 13 - t * 7 + 6.5;
    const rechts = 87 + t * 7 - 6.5;
    const r = 4.6 + i * 0.5;
    for (let k = 0; k < 6; k++) kekse.push(keks(links + ((rechts - links) * k) / 5, y, r));
  }
  return zusammen(lippe, rand, boden, ...kekse);
}

meldeObjekt("keksblech", {
  zustaende: ["reihen"],
  zeichne: () => bild({ breite: 100, hoehe: 70, teile: [{ stueck: keksblechStueck() }], ursprung: [50, 66] }),
});
