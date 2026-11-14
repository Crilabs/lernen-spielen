// <ls-objekt art="ringelsocken">: ein Paar lange Ringelsocken von der Seite, die hintere ein Stück höher und
// versetzt. Feld 0…100. Schaft mit Bündchen und Ringeln, Ferse und Spitze abgesetzt; beide Socken gleich, damit sie
// als Paar zusammengehören. Hoch und L-förmig, damit die Silhouette sich vom flachen Schuhpaar unterscheidet.
// Keine Schrift, keine Ziffer (figuren.md §4).

import { form, naht, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const SOCKE = "#9ED8A8";
export const RINGEL = "#FFFCF7";
export const FERSE = "#F59A86";

/**
 * Eine Socke von der Seite, Spitze rechts; (x, y) ist die linke obere Ecke des Bündchens.
 * Schaft 18 breit, Fuß 17 hoch, ganze Socke 52 breit und 62 hoch.
 * @param {number} x @param {number} y @param {boolean} [vorn] vorn: feine Linie, wo die Socke vor der anderen liegt
 * @returns {import("../runde/kinder/stil.js").Stueck}
 */
function socke(x, y, vorn = false) {
  const p = (/** @type {number} */ a, /** @type {number} */ b) => `${x + a} ${y + b}`;
  const koerper = form(
    pfad(`M${p(1, 6)} L${p(1, 50)} Q${p(1, 62)} ${p(14, 62)} L${p(42, 62)} Q${p(52, 62)} ${p(52, 53.5)} Q${p(52, 45)} ${p(42, 45)} L${p(19, 45)} L${p(19, 6)} Z`),
    SOCKE, [x + 5, y + 10], { s: 0.9, trenn: vorn },
  );
  const ringel = [14, 23, 32].map((r) => form(pfad(`M${p(1, r)} L${p(19, r)} L${p(19, r + 4.5)} L${p(1, r + 4.5)} Z`), RINGEL, [x + 4, y + r + 1], { s: 0.9, kontur: false }));
  const ferse = form(pfad(`M${p(1, 49)} Q${p(1, 62)} ${p(14, 62)} L${p(16, 62)} Q${p(15, 52)} ${p(7, 49)} Z`), FERSE, [x + 3, y + 52], { s: 0.86, kontur: false });
  const spitze = form(pfad(`M${p(42, 45)} Q${p(52, 45)} ${p(52, 53.5)} Q${p(52, 62)} ${p(42, 62)} Q${p(38, 53.5)} ${p(42, 45)} Z`), FERSE, [x + 44, y + 48], { s: 0.86, kontur: false });
  const buendchen = form(pfad(`M${p(0, 2)} Q${p(0, 0)} ${p(2, 0)} L${p(18, 0)} Q${p(20, 0)} ${p(20, 2)} L${p(20, 8)} L${p(0, 8)} Z`), heller(SOCKE, 0.25), [x + 4, y + 2], { s: 0.88 });
  const rippen = naht(`M${p(5, 1.5)} L${p(5, 7)} M${p(10, 1.5)} L${p(10, 7)} M${p(15, 1.5)} L${p(15, 7)}`, SOCKE, 1.4);
  const kante = naht(`M${p(1, 8.5)} L${p(19, 8.5)}`, dunkler(SOCKE, 0.1), 1.6);
  return zusammen(koerper, ...ringel, ferse, spitze, buendchen, rippen, kante);
}

/** Das Paar als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function ringelsockenStueck() {
  return zusammen(socke(38, 10), socke(20, 30, true));
}

meldeObjekt("ringelsocken", {
  zustaende: ["paar"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: ringelsockenStueck() }], ursprung: [50, 92] }),
});
