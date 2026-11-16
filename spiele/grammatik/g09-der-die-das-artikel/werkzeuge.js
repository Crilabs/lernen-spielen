// Die 18 Werkzeuge von G09 als flache Zeichnungen im Stil der Runde (figuren.md §4): Kontur nur um die Silhouette,
// Schatten in Stufen, feine Nähte im dunklen Ton der Fläche. Jedes Werkzeug steht in einem Feld 0 0 100 100 und ist
// naturgetreu (G11). Dieselbe Geometrie ergibt den Umriss für die Wand (eine dunkle Fläche, wie ein Schatten).
// Nur dieses Spiel braucht sie, deshalb liegen sie im Spielordner und nicht in spiele/objekte/.
import { form, flach, naht, zusammen, zeichner, dunkler, heller, TINTE } from "../../start/zeichnen.js";

const HOLZ = "#C9A06E";
const HOLZ_DUNKEL = "#8F6A43";
const AHORN = "#EAD5B5";
const STAHL = "#B4C0CC";
const STAHL_DUNKEL = "#7C8A99";
const KORALLE = "#FF9F8A";
const SONNE = "#F2C14E";
const WASSER = "#8FD3EE";
const WIESE = "#9ED8A8";
const SAND = "#D9B97A";
const SCHIEFER = "#5B6472";
/** Die Fläche des Umrisses an der Wand: ein dunkler Holzton, wie ein Schatten auf der Lochwand. */
export const UMRISS_FARBE = "#B9976A";

/** @typedef {{ t: "f", geo: string, c: string, l: [number, number] } | { t: "n", d: string, c: string } | { t: "s", d: string, c: string, w: number }} Teil */

/** Fläche mit Schattenstufen. @param {string} geo @param {string} c @param {[number, number]} l @returns {Teil} */
const f = (geo, c, l) => ({ t: "f", geo, c, l });
/** Naht. @param {string} d @param {string} c @returns {Teil} */
const n = (d, c) => ({ t: "n", d, c });
/** Strich (Seil, Henkel). @param {string} d @param {string} c @param {number} w @returns {Teil} */
const s = (d, c, w) => ({ t: "s", d, c, w });
/** Rechteck. */
const rc = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ w, /** @type {number} */ h, /** @type {number} */ rx, /** @type {string} */ c) =>
  f(`rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"`, c, [x + w * 0.22, y + h * 0.22]);
/** Ellipse. */
const el = (/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ rx, /** @type {number} */ ry, /** @type {string} */ c) =>
  f(`ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"`, c, [cx - rx * 0.4, cy - ry * 0.4]);
/** Vieleck oder Pfad. */
const pf = (/** @type {string} */ d, /** @type {string} */ c, /** @type {number} */ lx, /** @type {number} */ ly) => f(`path d="${d}"`, c, [lx, ly]);
/** Ring mit Loch (gerade Füllregel). */
const ring = (/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ rx, /** @type {number} */ ry, /** @type {number} */ t, /** @type {string} */ c) =>
  f(`path d="M${cx - rx} ${cy} a${rx} ${ry} 0 1 0 ${2 * rx} 0 a${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z M${cx - rx + t} ${cy} a${rx - t} ${ry - t} 0 1 1 ${2 * (rx - t)} 0 a${rx - t} ${ry - t} 0 1 1 ${-2 * (rx - t)} 0 Z" fill-rule="evenodd"`, c, [cx - rx * 0.5, cy - ry * 0.6]);

