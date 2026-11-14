// Grundbestand der Gesichter. Koordinaten relativ zur Mitte zwischen den Augen (schnitt.js GESICHT).
// Die Brauen tragen das Gefühl, der Mund ist eine Linie, die Augen ovale Punkte mit Lichtpunkt (figuren.md §4).
// Kein trauriger, enttäuschter oder erschrockener Ausdruck (grundsaetze.md 3.1 Nr. 5).

import { meldeGesicht } from "./bestand.js";
// Gesichtsfarben warm statt Tinte: Augen fast schwarzbraun, Brauen dunkelbraun, Mund rotbraun.
// Je Kind anpassbar über CSS-Variablen am <svg> (Kind.stil), z. B. dunklere Lippenlinie auf dunkler Haut.
const AUGE = "var(--auge, #2B1B18)";
const BRAUE = "var(--braue, #3E2621)";
const LIPPE = "var(--lippe, #8A3F3A)";
const MUND = "var(--mund, #B5505A)";
/** @param {number} n */
const z = (n) => String(Math.round(n * 100) / 100);

/** Auge mit Lichtpunkt. @param {number} x @param {number} y @param {number} [ry] */
const auge = (x, y, ry = 6) =>
  `<ellipse cx="${z(x)}" cy="${z(y)}" rx="4.6" ry="${z(ry)}" style="fill:${AUGE}" stroke="none"/>`
  + `<circle cx="${z(x + 1.6)}" cy="${z(y - ry * 0.38)}" r="1.7" fill="#FFFFFF" stroke="none"/>`;
/** Lachendes Auge als Bogen. @param {number} x */
const lachauge = (x) => `<path d="M${z(x - 5)} 1 Q${z(x)} -6 ${z(x + 5)} 1" fill="none" style="stroke:${AUGE}" stroke-width="3.2"/>`;
/** Braue: dy hebt (negativ) oder senkt, bogen wölbt. @param {number} x @param {number} dy @param {number} [bogen] */
const braue = (x, dy, bogen = 3) =>
  `<path d="M${z(x - 6)} ${z(-14 + dy)} Q${z(x)} ${z(-14 + dy - bogen)} ${z(x + 6)} ${z(-14 + dy)}" fill="none" style="stroke:${BRAUE};stroke-width:var(--braue-dicke, 3.4)"/>`;
/** Halb geschlossenes Auge (Lid als Fläche oben). @param {number} x */
const halbauge = (x) => `<path d="M${z(x - 4.8)} 0 Q${z(x)} 5 ${z(x + 4.8)} 0 Z" style="fill:${AUGE}" stroke="none"/>`
  + `<path d="M${z(x - 5.4)} -0.5 L${z(x + 5.4)} -0.5" fill="none" style="stroke:${AUGE}" stroke-width="2.6"/>`;
/** Zugekniffenes Auge als Winkel; richtung 1 zeigt nach rechts. @param {number} x @param {number} richtung */
const kneif = (x, richtung) => `<path d="M${z(x - 5 * richtung)} -5 L${z(x + 4 * richtung)} 0 L${z(x - 5 * richtung)} 5" fill="none" style="stroke:${AUGE}" stroke-width="3.2"/>`;
/** Geschlossenes Auge als Bogen nach unten. @param {number} x */
const zu = (x) => `<path d="M${z(x - 5)} 0 Q${z(x)} 4 ${z(x + 5)} 0" fill="none" style="stroke:${AUGE}" stroke-width="3"/>`;
/** Aufgeblasene Backe: runde Fläche im Hautton-Schatten mit Licht. @param {number} x @param {number} y @param {number} r */
const backe = (x, y, r) => `<circle cx="${z(x)}" cy="${z(y)}" r="${z(r)}" style="fill:var(--backe, #E9806A)" opacity="0.42" stroke="none"/>`
  + `<circle cx="${z(x - r * 0.3)}" cy="${z(y - r * 0.35)}" r="${z(r * 0.3)}" fill="#FFFFFF" opacity="0.35" stroke="none"/>`;
/** @param {string} d */
const zunge = (d) => `<path d="${d}" style="fill:#E9806A;stroke:${LIPPE}" stroke-width="2.4"/>`;
/** @param {string} d */
const mund = (d) => `<path d="${d}" fill="none" style="stroke:${LIPPE}" stroke-width="3"/>`;
/** @param {string} d */
const mundOffen = (d) => `<path d="${d}" style="fill:${MUND};stroke:${LIPPE}" stroke-width="2.6"/>`;

// Dreiviertel: Augen bei x = ±13. Profil: ein Auge bei 0, Mund vorn unten.
const L = -13;
const R = 13;

