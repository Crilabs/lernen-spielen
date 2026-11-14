// <ls-objekt art="glueckwunschkarte">: eine Karte zum Verschenken, halb aus dem offenen Briefumschlag gezogen.
// Feld 0…100. Auf der Karte eine gemalte Blume, kein Text, keine Ziffer, keine Lernzeichen. Breiter Umschlag mit
// aufgeklappter Lasche und hochkant ragender Karte, damit die Silhouette sich vom Zettel und vom Tischkärtchen
// abhebt. Schatten in Stufen, Falze als Nähte (figuren.md §4).

import { form, flach, naht, pfad, oval, zusammen, heller, dunkler } from "../runde/kinder/stil.js";
import { meldeObjekt, bild } from "./objekt.js";

export const UMSCHLAG = "#F6C9A8";
export const KARTE = "#FFFAF0";
const BLUETE = "#F59A86";
const MITTE = "#F5C451";
const STIEL = "#7CC08A";

/** Die gemalte Blume auf der Karte, Mitte (cx, cy). */
function blume(/** @type {number} */ cx, /** @type {number} */ cy) {
  const blaetter = [0, 72, 144, 216, 288].map((w) => {
    const a = (w - 90) * Math.PI / 180;
    return flach(oval(cx + Math.cos(a) * 6, cy + Math.sin(a) * 6, 5, 5), BLUETE);
  });
  return zusammen(
    naht(`M${cx} ${cy + 6} Q${cx - 2} ${cy + 16} ${cx + 1} ${cy + 24}`, STIEL, 2.4),
    flach(oval(cx + 5, cy + 17, 4.5, 2.4), STIEL),
    ...blaetter,
    flach(oval(cx, cy, 4, 4), MITTE),
  );
}

/** Umschlag und Karte als Stück im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck} */
export function glueckwunschkarteStueck() {
  const rueckseite = form(pfad("M14 46 L86 46 L86 88 L14 88 Z"), dunkler(UMSCHLAG, 0.12), [24, 52], { s: 0.92 });
  const lasche = form(pfad("M14 46 L50 22 L86 46 Z"), heller(UMSCHLAG, 0.18), [40, 34], { s: 0.9 });
  const karte = form(pfad("M29 18 L69 14 L73 74 L33 77 Z"), KARTE, [38, 24], { s: 0.92, trenn: true });
  const vorne = form(pfad("M14 50 L50 72 L86 50 L86 88 L14 88 Z"), UMSCHLAG, [24, 66], { s: 0.9 });
  const falze = zusammen(
    naht("M14 88 L44 68", UMSCHLAG, 1.8),
    naht("M86 88 L56 68", UMSCHLAG, 1.8),
  );
  return zusammen(rueckseite, lasche, karte, blume(50, 34), vorne, falze);
}

meldeObjekt("glueckwunschkarte", {
  zustaende: ["im-umschlag"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: glueckwunschkarteStueck() }], ursprung: [50, 88] }),
});
