// Der Zeltplatz in der blauen Stunde (S20): ein tiefblauer Himmel mit ein paar Sternen, ferne Hügel, die Wiese und links
// ein Zelt mit warmer Laterne. Reine Welt, keine Bedeutung (C3). Das Lernfeld (die dunkle Himmelsfläche), die Wäscheleine
// und die Kamera liegen als HTML darüber (index.html); sie folgen dem Bildformat, der Hintergrund hier hängt an keiner Spalte.
//
// Maße: viewBox 1920 × 1080, links ausgerichtet und `slice`; 1 rem (Bildhöhe / 108) = 10 Einheiten. Der Boden beginnt bei
// HORIZONT (80 rem). Keine Tiere, keine Feuerstelle (G9: kein Feuer im Bild, die Wunderkerze ist das einzige Licht, das sprüht).
import { dunkler, flach, form, heller, naht, zeichner, zusammen } from "../../start/zeichnen.js";

/** Wo die Wiese beginnt, in Einheiten (= 80 rem). */
export const HORIZONT = 800;
const B = 1920;
const H = 1080;

const ZELT = "#F0E2C4";
const WIESE = "#2F6366";
const HUEGEL = "#2C3F7A";
const LATERNE = "#FFD27A";

/** @param {number} n */
const r = (n) => Math.round(n);

/** Sterne: feste, kleine Punkte im oberen Himmel (kein Funkeln, nichts bewegt sich). */
function sterne() {
  const fest = [[130, 220], [260, 330], [410, 190], [520, 400], [690, 250], [820, 340], [960, 210], [1100, 380], [1230, 260], [1380, 330],
    [1500, 200], [1610, 410], [1730, 280], [1850, 360], [60, 450], [340, 520], [760, 470], [1040, 500], [1320, 480], [1660, 520], [1210, 150], [590, 160]];
  return fest.map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="${i % 4 === 0 ? 3.2 : 2}" fill="#F2F4FF" opacity="${i % 3 === 0 ? 0.9 : 0.6}"/>`).join("");
}

/** Hügelkette: dunkle Bögen am Horizont; die Tannen sind schlichte Dreiecke ohne Kontur. */
function huegel() {
  const fern = `<path d="M0 ${HORIZONT - 100} C 260 ${HORIZONT - 190} 470 ${HORIZONT - 70} 760 ${HORIZONT - 130} C 1040 ${HORIZONT - 190} 1280 ${HORIZONT - 60} 1560 ${HORIZONT - 120} C 1720 ${HORIZONT - 150} 1840 ${HORIZONT - 120} ${B} ${HORIZONT - 110} L ${B} ${HORIZONT + 10} L 0 ${HORIZONT + 10} Z" fill="${dunkler(HUEGEL, 0.1)}"/>`;
  const nah = `<path d="M0 ${HORIZONT - 40} C 340 ${HORIZONT - 120} 640 ${HORIZONT - 20} 980 ${HORIZONT - 70} C 1300 ${HORIZONT - 110} 1600 ${HORIZONT - 30} ${B} ${HORIZONT - 70} L ${B} ${HORIZONT + 10} L 0 ${HORIZONT + 10} Z" fill="${dunkler(HUEGEL, 0.32)}"/>`;
  const tanne = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ s) =>
    `<path d="M${x} ${y - 80 * s} L${x + 26 * s} ${y - 28 * s} L${x + 14 * s} ${y - 28 * s} L${x + 34 * s} ${y + 8 * s} L${x - 34 * s} ${y + 8 * s} L${x - 14 * s} ${y - 28 * s} L${x - 26 * s} ${y - 28 * s} Z" fill="${dunkler(HUEGEL, 0.5)}"/>`;
  return fern + nah + [[470, HORIZONT - 62, 1], [530, HORIZONT - 52, 0.8], [1180, HORIZONT - 70, 1.1], [1250, HORIZONT - 56, 0.8], [1610, HORIZONT - 52, 0.9]]
    .map(([x, y, s]) => tanne(x, y, s)).join("");
}

/** Die Wiese mit hellerem Schein um die Laterne und ein paar Halmen. */
function wiese() {
  const halme = [];
  for (let i = 0; i < 44; i++) {
    const x = (i * 163) % B;
    const y = HORIZONT + 40 + ((i * 97) % 240);
    halme.push(`<path d="M${x} ${y} l-5 -16 M${x} ${y} l1 -20 M${x} ${y} l6 -15" stroke="${heller(WIESE, 0.22)}" stroke-width="2.4" stroke-linecap="round" fill="none" opacity="0.5"/>`);
  }
  return `<rect x="0" y="${HORIZONT}" width="${B}" height="${H - HORIZONT}" fill="url(#s20wiese)"/>`
    + `<ellipse cx="230" cy="${HORIZONT + 150}" rx="360" ry="90" fill="url(#s20schein)"/>` + halme.join("");
}

/** Das Zelt links hinten: Leinwand, dunkle Seite, offener Eingang, davor die Laterne am Haken. */
function zelt(zz) {
  const x0 = 60;
  const x1 = 440;
  const spitze = 590;
  const boden = HORIZONT + 150;
  const mitte = (x0 + x1) / 2;
  const leinwand = form(`path d="M${x0} ${boden} L${mitte} ${spitze} L${x1} ${boden} Z"`, ZELT, [mitte - 60, spitze + 80], { tiefe: 0.6 });
  const seite = flach(`path d="M${mitte} ${spitze} L${x1} ${boden} L${mitte + 56} ${boden} Z"`, dunkler(ZELT, 0.12), false);
  const eingang = flach(`path d="M${mitte - 70} ${boden} L${mitte - 6} ${spitze + 110} L${mitte + 56} ${boden} Z"`, "#7B4D2B");
  const schein = { svg: `<path d="M${mitte - 58} ${boden - 4} L${mitte - 6} ${spitze + 136} L${mitte + 44} ${boden - 4} Z" fill="${LATERNE}" opacity="0.92"/>`, kontur: "" };
  const firstStange = flach(`rect x="${mitte - 5}" y="${spitze - 34}" width="10" height="40" rx="4"`, "#B98E5E");
  const naehte = naht(`M${mitte} ${spitze + 6} L${mitte - 36} ${boden - 6}`, ZELT, 2.4, 0.3);
  const seile = [x0 - 90, x1 + 110].map((px) => naht(`M${px < mitte ? x0 + 26 : x1 - 26} ${boden - 70} L${px} ${boden + 40}`, "#C9B58D", 2.6, 0.2));
  const heringe = [x0 - 90, x1 + 110].map((px) => flach(`rect x="${px - 5}" y="${boden + 32}" width="10" height="18" rx="3"`, "#B98E5E"));
  return zz.guss(...seile, ...heringe, leinwand, seite, eingang, schein, naehte, firstStange);
}

/** Die Laterne am Zelteingang: ein kleiner Kasten mit warmem Licht und einem weichen Hof (Licht nur als Fläche). */
function laterne(x, y) {
  return `<circle cx="${x}" cy="${y}" r="120" fill="url(#s20hof)"/>`
    + `<path d="M${x - 14} ${y - 34} L${x + 14} ${y - 34} L${x + 8} ${y - 46} L${x - 8} ${y - 46} Z" fill="#7B4D2B"/>`
    + `<rect x="${x - 15}" y="${y - 34}" width="30" height="44" rx="6" fill="${LATERNE}" stroke="#7B4D2B" stroke-width="4"/>`
    + `<rect x="${x - 15}" y="${y + 8}" width="30" height="7" rx="3" fill="#7B4D2B"/>`;
}

/** Der ganze Zeltplatz als SVG (aria-hidden). */
export function raumSvg() {
  const zz = zeichner("s20zelt", 4.5);
  const mitte = 250;
  const defs = `<defs>
    <linearGradient id="s20himmel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#0E1842"/><stop offset="0.45" stop-color="#1E3270"/><stop offset="0.72" stop-color="#4A66A8"/><stop offset="1" stop-color="#C98E86"/>
    </linearGradient>
    <linearGradient id="s20wiese" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2F6366"/><stop offset="1" stop-color="#1D4150"/></linearGradient>
    <radialGradient id="s20schein"><stop offset="0" stop-color="#FFD27A" stop-opacity="0.35"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
    <radialGradient id="s20hof"><stop offset="0" stop-color="#FFD27A" stop-opacity="0.55"/><stop offset="1" stop-color="#FFD27A" stop-opacity="0"/></radialGradient>
  </defs>`;
  const himmel = `<rect x="0" y="0" width="${B}" height="${HORIZONT + 10}" fill="url(#s20himmel)"/>`;
  const sonstiges = sterne();
  const zeltBild = zelt(zz);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" preserveAspectRatio="xMinYMin slice" aria-hidden="true" focusable="false">`
    + defs + himmel + sonstiges + huegel() + wiese() + zeltBild + laterne(mitte - 6, HORIZONT + 70).replace(/s20/g, "s20") + `</svg>`;
}

