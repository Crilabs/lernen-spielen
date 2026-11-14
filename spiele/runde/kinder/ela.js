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

/** Zopf mit Schattenstufe, aus einem Guss. @param {number} x @param {number} y */
const zopfS = (x, y) => S.zusammen(
  ...[0, 1, 2].map((i) => S.zusammen(
    S.form(S.oval(x, y + i * 14, 9.5 - i, 9), farben.haar, [x - 4, y + i * 14 - 4], { s: 0.8, glanz: false }),
    S.glanz(`M${x - 5} ${y + i * 14 - 3} Q${x - 1} ${y + i * 14 - 6} ${x + 3} ${y + i * 14 - 5}`, farben.haar, 2.4),
  )),
  S.form(S.pfad(`M${x - 8} ${y + 38} l8 -6 l8 6 l-8 6 Z`), BAND, [x - 3, y + 36], { s: 0.8 }),
);

/** Haarsträhne als geschwungene, spitz zulaufende Form, etwas heller als die Haarmasse. @param {string} d */
const straehne = (d) => S.form(S.pfad(d), S.heller(farben.haar, 0.12), [150, 30], { s: 0.92 });

const kopfDreiviertel = {
  haareHinten: S.zusammen(
    S.form(S.oval(162, 66, 46, 43), farben.haar, [146, 44], { s: 0.9, glanz: false }),
    zopfS(118, 100), zopfS(205, 96),
  ),
  haareOben: S.zusammen(
    S.form(S.pfad(
      "M119 86 C111 44 136 23 164 23 C194 23 213 42 207 80 C204 68 198 60 191 57 C187 64 179 66 172 59"
      + " C166 66 154 66 149 57 C141 61 133 68 126 78 Z",
    ), farben.haar, [140, 32], { s: 0.9, glanz: false }),
    straehne("M150 58 C146 44 152 30 166 26 C158 34 156 46 160 60 Z"),
    straehne("M176 60 C182 46 180 34 172 27 C188 32 194 46 190 58 Z"),
    straehne("M131 74 C128 56 136 40 150 32 C142 44 138 58 140 70 Z"),
    S.glanz("M136 52 C142 40 152 33 164 31 M176 34 C186 38 194 46 198 56 M152 50 C154 42 158 37 164 34", farben.haar, 3.4),
    S.glanz("M140 44 C146 37 154 33 160 32", farben.haar, 5),
    S.falte("M149 57 C154 64 166 66 172 59 C166 62 156 62 149 57 Z", farben.haar, 0.35),
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
