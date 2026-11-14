// <ls-objekt art="eintrittskarte">: zwei Eintrittskarten aus Papier, leicht schräg übereinander (Schwimmbad, Kino,
// Zoo). Jede Karte hat an den kurzen Seiten eine runde Kerbe und rechts einen Abriss hinter einer gestrichelten Linie.
// Die hintere in Hellblau, die vordere in Koralle. Feld 0…100. Keine Schrift, keine Ziffer: auf der Karte nur zwei
// Druckstreifen als Nähte, auf dem Abriss ein Stempelkreis (figuren.md §4).

import { form, flach, naht, pfad, oval, zusammen, heller } from "../runde/kinder/stil.js";
import { meldeObjekt, bild, verschiebe } from "./objekt.js";

export const KARTE_A = "#8FD3EE";
export const KARTE_B = "#F59A86";

const B = 66; // Breite einer Karte
const H = 34; // Höhe einer Karte
const K = 5; // Halbmesser der Kerbe

/**
 * Eine Karte mit linker oberer Ecke (0, 0), danach verschoben und gedreht.
 * @param {string} farbe @param {string} transform
 * @returns {import("../runde/kinder/stil.js").Stueck}
 */
function karte(farbe, transform) {
  const m = H / 2;
  const umriss = pfad(`M3 0 L${B - 3} 0 Q${B} 0 ${B} 3 L${B} ${m - K} A${K} ${K} 0 0 0 ${B} ${m + K} L${B} ${H - 3}`
    + ` Q${B} ${H} ${B - 3} ${H} L3 ${H} Q0 ${H} 0 ${H - 3} L0 ${m + K} A${K} ${K} 0 0 0 0 ${m - K} L0 3 Q0 0 3 0 Z`);
  const flaeche = form(umriss, farbe, [6, 5], { s: 0.92 });
  const abriss = B * 0.72;
  const striche = Array.from({ length: 6 }, (_, i) => `M${abriss} ${3 + i * 5.2} L${abriss} ${5.6 + i * 5.2}`).join(" ");
  const linie = naht(striche, farbe, 1.6);
  const druck = naht(`M9 ${m - 5} L${abriss - 9} ${m - 5} M9 ${m + 4} L${abriss - 18} ${m + 4}`, farbe, 2.4);
  const stempel = flach(oval((abriss + B) / 2, m, 5, 5), heller(farbe, 0.45));
  const stempelRand = naht(`M${(abriss + B) / 2 - 5} ${m} A5 5 0 1 0 ${(abriss + B) / 2 + 5} ${m} A5 5 0 1 0 ${(abriss + B) / 2 - 5} ${m}`, farbe, 1.4);
  return verschiebe(zusammen(flaeche, linie, druck, { svg: stempel.svg, kontur: "" }, stempelRand), transform);
}

/** Hintere und vordere Karte im Feld 0…100. @returns {import("../runde/kinder/stil.js").Stueck[]} */
export function eintrittskartenStuecke() {
  return [karte(KARTE_A, "translate(22 22) rotate(-9)"), karte(KARTE_B, "translate(14 44) rotate(6)")];
}

meldeObjekt("eintrittskarte", {
  zustaende: ["zwei"],
  // Die vordere Karte trägt ihre Kontur selbst, damit ihr Rand über der hinteren sichtbar bleibt.
  zeichne: () => {
    const [hinten, vorn] = eintrittskartenStuecke();
    return bild({ breite: 100, hoehe: 100, teile: [{ stueck: hinten }, { stueck: vorn, eigen: true }], ursprung: [50, 90] });
  },
});
