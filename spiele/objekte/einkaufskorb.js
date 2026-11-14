// <ls-objekt art="einkaufskorb" zustand="leer|1|2|…|8|gefuellt">: ein geflochtener Einkaufskorb von vorn, breit und
// flach, mit hohem Henkelbogen (Silhouette, figuren.md §4). Feld 0…200 × 20…146. Der Füllstand ist die Zahl der
// Packungen, die oben herausschauen (1 … 8; gefuellt = alle acht, für Karte und Regal): Tüten, Kartons und Schachteln
// ohne Schrift und Ziffer. Figur und Wirkung des Spiels M37: Jede gelöste Aufgabe legt eine Packung dazu (der neue
// Füllstand bleibt stehen, auch bei wenig Bewegung); bei jedem Stäbchen fällt etwas hinein (Anstoß, wirf()), der Korb
// wackelt satt.
//
// Farben nur aus der Welt-Palette „Werkstatt“ (spiele/start/welten.js) und den Tokens (spiele/rahmen/stil.js), keine
// Farben der Lernzeichen (grundsaetze-bilder §6.2).

import { form, flach, naht, pfad, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { FARBE } from "../rahmen/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const [, KARTON, , SCHACHTEL] = PALETTEN.werkstatt;
export const WEIDE = FARBE.kante;
const TUETE = FARBE.ahorn;

/** Füllstände: leer, eine bis acht Packungen, gefuellt (= acht). */
export const PLAETZE = 8;
const ZUSTAENDE = ["leer", ...Array.from({ length: PLAETZE }, (_, i) => String(i + 1)), "gefuellt"];

/** Zustand für eine Zahl von Packungen (0 = leer, ab acht voll). @param {number} anzahl */
export function fuellstand(anzahl) {
  const k = Math.max(0, Math.min(PLAETZE, Math.floor(anzahl)));
  return k === 0 ? "leer" : String(k);
}

/** Wie viele Packungen ein Zustand zeigt. @param {string} zustand */
const anzahlVon = (zustand) => (zustand === "gefuellt" ? PLAETZE : Number(zustand) || 0);

/** Der Henkel: ein hoher Bogen, hinter dem Korb. */
function henkel() {
  return form(pfad("M42 78 Q44 22 100 20 Q156 22 158 78 L148 78 Q146 32 100 31 Q54 32 52 78 Z"), dunkler(WEIDE, 0.08), [70, 30], { s: 0.92 });
}

/** Der Korb: oben breiter als unten, mit Rand und Flechtmuster. */
function korb() {
  const leib = form(pfad("M20 78 L180 78 L166 140 Q164 146 158 146 L42 146 Q36 146 34 140 Z"), WEIDE, [40, 84], { s: 0.9 });
  const rand = form(pfad("M14 70 L186 70 Q190 70 190 75 L190 82 Q190 86 186 86 L14 86 Q10 86 10 82 L10 75 Q10 70 14 70 Z"), heller(WEIDE, 0.12), [24, 72], { s: 0.9 });
  const flechten = naht("M30 102 L170 102 M34 120 L166 120 M60 88 L64 144 M100 88 L100 146 M140 88 L136 144", WEIDE, 2.4);
  return zusammen(leib, rand, flechten);
}

/** Eine Tüte mit umgeschlagenem Rand, Mitte x, Oberkante y. @param {number} x @param {number} y @param {boolean} vorn */
const tuete = (x, y, vorn) => zusammen(
  form(pfad(`M${x - 15} 76 L${x - 11} ${y} L${x + 11} ${y} L${x + 15} 76 Z`), TUETE, [x - 8, y + 4], { s: 0.9, trenn: vorn }),
  flach(pfad(`M${x - 11} ${y} L${x + 11} ${y} L${x + 10} ${y + 7} L${x - 10} ${y + 7} Z`), dunkler(TUETE, 0.12)),
);
/** Ein Karton mit Deckelkante. @param {number} x @param {number} y @param {boolean} vorn */
const karton = (x, y, vorn) => zusammen(
  form(pfad(`M${x - 18} 76 L${x - 17} ${y} L${x + 17} ${y} L${x + 18} 76 Z`), KARTON, [x - 12, y + 4], { s: 0.9, trenn: vorn }),
  naht(`M${x - 16} ${y + 6} L${x + 16} ${y + 6}`, KARTON, 2),
);
/** Eine schmale, leicht schräge Schachtel. @param {number} x @param {number} y @param {boolean} vorn */
const schachtel = (x, y, vorn) => form(pfad(`M${x - 11} 76 L${x - 9} ${y + 2} L${x + 12} ${y} L${x + 11} 76 Z`), SCHACHTEL, [x - 6, y + 4], { s: 0.9, trenn: vorn });

/**
 * Die acht Plätze in der Reihenfolge, in der sie sich füllen (abwechselnd hinten und vorn, von der Mitte nach außen),
 * je mit Form, Mitte und Oberkante. Hinten höher, vorn tiefer.
 */
const PLATZ = [
  { ding: karton, x: 100, y: 46, vorn: false },
  { ding: tuete, x: 62, y: 42, vorn: false },
  { ding: schachtel, x: 138, y: 40, vorn: false },
  { ding: tuete, x: 120, y: 56, vorn: true },
  { ding: schachtel, x: 80, y: 54, vorn: true },
  { ding: karton, x: 162, y: 52, vorn: false },
  { ding: karton, x: 36, y: 56, vorn: false },
  { ding: tuete, x: 148, y: 60, vorn: true },
];

/** Zustände, in denen Platz i (0 …) zu sehen ist. @param {number} i */
const sichtbarIn = (i) => ZUSTAENDE.filter((z) => anzahlVon(z) > i).join(" ");

/** Teile der Packungen, hinten vor vorn gezeichnet. */
function packungen() {
  const reihenfolge = PLATZ.map((p, i) => ({ ...p, i })).sort((a, b) => Number(a.vorn) - Number(b.vorn));
  return reihenfolge.map((p) => ({ stueck: p.ding(p.x, p.y, p.vorn), teil: `packung-${p.i + 1}`, in: sichtbarIn(p.i) }));
}

const wackeln = [{ transform: "rotate(0deg)" }, { transform: "rotate(-1.6deg)" }, { transform: "rotate(1.2deg)" }, { transform: "rotate(0deg)" }];

meldeObjekt("einkaufskorb", {
  zustaende: ZUSTAENDE,
  zeichne: () => bild({
    breite: 200,
    hoehe: 130,
    oben: 20,
    ursprung: [100, 146],
    teile: [{ stueck: henkel() }, ...packungen(), { stueck: korb() }],
  }),
  // Mehr Packungen: die neuen sinken von oben hinein, dann wackelt der Korb satt. Weniger (neue Runde): ohne Bewegung.
  bewegung: (von, nach) => {
    const a = anzahlVon(von);
    const b = anzahlVon(nach);
    if (b <= a) return [];
    const neu = [];
    for (let i = a; i < b; i++) {
      neu.push({ teil: `packung-${i + 1}`, keyframes: [{ opacity: 0, transform: "translateY(-16px)" }, { opacity: 1, transform: "translateY(0)" }], dauer: 380, beginn: (i - a) * 120 });
    }
    return [...neu, { teil: "ganz", keyframes: wackeln, dauer: 420, beginn: 300 + (b - a - 1) * 120 }];
  },
  anstoss: () => [{ teil: "ganz", keyframes: wackeln, dauer: 420 }],
  einwurf: [100, 74, 60],
});
