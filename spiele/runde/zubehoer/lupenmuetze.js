// Lupenmütze (figuren.md §5 „schrumpfen“): Wollmütze mit Krempe und Bommel, vorn eine aufgeklappte Lupe.
// Platz „kopf“ = Oberkante des Kopfes; die Mütze liegt über den Haaren, Pony und Nacken schauen darunter hervor.

import { meldeZubehoer } from "../bestand.js";
import * as S from "../kinder/stil.js";

const WOLLE = "#7FB3C9";
const GLAS = "#DFF0FC";
const RAHMEN = "#B98E5E";

/**
 * Lupe wie das bekannte Zeichen: rundes Glas mit dickem Holzrand und Glanzbogen, Griff schräg nach außen,
 * eine kleine Klammer steckt sie an die Krempe.
 * @param {number} x @param {number} y Mitte des Glases
 */
const lupenZeichen = (x, y) => S.zusammen(
  S.form(S.pfad(`M${x - 8} ${y + 6} L${x - 2} ${y + 6} L${x - 2} ${y + 14} L${x - 8} ${y + 14} Z`), "#9AA6B4", [x - 7, y + 7], { s: 0.8 }),
  S.glied([x + 9, y + 9], 3.4, [x + 20, y + 20], 3.8, RAHMEN),
  { svg: `<circle cx="${x}" cy="${y}" r="12" fill="${RAHMEN}" stroke="none"/>`
    + `<circle cx="${x}" cy="${y}" r="8.6" fill="${GLAS}" stroke="none"/>`
    + `<path d="M${x - 5.5} ${y - 2} A6 6 0 0 1 ${x - 1} ${y - 6}" fill="none" stroke="#FFFFFF" stroke-width="2.4"/>`
    + `<circle cx="${x}" cy="${y}" r="12" fill="none" stroke="${S.dunkler(RAHMEN, 0.4)}" stroke-width="1.6"/>`,
    kontur: `<circle cx="${x}" cy="${y}" r="12"/>` },
);

/**
 * Mütze so groß, dass sie den Haarschopf aller Kinder oben ganz umschließt (Locken, Wirbel ragen nicht heraus).
 * @param {number} dx Versatz nach vorn (Profil) @param {[number, number]} lupe
 */
const muetze = (dx, lupe) => S.zusammen(
  S.form(S.pfad(`M${-56 + dx} 30 C${-60 + dx} -40 ${60 + dx} -40 ${56 + dx} 30 Q${dx} 38 ${-56 + dx} 30 Z`), WOLLE, [-38 + dx, -10], { s: 0.88 }),
  S.naht(`M${-36 + dx} -4 Q${-34 + dx} 12 ${-36 + dx} 26 M${-12 + dx} -18 Q${-11 + dx} 6 ${-12 + dx} 28 M${12 + dx} -18 Q${13 + dx} 6 ${12 + dx} 28 M${36 + dx} -4 Q${38 + dx} 12 ${36 + dx} 26`, WOLLE, 2),
  S.form(S.pfad(`M${-59 + dx} 20 Q${dx} 32 ${59 + dx} 20 L${59 + dx} 34 Q${dx} 46 ${-59 + dx} 34 Z`), S.dunkler(WOLLE, 0.12), [-50 + dx, 23], { s: 0.86 }),
  S.form(S.oval(dx, -33, 9, 8.5), S.heller(WOLLE, 0.25), [-3 + dx, -36], { s: 0.8 }),
  lupenZeichen(lupe[0], lupe[1]),
);

meldeZubehoer({
  id: "lupenmuetze",
  wort: "die Lupenmütze",
  teile: [{ platz: "kopf", ebene: "vorne", svg: { dreiviertel: muetze(0, [40, 22]), profil: muetze(-2, [52, 22]) } }],
});
