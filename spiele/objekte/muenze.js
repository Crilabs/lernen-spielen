// <ls-objekt art="muenze">: ein kleiner Stapel Münzen (Zehn-Cent-Stücke, goldfarben) mit einer Münze daneben.
// Feld 0…100, leicht von oben gesehen: je Münze ein Oval als Oberseite, darunter die Kante mit feinen Rillen.
// Keine Ziffer, kein Wappen: nur ein Ring und ein Glanz auf der Oberseite.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const GOLD = "#F0CF7A";

/** Eine Münze mit Mitte (cx, cy) der Oberseite und Halbmesser r.
 * @param {number} cx @param {number} cy @param {number} r */
function muenze(cx, cy, r) {
  const ry = r * 0.4;
  const dicke = 5.5;
  const kante = form(pfad(`M${cx - r} ${cy} L${cx - r} ${cy + dicke} Q${cx} ${cy + dicke + ry * 2} ${cx + r} ${cy + dicke} L${cx + r} ${cy} Z`), dunkler(GOLD, 0.2), [cx - r * 0.5, cy + dicke], { s: 0.9 });
  const rillen = naht(`M${cx - r * 0.55} ${cy + dicke + ry * 0.85} L${cx - r * 0.55} ${cy + 2} M${cx - r * 0.1} ${cy + dicke + ry * 0.95} L${cx - r * 0.1} ${cy + 2} M${cx + r * 0.35} ${cy + dicke + ry * 0.85} L${cx + r * 0.35} ${cy + 2}`, GOLD, 1.2);
  const oben = form(oval(cx, cy, r, ry), GOLD, [cx - r * 0.4, cy - ry * 0.3], { s: 0.9 });
  const ring = flach(oval(cx, cy, r * 0.68, ry * 0.68), heller(GOLD, 0.18));
  const glanz = naht(`M${cx - r * 0.45} ${cy - ry * 0.3} Q${cx - r * 0.3} ${cy - ry * 0.55} ${cx} ${cy - ry * 0.55}`, heller(GOLD, 0.5), 1.8);
  return zusammen(kante, rillen, oben, ring, glanz);
}

/** Stapel und Einzelmünze als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function muenzenStueck() {
  const stapel = [72, 66, 60, 54].map((y) => muenze(38, y - 6, 22));
  return zusammen(...stapel, muenze(74, 82, 15));
}

meldeObjekt("muenze", {
  zustaende: ["stapel"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: muenzenStueck() }], ursprung: [50, 90] }),
});
