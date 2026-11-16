// Die Kreidebilder von G01 (Stufe material): ein kleines Bild je Wort, flach im Stil der Runde (figuren.md §4: Kontur nur
// um die Silhouette, Schatten in Stufen, feine Nähte im dunklen Ton der Fläche). Jedes Bild steht in einem Feld
// 0 0 100 100 und ist naturgetreu (G11, Regeln „Bilder bleiben wahr“): Tiere sehen aus wie Tiere, keines trägt ein
// Menschengesicht. Nur dieses Spiel braucht sie, deshalb liegen sie im Spielordner.
import { form, flach, naht, zusammen, zeichner, dunkler, heller } from "../../start/zeichnen.js";

const TINTE_DUNKEL = "#3B2A6B";
const ROT = "#F26B5B";
const KORALLE = "#FF9F8A";
const SONNE = "#F2C14E";
const WASSER = "#8FD3EE";
const WIESE = "#7DC28A";
const BLATT = "#5FAE74";
const HOLZ = "#C9A06E";
const HOLZ_DUNKEL = "#8F6A43";
const FELL_KATZE = "#F0A35E";
const FELL_HUND = "#C58B5B";
const CREME = "#FDE7C4";
const WEISS = "#FFFCF7";
const SCHIEFER = "#5B6472";

/** @typedef {import("../../start/zeichnen.js").Stueck} Stueck */

/** Fläche mit Schattenstufen. @param {string} geo @param {string} c @param {[number, number]} l @returns {Stueck} */
const f = (geo, c, l) => form(geo, c, l, { tiefe: 0.8 });
/** Ellipse. */
const el = (/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ rx, /** @type {number} */ ry, /** @type {string} */ c) =>
  f(`ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"`, c, [cx - rx * 0.4, cy - ry * 0.4]);
/** Rechteck. */
const rc = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ w, /** @type {number} */ h, /** @type {number} */ rx, /** @type {string} */ c) =>
  f(`rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}"`, c, [x + w * 0.22, y + h * 0.22]);
/** Pfad. */
const pf = (/** @type {string} */ d, /** @type {string} */ c, /** @type {number} */ lx, /** @type {number} */ ly) => f(`path d="${d}"`, c, [lx, ly]);
/** Naht. */
const n = (/** @type {string} */ d, /** @type {string} */ c) => naht(d, c, 1.6, 0.3);
/** Punkt ohne Kontur (Auge, Nase). */
const punkt = (/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ r, /** @type {string} */ c = TINTE_DUNKEL) => flach(`circle cx="${cx}" cy="${cy}" r="${r}"`, c, false);
/** Strich in Tinte (Schnurrhaar, Schall) ohne Kontur. */
const strich = (/** @type {string} */ d, /** @type {number} */ w = 2.2, /** @type {string} */ c = TINTE_DUNKEL) => ({ svg: `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`, kontur: "" });
/** Dicker Strich mit Kontur (Schwanz, Henkel). */
const dick = (/** @type {string} */ d, /** @type {string} */ c, /** @type {number} */ w) => ({
  svg: `<path d="${d}" fill="none" stroke="${c}" stroke-width="${w}" stroke-linecap="round"/>`,
  kontur: `<path d="${d}" fill="none" stroke-width="${w + 3.4}" stroke-linecap="round"/>`,
});

/** Fünfeck um (cx, cy) mit Radius r (Fußballmuster). */
const fuenfeck = (/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ r) =>
  Array.from({ length: 5 }, (_, i) => {
    const w = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
    return `${i ? "L" : "M"}${(cx + Math.cos(w) * r).toFixed(1)} ${(cy + Math.sin(w) * r).toFixed(1)}`;
  }).join(" ") + " Z";

/** Ein Ball um (cx, cy) mit Radius r. @returns {Stueck[]} */
function ball(cx = 50, cy = 52, r = 36) {
  const p = r * 0.34;
  return [
    el(cx, cy, r, r, WEISS),
    flach(`path d="${fuenfeck(cx, cy, p)}"`, SCHIEFER, false),
    ...Array.from({ length: 5 }, (_, i) => {
      const w = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
      const x1 = cx + Math.cos(w) * p;
      const y1 = cy + Math.sin(w) * p;
      const x2 = cx + Math.cos(w) * r * 0.9;
      const y2 = cy + Math.sin(w) * r * 0.9;
      return strich(`M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`, 2, SCHIEFER);
    }),
  ];
}

