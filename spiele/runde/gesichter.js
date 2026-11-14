// Grundbestand der Gesichter. Koordinaten relativ zur Mitte zwischen den Augen (schnitt.js GESICHT).
// Die Brauen tragen das Gefühl, der Mund ist eine Linie, die Augen ovale Punkte mit Lichtpunkt (figuren.md §4).
// Kein trauriger, enttäuschter oder erschrockener Ausdruck (grundsaetze.md 3.1 Nr. 5).

import { meldeGesicht } from "./bestand.js";
import { INK } from "./kinder/schnitt.js";

const MUND = "#8E3B52";
/** @param {number} n */
const z = (n) => String(Math.round(n * 100) / 100);

/** Auge mit Lichtpunkt. @param {number} x @param {number} y @param {number} [ry] */
const auge = (x, y, ry = 6) =>
  `<ellipse cx="${z(x)}" cy="${z(y)}" rx="4.6" ry="${z(ry)}" fill="${INK}" stroke="none"/>`
  + `<circle cx="${z(x + 1.6)}" cy="${z(y - ry * 0.38)}" r="1.7" fill="#FFFFFF" stroke="none"/>`;
/** Lachendes Auge als Bogen. @param {number} x */
const lachauge = (x) => `<path d="M${z(x - 5)} 1 Q${z(x)} -6 ${z(x + 5)} 1" fill="none" stroke="${INK}" stroke-width="3.2"/>`;
/** Braue: dy hebt (negativ) oder senkt, bogen wölbt. @param {number} x @param {number} dy @param {number} [bogen] */
const braue = (x, dy, bogen = 3) =>
  `<path d="M${z(x - 6)} ${z(-14 + dy)} Q${z(x)} ${z(-14 + dy - bogen)} ${z(x + 6)} ${z(-14 + dy)}" fill="none" stroke="${INK}" stroke-width="3.2"/>`;
/** @param {string} d */
const mund = (d) => `<path d="${d}" fill="none" stroke="${INK}" stroke-width="3"/>`;
/** @param {string} d */
const mundOffen = (d) => `<path d="${d}" fill="${MUND}" stroke="${INK}" stroke-width="3"/>`;

// Dreiviertel: Augen bei x = ±13. Profil: ein Auge bei 0, Mund vorn unten.
const L = -13;
const R = 13;

/** @type {Record<string, {dreiviertel: string, profil: string}>} */
const GESICHTER = {
  ruhig: {
    dreiviertel: braue(L, 0) + braue(R, 0) + auge(L, 0) + auge(R, 0) + mund("M-7 17 Q0 22 7 17"),
    profil: braue(0, 0) + auge(0, 0) + mund("M2 18 Q6 20 9 17"),
  },
  neugierig: {
    dreiviertel: braue(L, -4, 4) + braue(R, 0, 2) + auge(L, 0) + auge(R, 0) + mund("M-6 18 Q1 21 7 17"),
    profil: braue(0, -4, 4) + auge(0, 0) + mund("M3 18 Q6 19 9 17"),
  },
  staunen: {
    dreiviertel: braue(L, -5, 5) + braue(R, -5, 5) + auge(L, 0, 7.4) + auge(R, 0, 7.4)
      + `<ellipse cx="0" cy="19" rx="4" ry="5" fill="${MUND}" stroke="${INK}" stroke-width="3"/>`,
    profil: braue(0, -5, 5) + auge(0, 0, 7.4)
      + `<ellipse cx="7" cy="19" rx="3" ry="4.5" fill="${MUND}" stroke="${INK}" stroke-width="3"/>`,
  },
  "freuen-klein": {
    dreiviertel: braue(L, -2) + braue(R, -2) + auge(L, 0) + auge(R, 0) + mund("M-9 15 Q0 25 9 15"),
    profil: braue(0, -2) + auge(0, 0) + mund("M1 17 Q6 22 10 15"),
  },
  "freuen-gross": {
    dreiviertel: braue(L, -4, 4) + braue(R, -4, 4) + lachauge(L) + lachauge(R) + mundOffen("M-11 13 Q0 31 11 13 Z"),
    profil: braue(0, -4, 4) + lachauge(0) + mundOffen("M1 14 Q6 27 11 13 Z"),
  },
  nachdenken: {
    dreiviertel: braue(L, 0, 2) + braue(R, -4, 4) + auge(L + 1.5, -1.5) + auge(R + 1.5, -1.5) + mund("M-5 19 L5 17"),
    profil: braue(0, -3, 4) + auge(1.5, -1.5) + mund("M3 19 L9 18"),
  },
};

for (const [id, ansichten] of Object.entries(GESICHTER)) meldeGesicht({ id, ansichten });
