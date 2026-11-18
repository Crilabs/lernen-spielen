// Der Schulhof (S18): hinten eine Backsteinmauer mit einem Holzzaun davor, links ein Baum mit Licht, vorn graues Pflaster mit
// einem halben Hüpfkästchen am Rand. Reine Welt, keine Bedeutung (C3); Farben aus der Farbwelt (grundsaetze-bilder.md §6.2),
// Licht von links. Das Hof-Schild, das Buchstabenhaus und die Figuren liegen als HTML darüber (index.html).
//
// Maße wie bei m08-stellentafel/raum.js: viewBox 2600 × 1080 und `slice`, 1 rem (Bildhöhe / 108) = 10 Einheiten. Die Mauerkante
// liegt bei HORIZONT (= 41 rem); das Buchstabenhaus beginnt darunter.
import { dunkler, flach, form, heller, naht, ton, zeichner, zusammen } from "../../start/zeichnen.js";

/** Mauerkante in Einheiten (= 41 rem). */
export const HORIZONT = 410;
const B = 2600;
const H = 1080;
const MAUER = "#E8B79A";
const PFLASTER = "#D9D3CC";
const HOLZ = "#C9A06E";
const LAUB = "#7DC28A";
const STAMM = "#B98E5E";
const SONNE = "#F2C14E";

/** @param {number} n */
const r = (n) => Math.round(n);

/** Mauer: Backsteine in Reihen, jede zweite Reihe versetzt; ein Streifen Licht links. */
function mauer() {
  const fugen = [];
  for (let y = 0, i = 0; y < HORIZONT; y += 40, i++) {
    fugen.push(naht(`M0 ${y} L${B} ${y}`, MAUER, 2.2, 0.18));
    for (let x = (i % 2) * 40; x < B; x += 80) fugen.push(naht(`M${x} ${y} L${x} ${y + 40}`, MAUER, 2.2, 0.18));
  }
  return zusammen(
    flach(`rect x="0" y="0" width="${B}" height="${HORIZONT}"`, MAUER, false),
    ton(`M0 0 L760 0 L560 ${HORIZONT} L0 ${HORIZONT} Z`, heller(MAUER, 0.1)),
    ...fugen,
    ton(`M0 0 L${B} 0 L${B} 160 L0 160 Z`, dunkler(MAUER, 0.06)),
  );
}

/** Holzzaun vor der Mauer: Latten mit Spitze, zwei Querbalken. Die Mitte bleibt frei für das Schild (HTML). */
function zaun() {
  const teile = [];
  for (let x = -20; x < B + 40; x += 76) {
    teile.push(form(`path d="M${x} 232 L${x + 62} 232 L${x + 62} ${HORIZONT + 4} L${x} ${HORIZONT + 4} Z"`, HOLZ, [x + 10, 250], { tiefe: 0.7 }));
    teile.push(form(`path d="M${x} 232 L${x + 31} 200 L${x + 62} 232 Z"`, HOLZ, [x + 22, 224], { tiefe: 0.7 }));
  }
  teile.push(flach(`rect x="-10" y="292" width="${B + 20}" height="16"`, dunkler(HOLZ, 0.08), false));
  teile.push(flach(`rect x="-10" y="352" width="${B + 20}" height="16"`, dunkler(HOLZ, 0.08), false));
  return zusammen(...teile);
}

/** Baum links: Stamm und drei Laubwolken mit Licht (die obere Hälfte verschwindet hinter der Kopfleiste). */
function baum(x = 560) {
  return zusammen(
    form(`path d="M${x - 26} ${HORIZONT + 6} L${x - 16} 280 L${x + 16} 280 L${x + 26} ${HORIZONT + 6} Z"`, STAMM, [x - 12, 300], { tiefe: 0.8 }),
    form(`circle cx="${x}" cy="196" r="104"`, LAUB, [x - 44, 150], { tiefe: 0.7 }),
    form(`circle cx="${x - 88}" cy="250" r="74"`, heller(LAUB, 0.05), [x - 120, 222], { tiefe: 0.7 }),
    form(`circle cx="${x + 92}" cy="248" r="78"`, dunkler(LAUB, 0.08), [x + 66, 218], { tiefe: 0.7 }),
  );
}

/** Pflaster: Fugen laufen leicht auf einen Fluchtpunkt zu, Querfugen werden nach vorn weiter. */
function boden() {
  const fx = B / 2;
  const fy = -2200;
  const fugen = [];
  const t0 = (HORIZONT - fy) / (H - fy);
  for (let x = -1500; x <= B + 1500; x += 240) fugen.push(naht(`M${r(fx + (x - fx) * t0)} ${HORIZONT} L${x} ${H}`, PFLASTER, 2.4, 0.14));
  for (let i = 0, y = HORIZONT + 50; y < H; i++) {
    fugen.push(naht(`M0 ${r(y)} L${B} ${r(y)}`, PFLASTER, 2.4, 0.14));
    y += 50 + i * 22;
  }
  return zusammen(flach(`rect x="0" y="${HORIZONT}" width="${B}" height="${H - HORIZONT}"`, heller(PFLASTER, 0.05), false), ...fugen);
}

/** Ein halbes Hüpfkästchen am rechten Rand, mit Kreide gemalt. */
function huepfkaestchen() {
  const x = 2330;
  const y = 880;
  const k = (/** @type {number} */ dy, /** @type {number} */ w) => `rect x="${x + (170 - w) / 2}" y="${y + dy}" width="${w}" height="${w * 0.62}" rx="6"`;
  const strich = (/** @type {string} */ geo) => `<${geo} fill="none" stroke="#FFFCF7" stroke-width="6" stroke-linejoin="round" opacity="0.85"/>`;
  return { svg: strich(k(0, 170)) + strich(k(-100, 170)) + strich(k(-200, 170)) + strich(k(-260, 170)), kontur: "" };
}

/** Der ganze Hof als SVG (aria-hidden). */
export function raumSvg() {
  const zz = zeichner("s18hof", 4.5);
  const sonne = zz.guss(flach(`circle cx="2230" cy="-10" r="150"`, SONNE, false));
  const sockel = zz.guss(flach(`rect x="-10" y="${HORIZONT - 2}" width="${B + 20}" height="22"`, "#B9AFA5"));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">`
    + zz.guss(mauer()) + sonne + zz.guss(zaun()) + zz.guss(baum()) + sockel + zz.guss(boden()) + huepfkaestchen().svg + `</svg>`;
}
