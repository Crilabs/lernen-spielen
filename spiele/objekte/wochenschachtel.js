// <ls-objekt art="wochenschachtel">: eine flache Schachtel mit sieben Fächern nebeneinander, ein Fach für jeden Tag der
// Woche, die Deckel hinten aufgeklappt (wie eine Wochendose). Feld 0…100, leicht von oben gesehen. Keine Schrift,
// keine Ziffer, keine Tagesnamen.
// Packung der Siebenerreihe in M37 Kettenhüpfer („In echt hat eine Woche sieben Tage. Hier hat eine Wochenschachtel
// ein Fach für jeden Tag.“).
//
// Farben nur aus der Welt-Palette „Werkstatt“ (spiele/start/welten.js, grundsaetze-bilder §6.2), keine Farbe der
// Lernzeichen: Schachtel Himmel, Deckel Akzent.

import { form, flach, naht, falte, pfad, zusammen, dunkler } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const [SCHALE, , , DECKEL] = PALETTEN.werkstatt;
export const FAECHER = 7;
const LINKS = 5;
const RECHTS = 95;
const BREITE = (RECHTS - LINKS) / FAECHER;

/** Fach i (0 …): Mitte x. @param {number} i */
const mitte = (i) => LINKS + BREITE * (i + 0.5);

/** Sieben aufgeklappte Deckel hinter der Schachtel, oben die Griffkante (hell), dazwischen schmale Fugen. @returns {Stueck} */
function deckel() {
  const teile = [];
  for (let i = 0; i < FAECHER; i++) {
    const x = mitte(i);
    const h = BREITE / 2 - 0.5;
    teile.push(form(pfad(`M${x - h} 56 L${x - h} 38 Q${x - h} 35.5 ${x - h + 1.5} 35.5 L${x + h - 1.5} 35.5 Q${x + h} 35.5 ${x + h} 38 L${x + h} 56 Z`),
      DECKEL, [x - h + 2, 37.5], { s: 0.86 }));
    teile.push(naht(`M${x - h + 2.2} 40 L${x + h - 2.2} 40`, DECKEL, 1.4));
  }
  const fugen = [];
  for (let i = 1; i < FAECHER; i++) fugen.push(`M${LINKS + BREITE * i} 36.5 L${LINKS + BREITE * i} 55`);
  teile.push(naht(fugen.join(" "), DECKEL, 1.8));
  return zusammen(...teile);
}

/** Schale mit sieben Fächern (Mulden von oben) und Vorderkante. @returns {Stueck} */
function schale() {
  const oben = form(pfad(`M${LINKS} 54 L${RECHTS} 54 L${RECHTS + 2} 74 L${LINKS - 2} 74 Z`), SCHALE, [LINKS + 6, 56], { s: 0.94 });
  const mulden = [];
  for (let i = 0; i < FAECHER; i++) {
    const x = mitte(i);
    const ob = BREITE / 2 - 2.2;
    const un = ob + 0.5;
    mulden.push(flach(pfad(`M${x - ob} 57.5 L${x + ob} 57.5 L${x + un} 71 L${x - un} 71 Z`), dunkler(SCHALE, 0.26)));
    // Rückwand der Mulde im Schatten (Licht von oben links fällt auf die Vorderwand).
    mulden.push(falte(`M${x - ob} 57.5 L${x + ob} 57.5 L${x + ob + 0.1} 61 L${x - ob - 0.1} 61 Z`, SCHALE, 0.42));
  }
  const vorn = form(pfad(`M${LINKS - 2} 74 L${RECHTS + 2} 74 L${RECHTS + 1} 86 Q${RECHTS + 1} 89 ${RECHTS - 2} 89 L${LINKS + 2} 89 Q${LINKS - 1} 89 ${LINKS - 1} 86 Z`),
    dunkler(SCHALE, 0.06), [LINKS + 4, 76], { s: 0.9 });
  const fugen = [];
  for (let i = 1; i < FAECHER; i++) {
    const x = LINKS - 1.5 + ((RECHTS - LINKS + 3) / FAECHER) * i;
    fugen.push(`M${x} 76 L${x} 87`);
  }
  return zusammen(oben, ...mulden, vorn, naht(fugen.join(" "), SCHALE, 1.6));
}

/** Wochenschachtel als Stück im Feld 0…100 (Boden bei y 89). @returns {Stueck} */
export function wochenschachtelStueck() {
  return zusammen(deckel(), schale());
}

meldeObjekt("wochenschachtel", {
  zustaende: ["offen"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: wochenschachtelStueck() }], ursprung: [50, 89] }),
});
