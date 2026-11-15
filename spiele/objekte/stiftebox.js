// <ls-objekt art="stiftebox">: eine offene Dose mit acht Buntstiften, die angespitzt oben herausschauen. Feld 0…100,
// von vorn. Keine Schrift, keine Ziffer.
// Packung der Achterreihe in M37 Kettenhüpfer (Setzung des Spiels: „Hier kommen in eine Stiftebox acht Stifte.“).
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2) und den Tokens (Ahorn für das
// Holz der Spitze), keine Farbe der Lernzeichen: die Stifte in weichen Tönen der Welten, die Dose Akzent „Werkstatt“.

import { form, flach, naht, falte, pfad, zusammen, dunkler, heller } from "../runde/kinder/stil.js";
import { FARBE } from "../rahmen/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const DOSE = PALETTEN.werkstatt[3];
const HOLZ = FARBE.ahorn;
const MINE = PALETTEN.werkstatt[4];
/** Acht Stifte von links nach rechts: Farbe und Oberkante der Spitze (abwechselnd höher und tiefer). */
const STIFTE = [
  { farbe: PALETTEN.wasser[3], oben: 18 },
  { farbe: PALETTEN.wiese[2], oben: 10 },
  { farbe: PALETTEN.savanne[1], oben: 22 },
  { farbe: PALETTEN.dorf[4], oben: 13 },
  { farbe: PALETTEN.wiese[3], oben: 20 },
  { farbe: PALETTEN.wasser[1], oben: 9 },
  { farbe: PALETTEN.savanne[3], oben: 17 },
  { farbe: PALETTEN.wasser[4], oben: 12 },
];
export const ANZAHL = STIFTE.length;

/** Ein Stift: Schaft (bis unter den Dosenrand), Holzspitze, Mine. @param {number} x Mitte @param {number} oben @param {string} farbe */
function stift(x, oben, farbe) {
  const h = 3.4;
  const spitze = oben + 9;
  return zusammen(
    form(pfad(`M${x - h} ${spitze} L${x + h} ${spitze} L${x + h} 60 L${x - h} 60 Z`), farbe, [x - h + 1, spitze + 2], { s: 0.8 }),
    form(pfad(`M${x - h} ${spitze} L${x - 1.1} ${oben + 2.6} L${x + 1.1} ${oben + 2.6} L${x + h} ${spitze} Z`), HOLZ, [x - 1.6, oben + 4], { s: 0.86 }),
    form(pfad(`M${x - 1.1} ${oben + 2.6} L${x} ${oben} L${x + 1.1} ${oben + 2.6} Z`), farbe, [x - 0.4, oben + 1], { s: 0.9 }),
  );
}

/** Dose von vorn, oben die Öffnung (Rückwand innen im Schatten). @returns {{ hinten: Stueck, vorn: Stueck }} */
function dose() {
  const hinten = zusammen(
    flach(pfad("M17 46 L83 46 L83 54 L17 54 Z"), heller(DOSE, 0.2)),
    flach(pfad("M20 47.5 L80 47.5 L80 54 L20 54 Z"), dunkler(DOSE, 0.62)),
  );
  const vorn = zusammen(
    form(pfad("M16 52 L84 52 L82 90 Q82 94 78 94 L22 94 Q18 94 18 90 Z"), DOSE, [22, 55], { s: 0.92 }),
    flach(pfad("M16 52 L84 52 L83.8 56 L16.2 56 Z"), heller(DOSE, 0.25)),
    falte("M16.2 56 L83.8 56 L83.6 59 Q50 61 16.4 59 Z", DOSE, 0.3),
    naht("M19 84 L81 84", DOSE, 1.8),
  );
  return { hinten, vorn };
}

/** Stiftebox als Stück im Feld 0…100 (Boden bei y 94). @returns {Stueck} */
export function stifteboxStueck() {
  const d = dose();
  const stifte = STIFTE.map((s, i) => stift(23 + i * 7.7, s.oben, s.farbe));
  // Die Minen sind die dunklen Spitzen; der Ton ist der Schatten der Werkstatt, nicht die Farbe des Stifts.
  const minen = STIFTE.map((s, i) => flach(pfad(`M${23 + i * 7.7 - 0.8} ${s.oben + 1.4} L${23 + i * 7.7} ${s.oben} L${23 + i * 7.7 + 0.8} ${s.oben + 1.4} Z`), MINE));
  return zusammen(d.hinten, ...stifte, ...minen.map((m) => ({ svg: m.svg, kontur: "" })), d.vorn);
}

meldeObjekt("stiftebox", {
  zustaende: ["offen"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: stifteboxStueck() }], ursprung: [50, 94] }),
});
