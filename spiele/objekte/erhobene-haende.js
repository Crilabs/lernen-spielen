// <ls-objekt art="erhobene-haende">: zwei erhobene Hände einer Person, Handflächen nach vorn, Daumen nach außen.
// Die linke zeigt alle fünf Finger, an der rechten ist der Daumen über die Handfläche eingeklappt (zehn Finger, einer
// weg). Unten die Ärmel als Bündchen. Feld 0…100. Keine Schrift, keine Ziffer. Feine Linie im dunklen Hautton
// trennt die Finger (figuren.md §4, wie haende() in runde/kinder/stil.js).

import { form, falte, naht, pfad, kapsel, zusammen, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const HAUT = "#B97E57";
export const AERMEL = "#8FD3EE";

const fein = dunkler(HAUT, 0.55);

/** Fläche in Haut mit feiner Linie, trägt zur Silhouette bei. @param {string} geo */
const hautteil = (geo) => ({ svg: `<${geo} fill="${HAUT}" stroke="${fein}" stroke-width="1.6"/>`, kontur: `<${geo}/>` });

/**
 * Eine Hand; mx ist die Mitte der Handfläche, außen = -1 (Daumen links) oder +1 (Daumen rechts).
 * @param {number} mx @param {1|-1} aussen @param {boolean} daumenEin
 * @returns {import("../runde/kinder/stil.js").Stueck}
 */
function hand(mx, aussen, daumenEin) {
  const oben = 50; // Oberkante der Handfläche
  // Finger von innen nach außen: kleiner Finger innen, Zeigefinger außen (Handfläche zeigt nach vorn).
  const finger = [
    { dx: -7.5, l: 13, r: 2.9, neig: -1.6 },
    { dx: -2.5, l: 18, r: 3.1, neig: -0.5 },
    { dx: 2.5, l: 20, r: 3.2, neig: 0.5 },
    { dx: 7.5, l: 18, r: 3.1, neig: 1.6 },
  ].map(({ dx, l, r, neig }) => {
    const x = mx - aussen * dx;
    return hautteil(kapsel([x, oben + 4], r, [x - aussen * neig, oben - l], r * 0.9));
  });
  const flaeche = form(pfad(`M${mx - 11} ${oben} L${mx + 11} ${oben} Q${mx + 12.5} ${oben + 14} ${mx + 9} ${oben + 26}`
    + ` L${mx - 9} ${oben + 26} Q${mx - 12.5} ${oben + 14} ${mx - 11} ${oben} Z`), HAUT, [mx - 6, oben + 4], { s: 0.9 });
  const linie = naht(`M${mx - 7} ${oben + 9} Q${mx} ${oben + 12} ${mx + 7} ${oben + 8}`, HAUT, 1.4);
  const daumen = daumenEin
    // eingeklappt: liegt quer über der Handfläche, Spitze zur Mitte
    ? hautteil(kapsel([mx + aussen * 7.5, oben + 19], 3.8, [mx - aussen * 3, oben + 12.5], 3.3))
    // offen: schräg nach außen oben
    : hautteil(kapsel([mx + aussen * 9, oben + 18], 4, [mx + aussen * 19, oben + 4], 3.3));
  const schatten = falte(`M${mx + 4} ${oben + 22} Q${mx + 9} ${oben + 17} ${mx + 10} ${oben + 6} Q${mx + 11} ${oben + 18} ${mx + 7} ${oben + 25} Z`, HAUT, 0.22);
  const aermel = form(pfad(`M${mx - 12} ${oben + 24} L${mx + 12} ${oben + 24} L${mx + 13} ${oben + 40} L${mx - 13} ${oben + 40} Z`),
    AERMEL, [mx - 8, oben + 27], { s: 0.9 });
  const buendchen = naht(`M${mx - 11} ${oben + 29} L${mx + 11} ${oben + 29}`, AERMEL, 1.6);
  return zusammen(aermel, buendchen, ...finger, flaeche, schatten, linie, daumen);
}

/** Beide Hände als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function erhobeneHaendeStueck() {
  return zusammen(hand(28, -1, false), hand(72, 1, true));
}

meldeObjekt("erhobene-haende", {
  zustaende: ["eingeklappt"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: erhobeneHaendeStueck() }], ursprung: [50, 90] }),
});
