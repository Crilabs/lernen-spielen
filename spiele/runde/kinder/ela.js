// Ela – figuren.md §2: mittelbraune Haut, dunkle Haare in zwei Zöpfen, Brille. Läuft, klettert.
// Kleidung Senfgelb gedämpft (vorläufig bis zur Freigabe der ersten Zeichnung, figuren.md §9).

import { meldeKind } from "../bestand.js";
import { dreiviertel, profil, ellipse, flaeche, INK } from "./schnitt.js";
import * as S from "./stil.js";

const farben = {
  haut: "#B97E57", haar: "#4A2E2A", oben: "#D9B85C", hemd: "#F7F2EA", unten: "#6F6A86",
  schuhe: "#7C6FA8", sohle: "#FFFCF7",
};
const BAND = "#7FB3C9";

/** Zopf aus drei Gliedern mit Band (alter Stil, Profil). @param {number} x @param {number} y */
const zopf = (x, y) =>
  [0, 1, 2].map((i) => ellipse(x, y + i * 15, 9 - i, 9, farben.haar)).join("")
  + `<path d="M${x - 7} ${y + 40} l7 -5 l7 5 l-7 5 Z" fill="${BAND}" stroke-width="3"/>`;

/** Zopf mit Schattenstufe, aus einem Guss. @param {number} x @param {number} y */
const zopfS = (x, y) => S.zusammen(
  ...[0, 1, 2].map((i) => S.zusammen(
    S.form(S.oval(x, y + i * 14, 9.5 - i, 9), farben.haar, [x - 4, y + i * 14 - 4], { s: 0.8 }),
    S.naht(`M${x - 5} ${y + i * 14 - 2} Q${x} ${y + i * 14 + 3} ${x + 5} ${y + i * 14 - 3}`, farben.haar, 2),
  )),
  S.form(S.pfad(`M${x - 8} ${y + 38} l8 -6 l8 6 l-8 6 Z`), BAND, [x - 3, y + 36], { s: 0.8 }),
);

const kopfDreiviertel = {
  haareHinten: S.zusammen(S.form(S.oval(162, 66, 45, 42), farben.haar, [146, 44], { s: 0.9 }), zopfS(118, 100), zopfS(204, 96)),
  haareOben: S.zusammen(
    S.form(S.pfad(
      "M120 84 C113 42 138 24 164 24 C193 24 211 42 206 78 C203 66 197 59 190 56 C186 63 178 65 171 58"
      + " C165 65 154 65 149 56 C141 60 133 67 127 76 Z",
    ), farben.haar, [140, 34], { s: 0.9 }),
    S.naht("M166 27 Q161 38 166 50 M150 32 Q142 42 140 56 M184 32 Q192 42 194 54", farben.haar, 2.4),
  ),
  nachGesicht: S.tinte("M146 80 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 M173 80 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0"
    + " M168 79 Q170 77 173 79 M146 79 L126 76", 3.2),
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
