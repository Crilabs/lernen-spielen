// Die Wohnküche von G02 (Ich-Sicht am Maltisch): hinten die Wand mit Fenster, Lampe und einem Bild, vorn der Holztisch,
// auf dem der Papierbogen liegt. Reine Welt, keine Bedeutung (C3); Farben aus der Farbwelt (grundsaetze-bilder.md §6.2).
// Die Figuren der Runde sitzen hinter dem Tisch: der Tisch (tischSvg) liegt in einer eigenen Schicht über ihnen und
// verdeckt ihre Beine. Wand und Tisch folgen dem Bildformat wie bei m08-stellentafel/raum.js: viewBox mit 10 Einheiten je
// rem (Bildhöhe / 108) und `slice`, die Mitte (x = 1300) ist die Bildschirmmitte.
import { dunkler, flach, form, heller, naht, zeichner, zusammen } from "../../start/zeichnen.js";

/** Tischkante (Hinterkante des Tisches) in Einheiten (= 47 rem). */
export const TISCH_OBEN = 470;
const B = 2600;
const H = 1080;
const WAND = "#F6ECDF";
const AHORN = "#EAD5B5";
const KANTE = "#B98E5E";
const HOLZ = "#DDBB8D";
const HIMMEL = "#EAF3F3";
const LAUB = "#7FA36C";
const SCHIRM = "#F4C98E";

/** Die Wand, Fenster, Lampe und ein Bild: ein ruhiger Raum mit Nachmittagslicht. @returns {string} SVG-Text */
export function raumSvg() {
  const zz = zeichner("g02raum", 4.5);
  const wand = `<rect x="0" y="0" width="${B}" height="${TISCH_OBEN + 40}" fill="${WAND}"/>`
    + `<rect x="0" y="0" width="${B}" height="160" fill="${dunkler(WAND, 0.04)}"/>`;
  // Fenster (in der Lücke zwischen Kofi und Lena): Scheiben mit Baumkrone, Kreuz, Fensterbrett
  const x = 780;
  const oben = 190;
  const unten = 430;
  const w = 200;
  const r = 14;
  const scheiben = zz.innen([`rect x="${x + r}" y="${oben + r}" width="${w - 2 * r}" height="${unten - oben - 2 * r}"`],
    `<rect x="${x}" y="${oben}" width="${w}" height="${unten - oben}" fill="${HIMMEL}"/>`
    + `<ellipse cx="${x + 70}" cy="${unten - 10}" rx="110" ry="70" fill="${heller(LAUB, 0.45)}"/>`
    + `<ellipse cx="${x + 200}" cy="${unten - 5}" rx="90" ry="60" fill="${heller(LAUB, 0.55)}"/>`);
  const fenster = zz.guss(
    form(`rect x="${x}" y="${oben}" width="${w}" height="${unten - oben}" rx="6"`, KANTE, [x + 10, oben + 10], { tiefe: 0.6 }),
    scheiben,
    flach(`rect x="${x + w / 2 - 6}" y="${oben}" width="12" height="${unten - oben}"`, KANTE, false),
    flach(`rect x="${x}" y="${(oben + unten) / 2 - 6}" width="${w}" height="12"`, KANTE, false),
    form(`rect x="${x - 20}" y="${unten - 6}" width="${w + 40}" height="18" rx="5"`, AHORN, [x, unten], { tiefe: 0.7 }),
  );
  // Lichtfleck des Fensters auf der Wand
  const licht = `<path d="M${x} ${oben} L${x + w} ${oben} L${x + w + 160} ${TISCH_OBEN} L${x - 80} ${TISCH_OBEN} Z" fill="#FFFCF7" opacity="0.35"/>`;
  // Lampe über dem Tisch: Schnur von oben, Schirm
  const lx = 1340;
  const lampe = zz.guss(
    flach(`rect x="${lx - 3}" y="0" width="6" height="200"`, "#6E5A4A", false),
    form(`path d="M${lx - 70} 290 L${lx - 28} 190 L${lx + 28} 190 L${lx + 70} 290 Z"`, SCHIRM, [lx - 30, 200], { tiefe: 0.7 }),
    flach(`ellipse cx="${lx}" cy="292" rx="32" ry="9"`, "#FFF1B8", false),
  );
  // ein Bild an der Wand zwischen Timo und Ela: Rahmen, Hügel, Sonne
  const bx = 1715;
  const by = 230;
  const bild = zz.guss(
    form(`rect x="${bx}" y="${by}" width="170" height="130" rx="6"`, KANTE, [bx + 8, by + 8], { tiefe: 0.6 }),
    zz.innen([`rect x="${bx + 12}" y="${by + 12}" width="146" height="106"`],
      `<rect x="${bx}" y="${by}" width="170" height="130" fill="${HIMMEL}"/><circle cx="${bx + 120}" cy="${by + 42}" r="20" fill="#FFE9A8"/>`
      + `<ellipse cx="${bx + 50}" cy="${by + 128}" rx="95" ry="48" fill="${heller(LAUB, 0.4)}"/>`),
  );
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">`
    + wand + licht + fenster + bild + lampe + `</svg>`;
}

