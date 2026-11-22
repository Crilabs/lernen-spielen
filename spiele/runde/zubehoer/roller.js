// Roller (S18 Selbst schreiben): ein Tretroller, auf dem das Kind steht. Platz „fuesse“ (hinten): Brett unter den Füßen, zwei
// Räder und die Lenkstange, die schräg zur vorderen Hand führt; Platz „hand-vorn“ (vorn): der Griff über der Faust. Die
// Räder stehen auf der Linie (Unterkante der Räder = 28 Einheiten unter dem Fußpunkt, ROLLER_BODEN).
// „roller-kreide“ (Lena): dazu ein Kreidestück am Heck, das die Spur malt. Beide hängen als Zubehör an jeder Haltung.
//
// Ursprung des Platzes „fuesse“ ist der Fußpunkt (160, 250): x nach rechts (die Figur schaut nach rechts), y nach unten.

import { meldeZubehoer } from "../bestand.js";
import * as S from "../kinder/stil.js";

const BRETT = "#F2C14E";
const RAD = "#3B2A6B";
const NABE = "#FFFCF7";
const STANGE = "#8FD3EE";
const KREIDE = "#FFFCF7";

/** Wie weit die Unterkante der Räder unter dem Fußpunkt liegt (Einheiten der Figur). */
export const ROLLER_BODEN = 28;

/** @param {number} x */
const rad = (x) => S.zusammen(
  S.form(S.oval(x, 16, 12, 12), RAD, [x - 4, 12], { s: 0.8 }),
  S.flach(S.oval(x, 16, 4.5, 4.5), NABE),
);

/** Kreidestück hinten am Brett, die Spitze zeigt auf den Boden. */
const kreide = S.zusammen(
  S.flach(S.pfad("M-74 -2 L-70 -2 L-70 16 L-74 16 Z"), S.dunkler(BRETT, 0.3)),
  S.flach(S.pfad("M-78 16 L-66 16 L-67.5 26 L-76.5 26 Z"), KREIDE),
);

/** @param {boolean} mitKreide */
const unten = (mitKreide) => S.zusammen(
  S.glied([34, -78], 3, [58, 14], 3.4, STANGE),
  S.form(S.pfad("M-68 0 L66 0 Q72 0 72 6 L72 9 L-66 9 Q-72 9 -72 3 Z"), BRETT, [-50, 2], { s: 0.82 }),
  rad(-52), rad(58),
  ...(mitKreide ? [kreide] : []),
);

const griff = S.zusammen(
  S.glied([-9, 0], 3.6, [9, 0], 3.6, S.dunkler(STANGE, 0.12)),
);

/** @param {boolean} mitKreide */
const roller = (mitKreide) => ({
  teile: [
    { platz: "fuesse", ebene: /** @type {const} */ ("hinten"), svg: { dreiviertel: unten(mitKreide), profil: unten(mitKreide) } },
    { platz: "hand-vorn", ebene: /** @type {const} */ ("vorne"), greift: true, svg: { dreiviertel: griff, profil: griff } },
  ],
});

meldeZubehoer({ id: "roller", wort: "der Roller", ...roller(false) });
// Lenas Roller: dasselbe, mit dem Kreidestück am Heck (die gepunktete Vorlage entsteht aus seiner Spur).
meldeZubehoer({ id: "roller-kreide", wort: "der Roller mit Kreide", ...roller(true) });
