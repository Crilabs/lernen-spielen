// <ls-objekt art="landkarte">: eine aufgefaltete Papier-Landkarte, leicht von oben: vier Felder in Zickzack-Faltung
// (abwechselnd Berg und Tal, die abgewandten Felder im Schatten), darauf grüne Flächen (Wald, Wiese), ein Fluss als
// blaue Welle, eine Straße als Linie und Punkte für Orte in drei Größen (Stadt, Kleinstadt, Dorf). Feld 0…100.
// Kein Text, keine Ziffer, keine Legende: die Ortsnamen liest man auf der echten Karte.
// Bild der Karte „Mit echten Dingen“ für grosse-zahlen-lesen: Mit der Karte findet man Orte in der Nähe; ihre
// Einwohnerzahlen stehen nicht auf der Karte, sie kommen aus dem Internet oder der Zeitung.
// Breit und quer mit gezackter Ober- und Unterkante, damit sie sich von `faltzettel` (hochkant, flach) und
// `buch` (zwei gewölbte Seiten) abhebt.
//
// Farben nur aus den Welt-Paletten (spiele/start/welten.js, grundsaetze-bilder §6.2), keine Farbe der Lernzeichen.

import { form, flach, naht, pfad, zusammen, dunkler, heller, z } from "../runde/kinder/stil.js";
import { PALETTEN } from "../start/welten.js";
import { meldeObjekt, bild } from "./objekt.js";

/** @typedef {import("../runde/kinder/stil.js").Stueck} Stueck */

const PAPIER = PALETTEN.savanne[0];
const GRUEN = PALETTEN.wiese[2];
const FLUSS = PALETTEN.wasser[1];
const STRASSE = PALETTEN.wasser[3];
const ORT = PALETTEN.dorf[4];
export const FELDER = 4;

// Karte flach: x 0…88, y 0…56. Gefaltet: jedes Feld 22 breit, die Falze springen abwechselnd um 7 nach unten.
const BREITE = 22;
const HOEHE = 56;
const LINKS = 6;
const OBEN = 18;
const SPRUNG = 7;

/** Versatz nach unten an der Stelle x der flachen Karte (Zickzack). @param {number} x */
function zick(x) {
  const i = Math.min(FELDER - 1, Math.floor(x / BREITE));
  const t = (x - i * BREITE) / BREITE;
  return i % 2 === 0 ? t * SPRUNG : (1 - t) * SPRUNG;
}

/** Punkt der flachen Karte auf die gefaltete abbilden. @param {number} x @param {number} y @returns {string} */
const P = (x, y) => `${z(LINKS + x)} ${z(OBEN + y + zick(x))}`;

/** Linienzug der flachen Karte (fein abgetastet, damit er an den Falzen knickt). @param {(t: number) => [number, number]} f */
function zug(f, n = 60) {
  const pt = [];
  for (let k = 0; k <= n; k++) pt.push(P(...f(k / n)));
  return "M" + pt.join(" L");
}

/** Fläche aus Eckpunkten der flachen Karte, Kanten fein abgetastet. @param {[number, number][]} ecken */
function flaeche(ecken) {
  let d = "";
  ecken.forEach(([x0, y0], i) => {
    const [x1, y1] = ecken[(i + 1) % ecken.length];
    for (let k = 0; k < 8; k++) d += (d ? " L" : "M") + P(x0 + (x1 - x0) * k / 8, y0 + (y1 - y0) * k / 8);
  });
  return d + " Z";
}

/** Die aufgefaltete Karte als Stück im Feld 0…100. @returns {Stueck} */
export function landkarteStueck() {
  const umriss = flaeche([[0, 0], [88, 0], [88, HOEHE], [0, HOEHE]]);
  const blatt = form(pfad(umriss), PAPIER, [LINKS + 2, OBEN + 2], { s: 0.97 });
  const wald = [
    [[4, 4], [20, 3], [26, 12], [18, 20], [6, 16]],
    [[48, 34], [62, 30], [74, 36], [70, 50], [52, 50]],
    [[70, 4], [84, 6], [84, 18], [74, 16]],
  ].map((e) => flach(pfad(flaeche(/** @type {[number, number][]} */ (e))), GRUEN));
  const welle = (/** @type {number} */ t) => /** @type {[number, number]} */ ([t * 88, 30 + Math.sin(t * Math.PI * 3.2) * 8]);
  const flussRand = { svg: `<path d="${zug(welle)}" fill="none" stroke="${dunkler(FLUSS, 0.2)}" stroke-width="4"/>`, kontur: "" };
  const fluss = { svg: `<path d="${zug(welle)}" fill="none" stroke="${FLUSS}" stroke-width="2.6"/>`, kontur: "" };
  const weg = (/** @type {number} */ t) => /** @type {[number, number]} */ ([8 + t * 76, 50 - t * 40 + Math.sin(t * Math.PI) * 6]);
  const strassenRand = { svg: `<path d="${zug(weg)}" fill="none" stroke="${dunkler(STRASSE, 0.25)}" stroke-width="2.6"/>`, kontur: "" };
  const strasse = { svg: `<path d="${zug(weg)}" fill="none" stroke="${heller(STRASSE, 0.2)}" stroke-width="1.4"/>`, kontur: "" };
  const orte = [[30, 36, 3.4], [66, 22, 2.4], [14, 47, 1.7], [46, 12, 1.7], [80, 44, 1.4]].map(([x, y, r]) => {
    const [px, py] = P(x, y).split(" ").map(Number);
    return {
      svg: `<ellipse cx="${z(px)}" cy="${z(py)}" rx="${z(r + 0.8)}" ry="${z(r + 0.6)}" fill="${PAPIER}" stroke="none"/>`
        + `<ellipse cx="${z(px)}" cy="${z(py)}" rx="${z(r)}" ry="${z(r * 0.85)}" fill="${ORT}" stroke="none"/>`,
      kontur: "",
    };
  });
  // Die nach rechts abfallenden Felder (Tal) liegen im Schatten, die Falze als Nähte.
  const schatten = [1, 3].map((i) => ({
    svg: `<path d="${flaeche([[i * BREITE, 0], [(i + 1) * BREITE, 0], [(i + 1) * BREITE, HOEHE], [i * BREITE, HOEHE]])}" `
      + `fill="${dunkler(PAPIER, 0.5)}" opacity="0.16" stroke="none"/>`,
    kontur: "",
  }));
  const falze = naht([1, 2, 3].map((i) => `M${P(i * BREITE, 0)} L${P(i * BREITE, HOEHE)}`).join(" "), PAPIER, 1.2);
  return zusammen(blatt, ...wald, flussRand, fluss, strassenRand, strasse, ...orte, ...schatten, falze);
}

meldeObjekt("landkarte", {
  zustaende: ["aufgefaltet"],
  zeichne: () => bild({ breite: 100, hoehe: 100, teile: [{ stueck: landkarteStueck() }], ursprung: [50, 86] }),
});