/**
 * Der Holztisch von vorn und leicht von oben: eine breite Platte mit Dielen und Fugen, hinten die Kante. Liegt über den
 * Figuren. viewBox 2600 × 610 (= 61 rem ab TISCH_OBEN), `slice` und mittig wie der Raum. @returns {string} SVG-Text
 */
export function tischSvg() {
  const zz = zeichner("g02tisch", 4.5);
  const hoehe = H - TISCH_OBEN;
  const fugen = [];
  for (let y = 150; y < hoehe; y += 150) fugen.push(naht(`M0 ${y} L${B} ${y}`, HOLZ, 2.6, 0.16));
  // kurze Stoßfugen, versetzt
  for (let i = 0; i < 26; i++) {
    const reihe = i % 4;
    const y0 = 16 + reihe * 150;
    const x = 120 + ((i * 331) % (B - 240));
    fugen.push(naht(`M${x} ${y0 + 4} l0 ${y0 + 150 > hoehe ? 60 : 130}`, HOLZ, 2.6, 0.14));
  }
  // Maserung
  for (let i = 0; i < 16; i++) {
    const x = 80 + ((i * 487) % (B - 300));
    const y = 40 + ((i * 197) % (hoehe - 80));
    fugen.push(naht(`M${x} ${y} q40 -8 90 0`, HOLZ, 2.4, 0.12));
  }
  const platte = zz.guss(
    flach(`rect x="-20" y="0" width="${B + 40}" height="${hoehe + 20}"`, HOLZ),
    ...fugen,
    flach(`rect x="-20" y="0" width="${B + 40}" height="26"`, heller(HOLZ, 0.16), false),
  );
  // warmer Lichtfleck der Lampe auf der Tischplatte
  const fleck = `<ellipse cx="1340" cy="260" rx="560" ry="200" fill="#FFF8E6" opacity="0.30"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${hoehe}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">`
    + platte + fleck + `</svg>`;
}

/** Ein Stiftebecher mit Buntstiften (Feld 0…100 breit, 0…120 hoch), steht auf dem Tisch. @returns {string} SVG-Text */
export function becherSvg() {
  const zz = zeichner("g02becher", 2.4);
  const farben = ["#8FD3EE", "#F59A86", "#FFD95A", "#9ED8A8", "#C9A6E8", "#F4C98E"];
  const stifte = farben.map((f, i) => {
    const x = 28 + i * 9;
    const oben = 14 + ((i * 7) % 16);
    return zusammen(
      form(`rect x="${x - 3.4}" y="${oben + 10}" width="6.8" height="${70 - oben}"`, f, [x - 2, oben + 12], { s: 0.8 }),
      form(`path d="M${x - 3.4} ${oben + 10} L${x} ${oben} L${x + 3.4} ${oben + 10} Z"`, "#F3D9B1", [x - 1, oben + 8], { s: 0.86 }),
      flach(`path d="M${x - 1.2} ${oben + 3.6} L${x} ${oben} L${x + 1.2} ${oben + 3.6} Z"`, "#4F8FB3"),
    );
  });
  const becher = zusammen(
    form(`path d="M20 62 L80 62 L75 112 Q75 116 71 116 L29 116 Q25 116 25 112 Z"`, "#BFE3C9", [26, 66], { s: 0.92 }),
    flach(`path d="M20 62 L80 62 L79.5 68 L20.5 68 Z"`, heller("#BFE3C9", 0.25)),
  );
  return `<svg viewBox="0 0 100 120" overflow="visible" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${zz.guss(...stifte, becher)}</svg>`;
}

/** Die Kiste mit Bastelsachen (Feld 0…120 breit, 0…90 hoch): Holzkiste, Papierstreifen und ein Klötzchen schauen heraus. @returns {string} SVG-Text */
export function kisteSvg() {
  const zz = zeichner("g02kiste", 2.4);
  return `<svg viewBox="0 0 120 90" overflow="visible" xmlns="http://www.w3.org/2000/svg" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${zz.guss(
    form(`rect x="26" y="8" width="26" height="30" rx="3"`, "#F7D6C5", [28, 10], { s: 0.9 }),
    form(`rect x="60" y="14" width="22" height="22" rx="3"`, "#9ED8A8", [62, 16], { s: 0.9 }),
    flach(`path d="M84 36 L92 8 L100 12 L94 38 Z"`, "#FFD95A"),
    form(`rect x="6" y="30" width="108" height="56" rx="6"`, "#C9A06E", [16, 36], { tiefe: 0.7 }),
    naht("M8 52 L112 52", "#C9A06E", 2, 0.3),
    naht("M8 70 L112 70", "#C9A06E", 2, 0.3),
    flach(`rect x="44" y="40" width="32" height="7" rx="3"`, "#8F6A43", false),
  )}</svg>`;
}
