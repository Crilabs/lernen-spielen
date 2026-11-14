// Lena – figuren.md §2: helle Haut, rote Locken, Sommersprossen, zwei Hörgeräte (sichtbar, türkis). Läuft, hüpft.
// Mag Käfer und Steine sammeln, wohnt auf einem Bauernhof: Latzhose über kurzärmeligem Shirt.
// Stil wie Ela (figuren.md §4): Silhouette, Schatten in Stufen, Farben aus den Welt-Paletten.

import { meldeKind } from "../bestand.js";
import { dreiviertel, profil, flaeche } from "./schnitt.js";
import * as S from "./stil.js";

const farben = {
  haut: "#F6D5BF", haar: "#B5532E", oben: "#F6E1B5", latz: "#5E9C77", unten: "#5E9C77",
  schuhe: "#F4C98E", sohle: "#FFFCF7", kurzarm: true, wangen: 0.4,
};
const HOERGERAET = "#2FB3AE";

// Lange Locken hinter dem Kopf bis zur Schulter (im Uhrzeigersinn, Buckel nach außen).
const HINTEN = /** @type {[number, number][]} */ ([
  [163, 22], [182, 24], [198, 32], [209, 45], [214, 62], [215, 80], [214, 98], [209, 114], [198, 122],
  [190, 112], [184, 98], [162, 92], [140, 98], [133, 112], [126, 122], [115, 114], [110, 98], [109, 80], [111, 62], [117, 46], [129, 32], [145, 24],
]);
// Schopf vorn: über den Kopf, dann am Haaransatz als Lockenrand zurück; links endet er über dem Ohr.
const VORN = /** @type {[number, number][]} */ ([
  [118, 70], [119, 54], [126, 40], [138, 30], [151, 25], [164, 23], [178, 25], [191, 31], [201, 41], [207, 54],
  [209, 70], [211, 86],
  [203, 74], [199, 62], [190, 55], [180, 54], [170, 52], [159, 53], [149, 55], [139, 58], [130, 63],
]);
/** Lockenkerben und Lichtflächen im Schopf. */
const KRINGEL = /** @type {[number, number][]} */ ([
  [134, 42], [147, 33], [160, 29], [173, 30], [186, 35], [196, 44], [141, 52], [155, 42], [168, 40], [181, 43], [193, 53], [203, 66],
]);
const kringel = (/** @type {[number, number][]} */ punkte, /** @type {string} */ farbe) => ({
  svg: punkte.map(([x, y]) => `<path d="M${x - 5} ${y} Q${x} ${y + 5} ${x + 5} ${y} Q${x} ${y + 2.2} ${x - 5} ${y} Z" fill="${S.dunkler(farbe, 0.4)}" stroke="none"/>`
    + `<path d="M${x - 3.5} ${y - 3.5} Q${x} ${y - 6} ${x + 2.5} ${y - 4} Q${x} ${y - 4} ${x - 3.5} ${y - 3.5} Z" fill="${S.heller(farbe, 0.3)}" stroke="none"/>`).join(""),
  kontur: "",
});
const HINTEN_KRINGEL = /** @type {[number, number][]} */ ([[115, 84], [115, 102], [123, 114], [209, 82], [209, 100], [201, 114], [205, 62], [118, 64]]);

/** Ohr mit Hörgerät dahinter (Schlauch bis in den Gehörgang); am anderen Kopfrand das zweite Gerät. */
const ohr = S.zusammen(
  // zweites Gerät, ragt rechts hinter dem Kopf hervor
  S.form(S.pfad("M204 70 C210 68 214 74 213 82 C212 88 208 92 205 91 Z"), HOERGERAET, [206, 72], { s: 0.8 }),
  // Gerät hinter dem linken Ohr
  S.form(S.pfad("M116 68 C110 70 108 80 110 90 C111 95 115 96 118 93 L120 72 Z"), HOERGERAET, [113, 72], { s: 0.8 }),
  S.form(S.oval(123, 82, 7.5, 10.5), farben.haut, [120, 77], { s: 0.8 }),
  S.naht("M125 76 Q119 82 125 89", farben.haut, 2.2),
  { svg: `<path d="M117 70 Q121 64 125 70 Q126 76 124 80" fill="none" stroke="${S.dunkler(HOERGERAET, 0.35)}" stroke-width="2.4"/>`, kontur: "" },
);

const sommersprossen = {
  svg: [[146, 93], [151, 97], [155, 92], [143, 98], [184, 91], [189, 95], [180, 95], [193, 90], [168, 88], [175, 86]]
    .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.3" fill="#C98060" opacity="0.85" stroke="none"/>`).join(""),
  kontur: "",
};

const PONY = VORN.slice(12).map(([x, y]) => /** @type {[number, number]} */ ([x, y + 4]));
const kopfDreiviertel = {
  ohr,
  ponyschatten: {
    // nur die Lockenbögen des Haaransatzes, oben gerade geschlossen (sonst wölbt sich der Schatten über den Kopf)
    svg: `<path d="${S.buckel(PONY, 1).replace(/ A[^A]*Z$/, "")} L${PONY[PONY.length - 1][0]} 44 L${PONY[0][0]} 44 Z" fill="${S.dunkler(farben.haut, 0.26)}" stroke="none"/>`
      + sommersprossen.svg,
    kontur: "",
  },
  haareHinten: S.zusammen(
    S.flach(S.pfad(S.buckel(HINTEN, 0.6)), S.dunkler(farben.haar, 0.12)),
    S.falte("M204 40 C214 58 216 92 208 116 L201 118 C207 96 207 66 198 46 Z", farben.haar, 0.38),
    kringel(HINTEN_KRINGEL, S.dunkler(farben.haar, 0.12)),
  ),
  haareOben: S.zusammen(
    S.flach(S.pfad(S.buckel(VORN, 1)), farben.haar),
    S.falte("M186 28 C200 34 208 48 209 66 L210 84 L205 76 C204 66 201 58 196 52 C192 44 186 37 180 32 Z", farben.haar, 0.26),
    kringel(KRINGEL, farben.haar),
  ),
};

// Profil vorerst schlicht (folgt mit dem Profil aller Kinder).
const kopfProfil = {
  haareHinten: flaeche("M164 22 C196 22 214 44 212 70 C212 96 206 118 190 126 C170 130 140 128 122 116 C110 100 112 70 118 50 C126 32 142 22 164 22 Z", farben.haar),
  haareOben: flaeche("M206 62 C198 52 188 48 176 50 C164 52 152 56 146 62 C140 74 140 88 138 100 C126 100 120 90 120 76"
    + " C120 44 140 24 166 24 C192 24 208 40 206 62 Z", farben.haar),
};

meldeKind({
  id: "lena",
  name: "Lena",
  pronomen: "sie",
  bewegt: "geht",
  stil: { "--braue": "#8A3A22" },
  ansichten: {
    dreiviertel: dreiviertel({ breite: 1, farben, kopf: kopfDreiviertel }),
    profil: profil({ breite: 1, farben, kopf: kopfProfil }),
  },
});
