// <ls-objekt art="tischkaertchen">: ein gefaltetes Tischkärtchen, das wie ein kleines Dach steht, schräg von vorn
// gesehen (Vorderseite, rechts die schmale Seite des Knicks), davor liegt ein Buntstift. Auf der Vorderseite eine
// Wellenlinie, deren erster Bogen höher ist, als Zeichen „hier steht ein Name“ – keine Buchstaben, keine Ziffer. Feld 0…100.

import { form, flach, naht, falte, pfad, zusammen, dunkler, heller } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const KARTE = "#FFFCF7";
export const STIFT = "#8FD3EE";
export const HOLZ = "#F3D9B1";
export const RADIERER = "#F59A86";
export const MINE = "#4F8FB3";

/** Das stehende Kärtchen: Rückseite (schmaler Streifen rechts), Vorderseite, Knick oben, Wellenlinie. */
function kaertchen() {
  const hinten = form(pfad("M80 26 L92 74 L76 80 Z"), dunkler(KARTE, 0.12), [82, 36], { s: 0.9 });
  const vorn = form(pfad("M22 26 L80 26 L76 80 L10 80 Z"), KARTE, [24, 32], { s: 0.92, glanz: true });
  const knick = naht("M22 26 L80 26", KARTE, 2.4);
  const schatten = falte("M76 80 L80 26 L82.5 36 L79 80 Z", KARTE, 0.2);
  const name = naht("M24 60 Q27 38 31 60 Q34 52 37 60 T43 60 T49 60 T55 60 T61 60", MINE, 3);
  return zusammen(hinten, vorn, schatten, knick, name);
}

/** Der Buntstift liegt quer vor dem Kärtchen, Spitze nach rechts. */
function stift() {
  const radierer = form(pfad("M22 84 L30 84 L30 92 L22 92 Q20 88 22 84 Z"), RADIERER, [23, 85], { s: 0.9 });
  const zwinge = flach(pfad("M29 84 L33 84 L33 92 L29 92 Z"), "#C9CCD6");
  const schaft = form(pfad("M33 84 L74 84 L74 92 L33 92 Z"), STIFT, [36, 85], { s: 0.9 });
  const holz = form(pfad("M74 84 L86 87.2 L86 88.8 L74 92 Z"), HOLZ, [76, 86], { s: 0.9 });
  const mine = flach(pfad("M84 86.7 L90 88 L84 89.3 Z"), MINE);
  const licht = flach(pfad("M34 84.8 L73 84.8 L73 85.8 L34 85.8 Z"), heller(STIFT, 0.4));
  return zusammen(radierer, zwinge, schaft, licht, holz, mine);
}

/** Kärtchen und Stift als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function tischkaertchenStueck() {
  return zusammen(kaertchen(), stift());
}

meldeObjekt("tischkaertchen", {
  zustaende: ["beschrieben"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: tischkaertchenStueck() }], ursprung: [50, 90] }),
});
