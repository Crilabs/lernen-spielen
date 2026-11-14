// <ls-objekt art="kramkiste">: eine offene Holzkiste mit Kram zum Malen, leicht von vorn gesehen: aus der Kiste ragen
// drei Buntstifte und ein Pinsel, vorn klebt ein leerer Zettel (die Beschriftung der Kiste, ohne Schrift).
// Feld 0…100. Keine Schrift, keine Ziffer.

import { form, flach, naht, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const HOLZ = "#E8BC84";
const ZETTEL = "#FFFCF7";
const KLEBEBAND = "#CFE6F7";
const STIFT_HOLZ = "#F6D9B0";
const MINE = "#5C5470";

/**
 * Ein Buntstift, der schräg aus der Kiste ragt. (x, y) ist der Fuß (in der Kiste), (tx, ty) die Spitze.
 * @param {number} x @param {number} y @param {number} tx @param {number} ty @param {string} farbe
 */
function stift(x, y, tx, ty, farbe) {
  const lang = Math.hypot(tx - x, ty - y);
  const ux = (tx - x) / lang;
  const uy = (ty - y) / lang;
  const nx = -uy * 4;
  const ny = ux * 4;
  // Ende des Schafts, dort beginnt die angespitzte Holzspitze
  const ex = tx - ux * 11;
  const ey = ty - uy * 11;
  const mx = tx - ux * 4;
  const my = ty - uy * 4;
  const schaft = form(pfad(`M${x + nx} ${y + ny} L${ex + nx} ${ey + ny} L${ex - nx} ${ey - ny} L${x - nx} ${y - ny} Z`),
    farbe, [ex - nx * 0.5, ey - ny * 0.5], { s: 0.86 });
  const spitze = form(pfad(`M${ex + nx} ${ey + ny} L${tx} ${ty} L${ex - nx} ${ey - ny} Z`), STIFT_HOLZ, [ex, ey], { s: 0.86 });
  const mine = flach(pfad(`M${mx + nx * 0.36} ${my + ny * 0.36} L${tx} ${ty} L${mx - nx * 0.36} ${my - ny * 0.36} Z`), MINE);
  return zusammen(schaft, spitze, { svg: mine.svg, kontur: "" });
}

/** Ein Pinsel mit hellem Stiel und dunklem Haarbüschel. */
function pinsel() {
  const stiel = form(pfad("M47 44 L50 44 L52 18 L48 18 Z"), "#7FB6E8", [48.5, 22], { s: 0.86 });
  const zwinge = form(pfad("M47.6 18 L52.4 18 L52.6 12 L47.4 12 Z"), "#C9CCD6", [48.2, 13], { s: 0.86 });
  const haare = form(pfad("M47.2 12 Q46 6 50 1 Q54 6 52.8 12 Z"), "#8A6A55", [49, 6], { s: 0.86 });
  return zusammen(stiel, zwinge, haare);
}

/** Die Kiste mit Inhalt als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function kramkisteStueck() {
  // Innenseite der Rückwand: hinterer Rand, dunkel, weil man hineinschaut
  const innen = form(pfad("M15 32 L85 32 L91 42 L9 42 Z"), dunkler(HOLZ, 0.32), [20, 33], { s: 0.92 });
  const rueckkante = flach(pfad("M15 32 L85 32 L85.6 34.4 L14.4 34.4 Z"), heller(HOLZ, 0.15));
  const stifte = zusammen(
    stift(28, 42, 18, 6, "#FF9F8A"),
    stift(38, 42, 36, 4, "#9ED8A8"),
    pinsel(),
    stift(70, 42, 80, 9, "#FFD66B"),
  );
  // Vorderwand aus drei Brettern
  const vorn = form(pfad("M9 42 L91 42 L87 90 L13 90 Z"), HOLZ, [16, 46], { s: 0.92, glanz: false });
  const oberkante = flach(pfad("M9 42 L91 42 L90.6 46.5 L9.4 46.5 Z"), heller(HOLZ, 0.25));
  const bretter = naht("M10.6 58 L89.4 58 M11.9 74 L88.1 74", HOLZ, 1.8);
  // Der leere Zettel, mit einem Streifen Klebeband oben, leicht schräg
  const zettel = form(pfad("M33 57 L67 55 L68 77 L34 79 Z"), ZETTEL, [37, 59], { s: 0.92, kontur: false });
  const band = flach(pfad("M45 52.5 L56 51.9 L56.4 57.4 L45.4 58 Z"), KLEBEBAND);
  return zusammen(innen, rueckkante, stifte, vorn, oberkante, bretter,
    { svg: zettel.svg, kontur: "" }, { svg: band.svg, kontur: "" });
}

meldeObjekt("kramkiste", {
  zustaende: ["beschriftet"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: kramkisteStueck() }], ursprung: [50, 90] }),
});
