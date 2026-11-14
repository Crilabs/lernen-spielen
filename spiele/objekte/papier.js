// <ls-objekt art="papier">: ein zerknülltes Blatt Heftpapier (gehört in die blaue Papiertonne).
// Feld 0…100, das Knäuel sitzt mittig. Linien des Hefts in Wasserblau als Erkennungszeichen; Knicke als
// Schattenformen und feine Linien im dunklen Ton der Fläche (figuren.md §4).

import { form, falte, naht, pfad, zusammen, zacken } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const PAPIER = "#F4EEE1";
const LINIE = "#8FD3EE";

/** Das Knäuel als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function papierStueck() {
  // Umriss: abwechselnd Ecken und Kerben, leicht gewölbt – zerknittert, aber rund.
  const radien = [31, 26, 33, 27, 30, 25, 32, 28, 31, 25, 33, 26, 30, 27, 32, 25];
  /** @type {[number, number][]} */
  const punkte = radien.map((r, i) => {
    const a = (i / radien.length) * Math.PI * 2 - Math.PI / 2;
    return [50 + Math.cos(a) * r, 54 + Math.sin(a) * r * 0.92];
  });
  const umriss = form(pfad(zacken(punkte, -0.12)), PAPIER, [40, 40], { s: 0.86 });
  const knicke = zusammen(
    falte(`M48 32 L58 44 L46 50 Z`, PAPIER, 0.2),
    falte(`M66 48 L74 60 L60 63 Z`, PAPIER, 0.26),
    falte(`M32 58 L46 64 L38 74 Z`, PAPIER, 0.22),
    naht(`M58 44 L66 48 M46 50 L46 64 M60 63 L56 76`, PAPIER, 1.8),
  );
  const linien = { svg: [
    `M27 46 Q36 42 44 45`, `M54 34 Q62 33 70 38`, `M24 64 Q30 62 34 64`, `M56 54 Q66 52 76 54`, `M44 74 Q52 76 62 72`,
  ].map((d) => `<path d="${d}" fill="none" stroke="${LINIE}" stroke-width="2"/>`).join(""), kontur: "" };
  return zusammen(umriss, linien, knicke);
}

meldeObjekt("papier", {
  zustaende: ["liegt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: papierStueck() }], ursprung: [50, 84] }),
});
