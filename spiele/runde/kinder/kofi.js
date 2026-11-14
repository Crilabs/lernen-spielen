// Kofi – figuren.md §2: dunkelbraune Haut, kurze schwarze Locken, schmal. Rennt, springt. Mag malen und Muster legen.
// Stil wie Ela (figuren.md §4): Silhouette, Schatten in Stufen, Farben aus den Welt-Paletten.

import { meldeKind } from "../bestand.js";
import { dreiviertel, profil } from "./schnitt.js";
import * as S from "./stil.js";

const farben = {
  haut: "#7A4A2E", haar: "#1F1716", oben: "#8FB06A", muster: ["#FDE7C4", "#A86E44"], unten: "#6E5A4A",
  schuhe: "#7FB3C9", sohle: "#FFFCF7", wangen: 0.2,
};

// Kurze Locken: ein Schopf mit Buckeln, im Uhrzeigersinn – außen über den Kopf, dann am Haaransatz zurück.
const SCHOPF = /** @type {[number, number][]} */ ([
  [121, 80], [118, 66], [120, 52], [127, 40], [137, 31], [149, 25], [162, 22], [175, 23], [188, 28], [198, 36],
  [205, 47], [209, 60], [208, 75],
  [202, 63], [194, 53], [184, 48], [173, 46], [162, 46], [151, 48], [141, 52], [133, 59], [127, 69],
]);
/** Locken im Schopf: kleine dunkle Bögen (Unterseite jeder Locke). */
const KRINGEL = /** @type {[number, number][]} */ ([
  [132, 46], [145, 36], [158, 31], [171, 31], [184, 35], [195, 43], [140, 55], [153, 43], [166, 40], [179, 42],
  [191, 50], [126, 60], [200, 56], [124, 72], [204, 68],
]);
const kringel = {
  svg: KRINGEL.map(([x, y]) => `<path d="M${x - 4} ${y} Q${x} ${y + 4.5} ${x + 4} ${y} Q${x} ${y + 2} ${x - 4} ${y} Z"`
    + ` fill="${S.dunkler(farben.haar, 0.45)}" stroke="none"/>`
    + `<path d="M${x - 3} ${y - 3} Q${x} ${y - 5} ${x + 2} ${y - 3.5} Q${x} ${y - 3.5} ${x - 3} ${y - 3} Z" fill="${S.heller(farben.haar, 0.22)}" stroke="none"/>`).join(""),
  kontur: "",
};
const ponyschatten = {
  svg: `<path d="${S.buckel(SCHOPF.slice(13).map(([x, y]) => /** @type {[number, number]} */ ([x, y + 4])), 1)}" fill="${S.dunkler(farben.haut, 0.3)}" stroke="none"/>`,
  kontur: "",
};

const kopfDreiviertel = {
  ponyschatten,
  // Locken: Grundton flach (kein Verkleinerungs-Schatten, der an Buckeln Doppelkanten macht), Schatten als Bogen rechts.
  haareOben: S.zusammen(
    S.flach(S.pfad(S.buckel(SCHOPF, 1)), farben.haar),
    S.falte("M184 27 C202 34 213 54 208 76 L203 66 C200 56 196 50 190 46 C186 40 182 34 176 30 Z", S.heller(farben.haar, 0.06), 0.42),
    kringel,
  ),
};

// Profil: kurze Locken als Kappe über Kopf und Nacken, Haaransatz vorn an der Stirn und hinter dem Ohr.
const SCHOPF_P = /** @type {[number, number][]} */ ([
  [132, 98], [121, 84], [118, 66], [123, 48], [135, 34], [150, 26], [167, 23], [183, 26], [196, 34], [204, 46],
  [203, 57], [194, 51], [184, 49], [174, 50], [165, 53], [158, 59], [152, 67], [147, 75], [144, 87], [139, 96],
]);
const KRINGEL_P = /** @type {[number, number][]} */ ([[132, 46], [146, 36], [160, 31], [174, 31], [188, 36], [198, 46], [126, 62], [138, 56], [152, 46], [166, 42], [180, 42], [128, 80], [136, 72], [140, 88]]);
const kopfProfil = {
  ponyschatten: { svg: `<path d="${S.buckel(SCHOPF_P.slice(10, 15).map(([x, y]) => /** @type {[number, number]} */ ([x, y + 4])), 1).replace(/ A[^A]*Z$/, "")} L165 44 L203 44 Z" fill="${S.dunkler(farben.haut, 0.3)}" stroke="none"/>`, kontur: "" },
  haareOben: S.zusammen(
    S.flach(S.pfad(S.buckel(SCHOPF_P, 1)), farben.haar),
    { svg: KRINGEL_P.map(([x, y]) => `<path d="M${x - 4} ${y} Q${x} ${y + 4.5} ${x + 4} ${y} Q${x} ${y + 2} ${x - 4} ${y} Z" fill="${S.dunkler(farben.haar, 0.45)}" stroke="none"/>`
      + `<path d="M${x - 3} ${y - 3} Q${x} ${y - 5} ${x + 2} ${y - 3.5} Q${x} ${y - 3.5} ${x - 3} ${y - 3} Z" fill="${S.heller(farben.haar, 0.22)}" stroke="none"/>`).join(""), kontur: "" },
  ),
};

meldeKind({
  id: "kofi",
  name: "Kofi",
  pronomen: "er",
  bewegt: "geht",
  stil: { "--lippe": "#2A120E", "--mund": "#8E3A40", "--braue": "#140C0B", "--auge": "#120A08" },
  ansichten: {
    dreiviertel: dreiviertel({ breite: 0.9, farben, kopf: kopfDreiviertel }),
    profil: profil({ breite: 0.9, farben, kopf: kopfProfil }),
  },
});
