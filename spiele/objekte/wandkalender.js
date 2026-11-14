// <ls-objekt art="wandkalender">: ein Wandkalender aus Papier an einer Schnur am Nagel. Oben ein Bild (Hügel und
// Sonne), unten die Monatsübersicht: 5 Zeilen mit je 7 Kästchen, eine Zeile ist eine Woche; ein Tag ist rot
// umkringelt (der Tag, auf den man wartet). Dahinter lugt das nächste Blatt hervor. Feld 0…80 breit, 0…100 hoch.
// Keine Schrift, keine Ziffer.

import { form, flach, naht, tinte, pfad, oval, zusammen, heller, dunkler, z } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const BLATT = "#FFFCF7";
export const HIMMEL = "#BFDDF2";
export const HUEGEL = "#9CCB8A";
export const SONNE = "#F7C95C";
export const RING = "#C9CCD6";
export const KRINGEL = "#E9806A";

/** Rechteck als Pfad. */
const eck = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ b, /** @type {number} */ h) =>
  pfad(`M${z(x)} ${z(y)} L${z(x + b)} ${z(y)} L${z(x + b)} ${z(y + h)} L${z(x)} ${z(y + h)} Z`);

/** Die Monatsübersicht: 5 Wochen-Zeilen mit je 7 Tagen, ein Tag umkringelt. */
function monat() {
  const teile = [];
  const x0 = 11.5, y0 = 56, b = 7.2, h = 6.6, luft = 1.2;
  for (let zeile = 0; zeile < 5; zeile++) {
    for (let tag = 0; tag < 7; tag++) {
      const farbe = tag >= 5 ? heller(KRINGEL, 0.72) : dunkler(BLATT, 0.08);
      teile.push({ svg: `<${eck(x0 + tag * (b + luft), y0 + zeile * (h + luft), b, h)} fill="${farbe}" stroke="none"/>`, kontur: "" });
    }
  }
  const cx = x0 + 4 * (b + luft) + b / 2, cy = y0 + 3 * (h + luft) + h / 2;
  teile.push({ svg: `<${oval(cx, cy, 5.6, 5)} fill="none" stroke="${KRINGEL}" stroke-width="2.2"/>`, kontur: "" });
  return zusammen(...teile);
}

/** Der Kalender als Stück im Feld 0…80 × 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function wandkalenderStueck() {
  const schnur = tinte("M40 4 L16 15 M40 4 L64 15", 1.6);
  const nagel = form(oval(40, 4, 2.6, 2.6), RING, [39, 3], { s: 0.8 });
  const naechstes = form(pfad("M9 16 L75 16 L75 97 L9 97 Z"), dunkler(BLATT, 0.14), [20, 20], { s: 0.96 });
  const blatt = form(pfad("M5 14 L71 14 L71 94 L5 94 Z"), BLATT, [16, 18], { s: 0.96 });
  const himmel = flach(eck(10, 20, 56, 30), HIMMEL);
  const sonne = form(oval(55, 29, 5, 5), SONNE, [53, 27], { s: 0.86, kontur: false });
  const huegel = form(pfad("M10 50 L10 40 Q22 31 36 39 Q48 33 66 41 L66 50 Z"), HUEGEL, [20, 38], { s: 0.9, kontur: false });
  const bildrand = naht("M10 20 L66 20 L66 50 L10 50 Z", BLATT, 1.2);
  const ringe = [];
  for (const x of [14, 23, 32, 44, 53, 62]) ringe.push(form(pfad(`M${x - 1.6} 10 L${x + 1.6} 10 L${x + 1.6} 17 L${x - 1.6} 17 Z`), RING, [x - 1, 11], { s: 0.85 }));
  return zusammen(schnur, nagel, naechstes, blatt, himmel, sonne, huegel, bildrand, monat(), ...ringe);
}

meldeObjekt("wandkalender", {
  zustaende: ["haengt"],
  zeichne: () => bild({ breite: 80, hoehe: 100, teile: [{ stueck: wandkalenderStueck() }], ursprung: [40, 4] }),
});
