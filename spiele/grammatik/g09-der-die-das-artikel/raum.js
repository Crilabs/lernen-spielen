// Elas Werkraum (G09): oben die Wand, unten heller Ahornboden mit Dielen, dazwischen ein Sockel. Reine Welt, keine
// Bedeutung (C3); Farben aus der Farbwelt (grundsaetze-bilder.md §6.2). Die Lochwand, das Fenster und die Werkbank
// liegen als HTML darüber (index.html): sie folgen dem Bildformat, der Hintergrund hier hängt an keiner Spalte.
//
// Maße wie bei m08-stellentafel/raum.js: viewBox 2600 × 1080 und `slice`, 1 rem (Bildhöhe / 108) = 10 Einheiten.
// Die Wandkante liegt bei HORIZONT (= 55 rem), knapp über der Werkbank.
import { dunkler, flach, heller, naht, zeichner, zusammen } from "../../start/zeichnen.js";

/** Wandkante in Einheiten (= 55 rem). */
export const HORIZONT = 550;
const B = 2600;
const H = 1080;
const WAND = "#F6ECDF";
const AHORN = "#EAD5B5";
const BODEN = heller(AHORN, 0.12);

/** @param {number} n */
const r = (n) => Math.round(n);

/** Boden: Dielen laufen leicht auf einen Fluchtpunkt über der Mitte zu. */
function boden() {
  const fx = B / 2;
  const fy = -2400;
  const fugen = [];
  for (let x = -1400; x <= B + 1400; x += 170) {
    const t0 = (HORIZONT - fy) / (H - fy);
    fugen.push(naht(`M${r(fx + (x - fx) * t0)} ${HORIZONT} L${x} ${H}`, BODEN, 2.4, 0.16));
  }
  for (let i = 0; i < 18; i++) {
    const x = 200 + ((i * 397) % (B - 400));
    const y = HORIZONT + 90 + ((i * 233) % (H - HORIZONT - 140));
    fugen.push(naht(`M${x} ${y} l70 0`, BODEN, 2.4, 0.16));
  }
  return zusammen(flach(`rect x="0" y="${HORIZONT}" width="${B}" height="${H - HORIZONT}"`, BODEN, false), ...fugen);
}

/** Der ganze Raum als SVG (aria-hidden). */
export function raumSvg() {
  const zz = zeichner("g09raum", 4.5);
  const wand = `<rect x="0" y="0" width="${B}" height="${HORIZONT}" fill="${WAND}"/>`
    // ein ruhiger, etwas dunklerer Streifen oben unter der Kopfleiste, damit die Wand Tiefe hat
    + `<rect x="0" y="0" width="${B}" height="160" fill="${dunkler(WAND, 0.04)}"/>`;
  const sockel = zz.guss(flach(`rect x="-10" y="${HORIZONT - 12}" width="${B + 20}" height="14"`, AHORN));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">`
    + wand + zz.guss(boden()) + sockel + `</svg>`;
}
