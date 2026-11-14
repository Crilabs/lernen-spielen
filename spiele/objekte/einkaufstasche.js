// <ls-objekt art="einkaufstasche">: eine volle Stofftasche nach dem Einkauf, von vorn. Feld 0…100.
// Hoher Henkelbogen über dem Beutel (Silhouette), oben schauen eine Milchtüte mit Giebel und eine Lauchstange heraus.
// Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const STOFF = "#8FB0CF";
export const TUETE = "#F3EBDD";
export const BAND = "#6F95C2";
export const LAUCH = "#EEF0D8";
export const BLATT = "#7FAE6A";

/** Milchtüte mit Giebel, hinter dem Rand der Tasche. */
function milchtuete() {
  const koerper = form(pfad("M27 30 L47 30 L47 56 L27 56 Z"), TUETE, [30, 32], { s: 0.9 });
  const giebel = form(pfad("M27 30 L37 20 L47 30 Z"), heller(TUETE, 0.2), [33, 25], { s: 0.9 });
  const falz = form(pfad("M34 20 L40 20 L40 17 L34 17 Z"), dunkler(TUETE, 0.08), [35, 18], { s: 0.9 });
  const band = flach(pfad("M27 38 L47 38 L47 44 L27 44 Z"), BAND);
  return zusammen(falz, giebel, koerper, band);
}

/** Lauchstange, schräg nach rechts oben, mit drei Blättern. */
function lauch() {
  const schaft = form(pfad("M58 56 L66 56 L77 24 L70 21 Z"), LAUCH, [61, 50], { s: 0.9 });
  const blattA = form(pfad("M70 21 Q66 10 61 4 Q71 9 76 23 Z"), BLATT, [66, 10], { s: 0.9 });
  const blattB = form(pfad("M72 22 Q76 9 74 2 Q81 10 77 24 Z"), dunkler(BLATT, 0.08), [75, 8], { s: 0.9 });
  const blattC = form(pfad("M74 23 Q84 14 92 12 Q86 20 77 25 Z"), heller(BLATT, 0.1), [80, 17], { s: 0.9 });
  const ader = naht("M62 54 L72 25", LAUCH, 1.4);
  return zusammen(blattA, blattB, blattC, schaft, ader);
}

/** Volle Einkaufstasche als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function einkaufstascheStueck() {
  const henkelHinten = form(pfad("M36 50 C34 4 76 4 74 50 L69 50 C70 13 40 13 41 50 Z"), dunkler(STOFF, 0.18), [42, 12], { s: 0.9 });
  const beutel = form(pfad("M20 46 L80 46 L83 94 L17 94 Z"), STOFF, [26, 52], { s: 0.9, glanz: true });
  const saum = flach(pfad("M20 46 L80 46 L80.4 51 L19.6 51 Z"), dunkler(STOFF, 0.12));
  const henkelVorne = form(pfad("M27 58 C25 6 69 6 67 58 L62 58 C63 15 32 15 32 58 Z"), heller(STOFF, 0.08), [33, 16], { s: 0.9 });
  const steppL = flach(pfad("M27 52 L32 52 L32 62 L27 62 Z"), dunkler(STOFF, 0.1));
  const steppR = flach(pfad("M62 52 L67 52 L67 62 L62 62 Z"), dunkler(STOFF, 0.1));
  return zusammen(henkelHinten, milchtuete(), lauch(), beutel, saum, steppL, steppR, henkelVorne);
}

meldeObjekt("einkaufstasche", {
  zustaende: ["voll"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: einkaufstascheStueck() }], ursprung: [50, 94] }),
});