/** @type {Record<string, {dreiviertel: string, profil: string}>} */
const GESICHTER = {
  ruhig: {
    dreiviertel: braue(L, 0) + braue(R, 0) + auge(L, 0) + auge(R, 0) + mund("M-7 20 Q0 25 7 20"),
    profil: braue(0, 0) + auge(0, 0) + mund("M6 18 Q10 20 13 17"),
  },
  neugierig: {
    dreiviertel: braue(L, -4, 4) + braue(R, 0, 2) + auge(L, 0) + auge(R, 0) + mund("M-6 21 Q1 24 7 20"),
    profil: braue(0, -4, 4) + auge(0, 0) + mund("M7 18 Q10 19 13 17"),
  },
  staunen: {
    dreiviertel: braue(L, -5, 5) + braue(R, -5, 5) + auge(L, 0, 7.4) + auge(R, 0, 7.4)
      + `<ellipse cx="0" cy="22" rx="4" ry="5" style="fill:${MUND};stroke:${LIPPE}" stroke-width="2.6"/>`,
    profil: braue(0, -5, 5) + auge(0, 0, 7.4)
      + `<ellipse cx="11" cy="19" rx="3" ry="4.5" style="fill:${MUND};stroke:${LIPPE}" stroke-width="2.6"/>`,
  },
  "freuen-klein": {
    dreiviertel: braue(L, -2) + braue(R, -2) + auge(L, 0) + auge(R, 0) + mund("M-9 18 Q0 28 9 18"),
    profil: braue(0, -2) + auge(0, 0) + mund("M5 17 Q10 22 14 15"),
  },
  "freuen-gross": {
    dreiviertel: braue(L, -4, 4) + braue(R, -4, 4) + lachauge(L) + lachauge(R) + mundOffen("M-11 16 Q0 34 11 16 Z"),
    profil: braue(0, -4, 4) + lachauge(0) + mundOffen("M5 14 Q10 27 15 13 Z"),
  },
  nachdenken: {
    dreiviertel: braue(L, 0, 2) + braue(R, -4, 4) + auge(L + 1.5, -1.5) + auge(R + 1.5, -1.5) + mund("M-5 22 L5 20"),
    profil: braue(0, -3, 4) + auge(1.5, -1.5) + mund("M7 19 L13 18"),
  },
  // Alberne Gesichter (Spec lustige Bewegungen): niesen, Grimassen, kichern, gähnen, Roboter.
  "nies-anlauf": {
    dreiviertel: braue(L, -6, 5) + braue(R, -6, 5) + halbauge(L) + halbauge(R)
      + mundOffen("M-5 20 Q0 15 5 20 Q4 28 0 28 Q-4 28 -5 20 Z"),
    profil: braue(0, -6, 5) + halbauge(0) + mundOffen("M8 18 Q12 15 15 19 Q14 25 11 25 Q8 24 8 18 Z"),
  },
  hatschi: {
    dreiviertel: braue(L, -1, 1) + braue(R, -1, 1) + kneif(L, 1) + kneif(R, -1)
      + `<ellipse cx="0" cy="23" rx="6" ry="6.5" style="fill:${MUND};stroke:${LIPPE}" stroke-width="2.6"/>`,
    profil: braue(0, -1, 1) + kneif(0, -1)
      + `<ellipse cx="12" cy="20" rx="4" ry="5.5" style="fill:${MUND};stroke:${LIPPE}" stroke-width="2.6"/>`,
  },
  zunge: {
    dreiviertel: braue(L, -3, 3) + braue(R, -6, 5) + auge(L, 0) + lachauge(R)
      + zunge("M-2 21 Q-1 32 5 32 Q10 31 9 22 Z") + mund("M-9 19 Q0 25 10 18"),
    profil: braue(0, -6, 5) + lachauge(0) + zunge("M10 19 Q12 28 17 27 Q20 25 17 19 Z") + mund("M5 18 Q11 21 16 17"),
  },
  backen: {
    dreiviertel: braue(L, -5, 4) + braue(R, -5, 4) + auge(L, -1, 6.6) + auge(R, -1, 6.6)
      + backe(-19, 18, 9) + backe(19, 18, 9)
      + `<circle cx="0" cy="23" r="3.2" fill="none" style="stroke:${LIPPE}" stroke-width="2.8"/>`,
    profil: braue(0, -5, 4) + auge(0, -1, 6.6) + backe(4, 19, 11)
      + `<circle cx="15" cy="20" r="2.6" fill="none" style="stroke:${LIPPE}" stroke-width="2.8"/>`,
  },
  kichern: {
    dreiviertel: braue(L, -5, 4) + braue(R, -5, 4) + lachauge(L) + lachauge(R) + mundOffen("M-6 18 Q0 28 6 18 Z"),
    profil: braue(0, -5, 4) + lachauge(0) + mundOffen("M7 17 Q11 24 15 16 Z"),
  },
  gaehnen: {
    dreiviertel: braue(L, -6, 4) + braue(R, -6, 4) + zu(L) + zu(R)
      + `<ellipse cx="0" cy="25" rx="7" ry="10" style="fill:${MUND};stroke:${LIPPE}" stroke-width="2.6"/>`,
    profil: braue(0, -6, 4) + zu(0)
      + `<ellipse cx="12" cy="22" rx="4.4" ry="8" style="fill:${MUND};stroke:${LIPPE}" stroke-width="2.6"/>`,
  },
  roboter: {
    dreiviertel: braue(L, -2, 0) + braue(R, -2, 0) + auge(L, 0, 4.6) + auge(R, 0, 4.6) + mund("M-7 21 L7 21"),
    profil: braue(0, -2, 0) + auge(0, 0, 4.6) + mund("M7 19 L14 19"),
  },
};

for (const [id, ansichten] of Object.entries(GESICHTER)) meldeGesicht({ id, ansichten });
