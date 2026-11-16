// <ls-objekt art="tastentelefon">: das Mobilteil eines schnurlosen Haustelefons, stehend und leicht schräg: oben die
// Hörmuschel (Schlitze), darunter ein kleines leeres Display mit Glanz, zwei längliche Ruftasten und das Tastenfeld aus
// 3 × 4 runden Tasten. Feld 0…100. Keine Schrift, keine Ziffer: die Ziffern liest man auf den Tasten des echten Telefons.
// Bild der Karte „Mit echten Dingen“ für ziffern-lesen-bis-10 (eine Nummer wählen).
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2), keine Farbe der Lernzeichen.

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const GEHAEUSE = PALETTEN.wasser[4];
const DISPLAY = PALETTEN.wasser[0];
const TASTE = PALETTEN.werkstatt[0];
const ANRUF = PALETTEN.wiese[2];
const AUFLEGEN = PALETTEN.wasser[3];
export const SPALTEN = 3;
export const REIHEN = 4;

/** Eine runde Taste mit Schattenstufe, Mitte (x, y). @param {number} x @param {number} y @returns {Stueck} */
function taste(x, y) {
  const t = form(oval(x, y, 4.2, 3.6), TASTE, [x - 1.6, y - 1.4], { s: 0.86, kontur: false });
  return { svg: t.svg, kontur: "" };
}

/** Eine längliche Ruftaste. @param {number} x @param {number} y @param {string} farbe @returns {Stueck} */
function ruftaste(x, y, farbe) {
  const t = form(pfad(`M${x - 5} ${y - 2} L${x + 5} ${y - 2} Q${x + 7} ${y} ${x + 5} ${y + 2} L${x - 5} ${y + 2} Q${x - 7} ${y} ${x - 5} ${y - 2} Z`),
    farbe, [x - 4, y - 1], { s: 0.84, kontur: false });
  return { svg: t.svg, kontur: "" };
}

/** Das Mobilteil als Stück im Feld 0…100, aufrecht um die Mitte (50, 50). @returns {Stueck} */
function mobilteil() {
  const koerper = form(pfad("M34 12 Q34 4 42 4 L58 4 Q66 4 66 12 L67 88 Q67 96 59 96 L41 96 Q33 96 33 88 Z"),
    GEHAEUSE, [38, 8], { s: 0.93 });
  const hoerer = naht("M45 9.5 L55 9.5 M46.5 12.5 L53.5 12.5", GEHAEUSE, 1.4);
  const rahmen = flach(pfad("M38.5 17 Q38.5 15 40.5 15 L59.5 15 Q61.5 15 61.5 17 L61.5 31 Q61.5 33 59.5 33 L40.5 33 Q38.5 33 38.5 31 Z"),
    dunkler(GEHAEUSE, 0.35));
  const display = flach(pfad("M41 17.5 L59 17.5 L59 30.5 L41 30.5 Z"), DISPLAY);
  const schatten = flach(pfad("M41 17.5 L59 17.5 L59 19.6 L41 19.6 Z"), dunkler(DISPLAY, 0.16));
  const licht = flach(pfad("M43 28.5 L49.5 20.5 L53 20.5 L46.5 28.5 Z"), heller(DISPLAY, 0.6));
  const ruf = zusammen(ruftaste(42.5, 39.5, ANRUF), ruftaste(57.5, 39.5, AUFLEGEN));
  const tasten = [];
  for (let r = 0; r < REIHEN; r++) for (let s = 0; s < SPALTEN; s++) tasten.push(taste(40.5 + s * 9.5, 50 + r * 10.5));
  const mikro = naht("M48 91 L52 91", GEHAEUSE, 1.4);
  return zusammen(koerper, hoerer, rahmen, display, schatten, licht, ruf, ...tasten, mikro);
}

/** Das schräg stehende Mobilteil als Stück im Feld 0…100 (Boden bei y 96). @returns {Stueck} */
export function tastentelefonStueck() {
  const m = mobilteil();
  const lage = "rotate(-9 50 92)";
  return { svg: `<g transform="${lage}">${m.svg}</g>`, kontur: `<g transform="${lage}">${m.kontur}</g>` };
}

meldeObjekt("tastentelefon", {
  zustaende: ["tasten"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: tastentelefonStueck() }], ursprung: [50, 96] }),
});
