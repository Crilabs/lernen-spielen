// <ls-objekt art="buch">: ein aufgeschlagenes Buch, leicht von oben, auf beiden Seiten Wellenlinien statt Text,
// oben schaut ein Lesezeichen aus Papier heraus. Feld 0…100. Keine Schrift, keine Ziffer.
// Bild der Karte „Mit echten Dingen“ für zahl-darstellungen-bis-100 (die Seite finden, Zettel als Lesezeichen).
//
// Farben: Einband Akzent „Dorf und Stadt“, Seiten Papier (Werkstatt hell), Lesezeichen Gelb der „Nacht“.

import { form, flach, naht, pfad, zusammen, dunkler } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const EINBAND = PALETTEN.dorf[3];
const PAPIER = PALETTEN.werkstatt[0];
const ZETTEL = PALETTEN.nacht[3];

/** Wellenlinien einer Seite (statt Schrift), von x0 bis x1, ab y. @param {number} x0 @param {number} x1 @param {number} y */
function zeilen(x0, x1, y) {
  let d = "";
  for (let i = 0; i < 5; i++) {
    const yy = y + i * 7;
    const ende = i === 4 ? x0 + (x1 - x0) * 0.55 : x1;
    d += `M${x0} ${yy} `;
    for (let x = x0; x < ende - 3; x += 6) d += `Q${x + 1.5} ${yy - 1.6} ${x + 3} ${yy} T${x + 6} ${yy} `;
  }
  return naht(d, PAPIER, 1.1);
}

/** Aufgeschlagenes Buch mit Lesezeichen als Stück im Feld 0…100 (Boden bei y 90). @returns {Stueck} */
export function buchStueck() {
  const zettel = form(pfad("M60 14 L70 14 L70 40 L60 40 Z"), ZETTEL, [61, 15], { s: 0.88 });
  const einband = form(pfad("M4 34 Q27 28 50 36 Q73 28 96 34 L96 86 Q73 80 50 90 Q27 80 4 86 Z"), EINBAND, [10, 36], { s: 0.92 });
  const links = form(pfad("M8 30 Q29 24 50 32 L50 84 Q29 76 8 82 Z"), PAPIER, [12, 31], { s: 0.94, kontur: false });
  const rechts = form(pfad("M50 32 Q71 24 92 30 L92 82 Q71 76 50 84 Z"), PAPIER, [54, 30], { s: 0.94, kontur: false });
  const falz = naht("M50 32 L50 84", PAPIER, 1.6);
  const schatten = flach(pfad("M50 32 L53 31.4 L53 83.2 L50 84 Z"), dunkler(PAPIER, 0.18));
  return zusammen(zettel, einband, links, rechts, schatten, falz, zeilen(14, 44, 40), zeilen(57, 86, 40));
}

meldeObjekt("buch", {
  zustaende: ["lesezeichen"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: buchStueck() }], ursprung: [50, 90] }),
});