/** Katzenkopf von vorn: Ohren, Fell, Augen, Nase, Schnurrhaare; offen: Maul auf. @returns {Stueck[]} */
function katzenkopf(cx, cy, r, offen = false) {
  const ohr = (/** @type {number} */ s) => pf(`M${cx + s * r * 0.95} ${cy - r * 0.2} L${cx + s * r * 0.72} ${cy - r * 1.28} L${cx + s * r * 0.18} ${cy - r * 0.86} Z`, FELL_KATZE, cx + s * r * 0.6, cy - r * 0.8);
  return [
    ohr(-1),
    ohr(1),
    pf(`M${cx + r * 0.78} ${cy - r * 0.7} L${cx + r * 0.66} ${cy - r * 1.05} L${cx + r * 0.38} ${cy - r * 0.82} Z`, KORALLE, cx + r * 0.6, cy - r * 0.86),
    pf(`M${cx - r * 0.78} ${cy - r * 0.7} L${cx - r * 0.66} ${cy - r * 1.05} L${cx - r * 0.38} ${cy - r * 0.82} Z`, KORALLE, cx - r * 0.7, cy - r * 0.86),
    el(cx, cy, r, r * 0.92, FELL_KATZE),
    n(`M${cx - r * 0.2} ${cy - r * 0.82} L${cx - r * 0.12} ${cy - r * 0.5}`, FELL_KATZE),
    n(`M${cx + r * 0.2} ${cy - r * 0.82} L${cx + r * 0.12} ${cy - r * 0.5}`, FELL_KATZE),
    punkt(cx - r * 0.38, cy - r * 0.08, r * 0.1),
    punkt(cx + r * 0.38, cy - r * 0.08, r * 0.1),
    pf(`M${cx - r * 0.1} ${cy + r * 0.12} L${cx + r * 0.1} ${cy + r * 0.12} L${cx} ${cy + r * 0.24} Z`, KORALLE, cx, cy + r * 0.15),
    offen
      ? flach(`ellipse cx="${cx}" cy="${cy + r * 0.5}" rx="${r * 0.2}" ry="${r * 0.26}"`, "#7A2E2E", false)
      : strich(`M${cx} ${cy + r * 0.24} Q${cx - r * 0.12} ${cy + r * 0.42} ${cx - r * 0.3} ${cy + r * 0.34} M${cx} ${cy + r * 0.24} Q${cx + r * 0.12} ${cy + r * 0.42} ${cx + r * 0.3} ${cy + r * 0.34}`, 1.8),
    strich(`M${cx - r * 0.55} ${cy + r * 0.16} L${cx - r * 1.12} ${cy + r * 0.04} M${cx - r * 0.55} ${cy + r * 0.3} L${cx - r * 1.1} ${cy + r * 0.38} M${cx + r * 0.55} ${cy + r * 0.16} L${cx + r * 1.12} ${cy + r * 0.04} M${cx + r * 0.55} ${cy + r * 0.3} L${cx + r * 1.1} ${cy + r * 0.38}`, 1.4),
  ];
}

