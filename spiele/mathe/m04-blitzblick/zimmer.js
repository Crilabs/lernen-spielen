// Kofis Zimmer am Abend (Idee §3, Vorbild m08-stellentafel/raum.js): hoher Blick, oben ein Streifen Wand mit einem Fenster
// in der Dämmerung, einem Regal mit der Tischlampe und einer Lichterschnur davor, darunter warmer Holzboden im Lampenlicht.
// Die Matte mit Glas und Schnur liegt als HTML darüber (index.html) und ist das Hellste.
//
// Maße wie raum.js: viewBox 2600 × 1080 und `slice`; 1 rem (Bildhöhe / 108) sind 10 Einheiten, die Wandkante liegt bei
// 29 rem, unter der Kopfleiste (15,8 rem). Die Bildmitte ist x = 1300.
// Keine Bedeutungsfarben (C3), nur die ruhigen Töne der Farbwelt; Verläufe nur hier in der Welt.
import { dunkler, flach, form, heller, naht, zeichner, zusammen } from "../../start/zeichnen.js";

/** Wandkante in Einheiten (= 33 rem). */
export const HORIZONT = 330;
const B = 2600;
const H = 1080;
const KONTUR = 4.5;

const WAND = "#F4EAEF";
const AHORN = "#EAD5B5";
const KANTE = "#B98E5E";
const BODEN = "#EBD3A8";
const HIMMEL_OBEN = "#6F7DB8";
const HIMMEL_UNTEN = "#F3B58C";
const KORB = "#C9A06E";
const LAUB = "#7FA36C";

/** @param {number} n */
const r = (n) => Math.round(n);

/** Holzboden: Dielen laufen auf einen Fluchtpunkt über der Mitte zu, dazu der Lichtkreis der Lampe. */
function boden() {
  const fx = B / 2;
  const fy = -2400;
  const fugen = [];
  for (let x = -1400; x <= B + 1400; x += 170) {
    const t0 = (HORIZONT - fy) / (H - fy);
    const xo = fx + (x - fx) * t0;
    fugen.push(naht(`M${r(xo)} ${HORIZONT} L${x} ${H}`, BODEN, 2.4, 0.16));
  }
  for (let i = 0; i < 18; i++) {
    const x = 200 + ((i * 397) % (B - 400));
    const y = HORIZONT + 90 + ((i * 233) % (H - HORIZONT - 140));
    fugen.push(naht(`M${x} ${y} l70 0`, BODEN, 2.4, 0.16));
  }
  return zusammen(flach(`rect x="0" y="${HORIZONT}" width="${B}" height="${H - HORIZONT}"`, BODEN, false), ...fugen);
}

/** Das Fenster mit zwei Flügeln; draußen Dämmerhimmel, ein Baum und ein erster Stern. */
function fenster(zz) {
  const x = 960;
  const w = 440;
  const oben = 200;
  const unten = 318;
  const rahmen = 14;
  const mitte = x + w / 2;
  const scheibe = (/** @type {number} */ von, /** @type {number} */ bis, /** @type {string} */ id) =>
    `<g id="${id}" class="fluegel">`
    + `<rect x="${von}" y="${oben + rahmen}" width="${bis - von}" height="${unten - oben - 2 * rahmen}" fill="url(#himmel)"/>`
    + `<rect x="${von}" y="${oben + rahmen}" width="${bis - von}" height="${unten - oben - 2 * rahmen}" fill="none" stroke="${KANTE}" stroke-width="10"/>`
    + `</g>`;
  return zz.guss(
    form(`rect x="${x}" y="${oben}" width="${w}" height="${unten - oben}" rx="6"`, KANTE, [x + 10, oben + 10], { tiefe: 0.6 }),
    { svg: `<rect x="${x + rahmen}" y="${oben + rahmen}" width="${w - 2 * rahmen}" height="${unten - oben - 2 * rahmen}" fill="url(#himmel)"/>`
      + `<ellipse cx="${x + 90}" cy="${unten - 6}" rx="110" ry="46" fill="${heller(LAUB, 0.4)}" opacity="0.8"/>`
      + `<ellipse cx="${x + 290}" cy="${unten - 2}" rx="100" ry="40" fill="${heller(LAUB, 0.5)}" opacity="0.8"/>`
      + `<circle cx="${x + 250}" cy="${oben + 36}" r="4" fill="#FFF6D8"/><circle cx="${x + 120}" cy="${oben + 48}" r="3" fill="#FFF6D8"/>`,
    kontur: "" },
    { svg: scheibe(x + rahmen, mitte, "fluegel-links") + scheibe(mitte, x + w - rahmen, "fluegel-rechts"), kontur: "" },
    form(`rect x="${x - 24}" y="${unten - 4}" width="${w + 48}" height="16" rx="5"`, AHORN, [x, unten], { tiefe: 0.7 }),
  );
}

