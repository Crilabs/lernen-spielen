// Kofi – figuren.md §2: dunkelbraune Haut, kurze schwarze Locken, schmal. Rennt, springt. Mag malen und Muster legen.
// Stil wie Ela (figuren.md §4): Silhouette, Schatten in Stufen, Farben aus den Welt-Paletten.

import { meldeKind } from "../bestand.js";
import { dreiviertel, profil, ellipse, flaeche, INK } from "./schnitt.js";
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

// Profil vorerst im alten Stil (folgt mit dem Profil aller Kinder).
const kopfProfil = {
  haareOben: flaeche("M206 62 C198 50 186 46 174 47 C164 48 154 52 148 60 C144 70 144 84 142 96 C130 98 122 88 122 74"
    + " C122 42 142 24 166 24 C190 24 208 38 206 62 Z", farben.haar),
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
void ellipse; void INK;
