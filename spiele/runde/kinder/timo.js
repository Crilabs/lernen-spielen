// Timo – figuren.md §2: helle bis olive Haut, glatte hellbraune Haare, länger mit Wirbel, rundlich. Rollstuhl, fährt selbst,
// schnell und geschickt, trägt Dinge auf dem Schoß. Mag backen und abwiegen.
// Stil wie Ela (figuren.md §4): Silhouette, Schatten in Stufen, Farben aus den Welt-Paletten.

import { meldeKind } from "../bestand.js";
import { dreiviertelStuhl, profilStuhl } from "./schnitt.js";
import * as S from "./stil.js";

const farben = {
  haut: "#E8C39E", haar: "#8A5A3A", oben: "#E2B47A", unten: "#7B6A8E", schuhe: "#4F8FB3", sohle: "#FFFCF7",
  kapuze: true, wangen: 0.35,
};

// Glatte, strubbelige Haare, Seitenscheitel links mit Wirbel, der Pony fällt kräftig nach rechts, seitlich bis zur Ohrmitte.
// Ein Schopf aus einem Stück, im Uhrzeigersinn: außen von links unten über den Kopf nach rechts unten,
// dann innen am Gesicht entlang zurück (rechte Seitensträhne, Pony mit Spitzen nach rechts unten, linke Seitensträhne).
const AUSSEN = /** @type {[number, number][]} */ ([
  [116, 94], [110, 80], [110, 60], [119, 41], [133, 27], [147, 21],
  // Wirbel am Scheitel
  [146, 10], [154, 17], [159, 8], [163, 18],
  [175, 18], [191, 22], [204, 32], [213, 49], [216, 69], [214, 88], [211, 97],
]);
const RECHTS = /** @type {[number, number][]} */ ([[207, 88], [204, 94], [205, 80], [203, 66]]);
const PONY_RAND = /** @type {[number, number][]} */ ([
  [199, 73], [194, 56], [186, 70], [181, 51], [172, 66], [167, 46], [157, 60], [151, 42], [141, 51],
]);
const LINKS = /** @type {[number, number][]} */ ([[134, 46], [126, 62], [122, 74], [120, 82], [118, 88]]);
const SCHOPF = [...AUSSEN, ...RECHTS, ...PONY_RAND, ...LINKS];
/** Strähnen: dunkle Keile entlang der Fallrichtung. */
const KERBEN = [
  [[194, 56], [185, 41]], [[181, 51], [173, 37]], [[167, 46], [161, 34]], [[151, 42], [148, 32]],
  [[207, 88], [206, 72]], [[118, 88], [116, 70]], [[204, 32], [197, 45]], [[154, 17], [156, 27]],
];
/** @param {number[]} a @param {number[]} b */
const kerbe = (a, b) => {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const l = Math.hypot(dx, dy);
  const n = [(-dy / l) * 2.6, (dx / l) * 2.6];
  return `M${a[0] - n[0]} ${a[1] - n[1]} Q${(a[0] + b[0]) / 2} ${(a[1] + b[1]) / 2 + 1} ${b[0]} ${b[1]} Q${(a[0] + b[0]) / 2 + n[0] * 0.4} ${(a[1] + b[1]) / 2} ${a[0] + n[0]} ${a[1] + n[1]} Z`;
};
/** Lichtflächen: Glanz auf dem Scheitelbogen und auf den Seitensträhnen. */
const LICHT = [
  "M140 36 Q152 26 168 24 Q154 30 146 40 Z", "M174 26 Q186 27 196 34 Q186 32 178 32 Z",
  "M114 70 Q116 56 122 46 Q119 58 118 72 Z", "M210 60 Q213 70 213 82 Q210 72 207 64 Z",
];

