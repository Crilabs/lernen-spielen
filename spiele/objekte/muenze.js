// <ls-objekt art="muenze" zustand="stapel|zehn-cent">
//   stapel     ein kleiner Stapel Münzen (Zehn-Cent-Stücke, goldfarben) mit einer Münze daneben. Feld 0…100, leicht
//              von oben gesehen: je Münze ein Oval als Oberseite, darunter die Kante mit feinen Rillen. Keine Ziffer,
//              kein Wappen: nur ein Ring und ein Glanz auf der Oberseite.
//   zehn-cent  eine einzelne Zehn-Cent-Münze, fast von vorn, mit der Prägung „10“ wie die echte Münze (Wertseite;
//              einziges Objekt mit Ziffer, weil die Zahl zur echten Münze gehört; Packung der Zehnerreihe in M37,
//              „In echt ist eine Zehn-Cent-Münze zehn Cent wert.“). Farbe aus der Welt-Palette „Savanne“ (weicher als
//              das Gold der Perle 10), Rand mit Rillen, keine Karte, keine Sterne.
// Kein Wechsel zwischen den Zuständen im Spiel (beide sind eigene Bilder; ein Wechsel blendet nur um).

import { form, flach, naht, glanz, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
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

/** Gold der Zehn-Cent-Münze (Welt-Palette „Savanne“, Ferne). */
const NORDISCH = PALETTEN.savanne[1];

/**
 * Eine Zehn-Cent-Münze fast von vorn (leicht gekippt: die Kante unten sichtbar), Prägung „10“ als Text im dunklen Ton
 * der Münze. Feld 0…100, Mitte (50, 48). @returns {import("../runde/kinder/stil.js").Stueck}
 */
export function zehnCentStueck() {
  const r = 40;
  const ry = 36;
  const cy = 48;
  const dicke = 7;
  const kante = form(pfad(`M${50 - r} ${cy} L${50 - r} ${cy + dicke} A${r} ${ry} 0 0 0 ${50 + r} ${cy + dicke} L${50 + r} ${cy} Z`),
    dunkler(NORDISCH, 0.18), [50 - r * 0.6, cy + dicke], { s: 0.92 });
  const rillen = [];
  for (let i = -6; i <= 6; i++) {
    const x = 50 + i * 5.6;
    const y = cy + Math.sqrt(Math.max(0, 1 - ((x - 50) / r) ** 2)) * ry;
    rillen.push(`M${x.toFixed(1)} ${(y + 1).toFixed(1)} L${x.toFixed(1)} ${(y + dicke - 1).toFixed(1)}`);
  }
  const vorn = form(oval(50, cy, r, ry), NORDISCH, [36, 30], { s: 0.92 });
  const rand = naht(`M${50 - r + 5} ${cy} A${r - 5} ${ry - 5} 0 1 1 ${50 + r - 5} ${cy} A${r - 5} ${ry - 5} 0 1 1 ${50 - r + 5} ${cy}`, NORDISCH, 2.2);
  const licht = glanz(`M24 ${cy - 16} Q30 ${cy - 26} 42 ${cy - 29}`, NORDISCH, 3);
  const zahl = { svg: `<text x="50" y="${cy + 12}" font-size="34" text-anchor="middle" fill="${dunkler(NORDISCH, 0.5)}" stroke="none">10</text>`, kontur: "" };
  // Schlagschatten der Prägung (Licht von oben links): die Ziffern stehen leicht erhaben.
  const praegung = { svg: `<text x="51.2" y="${cy + 13.2}" font-size="34" text-anchor="middle" fill="${dunkler(NORDISCH, 0.28)}" stroke="none">10</text>`, kontur: "" };
  return zusammen(kante, { svg: naht(rillen.join(" "), dunkler(NORDISCH, 0.18), 1.2).svg, kontur: "" }, vorn, rand, licht, praegung, zahl);
}

meldeObjekt("muenze", {
  zustaende: ["stapel", "zehn-cent"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [
    { stueck: muenzenStueck(), in: "stapel" },
    { stueck: zehnCentStueck(), in: "zehn-cent" },
  ], ursprung: [50, 90] }),
});
