// Lena – figuren.md §2: helle Haut, lange rote Wellenlocken, Sommersprossen, zwei Hörgeräte (sichtbar, türkis). Läuft, hüpft.
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

/** Verdichtet eine Punktliste (Mittelpunkte einfügen), damit die Wellen am Rand feiner werden. @param {[number, number][]} p */
const fein = (p) => p.flatMap((a, i) => {
  const b = p[(i + 1) % p.length];
  return [a, /** @type {[number, number]} */ ([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2])];
});

// Lange Wellenlocken: schmal am Kopf, zwei Haarvorhänge bis über die Schultern. In der Mitte endet das Haar
// hinter dem Hals (kein „Bart“). Im Uhrzeigersinn, feine Wellen am Rand.
const HINTEN = fein(/** @type {[number, number][]} */ ([
  [163, 22], [181, 23], [197, 30], [208, 43], [213, 60], [214, 80], [212, 100], [214, 120], [212, 140], [204, 152],
  [194, 148], [190, 132], [190, 114], [186, 100], [162, 94], [138, 100], [134, 114], [134, 132], [130, 148],
  [120, 152], [112, 140], [110, 120], [112, 100], [110, 80], [112, 60], [118, 43], [130, 30], [146, 23],
]));
// Schopf vorn: feine Locken am Haaransatz; links endet er über dem Ohr (Hörgerät bleibt frei).
const VORN = /** @type {[number, number][]} */ ([
  [118, 70], [119, 54], [126, 40], [138, 30], [151, 25], [164, 23], [178, 25], [191, 31], [201, 41], [207, 54],
  [209, 70], [211, 90],
  [206, 84], [204, 76], [201, 68], [198, 61], [193, 56], [187, 54], [181, 55], [175, 53], [169, 52], [163, 53],
  [157, 53], [151, 54], [145, 56], [139, 58], [134, 61], [129, 64],
]);
/** Wellenlinien (S-Kurven) statt Kringel: Haare fallen in Wellen. @param {number} x @param {number} y @param {number} l @param {number} a Amplitude */
const welle = (x, y, l, a) => `M${x} ${y} q${a} ${l / 4} 0 ${l / 2} q${-a} ${l / 4} 0 ${l / 2}`;
/** Dunkle Wellenrillen zwischen den Strähnen (keine hellen Linien). @param {Array<[number, number, number, number]>} liste @param {string} farbe */
const wellen = (liste, farbe) => ({
  svg: `<path d="${liste.map(([x, y, l, a]) => welle(x, y, l, a)).join(" ")}" fill="none" stroke="${farbe}" stroke-width="2.4"/>`,
  kontur: "",
});
/** Licht als schmale, geschwungene Flächen auf den Wellen. @param {string[]} pfade @param {string} farbe */
const lichter = (pfade, farbe) => ({ svg: pfade.map((d) => `<path d="${d}" fill="${farbe}" stroke="none"/>`).join(""), kontur: "" });
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
const HAAR_HINTEN = S.dunkler(farben.haar, 0.12);
const kopfDreiviertel = {
  ohr,
  ponyschatten: {
    // nur die Lockenbögen des Haaransatzes, oben gerade geschlossen (sonst wölbt sich der Schatten über den Kopf)
    svg: `<path d="${S.buckel(PONY, 1).replace(/ A[^A]*Z$/, "")} L${PONY[PONY.length - 1][0]} 44 L${PONY[0][0]} 44 Z" fill="${S.dunkler(farben.haut, 0.26)}" stroke="none"/>`
      + sommersprossen.svg,
    kontur: "",
  },
  haareHinten: S.zusammen(
    S.flach(S.pfad(S.buckel(HINTEN, 0.42)), HAAR_HINTEN),
    // Schattenseite rechts, ganzer Vorhang
    S.falte("M206 44 C212 62 212 96 210 120 C212 134 210 146 204 152 L198 146 C204 130 204 104 204 84 C204 66 202 54 198 44 Z", HAAR_HINTEN, 0.34),
    wellen([[118, 100, 44, 3], [203, 108, 38, -3], [126, 118, 26, 2.5]], S.dunkler(HAAR_HINTEN, 0.4)),
    lichter(["M114 84 Q118 96 114 108 Q117 96 114 84 Z", "M206 116 Q209 126 206 136 Q208 126 206 116 Z"], S.heller(HAAR_HINTEN, 0.28)),
  ),
  haareOben: S.zusammen(
    S.flach(S.pfad(S.buckel(VORN, 1)), farben.haar),
    S.falte("M188 29 C200 35 207 46 209 62 L211 88 L205 80 C204 70 202 62 197 56 C193 48 188 40 182 34 Z", farben.haar, 0.26),
    wellen([[144, 31, 18, 2.5], [168, 27, 22, 2.5], [190, 36, 18, -2.5], [130, 44, 14, 2]], S.dunkler(farben.haar, 0.36)),
    lichter(["M136 40 Q144 30 156 27 Q146 33 140 43 Z", "M160 30 Q168 26 177 27 Q169 29 163 34 Z"], S.heller(farben.haar, 0.3)),
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
