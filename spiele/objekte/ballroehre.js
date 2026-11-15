// <ls-objekt art="ballroehre">: eine durchsichtige Röhre mit drei Bällen übereinander, oben ein Deckel, unten ein
// Boden (wie eine Röhre mit Tennisbällen). Feld 0…100, von vorn. Keine Schrift, keine Ziffer.
// Packung der Dreierreihe in M37 Kettenhüpfer (Setzung des Spiels: „Hier kommen in eine Ballröhre drei Bälle.“).
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2), keine Farbe der Lernzeichen:
// Röhre Himmel der Palette „Wasser“ (durchsichtig hell), Deckel und Boden ihr Schatten, Bälle das helle Gelb der
// Palette „Nacht“ (weicher als Perle 4).

import { form, naht, pfad, oval, zusammen, heller } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const [GLAS, , , , DECKEL] = PALETTEN.wasser;
const BALL = PALETTEN.nacht[3];

/** Ein Ball mit Naht, Mitte (cx, cy), liegt in der Röhre (trägt nicht zur Silhouette bei). @param {number} cx @param {number} cy */
function ball(cx, cy) {
  const r = 12.5;
  return zusammen(
    form(oval(cx, cy, r, r), BALL, [cx - 4, cy - 5], { s: 0.86, kontur: false, trenn: true }),
    naht(`M${cx - r + 2} ${cy - 5} Q${cx} ${cy + 2} ${cx + r - 2} ${cy - 5}`, BALL, 1.8),
  );
}

/** Röhre mit drei Bällen als Stück im Feld 0…100 (Boden bei y 94). @returns {Stueck} */
export function ballroehreStueck() {
  const roehre = form(pfad("M36 16 L64 16 L64 88 L36 88 Z"), GLAS, [40, 20], { s: 0.92 });
  const baelle = zusammen(ball(50, 29), ball(50, 52), ball(50, 75));
  // Glanzstreifen auf der Vorderseite des Glases, vor den Bällen.
  const glanz = { svg: `<path d="M40.5 21 L43 21 L43 83 L40.5 83 Z" fill="${heller(GLAS, 0.75)}" stroke="none" opacity="0.85"/>`, kontur: "" };
  const deckel = zusammen(
    form(pfad("M33 8 Q33 5 36 5 L64 5 Q67 5 67 8 L67 17 Q67 19 65 19 L35 19 Q33 19 33 17 Z"), DECKEL, [37, 7], { s: 0.9 }),
    naht("M34 14 L66 14", DECKEL, 1.8),
  );
  const boden = form(pfad("M34 86 L66 86 L66 92 Q66 95 63 95 L37 95 Q34 95 34 92 Z"), DECKEL, [37, 87], { s: 0.86 });
  return zusammen(roehre, baelle, glanz, boden, deckel);
}

meldeObjekt("ballroehre", {
  zustaende: ["zu"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: ballroehreStueck() }], ursprung: [50, 95] }),
});
