// Ela – figuren.md §2: mittelbraune Haut, kurze dunkle Haare mit Haarspange, Brille. Läuft, klettert.
// Farben aus den Welt-Paletten, freigegeben 2026-11-14 (figuren.md §4).

import { meldeKind } from "../bestand.js";
import { dreiviertel, profil, ellipse, flaeche, INK } from "./schnitt.js";
import * as S from "./stil.js";

const farben = {
  haut: "#B97E57", haar: "#3A2420", oben: "#FF9F8A", hemd: "#FFFCF7", ringel: "#8FD3EE", unten: "#4F8FB3",
  schuhe: "#9ED8A8", sohle: "#FFFCF7",
};
const BAND = "#8FD3EE";
const BRILLE = "#2E7D8C";
const HAAR_HINTEN = S.dunkler(farben.haar, 0.15);
const HAAR_VORN = S.heller(farben.haar, 0.16);

// Haarschopf aus einem Stück: Rand abwechselnd Kerbe und Spitze. Pony von links nach rechts, dann über den Wirbel zurück.
const SCHOPF = /** @type {[number, number][]} */ ([
  [118, 88], [127, 58], [136, 67], [146, 47], [155, 60], [163, 45], [174, 59], [182, 46], [194, 62], [199, 52], [208, 84],
  [210, 64], [213, 47], [203, 39], [202, 27], [190, 30], [180, 19], [169, 28], [155, 21], [148, 31], [134, 28],
  [132, 40], [120, 45], [123, 56], [115, 67],
]);
/** Kerben: dunkle Keile, die die Locken trennen (Spitze innen, Basis an der Kerbe des Randes). */
const KERBEN = [
  [[127, 58], [133, 42]], [[146, 47], [150, 34]], [[163, 45], [164, 33]], [[182, 46], [180, 34]], [[199, 52], [194, 40]],
  [[203, 39], [193, 45]], [[190, 30], [184, 40]], [[169, 28], [168, 38]], [[148, 31], [152, 41]], [[132, 40], [141, 45]],
];
/** @param {number[]} a @param {number[]} b */
const kerbe = (a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const n = [(-dy / l) * 3.2, (dx / l) * 3.2];
  return `M${a[0] - n[0]} ${a[1] - n[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 1} ${b[0]} ${b[1]} Q${(a[0] + b[0]) / 2 + n[0] * 0.4} ${(a[1] + b[1]) / 2} ${a[0] + n[0]} ${a[1] + n[1]} Z`;
};
/** Lichtflächen auf den Locken (Licht von oben links), als schmale Linsen. */
const LICHT = [
  "M139 46 Q141 38 148 33 Q143 41 143 50 Z", "M157 42 Q158 35 163 30 Q161 37 161 46 Z",
  "M172 41 Q175 34 181 30 Q177 37 176 44 Z", "M136 38 Q142 31 151 28 Q144 34 140 41 Z", "M161 30 Q167 25 175 24 Q168 28 164 33 Z",
];

/** Schatten des Ponys: die Pony-Kerben und -Spitzen, 5 nach unten versetzt, oben geschlossen – nur über der Stirn. */
const PONY = SCHOPF.slice(1, 10).map(([x, y]) => /** @type {[number, number]} */ ([x, y + 5]));
const ponyschatten = {
  svg: `<path d="${S.zacken([[PONY[0][0], 40], ...PONY, [PONY[PONY.length - 1][0], 40]], 0.16)}" fill="${S.dunkler(farben.haut, 0.3)}" stroke="none"/>`,
  kontur: "",
};

/** Haarspange rechts im Pony (Wasserblau, wie früher das Zopfband). */
const spange = S.zusammen(
  S.form(S.pfad("M186 49 Q190 44 197 45 L205 50 Q207 54 203 56 L190 55 Q184 54 186 49 Z"), BAND, [189, 47], { s: 0.82 }),
  { svg: `<path d="M190 50 L201 51" fill="none" stroke="${S.heller(BAND, 0.45)}" stroke-width="2"/>`, kontur: "" },
);

const kopfDreiviertel = {
  ponyschatten,
  // kurzer Nacken: hintere Haarmasse endet hinter dem Kopf
  haareHinten: S.form(S.pfad("M118 78 C114 40 140 22 164 22 C190 22 214 40 210 78 C206 92 200 100 192 104 L134 104 C126 100 120 92 118 78 Z"),
    HAAR_HINTEN, [140, 34], { s: 0.9 }),
  haareOben: S.zusammen(
    S.form(S.pfad(S.zacken(SCHOPF, 0.16)), farben.haar, [138, 32], { s: 0.9 }),
    { svg: KERBEN.map(([a, b]) => `<path d="${kerbe(a, b)}" fill="${S.dunkler(farben.haar, 0.45)}" stroke="none"/>`).join(""), kontur: "" },
    { svg: LICHT.map((d) => `<path d="${d}" fill="${HAAR_VORN}" stroke="none"/>`).join(""), kontur: "" },
    spange,
  ),
  nachGesicht: {
    svg: `<path d="M146 80 a11 11 0 1 0 22 0 a11 11 0 1 0 -22 0 M173 80 a10 10 0 1 0 20 0 a10 10 0 1 0 -20 0`
      + ` M168 79 Q170 77 173 79 M146 79 L126 76 M193 79 L203 77" fill="none" stroke="${BRILLE}" stroke-width="3.4"/>`
      + `<path d="M149 74 a8 8 0 0 1 6 -3 M176 74 a7 7 0 0 1 5 -2.5" fill="none" stroke="#FFFFFF" stroke-width="1.8" opacity="0.7"/>`,
    kontur: "",
  },
};

const kopfProfil = {
  haareHinten: ellipse(158, 66, 44, 42, farben.haar),
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
