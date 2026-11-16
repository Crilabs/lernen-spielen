// <ls-objekt art="einkaufszettel">: ein schmaler, hoher Einkaufszettel (Papierstreifen, oben gewellt abgerissen) mit
// fünf Zeilen Bleistift-Wellen, vor jeder Zeile ein kurzer Strich; rechts daneben liegt schräg eine Laugenbrezel mit
// hellen Salzkörnern. Feld 0…100. Keine Schrift, keine Ziffer: die Wellen stehen für das, was man aufschreibt.
// Bild der Karte „Mit echten Dingen“ für zahlen-bis-20-schreiben (Einkaufszettel mit Mengen).
// Schmaler und höher als `auftragszettel` (ohne Bleistift, mit Strichliste), die Brezel macht ihn zum Einkauf.
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2), keine Farbe der Lernzeichen.

import { form, pfad, zusammen, dunkler, heller, z } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild, KONTUR } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const PAPIER = PALETTEN.werkstatt[0];
const BLEI = PALETTEN.werkstatt[4];
const BREZEL = PALETTEN.savanne[4];
const SALZ = PALETTEN.savanne[0];

/** Fünf Zeilen: kurzer Strich, dann Wellen verschiedener Länge (keine Buchstaben). @returns {Stueck} */
function zeilen() {
  const laengen = [4, 3, 4, 2, 3];
  let d = "";
  laengen.forEach((n, i) => {
    const y = 26 + i * 12;
    d += `M23 ${y} L26.5 ${y} `;
    d += `M30 ${y}`;
    for (let k = 0; k < n; k++) d += ` q1 -2.2 2 0 q1 2.2 2 0`;
    d += " ";
  });
  return { svg: `<path d="${d}" fill="none" stroke="${dunkler(BLEI, 0.1)}" stroke-width="1.7"/>`, kontur: "" };
}

// Laugenbrezel als ein Strang: rechtes Ende, linke Schlaufe, Bauch, rechte Schlaufe, linkes Ende (Arme kreuzen sich).
const STRANG = "M11 10 C5 3 -3 -7 -8 -12 C-13 -17 -23 -13 -23 -3 C-23 9 -11 16 0 16 C11 16 23 9 23 -3 "
  + "C23 -13 13 -17 8 -12 C3 -7 -5 3 -11 10";

/** Die Brezel als Stück um (0, 0); dicker Strang mit Schattenstufe und Salzkörnern. @returns {Stueck} */
function brezel() {
  const dick = 6;
  const strang = (/** @type {string} */ farbe, /** @type {number} */ w, /** @type {string} */ zusatz = "") =>
    `<path d="${STRANG}" fill="none" stroke="${farbe}" stroke-width="${w}"${zusatz}/>`;
  const svg = strang(dunkler(BREZEL, 0.3), dick)
    + strang(BREZEL, dick - 2.2, ' transform="translate(-0.7 -0.8)"')
    + strang(heller(BREZEL, 0.3), 1.6, ' transform="translate(-1.6 -1.9)" opacity="0.8"');
  const salz = [[-20, -6, 20], [-15, 12, -30], [-4, 15.5, 10], [7, 15, -15], [17, 10, 40], [21, -7, 0], [-12, -15, 60],
    [14, -14, -50], [-6, -6, 30], [5, -6, -30]]
    .map(([x, y, w]) => `<ellipse cx="${x}" cy="${y}" rx="1.1" ry="0.7" transform="rotate(${w} ${x} ${y})" fill="${SALZ}" stroke="none"/>`)
    .join("");
  return { svg: svg + salz, kontur: `<path d="${STRANG}" fill="none" stroke-width="${z(dick + KONTUR)}"/>` };
}

/** Zettel und Brezel als Stück im Feld 0…100 (Boden bei y 92). @returns {Stueck} */
export function einkaufszettelStueck() {
  const rand = "M18 14 Q21 10 24 13 T30 13 T36 12 T42 13 T48 11 L50 92 L20 93 Z";
  const zettel = form(pfad(rand), PAPIER, [22, 16], { s: 0.92 });
  const b = brezel();
  const lage = "translate(72 71) rotate(-24) scale(1.12)";
  return zusammen(zettel, zeilen(),
    { svg: `<g transform="${lage}">${b.svg}</g>`, kontur: `<g transform="${lage}">${b.kontur}</g>` });
}

meldeObjekt("einkaufszettel", {
  zustaende: ["brezel"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: einkaufszettelStueck() }], ursprung: [50, 92] }),
});