/** @type {Record<string, Teil[]>} */
const WERKZEUGE = {
  hammer: [
    rc(43, 26, 14, 68, 6, HOLZ),
    n("M47 34 L47 88", HOLZ),
    pf("M16 12 L72 12 Q84 12 84 24 L84 30 L16 30 Z", STAHL, 24, 15),
    pf("M16 12 L8 21 L16 30 Z", STAHL_DUNKEL, 12, 18),
  ],
  pinsel: [
    pf("M42 94 Q50 100 58 94 L54 52 L46 52 Z", KORALLE, 46, 60),
    rc(41, 40, 18, 15, 3, STAHL),
    pf("M41 42 Q38 18 50 4 Q62 18 59 42 Z", WASSER, 46, 16),
    n("M47 40 Q47 20 50 10", WASSER),
  ],
  nagel: [
    rc(46, 20, 8, 70, 2, STAHL),
    pf("M46 88 L54 88 L50 99 Z", STAHL_DUNKEL, 49, 90),
    el(50, 19, 18, 7, STAHL),
  ],
  eimer: [
    s("M24 32 Q50 -10 76 32", STAHL_DUNKEL, 4),
    pf("M20 32 L80 32 L71 90 Q50 98 29 90 Z", WASSER, 28, 40),
    rc(15, 25, 70, 11, 5, STAHL),
    n("M32 50 L35 82", WASSER),
    n("M68 50 L65 82", WASSER),
  ],
  besen: [
    rc(46, 4, 8, 62, 4, HOLZ),
    pf("M26 64 L74 64 L84 96 L16 96 Z", SONNE, 32, 70),
    rc(27, 60, 46, 10, 4, KORALLE),
    n("M34 74 L30 94", SONNE),
    n("M44 74 L42 94", SONNE),
    n("M56 74 L58 94", SONNE),
    n("M66 74 L70 94", SONNE),
  ],
  schluessel: [
    ring(50, 24, 17, 17, 8, SONNE),
    rc(46, 38, 9, 56, 3, SONNE),
    rc(55, 68, 14, 8, 2, SONNE),
    rc(55, 82, 10, 8, 2, SONNE),
  ],
  zange: [
    pf("M26 96 L42 52 L52 58 L38 98 Z", KORALLE, 36, 70),
    pf("M74 96 L58 52 L48 58 L62 98 Z", KORALLE, 62, 70),
    pf("M42 54 L38 14 Q50 4 62 14 L58 54 L50 46 Z", STAHL, 44, 20),
    n("M50 14 L50 38", STAHL),
    el(50, 52, 5, 5, STAHL_DUNKEL),
  ],
  saege: [
    pf("M70 18 L94 14 L96 56 L70 58 Z M80 28 a6 11 0 1 0 0.1 0 Z", HOLZ, 76, 22),
    pf("M6 40 L72 20 L72 58 L64 52 L58 59 L52 52 L46 60 L40 53 L34 61 L28 54 L22 62 L16 55 L10 62 L6 54 Z", STAHL, 14, 40),
    n("M10 44 L68 27", STAHL),
  ],
  schere: [
    pf("M50 54 L33 6 L41 3 L56 50 Z", STAHL, 38, 12),
    pf("M50 54 L67 6 L59 3 L44 50 Z", STAHL_DUNKEL, 62, 12),
    ring(32, 76, 15, 18, 7, KORALLE),
    ring(68, 76, 15, 18, 7, KORALLE),
    pf("M40 60 L50 52 L60 60 L56 66 L50 60 L44 66 Z", KORALLE, 46, 58),
  ],
  leiter: [
    rc(24, 4, 9, 92, 3, HOLZ),
    rc(67, 4, 9, 92, 3, HOLZ),
    rc(33, 14, 34, 6, 2, HOLZ_DUNKEL),
    rc(33, 32, 34, 6, 2, HOLZ_DUNKEL),
    rc(33, 50, 34, 6, 2, HOLZ_DUNKEL),
    rc(33, 68, 34, 6, 2, HOLZ_DUNKEL),
    rc(33, 86, 34, 6, 2, HOLZ_DUNKEL),
  ],
  nadel: [
    s("M52 24 Q74 30 66 50 Q58 68 76 82", KORALLE, 3),
    pf("M46 12 Q50 6 54 12 L54 88 L50 99 L46 88 Z M50 14 a2 4.5 0 1 0 0.1 0 Z", STAHL, 47, 20),
  ],
  buerste: [
    rc(12, 30, 76, 24, 11, HOLZ),
    rc(16, 54, 68, 20, 3, SONNE),
    n("M26 58 L26 72", SONNE),
    n("M38 58 L38 72", SONNE),
    n("M50 58 L50 72", SONNE),
    n("M62 58 L62 72", SONNE),
    n("M74 58 L74 72", SONNE),
    n("M24 38 L70 38", HOLZ),
  ],
  messer: [
    pf("M30 40 L92 52 L30 58 Z", STAHL, 40, 46),
    n("M36 53 L84 53", STAHL),
    rc(6, 38, 30, 21, 8, HOLZ_DUNKEL),
    el(16, 48, 2.6, 2.6, STAHL),
    el(27, 48, 2.6, 2.6, STAHL),
  ],
  seil: [
    s("M50 14 a36 36 0 1 1 -0.1 0", SAND, 12),
    s("M50 30 a20 20 0 1 1 -0.1 0", SAND, 12),
    s("M50 14 Q76 4 90 12", SAND, 9),
    n("M30 22 L36 30", SAND),
  ],
  brett: [
    rc(8, 32, 84, 36, 3, AHORN),
    n("M12 42 Q40 38 88 44", AHORN),
    n("M12 58 Q50 62 88 56", AHORN),
    el(30, 50, 5, 3.4, HOLZ),
    el(15, 50, 2, 2, STAHL_DUNKEL),
    el(85, 50, 2, 2, STAHL_DUNKEL),
  ],
  lineal: [
    rc(4, 36, 92, 28, 3, SONNE),
    n("M12 36 L12 50", SONNE),
    n("M22 36 L22 46", SONNE),
    n("M32 36 L32 46", SONNE),
    n("M42 36 L42 46", SONNE),
    n("M52 36 L52 50", SONNE),
    n("M62 36 L62 46", SONNE),
    n("M72 36 L72 46", SONNE),
    n("M82 36 L82 46", SONNE),
  ],
  rad: [
    ring(50, 50, 44, 44, 13, SCHIEFER),
    s("M50 50 L50 12", STAHL, 4),
    s("M50 50 L83 31", STAHL, 4),
    s("M50 50 L83 69", STAHL, 4),
    s("M50 50 L50 88", STAHL, 4),
    s("M50 50 L17 69", STAHL, 4),
    s("M50 50 L17 31", STAHL, 4),
    el(50, 50, 8, 8, STAHL_DUNKEL),
  ],
  glas: [
    pf("M24 12 L76 12 L70 88 Q50 98 30 88 Z", heller(WASSER, 0.55), 32, 22),
    pf("M26 44 L74 44 L70 88 Q50 98 30 88 Z", WASSER, 34, 52),
    n("M34 22 L38 76", WASSER),
  ],
};