const PONY = [RECHTS[RECHTS.length - 1], ...PONY_RAND, LINKS[0]].map(([x, y]) => /** @type {[number, number]} */ ([x, y + 5]));
const kopfDreiviertel = {
  ponyschatten: {
    svg: `<path d="${S.zacken([[PONY[0][0], 40], ...PONY, [PONY[PONY.length - 1][0], 40]], 0.08)}" fill="${S.dunkler(farben.haut, 0.3)}" stroke="none"/>`,
    kontur: "",
  },
  // Haare hinter dem Kopf, schmal und kurz: seitlich schaut kaum etwas hervor
  haareHinten: S.form(S.pfad("M116 72 C114 36 140 21 164 21 C190 21 213 36 210 72 L208 88 C202 94 196 96 190 96 L136 96 C130 96 122 94 118 88 Z"),
    S.dunkler(farben.haar, 0.15), [134, 34], { s: 0.9 }),
  haareOben: S.zusammen(
    S.form(S.pfad(S.zacken(SCHOPF, 0.07)), farben.haar, [132, 30], { s: 0.92 }),
    { svg: KERBEN.map(([a, b]) => `<path d="${kerbe(a, b)}" fill="${S.dunkler(farben.haar, 0.4)}" stroke="none"/>`).join(""), kontur: "" },
    { svg: LICHT.map((d) => `<path d="${d}" fill="${S.heller(farben.haar, 0.25)}" stroke="none"/>`).join(""), kontur: "" },
  ),
};

// Profil: längere glatte Haare, Pony nach vorn bis über die Brauen, Wirbel am Scheitel, Nacken bis zum Kragen.
// Profil: glatte, längere Haare – gerade geschnitten bis zum Kragen, der Pony hängt über die Stirn, Wirbel am Scheitel.
const SCHOPF_P = /** @type {[number, number][]} */ ([
  [146, 116], [140, 112], [134, 116], [128, 111], [122, 114], [118, 104], [115, 84], [116, 64], [122, 48], [133, 35],
  [146, 28], [147, 16], [155, 24], [161, 14], [166, 24], [182, 26], [196, 34], [204, 46], [205, 60],
  [204, 70], [199, 60], [197, 70], [191, 58], [188, 68], [181, 56], [172, 58],
  [163, 62], [157, 70], [153, 80], [151, 94], [149, 108],
]);
const PONY_P = SCHOPF_P.slice(18, 26).map(([x, y]) => /** @type {[number, number]} */ ([x, y + 5]));
const kopfProfil = {
  ponyschatten: { svg: `<path d="${S.zacken([[PONY_P[0][0], 44], ...PONY_P, [PONY_P[PONY_P.length - 1][0], 44]], 0.08)}" fill="${S.dunkler(farben.haut, 0.3)}" stroke="none"/>`, kontur: "" },
  haareOben: S.zusammen(
    S.form(S.pfad(S.zacken(SCHOPF_P, 0.07)), farben.haar, [134, 32], { s: 0.92 }),
    { svg: [[[199, 60], [194, 44]], [[191, 58], [186, 42]], [[181, 56], [176, 40]], [[140, 112], [138, 88]], [[128, 111], [126, 88]], [[134, 116], [132, 94]], [[155, 24], [156, 34]], [[122, 114], [119, 94]]]
      .map(([a, b]) => `<path d="${kerbe(a, b)}" fill="${S.dunkler(farben.haar, 0.4)}" stroke="none"/>`).join(""), kontur: "" },
    { svg: ["M138 40 Q150 30 166 28 Q152 34 144 44 Z", "M122 66 Q124 54 130 44 Q127 56 126 68 Z"].map((d) => `<path d="${d}" fill="${S.heller(farben.haar, 0.25)}" stroke="none"/>`).join(""), kontur: "" },
  ),
};

meldeKind({
  id: "timo",
  name: "Timo",
  pronomen: "er",
  bewegt: "rollstuhl",
  stil: { "--braue": "#4A2E1E", "--braue-dicke": "4.4" },
  ansichten: {
    dreiviertel: dreiviertelStuhl({ breite: 1.15, farben, kopf: kopfDreiviertel }),
    profil: profilStuhl({ breite: 1.15, farben, kopf: kopfProfil }),
  },
});