/** Das Regal rechts mit Büchern, einem Korb und der Tischlampe; deren Licht liegt als warmer Fleck auf der Wand. */
function regal(zz) {
  const x = 1740;
  const w = 420;
  const oben = 270;
  const unten = HORIZONT + 6;
  const buch = (/** @type {number} */ bx, /** @type {number} */ h, /** @type {string} */ farbe) =>
    form(`rect x="${bx}" y="${unten - 18 - h}" width="22" height="${h}" rx="3"`, farbe, [bx + 4, unten - 14 - h], { tiefe: 0.6 });
  return zz.guss(
    form(`rect x="${x}" y="${oben}" width="${w}" height="${unten - oben}" rx="8"`, AHORN, [x + 12, oben + 8], { tiefe: 0.7 }),
    flach(`rect x="${x + 16}" y="${oben + 14}" width="${w / 2 - 20}" height="${unten - oben - 28}" rx="4"`, dunkler(KANTE, 0.12), false),
    flach(`rect x="${x + w / 2 + 6}" y="${oben + 14}" width="${w / 2 - 22}" height="${unten - oben - 28}" rx="4"`, dunkler(KANTE, 0.12), false),
    buch(x + 30, 36, "#C97B63"), buch(x + 56, 42, "#5E8FA8"), buch(x + 82, 32, "#6FA37F"), buch(x + 108, 40, "#8F6FA8"),
    form(`rect x="${x + 250}" y="${oben + 34}" width="120" height="${unten - oben - 40}" rx="12"`, KORB, [x + 258, oben + 40], { tiefe: 0.6 }),
    // Lampe auf dem Regal: Fuß und Schirm
    form(`rect x="${x + w - 96}" y="${oben - 34}" width="14" height="34"`, KANTE, [x + w - 94, oben - 30], { tiefe: 0.5 }),
    form(`path d="M${x + w - 124} ${oben - 34} l70 0 l-12 -44 l-46 0 z"`, "#F7D98A", [x + w - 112, oben - 70], { tiefe: 0.5 }),
  );
}

/** Der warme Fleck der Lampe auf Wand und Boden. */
function lampenlicht() {
  const lx = 1740 + 420 - 89;
  return `<ellipse cx="${lx}" cy="${HORIZONT - 120}" rx="520" ry="260" fill="url(#lampe)"/>`
    + `<ellipse cx="${lx - 280}" cy="${HORIZONT + 330}" rx="900" ry="340" fill="url(#lampe-boden)"/>`;
}

/** Der ganze Raum als SVG (aria-hidden; reine Welt, keine Bedeutung). */
export function zimmerSvg() {
  const zz = zeichner("zimmer", KONTUR);
  const defs = `<defs>
    <linearGradient id="himmel" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${HIMMEL_OBEN}"/><stop offset="1" stop-color="${HIMMEL_UNTEN}"/></linearGradient>
    <radialGradient id="lampe"><stop offset="0" stop-color="#FFE9A8" stop-opacity="0.75"/><stop offset="1" stop-color="#FFE9A8" stop-opacity="0"/></radialGradient>
    <radialGradient id="lampe-boden"><stop offset="0" stop-color="#FFF1C4" stop-opacity="0.5"/><stop offset="1" stop-color="#FFF1C4" stop-opacity="0"/></radialGradient>
  </defs>`;
  const wand = `<rect x="0" y="0" width="${B}" height="${HORIZONT}" fill="${WAND}"/>`;
  const sockel = zz.guss(flach(`rect x="-10" y="${HORIZONT - 12}" width="${B + 20}" height="14"`, AHORN));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">`
    + defs + wand + fenster(zz) + zz.guss(boden()) + lampenlicht() + sockel + regal(zz)
    + `</svg>`;
}
