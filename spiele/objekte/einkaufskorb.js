// <ls-objekt art="einkaufskorb" zustand="leer|gefuellt">: ein geflochtener Einkaufskorb von vorn, breit und flach,
// mit hohem Henkelbogen (Silhouette, figuren.md §4). Feld 0…200 × 30…150. gefuellt: oben schauen Packungen heraus
// (eine Tüte, ein Karton, eine Schachtel), ohne Schrift und Ziffer. Figur und Wirkung des Spiels M37: Bei jedem
// Stäbchen fällt eine Packung hinein (Anstoß, wirf()), der Korb wackelt satt.

import { form, flach, naht, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const WEIDE = "#D8B07A";
const TUETE = "#E9D2A8";
const KARTON = "#BDB3A3";
const SCHACHTEL = "#9FC7DB";

/** Der Henkel: ein hoher Bogen, hinter dem Korb. */
function henkel() {
  return form(pfad("M42 78 Q44 22 100 20 Q156 22 158 78 L148 78 Q146 32 100 31 Q54 32 52 78 Z"), dunkler(WEIDE, 0.08), [70, 30], { s: 0.92 });
}

/** Der Korb: oben breiter als unten, mit Rand und Flechtmuster. */
function korb() {
  const leib = form(pfad("M20 78 L180 78 L166 140 Q164 146 158 146 L42 146 Q36 146 34 140 Z"), WEIDE, [40, 84], { s: 0.9 });
  const rand = form(pfad("M14 70 L186 70 Q190 70 190 75 L190 82 Q190 86 186 86 L14 86 Q10 86 10 82 L10 75 Q10 70 14 70 Z"), heller(WEIDE, 0.12), [24, 72], { s: 0.9 });
  const flechten = naht("M30 102 L170 102 M34 120 L166 120 M60 88 L64 144 M100 88 L100 146 M140 88 L136 144", WEIDE, 2.4);
  return zusammen(leib, rand, flechten);
}

/** Packungen, die oben herausschauen (nur im Zustand gefuellt). */
function packungen() {
  return zusammen(
    form(pfad("M40 74 L46 44 L76 44 L80 74 Z"), TUETE, [48, 48], { s: 0.9 }),
    flach(pfad("M46 44 L76 44 L74 52 L48 52 Z"), dunkler(TUETE, 0.12)),
    form(pfad("M86 74 L88 50 L130 50 L128 74 Z"), KARTON, [92, 54], { s: 0.9 }),
    form(pfad("M134 74 L138 38 L162 40 L160 74 Z"), SCHACHTEL, [140, 42], { s: 0.9 }),
  );
}

meldeObjekt("einkaufskorb", {
  zustaende: ["leer", "gefuellt"],
  zeichne: () => bild({
    breite: 200,
    hoehe: 130,
    oben: 20,
    ursprung: [100, 146],
    teile: [
      { stueck: henkel() },
      { stueck: packungen(), teil: "inhalt", in: "gefuellt" },
      { stueck: korb() },
    ],
  }),
  bewegung: (von, nach) => (von === "leer" && nach === "gefuellt"
    ? [
      { teil: "inhalt", keyframes: [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "translateY(0)" }], dauer: 450 },
      { teil: "ganz", keyframes: [{ transform: "rotate(0deg)" }, { transform: "rotate(-2deg)" }, { transform: "rotate(1.5deg)" }, { transform: "rotate(0deg)" }], dauer: 500, beginn: 400 },
    ]
    : []),
  anstoss: () => [
    { teil: "ganz", keyframes: [{ transform: "rotate(0deg)" }, { transform: "rotate(-1.6deg)" }, { transform: "rotate(1.2deg)" }, { transform: "rotate(0deg)" }], dauer: 420 },
  ],
  einwurf: [100, 74, 60],
});
