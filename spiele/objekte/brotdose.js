// <ls-objekt art="brotdose">: eine offene Brotdose aus Kunststoff mit runden Ecken, der Deckel hinten aufgeklappt,
// darin ein Häufchen Weintrauben. Feld 0…100, leicht von oben. Keine Schrift, keine Ziffer.
// Bild der Karte „Mit echten Dingen“ für minus-zehner (zehn Trauben kommen in die Dose, der Rest bleibt).
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2): Dose Akzent „Wasser und Strand“,
// Trauben Grün der „Wiese“.

import { form, flach, naht, oval, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const DOSE = PALETTEN.wasser[1];
const TRAUBE = PALETTEN.wiese[2];

/** Eine Traube, Mitte (cx, cy). @param {number} cx @param {number} cy */
function traube(cx, cy) {
  return zusammen(
    form(oval(cx, cy, 6, 6.6), TRAUBE, [cx - 2, cy - 3], { s: 0.86, kontur: false, trenn: true }),
    naht(`M${cx - 2.6} ${cy - 3} Q${cx - 1.8} ${cy - 4.6} ${cx} ${cy - 4.8}`, heller(TRAUBE, 0.6), 1.2),
  );
}

/** Brotdose mit Trauben als Stück im Feld 0…100 (Boden bei y 94). @returns {Stueck} */
export function brotdoseStueck() {
  const deckel = form(pfad("M14 12 Q14 8 18 8 L82 8 Q86 8 86 12 L88 40 L12 40 Z"), dunkler(DOSE, 0.08), [20, 11], { s: 0.92 });
  const clip = form(pfad("M44 6 L56 6 L56 12 L44 12 Z"), heller(DOSE, 0.3), [45, 7], { s: 0.9 });
  const innen = flach(pfad("M12 40 L88 40 L90 76 L10 76 Z"), dunkler(DOSE, 0.5));
  const trauben = [];
  // Zehn Trauben als Häufchen, nicht im Raster (Sachbild, kein Zählmaterial).
  for (const [cx, cy] of [[26, 66], [38, 68], [32, 57], [44, 58], [50, 68], [62, 66], [56, 56], [68, 57], [74, 67], [50, 48]]) trauben.push(traube(cx, cy));
  const wand = zusammen(
    form(pfad("M10 70 L90 70 L92 86 Q92 94 84 94 L16 94 Q8 94 8 86 Z"), DOSE, [14, 72], { s: 0.92 }),
    flach(pfad("M10 70 L90 70 L90.3 74 L9.7 74 Z"), heller(DOSE, 0.3)),
  );
  const rand = form(pfad("M10 40 L90 40 L90.5 44 L9.5 44 Z"), heller(DOSE, 0.2), [12, 40], { s: 0.9 });
  const seiten = zusammen(
    form(pfad("M9.5 44 L14 44 L13 72 L9 72 Z"), DOSE, [10, 45], { s: 0.9 }),
    form(pfad("M86 44 L90.5 44 L91 72 L87 72 Z"), DOSE, [87, 45], { s: 0.9 }),
  );
  return zusammen(deckel, clip, innen, ...trauben, rand, seiten, wand);
}

meldeObjekt("brotdose", {
  zustaende: ["gepackt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: brotdoseStueck() }], ursprung: [50, 94] }),
});