/** Hundekopf von vorn mit Schlappohren; offen: Maul auf. @returns {Stueck[]} */
function hundekopf(cx, cy, r, offen = false) {
  return [
    pf(`M${cx - r * 0.78} ${cy - r * 0.6} Q${cx - r * 1.45} ${cy - r * 0.2} ${cx - r * 1.12} ${cy + r * 0.7} Q${cx - r * 0.7} ${cy + r * 0.7} ${cx - r * 0.55} ${cy - r * 0.1} Z`, HOLZ_DUNKEL, cx - r * 1.0, cy),
    pf(`M${cx + r * 0.78} ${cy - r * 0.6} Q${cx + r * 1.45} ${cy - r * 0.2} ${cx + r * 1.12} ${cy + r * 0.7} Q${cx + r * 0.7} ${cy + r * 0.7} ${cx + r * 0.55} ${cy - r * 0.1} Z`, HOLZ_DUNKEL, cx + r * 0.9, cy),
    el(cx, cy, r, r * 0.94, FELL_HUND),
    el(cx, cy + r * 0.34, r * 0.56, r * 0.46, CREME),
    punkt(cx - r * 0.38, cy - r * 0.2, r * 0.1),
    punkt(cx + r * 0.38, cy - r * 0.2, r * 0.1),
    el(cx, cy + r * 0.14, r * 0.17, r * 0.12, TINTE_DUNKEL),
    offen
      ? pf(`M${cx - r * 0.32} ${cy + r * 0.34} Q${cx} ${cy + r * 0.95} ${cx + r * 0.32} ${cy + r * 0.34} Z`, "#7A2E2E", cx, cy + r * 0.5)
      : strich(`M${cx} ${cy + r * 0.26} L${cx} ${cy + r * 0.4} M${cx} ${cy + r * 0.4} Q${cx - r * 0.18} ${cy + r * 0.56} ${cx - r * 0.34} ${cy + r * 0.42} M${cx} ${cy + r * 0.4} Q${cx + r * 0.18} ${cy + r * 0.56} ${cx + r * 0.34} ${cy + r * 0.42}`, 1.8),
  ];
}

/** Menschenkopf neutral (nur für Tätigkeiten: gähnen). */
function kopfGaehnen() {
  const haut = "#D9A06E";
  return [
    el(50, 52, 34, 36, haut),
    pf("M17 48 Q16 16 50 14 Q84 16 83 48 Q76 30 50 30 Q24 30 17 48 Z", "#4A3426", 40, 24),
    strich("M31 46 Q37 41 43 46", 2.4),
    strich("M57 46 Q63 41 69 46", 2.4),
    flach(`ellipse cx="50" cy="69" rx="10" ry="13"`, "#7A2E2E", false),
    flach(`ellipse cx="50" cy="75" rx="6" ry="5"`, "#E57B7B", false),
    pf("M64 70 Q76 70 74 82 Q70 90 60 86 Q56 80 64 70 Z", haut, 64, 76),
    n("M66 80 Q68 76 72 78", haut),
  ];
}

/** Schall: drei Bögen rechts neben einem Kopf. @param {number} x @param {number} y @returns {Stueck[]} */
const schall = (x, y) => [
  strich(`M${x} ${y - 7} Q${x + 7} ${y} ${x} ${y + 7}`, 2.6),
  strich(`M${x + 8} ${y - 13} Q${x + 19} ${y} ${x + 8} ${y + 13}`, 2.6),
  strich(`M${x + 16} ${y - 19} Q${x + 31} ${y} ${x + 16} ${y + 19}`, 2.6),
];

