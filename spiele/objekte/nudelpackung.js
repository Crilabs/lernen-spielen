// <ls-objekt art="nudelpackung">: eine stehende Nudelpackung aus Pappe, leicht von der Seite gesehen: vorne ein
// Sichtfenster mit kurzen Röhrennudeln, rechts die schmale Seite, oben die geschlossene Lasche. Feld 0…100.
// Keine Schrift, keine Ziffer: die Wörter auf der Packung liest man an der echten Packung.

import { form, flach, naht, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const PACKUNG = "#F9D27A";
export const BAND = "#7FB6E8";
export const FENSTER = "#FFFCF7";
export const NUDEL = "#E9B65E";

/** Eine Röhrennudel (schräg abgeschnitten), Mitte (cx, cy), gedreht um w Grad. */
function nudel(/** @type {number} */ cx, /** @type {number} */ cy, /** @type {number} */ w) {
  const geo = pfad("M-6 -2.6 L5 -2.6 L7 2.6 L-4 2.6 Z");
  const g = (/** @type {string} */ inhalt) => `<g transform="translate(${cx} ${cy}) rotate(${w})">${inhalt}</g>`;
  const rohr = form(geo, NUDEL, [-4, -2], { s: 0.86, kontur: false });
  const loch = `<ellipse cx="6" cy="0" rx="1" ry="2.2" transform="rotate(-20 6 0)" fill="${dunkler(NUDEL, 0.5)}" stroke="none"/>`;
  const rille = `<path d="M-3 -1 L4 -1" stroke="${dunkler(NUDEL, 0.25)}" stroke-width="0.9" fill="none"/>`;
  return { svg: g(rohr.svg + loch + rille), kontur: "" };
}

/** Die Packung als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function nudelpackungStueck() {
  const vorne = form(pfad("M26 24 L64 24 L64 92 L26 92 Z"), PACKUNG, [30, 28], { s: 0.92 });
  const seite = form(pfad("M64 24 L77 17 L77 85 L64 92 Z"), dunkler(PACKUNG, 0.16), [66, 24], { s: 0.9 });
  const oben = form(pfad("M26 24 L39 17 L77 17 L64 24 Z"), heller(PACKUNG, 0.18), [40, 18], { s: 0.86 });
  const lasche = naht("M30 22 L41 18.5 L73 18.5", PACKUNG, 1.4);
  const band = form(pfad("M26 30 L64 30 L64 38 L26 38 Z"), BAND, [28, 31], { s: 0.9, kontur: false });
  const bandSeite = flach(pfad("M64 30 L77 23 L77 31 L64 38 Z"), dunkler(BAND, 0.18));
  const fenster = form(pfad("M33 47 Q33 44 36 44 L54 44 Q57 44 57 47 L57 76 Q57 79 54 79 L36 79 Q33 79 33 76 Z"), FENSTER, [36, 46], { s: 0.92, kontur: false });
  const rahmen = naht("M33 47 Q33 44 36 44 L54 44 Q57 44 57 47 L57 76 Q57 79 54 79 L36 79 Q33 79 33 76 Z", PACKUNG, 1.6);
  const nudeln = [
    [39, 72, -18], [49, 74, 12], [43, 66, 30], [52, 64, -24], [38, 60, 8], [47, 56, -40], [53, 51, 20], [40, 51, -10],
  ].map(([x, y, w]) => nudel(x, y, w));
  const glanz = { svg: `<path d="M36.5 47.5 L40 47.5 L36.5 54 Z" fill="${heller(FENSTER, 0.6)}" stroke="none" opacity="0.9"/>`, kontur: "" };
  const kante = naht("M64 24 L64 92", dunkler(PACKUNG, 0.1), 1.4);
  return zusammen(
    seite, oben, vorne,
    { svg: band.svg, kontur: "" }, bandSeite,
    { svg: fenster.svg, kontur: "" }, ...nudeln, glanz, rahmen, lasche, kante,
  );
}

meldeObjekt("nudelpackung", {
  zustaende: ["steht"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: nudelpackungStueck() }], ursprung: [50, 92] }),
});
