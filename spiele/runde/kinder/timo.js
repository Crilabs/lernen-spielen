// Timo – figuren.md §2: helle bis olive Haut, glatte hellbraune Haare bis zum Kinn, rundlich. Rollstuhl, fährt selbst,
// schnell und geschickt, trägt Dinge auf dem Schoß. Mag backen und abwiegen.
// Stil wie Ela (figuren.md §4): Silhouette, Schatten in Stufen, Farben aus den Welt-Paletten.

import { meldeKind } from "../bestand.js";
import { dreiviertelStuhl, profilStuhl, flaeche } from "./schnitt.js";
import * as S from "./stil.js";

const farben = {
  haut: "#E8C39E", haar: "#8A5A3A", oben: "#E2B47A", unten: "#7B6A8E", schuhe: "#4F8FB3", sohle: "#FFFCF7",
  kapuze: true, wangen: 0.35,
};

// Glatte, strubbelige Haare bis zum Kinn, Seitenscheitel links, der Pony fällt kräftig nach rechts, seitlich über die Ohren.
// Ein Schopf aus einem Stück, im Uhrzeigersinn: außen von links unten über den Kopf nach rechts unten,
// dann innen am Gesicht entlang zurück (rechte Seitensträhne, Pony mit Spitzen nach rechts unten, linke Seitensträhne).
const SCHOPF = /** @type {[number, number][]} */ ([
  [113, 117], [109, 98], [108, 80], [110, 60], [119, 41], [133, 27], [151, 20], [171, 18], [190, 22], [204, 32], [213, 49],
  [217, 70], [217, 92], [215, 106], [213, 118],
  [209, 106], [206, 113], [205, 96], [205, 82], [203, 66],
  [199, 73], [194, 56], [186, 70], [181, 51], [172, 66], [167, 46], [157, 60], [151, 42], [141, 51],
  [134, 46], [126, 62], [122, 82], [121, 98], [119, 110], [116, 104],
]);
/** Strähnen: dunkle Keile entlang der Fallrichtung. */
const KERBEN = [
  [[193, 54], [184, 40]], [[180, 50], [172, 36]], [[166, 46], [160, 34]], [[151, 43], [148, 33]],
  [[206, 104], [204, 80]], [[121, 100], [118, 76]], [[203, 33], [196, 46]], [[134, 28], [140, 40]],
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
  "M114 70 Q116 56 122 46 Q119 58 118 72 Z", "M210 62 Q213 74 213 88 Q210 76 207 66 Z",
];

const PONY = SCHOPF.slice(20, 30).map(([x, y]) => /** @type {[number, number]} */ ([x, y + 5]));
const kopfDreiviertel = {
  ponyschatten: {
    svg: `<path d="${S.zacken([[PONY[0][0], 40], ...PONY, [PONY[PONY.length - 1][0], 40]], 0.08)}" fill="${S.dunkler(farben.haut, 0.3)}" stroke="none"/>`,
    kontur: "",
  },
  // Haare hinter dem Kopf bis zum Kinn (sichtbar neben Wangen und Hals)
  haareHinten: S.form(S.pfad("M110 72 C108 34 138 20 164 20 C192 20 218 34 216 72 L216 112 C206 118 196 116 190 110 L136 110 C130 116 118 118 110 112 Z"),
    S.dunkler(farben.haar, 0.15), [134, 34], { s: 0.9 }),
  haareOben: S.zusammen(
    S.form(S.pfad(S.zacken(SCHOPF, 0.07)), farben.haar, [132, 30], { s: 0.92 }),
    { svg: KERBEN.map(([a, b]) => `<path d="${kerbe(a, b)}" fill="${S.dunkler(farben.haar, 0.4)}" stroke="none"/>`).join(""), kontur: "" },
    { svg: LICHT.map((d) => `<path d="${d}" fill="${S.heller(farben.haar, 0.25)}" stroke="none"/>`).join(""), kontur: "" },
  ),
};

// Profil vorerst schlicht (folgt mit dem Profil aller Kinder).
const kopfProfil = {
  haareOben: flaeche("M206 62 C198 52 186 47 174 49 C164 50 154 54 148 60 C144 70 144 84 142 96 C130 98 122 88 122 74"
    + " C122 42 142 24 166 24 C190 24 208 40 206 62 Z", farben.haar),
};

meldeKind({
  id: "timo",
  name: "Timo",
  pronomen: "er",
  bewegt: "rollstuhl",
  stil: { "--braue": "#5A3A26" },
  ansichten: {
    dreiviertel: dreiviertelStuhl({ breite: 1.15, farben, kopf: kopfDreiviertel }),
    profil: profilStuhl({ breite: 1.15, farben, kopf: kopfProfil }),
  },
});