/** @type {Record<string, Stueck[]>} */
const BILDER = {
  ball: ball(),
  katze: [
    dick("M70 86 Q96 80 90 52", FELL_KATZE, 9),
    pf("M26 88 Q22 56 50 54 Q78 56 74 88 Q50 98 26 88 Z", FELL_KATZE, 38, 66),
    n("M32 70 L40 72 M30 80 L38 80 M68 70 L60 72", FELL_KATZE),
    el(36, 90, 9, 5, heller(FELL_KATZE, 0.1)),
    el(64, 90, 9, 5, heller(FELL_KATZE, 0.1)),
    ...katzenkopf(50, 38, 21),
  ],
  hund: [
    dick("M72 80 Q92 74 88 56", FELL_HUND, 8),
    pf("M26 90 Q20 58 50 56 Q80 58 74 90 Q50 98 26 90 Z", FELL_HUND, 38, 68),
    el(37, 91, 9, 5, heller(FELL_HUND, 0.1)),
    el(63, 91, 9, 5, heller(FELL_HUND, 0.1)),
    ...hundekopf(50, 36, 21),
  ],
  baum: [
    pf("M42 94 L44 54 L56 54 L58 94 Z", HOLZ, 46, 70),
    n("M48 62 L49 88", HOLZ),
    el(30, 50, 19, 17, BLATT),
    el(70, 50, 19, 17, BLATT),
    el(50, 32, 25, 22, WIESE),
    el(50, 56, 18, 12, BLATT),
  ],
  haus: [
    rc(14, 46, 72, 46, 3, CREME),
    pf("M6 50 L50 12 L94 50 Z", ROT, 30, 32),
    rc(42, 64, 17, 28, 3, HOLZ),
    el(55, 78, 1.8, 1.8, HOLZ_DUNKEL),
    rc(21, 58, 14, 14, 2, WASSER),
    rc(65, 58, 14, 14, 2, WASSER),
    n("M28 58 L28 72 M21 65 L35 65", WASSER),
    n("M72 58 L72 72 M65 65 L79 65", WASSER),
    rc(66, 18, 8, 16, 2, KORALLE),
  ],
  apfel: [
    pf("M50 30 Q22 20 14 48 Q8 78 34 90 Q44 96 50 92 Q56 96 66 90 Q92 78 86 48 Q78 20 50 30 Z", ROT, 32, 48),
    n("M50 31 Q50 22 53 14", ROT),
    pf("M52 22 Q66 6 80 14 Q68 28 52 22 Z", BLATT, 62, 16),
    strich("M30 52 Q31 44 38 40", 2.4, heller(ROT, 0.5)),
  ],
  schuh: [
    pf("M10 54 Q10 34 28 34 L46 34 Q50 48 70 52 Q92 56 92 72 L92 80 L10 80 Z", WASSER, 30, 46),
    rc(8, 74, 86, 12, 6, WEISS),
    pf("M10 54 Q10 34 28 34 L34 34 L34 60 L10 60 Z", heller(WASSER, 0.2), 18, 44),
    strich("M38 40 L48 46 M42 46 L52 52 M47 52 L56 57", 2.6, WEISS),
    el(30, 80, 2, 2, WEISS),
  ],
  tasse: [
    ...[0].map(() => ({ svg: `<path d="M64 42 Q94 40 90 62 Q86 78 64 72" fill="none" stroke="${WEISS}" stroke-width="8" stroke-linecap="round"/>`, kontur: `<path d="M64 42 Q94 40 90 62 Q86 78 64 72" fill="none" stroke-width="11.4" stroke-linecap="round"/>` })),
    el(50, 86, 38, 7, heller(KORALLE, 0.1)),
    pf("M16 30 L78 30 L72 72 Q47 90 22 72 Z", WEISS, 32, 42),
    pf("M16 30 L78 30 L78 38 Q47 46 16 38 Z", KORALLE, 30, 32),
    el(47, 31, 31, 5, dunkler(KORALLE, 0.15)),
    flach(`circle cx="34" cy="58" r="3"`, KORALLE, false),
    flach(`circle cx="52" cy="64" r="3"`, KORALLE, false),
    flach(`circle cx="44" cy="50" r="3"`, KORALLE, false),
  ],
  gaehnen: kopfGaehnen(),
  bellen: [...hundekopf(36, 54, 26, true), ...schall(70, 50)],
  miauen: [...katzenkopf(38, 54, 25, true), ...schall(72, 50)],
  rollen: [
    ...ball(60, 62, 27),
    strich("M6 48 L24 48 M2 62 L20 62 M8 76 L26 76", 3.2),
    strich("M34 28 Q60 10 88 30", 2.6),
    pf("M86 20 L92 34 L78 33 Z", TINTE_DUNKEL, 86, 28),
  ],
  huepfen: [
    el(50, 90, 24, 5, "#D8D2E3"),
    ...ball(50, 44, 24),
    strich("M12 80 Q22 40 34 28", 2.6),
    strich("M88 80 Q78 40 66 28", 2.6),
    strich("M42 74 L42 68 M50 76 L50 68 M58 74 L58 68", 2.4),
  ],
};

const zz = zeichner("g01bild", 2);

/** Gibt es zu dieser Kennung ein Bild? @param {string | null | undefined} id */
export const hatBild = (id) => !!id && Object.hasOwn(BILDER, id);

/** Alle Kennungen. */
export const BILD_IDS = Object.keys(BILDER);

/** Das Bild als SVG-Text (Feld 0 0 100 100, aria-hidden). @param {string} id */
export function bildSvg(id) {
  const teile = BILDER[id];
  if (!teile) throw new Error(`G01: kein Bild „${id}“`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 104 104" aria-hidden="true" focusable="false">${zz.guss(zusammen(...teile))}</svg>`;
}
