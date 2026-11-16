// Der Raum von M08 (Review Christian 2026-11-16: „wenig einladend“): ein heller Montessori-Werkraum nach dem Leitbild
// der Farbwelt (grundsaetze-bilder.md §6.2). Hoher Blick: oben nur ein Streifen Wand mit einem großen Fenster und einem
// niedrigen Regal, darunter heller Ahornboden; aus dem Fenster fällt ein blasser Lichtfleck schräg über den Boden.
// Die Arbeitsmatte mit der Stellentafel liegt als HTML darüber (index.html, .tafel::before) – sie ist das Hellste.
//
// Maße: viewBox 2600 × 1080 und `slice`, damit jedes Bildformat bis 2,4 : 1 nach der Höhe skaliert wird – dann ist
// 1 rem (Bildhöhe / 108) genau 10 Einheiten, und die Wandkante (HORIZONT) liegt immer bei 29 rem, unter der Kopfleiste
// (15,8 rem). Die Mitte (x = 1300) ist die Bildschirmmitte.
// Farben nur aus der Farbwelt und ihren Stufen (dunkler/heller), keine Bedeutungsfarben (C3). Stil der Runde: Kontur nur
// um Silhouetten (guss), Schatten in Stufen (form), Fugen im dunklen Ton der Fläche (naht).
import { dunkler, flach, form, heller, naht, zeichner, zusammen } from "../../start/zeichnen.js";

/** Wandkante in Einheiten (= 29 rem). */
export const HORIZONT = 290;
const B = 2600;
const H = 1080;
/** Sichtbare Kontur wie bei Timo (Figur 280 Einheiten auf 56 rem: 3 × 2 ≈ 6, etwas leiser). */
const KONTUR = 4.5;

const WAND = "#F6ECDF"; // Kulisse „Im Haus“
const AHORN = "#EAD5B5";
const KANTE = "#B98E5E";
const BODEN = heller(AHORN, 0.12); // heller als das Tablett, damit das Ziffernbrett als Ding auf dem Boden liest
const HIMMEL = "#EAF3F3"; // Kulisse „Garten“, Grund
const LAUB = "#7FA36C"; // Kulisse „Garten“, tief
const KORB = "#C9A06E"; // Kulisse „Strand“, tief

/** @param {number} n */
const r = (n) => Math.round(n);

/** Boden: Dielen laufen leicht auf einen Fluchtpunkt über der Mitte zu. */
function boden() {
  const fx = B / 2;
  const fy = -2400;
  const fugen = [];
  for (let x = -1400; x <= B + 1400; x += 170) {
    // Gerade von der Wandkante nach unten, ausgerichtet auf den Fluchtpunkt.
    const t0 = (HORIZONT - fy) / (H - fy);
    const xo = fx + (x - fx) * t0;
    fugen.push(naht(`M${r(xo)} ${HORIZONT} L${x} ${H}`, BODEN, 2.4, 0.16));
  }
  // Kurze Querfugen, versetzt, damit es Dielen sind und keine Streifen.
  for (let i = 0; i < 18; i++) {
    const x = 200 + ((i * 397) % (B - 400));
    const y = HORIZONT + 90 + ((i * 233) % (H - HORIZONT - 140));
    fugen.push(naht(`M${x} ${y} l70 0`, BODEN, 2.4, 0.16));
  }
  return zusammen(flach(`rect x="0" y="${HORIZONT}" width="${B}" height="${H - HORIZONT}"`, BODEN, false), ...fugen);
}

/** Der Lichtfleck des Fensters: ein schräges Viereck auf dem Boden, blass. */
function licht() {
  return `<path d="M640 ${HORIZONT} L1000 ${HORIZONT} L1180 ${H} L520 ${H} Z" fill="#FFFCF7" opacity="0.6"/>`;
}

/** Ein großes Fenster: unten sieht man das Fensterbrett, oben verschwindet es unter der Kopfleiste. */
function fenster(zz) {
  const x = 640;
  const w = 360;
  const oben = 168;
  const unten = 262;
  const rahmen = 16;
  const scheiben = zz.innen([`rect x="${x + rahmen}" y="${oben}" width="${w - 2 * rahmen}" height="${unten - oben - rahmen}"`],
    `<rect x="${x}" y="${oben}" width="${w}" height="${unten - oben}" fill="${HIMMEL}"/>`
    // Draußen eine Baumkrone, ruhig und blass.
    + `<ellipse cx="${x + 90}" cy="${unten + 10}" rx="120" ry="70" fill="${heller(LAUB, 0.45)}"/>`
    + `<ellipse cx="${x + 300}" cy="${unten + 30}" rx="110" ry="60" fill="${heller(LAUB, 0.55)}"/>`);
  return zz.guss(
    form(`rect x="${x}" y="${oben}" width="${w}" height="${unten - oben}" rx="6"`, KANTE, [x + 10, oben + 10], { tiefe: 0.6 }),
    scheiben,
    flach(`rect x="${x + w / 2 - 7}" y="${oben}" width="14" height="${unten - oben}"`, KANTE, false),
    form(`rect x="${x - 26}" y="${unten - 4}" width="${w + 52}" height="18" rx="5"`, AHORN, [x, unten], { tiefe: 0.7 }),
  );
}

/** Ein niedriges Regal an der Wand: zwei Fächer mit Körben, oben eine Pflanze. */
function regal(zz) {
  const x = 1230;
  const w = 400;
  const oben = 238;
  const unten = HORIZONT + 6;
  const fach = (/** @type {number} */ fx) => zusammen(
    flach(`rect x="${fx}" y="${oben + 18}" width="${w / 2 - 30}" height="${unten - oben - 36}" rx="4"`, dunkler(KANTE, 0.12), false),
    form(`rect x="${fx + 22}" y="${oben + 40}" width="${w / 2 - 74}" height="${unten - oben - 58}" rx="10"`, KORB, [fx + 30, oben + 44], { tiefe: 0.6 }),
    naht(`M${fx + 30} ${oben + 62} L${fx + w / 2 - 60} ${oben + 62}`, KORB, 2, 0.25),
  );
  return zz.guss(
    form(`rect x="${x}" y="${oben}" width="${w}" height="${unten - oben}" rx="8"`, AHORN, [x + 12, oben + 8], { tiefe: 0.7 }),
    fach(x + 20),
    fach(x + w / 2 + 10),
    // Pflanze: Topf und drei runde Blätter (im Topf, nicht schwebend).
    form(`ellipse cx="${x + 300}" cy="${oben - 44}" rx="20" ry="24"`, LAUB, [x + 292, oben - 62], { tiefe: 0.6 }),
    form(`ellipse cx="${x + 328}" cy="${oben - 48}" rx="18" ry="26"`, LAUB, [x + 320, oben - 74], { tiefe: 0.6 }),
    form(`path d="M${x + 284} ${oben} l60 0 l-7 -28 l-46 0 z"`, KORB, [x + 292, oben - 24], { tiefe: 0.6 }),
  );
}

/** Der ganze Raum als SVG (aria-hidden; reine Welt, keine Bedeutung). */
export function raumSvg() {
  const zz = zeichner("raum", KONTUR);
  const wand = `<rect x="0" y="0" width="${B}" height="${HORIZONT}" fill="${WAND}"/>`;
  const sockel = zz.guss(flach(`rect x="-10" y="${HORIZONT - 12}" width="${B + 20}" height="14"`, AHORN));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">`
    + wand + fenster(zz) + zz.guss(boden()) + licht() + sockel + regal(zz)
    + `</svg>`;
}