const zz = zeichner("wz", 2);

/** Ist es ein Werkzeug von G09? @param {string} id */
export const hatWerkzeug = (id) => Object.hasOwn(WERKZEUGE, id);

/** Alle Kennungen. */
export const WERKZEUG_IDS = Object.keys(WERKZEUGE);

/** @param {Teil} t */
const stueck = (t) => {
  if (t.t === "f") return form(t.geo, t.c, t.l, { tiefe: 0.8 });
  if (t.t === "n") return naht(t.d, t.c, 1.6, 0.3);
  return { svg: `<path d="${t.d}" fill="none" stroke="${t.c}" stroke-width="${t.w}" stroke-linecap="round"/>`, kontur: `<path d="${t.d}" fill="none" stroke-width="${t.w + 4}" stroke-linecap="round"/>` };
};

/**
 * Das Werkzeug als SVG-Text (Feld 0 0 100 100, aria-hidden). Mit `umriss` nur die dunkle Fläche der Silhouette.
 * @param {string} id @param {{ umriss?: boolean }} [o]
 */
export function werkzeugSvg(id, { umriss = false } = {}) {
  const teile = WERKZEUGE[id];
  if (!teile) throw new Error(`G09: kein Werkzeug „${id}“`);
  const kopf = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 104 104" aria-hidden="true" focusable="false">`;
  if (umriss) {
    const flaechen = teile.map((t) => (t.t === "f" ? `<${t.geo} fill="${UMRISS_FARBE}"/>`
      : t.t === "s" ? `<path d="${t.d}" fill="none" stroke="${UMRISS_FARBE}" stroke-width="${t.w}" stroke-linecap="round"/>` : "")).join("");
    return `${kopf}${flaechen}</svg>`;
  }
  return `${kopf}${zz.guss(zusammen(...teile.map(stueck)))}</svg>`;
}

export { TINTE, dunkler };
