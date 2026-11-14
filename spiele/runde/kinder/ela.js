// Ela – figuren.md §2: mittelbraune Haut, dunkle Haare in zwei Zöpfen, Brille. Läuft, klettert.
// Kleidung Senfgelb gedämpft (vorläufig bis zur Freigabe der ersten Zeichnung, figuren.md §9).

import { meldeKind } from "../bestand.js";
import { dreiviertel, profil, ellipse, flaeche, INK } from "./schnitt.js";
import * as S from "./stil.js";

const farben = {
  haut: "#B97E57", haar: "#3A2420", oben: "#FF9F8A", hemd: "#FFFCF7", ringel: "#8FD3EE", unten: "#4F8FB3",
  schuhe: "#9ED8A8", sohle: "#FFFCF7",
};
const BAND = "#8FD3EE";
const BRILLE = "#2E7D8C";

/** Zopf aus drei Gliedern mit Band (alter Stil, Profil). @param {number} x @param {number} y */
const zopf = (x, y) =>
  [0, 1, 2].map((i) => ellipse(x, y + i * 15, 9 - i, 9, farben.haar)).join("")
  + `<path d="M${x - 7} ${y + 40} l7 -5 l7 5 l-7 5 Z" fill="${BAND}" stroke-width="3"/>`;

const HAAR_HINTEN = S.dunkler(farbe("haar"), 0.15);
const HAAR_VORN = S.heller(farbe("haar"), 0.16);
/** @param {string} k */
function farbe(k) { return /** @type {Record<string, string>} */ (farben)[k]; }

/** Zopf aus drei Gliedern, jedes mit Licht als Fläche. @param {number} x @param {number} y */
const zopfS = (x, y) => S.zusammen(
  ...[0, 1, 2].map((i) => {
    const cy = y + i * 14;
    return S.zusammen(
      S.form(S.oval(x, cy, 9.5 - i, 9), farben.haar, [x - 4, cy - 4], { s: 0.8 }),
      S.locke([x - 7, cy - 4], [x + 6, cy + 2], 5, -2, HAAR_VORN, { licht: true }),
    );
  }),
  S.form(S.pfad(`M${x - 8} ${y + 38} l8 -6 l8 6 l-8 6 Z`), BAND, [x - 3, y + 36], { s: 0.8 }),
);

/** Locke vorn (heller, mit Licht). @param {[number, number]} b @param {[number, number]} t @param {number} w @param {number} bg */
const vorn = (b, t, w, bg) => S.locke(b, t, w, bg, HAAR_VORN, { licht: true });
/** Locke hinten (dunkler). @param {[number, number]} b @param {[number, number]} t @param {number} w @param {number} bg */
const hinten = (b, t, w, bg) => S.locke(b, t, w, bg, farben.haar);

const kopfDreiviertel = {
  haareHinten: S.zusammen(
    S.form(S.oval(162, 66, 46, 43), HAAR_HINTEN, [146, 44], { s: 0.9 }),
    zopfS(118, 100), zopfS(205, 96),
  ),
  haareOben: S.zusammen(
    // Kappe über dem Schädel, unten offen für die Stirn
    S.form(S.pfad("M119 82 C113 42 138 23 164 23 C195 23 213 42 207 78 C200 60 186 48 164 46 C142 46 126 58 119 82 Z"),
      farben.haar, [140, 32], { s: 0.9 }),
    // Wirbel oben: kleine Büschel, die aus der Silhouette ragen
    hinten([146, 34], [134, 24], 16, -4),
    hinten([162, 30], [160, 19], 16, 4),
    hinten([178, 32], [190, 23], 16, 4),
    hinten([196, 46], [208, 44], 14, 4),
    vorn([138, 38], [128, 30], 12, -3),
    vorn([170, 29], [175, 21], 12, 3),
    // seitliche Strähne vor dem Ohr
    hinten([126, 56], [116, 94], 14, -5),
    // Pony: Locken fallen über die Stirn, nach rechts geschwungen
    hinten([130, 44], [121, 80], 16, -4),
    hinten([196, 44], [208, 78], 16, 4),
    vorn([142, 38], [140, 68], 17, -5),
    vorn([156, 36], [162, 66], 17, 4),
    vorn([172, 36], [184, 63], 17, 5),
    vorn([186, 40], [200, 66], 15, 5),
    vorn([150, 40], [150, 60], 12, 3),
  ),
  nachGesicht: {
    svg: `<path d="M146 80 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 M173 80 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0`
      + ` M168 79 Q170 77 173 79 M146 79 L126 76" fill="none" stroke="${BRILLE}" stroke-width="3.4"/>`
      + `<path d="M149 74 a8 8 0 0 1 6 -3 M176 74 a7 7 0 0 1 5 -2.5" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.7"/>`,
    kontur: "",
  },
};

const kopfProfil = {
  haareHinten: ellipse(158, 66, 44, 42, farben.haar) + zopf(130, 100),
  haareOben: flaeche(
    "M206 62 C198 52 188 49 178 50 C168 56 156 58 146 62 C142 74 142 88 140 102 C128 106 120 94 122 78 C122 44 140 25 166 25 C192 25 208 40 206 62 Z",
    farben.haar,
  ),
  nachGesicht: `<g fill="none" stroke="${INK}"><circle cx="188" cy="80" r="10" stroke-width="3.5"/>`
    + `<path d="M178 79 L157 77" stroke-width="3"/></g>`,
};

meldeKind({
  id: "ela",
  name: "Ela",
  pronomen: "sie",
  bewegt: "geht",
  ansichten: {
    dreiviertel: dreiviertel({ breite: 1, farben, kopf: kopfDreiviertel }),
    profil: profil({ breite: 1, farben, kopf: kopfProfil }),
  },
});