/**
 * Die Kamera auf dem Stativ (Sofortbildkamera: oben der Blitz, vorn die Linse, unten der Schlitz, aus dem das Foto kommt).
 * viewBox 210 × 440; die Teile `.blitzlicht` und `.linse` nimmt spiel.js für den Klick.
 */
export function kameraSvg() {
  const zz = zeichner("s20kamera", 4);
  const beine = [
    flach(`path d="M105 250 L40 428 L56 432 L112 262 Z"`, "#B98E5E"),
    flach(`path d="M105 250 L170 428 L154 432 L98 262 Z"`, "#B98E5E"),
    flach(`path d="M101 250 L99 420 L111 420 L109 250 Z"`, "#9E7849"),
  ];
  const koerper = form(`rect x="14" y="96" width="182" height="152" rx="22"`, "#F26B5B", [50, 120], { tiefe: 0.7 });
  const band = flach(`rect x="14" y="148" width="182" height="34" rx="2"`, "#FFFCF7", false);
  const blitz = form(`rect x="130" y="64" width="50" height="40" rx="8"`, "#FFE9A8", [145, 72], { tiefe: 0.5 });
  const sucher = flach(`rect x="34" y="76" width="30" height="26" rx="6"`, "#3B2A6B");
  const linseAussen = form(`circle cx="92" cy="170" r="52"`, "#6B5C96", [76, 150], { tiefe: 0.7 });
  const linse = form(`circle cx="92" cy="170" r="34"`, "#1F1B45", [80, 156], { tiefe: 0.5 });
  const glanz = { svg: `<circle cx="80" cy="158" r="8" fill="#BFD3FF" opacity="0.9"/><circle cx="104" cy="184" r="4" fill="#BFD3FF" opacity="0.6"/>`, kontur: "" };
  const schlitz = flach(`rect x="40" y="226" width="104" height="10" rx="4"`, "#3B2A6B", false);
  return `<svg viewBox="0 0 210 440" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">`
    + zz.guss(...beine, koerper, band, sucher, linseAussen, linse, glanz, schlitz, blitz)
    + `<rect class="blitzlicht" x="130" y="64" width="50" height="40" rx="8" fill="#FFFDF0" opacity="0"/></svg>`;
}

void zusammen;
void r;
