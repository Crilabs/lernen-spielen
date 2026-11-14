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
// Oben: Haarmasse hinter dem Kopf (Kopf-Ebene).
const HINTEN = fein(/** @type {[number, number][]} */ ([
  [163, 25], [180, 26], [195, 32], [205, 44], [209, 60], [210, 80], [208, 98], [198, 102], [162, 94],
  [126, 102], [115, 98], [113, 80], [115, 60], [120, 44], [131, 32], [146, 26],
]));
// Die langen Vorhänge hängen hinter Rumpf und Armen (Ebene „zoepfe“ im koerper), damit die Arme davor liegen.
const VORHANG_L = fein(/** @type {[number, number][]} */ ([
  [114, 86], [123, 88], [130, 96], [131, 114], [131, 132], [128, 146], [121, 150], [115, 140], [113, 120], [114, 100],
]));
const VORHANG_R = fein(/** @type {[number, number][]} */ ([
  [192, 88], [208, 86], [210, 102], [209, 120], [210, 138], [204, 150], [196, 146], [193, 132], [193, 114], [191, 98],
]));
// Schopf vorn: feine Locken am Haaransatz; links endet er über dem Ohr (Hörgerät bleibt frei).
const VORN = /** @type {[number, number][]} */ ([
  [119, 70], [120, 55], [127, 42], [138, 33], [151, 28], [164, 26], [177, 28], [189, 33], [198, 42], [204, 54],
  [206, 70], [207, 86],
  [206, 84], [204, 76], [201, 68], [198, 61], [193, 56], [187, 54], [181, 55], [175, 53], [169, 52], [163, 53],
  [157, 53], [151, 54], [145, 56], [139, 58], [134, 61], [129, 64],
]);
/** Strähnenkeile wie bei Ela: breit an der Kerbe, spitz im Haar, der Welle nach gebogen.
 * @param {Array<[[number, number], [number, number], number, number]>} liste [Ansatz, Spitze, Breite, Bogen] @param {string} farbe */
const keile = (liste, farbe) => ({
  svg: liste.map(([a, b, w, bg]) => `<path d="${S.keil(a, b, w, bg)}" fill="${farbe}" stroke="none"/>`).join(""),
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
  zoepfe: S.zusammen(
    S.flach(S.pfad(S.buckel(VORHANG_L, 0.42)), HAAR_HINTEN),
    S.flach(S.pfad(S.buckel(VORHANG_R, 0.42)), HAAR_HINTEN),
    S.falte("M205 90 C209 104 209 124 209 138 L203 148 L198 144 C203 128 203 108 201 92 Z", HAAR_HINTEN, 0.34),
    keile([
      [[121, 150], [118, 120], 3, 3], [[128, 146], [126, 118], 2.8, -3], [[115, 140], [115, 114], 2.4, 3],
      [[204, 150], [206, 120], 3, -3], [[196, 146], [198, 118], 2.8, 3], [[209, 128], [208, 102], 2.2, -2],
    ], S.dunkler(HAAR_HINTEN, 0.42)),
    lichter(["M114 96 Q119 106 116 118 Q116 106 114 96 Z", "M123 104 Q127 114 125 126 Q124 114 123 104 Z",
      "M201 104 Q205 114 203 126 Q202 114 201 104 Z"], S.heller(HAAR_HINTEN, 0.26)),
  ),
  haareHinten: S.zusammen(
    S.flach(S.pfad(S.buckel(HINTEN, 0.42)), HAAR_HINTEN),
    S.falte("M204 46 C208 62 209 82 208 98 L202 98 C203 82 202 64 198 48 Z", HAAR_HINTEN, 0.34),
  ),
  haareOben: S.zusammen(
    S.flach(S.pfad(S.buckel(VORN, 1)), farben.haar),
    S.falte("M188 31 C198 36 204 46 206 62 L207 84 L203 78 C202 70 200 62 196 56 C192 48 188 41 182 35 Z", farben.haar, 0.26),
    keile([
      [[139, 58], [141, 40], 3, 3], [[157, 53], [155, 34], 3, -3], [[175, 53], [172, 34], 3, 3], [[193, 56], [187, 39], 3, -3],
      [[204, 76], [203, 56], 2.6, 3], [[129, 64], [128, 48], 2.6, -2],
    ], S.dunkler(farben.haar, 0.38)),
    lichter(["M137 42 Q144 33 156 30 Q146 36 141 45 Z", "M160 32 Q168 28 177 29 Q169 31 163 36 Z",
      "M146 46 Q147 38 151 33 Q150 40 149 48 Z", "M180 44 Q182 37 187 33 Q184 40 183 46 Z"], S.heller(farben.haar, 0.3)),
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
