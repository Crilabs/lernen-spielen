// <ls-objekt art="spielkarten">: fünf Spielkarten als Fächer, wie man sie beim Austeilen und Spielen in der Hand hält.
// Feld 0…100, die Karten drehen sich um einen Punkt unten in der Mitte. Man sieht nur die Rückseiten: weißer Rand,
// Fläche in Koralle mit einer hellen Raute. Keine Schrift, keine Ziffer, keine Kartenfarben (Herz, Pik …).

import { form, flach, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild, verschiebe } from "./objekt.js";

export const RAND = "#FFFCF7";
export const RUECKEN = "#F59A86";

/** Rechteck mit runden Ecken als Pfad. */
function eckig(/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ b, /** @type {number} */ h, /** @type {number} */ r) {
  return pfad(`M${x + r} ${y} L${x + b - r} ${y} Q${x + b} ${y} ${x + b} ${y + r} L${x + b} ${y + h - r} Q${x + b} ${y + h} ${x + b - r} ${y + h}`
    + ` L${x + r} ${y + h} Q${x} ${y + h} ${x} ${y + h - r} L${x} ${y + r} Q${x} ${y} ${x + r} ${y} Z`);
}

/** Eine Karte, aufrecht, Rückseite nach vorn; unten Mitte bei (50, 80), Drehpunkt (50, 94). */
function karte() {
  const blatt = form(eckig(33, 22, 34, 58, 4.5), RAND, [36, 25], { s: 0.92, trenn: true });
  const flaeche = flach(eckig(37, 26, 26, 50, 2.5), RUECKEN);
  const raute = flach(pfad("M50 32 L59 51 L50 70 L41 51 Z"), heller(RUECKEN, 0.35));
  const kern = flach(pfad("M50 41 L54.5 51 L50 61 L45.5 51 Z"), dunkler(RUECKEN, 0.12));
  return zusammen(blatt, flaeche, raute, kern);
}

/** Der Fächer als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function spielkartenStueck() {
  const winkel = [-24, -12, 0, 12, 24];
  return zusammen(...winkel.map((w) => verschiebe(karte(), `rotate(${w} 50 94)`)));
}

meldeObjekt("spielkarten", {
  zustaende: ["faecher"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: spielkartenStueck() }], ursprung: [50, 94] }),
});
