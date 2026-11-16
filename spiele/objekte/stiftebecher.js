// <ls-objekt art="stiftebecher">: ein Becher mit zehn Buntstiften, davor liegen vier einzelne Stifte quer.
// Feld 0…100, von vorn. Keine Schrift, keine Ziffer.
// Bild der Karte „Mit echten Dingen“ für zehner-und-einer-bis-20 (der volle Becher ist ein Zehner, die losen Stifte
// sind Einer). Anders als `stiftebox` (acht Stifte in einer breiten Dose, Packung der Achterreihe in M37).
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2) und den Tokens (Ahorn für das
// Holz der Spitze), keine Farbe der Lernzeichen.

import { form, flach, naht, pfad, zusammen, heller } from "../runde/kinder/stil.js";
import { FARBE } from "../rahmen/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const BECHER = PALETTEN.wiese[2];
const HOLZ = FARBE.ahorn;
const MINE = PALETTEN.werkstatt[4];
const FARBEN = [PALETTEN.wasser[3], PALETTEN.wiese[4], PALETTEN.savanne[1], PALETTEN.dorf[4], PALETTEN.wasser[1],
  PALETTEN.savanne[3], PALETTEN.dorf[3], PALETTEN.wasser[4], PALETTEN.savanne[4], PALETTEN.wiese[3]];
const OBEN = [16, 8, 20, 11, 6, 18, 10, 21, 9, 15];
export const IM_BECHER = 10;
export const DAVOR = 4;

/** Ein stehender Stift: Schaft bis unter den Becherrand, Holzspitze, Mine. @param {number} x @param {number} oben @param {string} farbe */
function stift(x, oben, farbe) {
  const h = 2.7;
  const spitze = oben + 8;
  return zusammen(
    form(pfad(`M${x - h} ${spitze} L${x + h} ${spitze} L${x + h} 50 L${x - h} 50 Z`), farbe, [x - h + 0.8, spitze + 2], { s: 0.8 }),
    form(pfad(`M${x - h} ${spitze} L${x - 0.9} ${oben + 2.4} L${x + 0.9} ${oben + 2.4} L${x + h} ${spitze} Z`), HOLZ, [x - 1.3, oben + 4], { s: 0.86 }),
    flach(pfad(`M${x - 0.9} ${oben + 2.4} L${x} ${oben} L${x + 0.9} ${oben + 2.4} Z`), MINE),
  );
}

/** Ein liegender Stift, Spitze rechts. @param {number} x0 links @param {number} y Mitte @param {string} farbe */
function liegend(x0, y, farbe) {
  const h = 2.6;
  const l = 34;
  return zusammen(
    form(pfad(`M${x0} ${y - h} L${x0 + l} ${y - h} L${x0 + l} ${y + h} L${x0} ${y + h} Z`), farbe, [x0 + 2, y - h + 0.8], { s: 0.8 }),
    form(pfad(`M${x0 + l} ${y - h} L${x0 + l + 7} ${y - 0.8} L${x0 + l + 7} ${y + 0.8} L${x0 + l} ${y + h} Z`), HOLZ, [x0 + l + 1, y - 1], { s: 0.86 }),
    flach(pfad(`M${x0 + l + 7} ${y - 0.8} L${x0 + l + 9} ${y} L${x0 + l + 7} ${y + 0.8} Z`), MINE),
  );
}

/** Stiftebecher mit zehn Stiften und vier Stiften davor als Stück im Feld 0…100 (Boden bei y 95). @returns {Stueck} */
export function stiftebecherStueck() {
  const stifte = OBEN.map((o, i) => stift(30 + i * 4.45, o, FARBEN[i]));
  const becher = zusammen(
    form(pfad("M26 44 L74 44 L70 82 Q70 85 67 85 L33 85 Q30 85 30 82 Z"), BECHER, [30, 47], { s: 0.92 }),
    flach(pfad("M26 44 L74 44 L73.6 48 L26.4 48 Z"), heller(BECHER, 0.25)),
    naht("M29 76 L71 76", BECHER, 1.6),
  );
  const davor = [liegend(8, 85, FARBEN[2]), liegend(52, 85, FARBEN[0]), liegend(14, 92, FARBEN[6]), liegend(50, 92, FARBEN[4])];
  return zusammen(...stifte, becher, ...davor);
}

meldeObjekt("stiftebecher", {
  zustaende: ["zehn-und-vier"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: stiftebecherStueck() }], ursprung: [50, 95] }),
});
