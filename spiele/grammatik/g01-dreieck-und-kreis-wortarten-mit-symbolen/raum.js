// Der Hinterhof (G01): oben eine warme Hauswand mit Fenster, Blumenkasten und Regenrohr, unten der Pflasterboden mit
// Platten, die auf einen Fluchtpunkt zulaufen. Reine Welt, keine Bedeutung (C3); Farben aus der Farbwelt
// (grundsaetze-bilder.md §6.2). Das Licht kommt von links. Die Kreidereihe, Kofis Weg und das Tablett liegen als HTML
// darüber (index.html): sie folgen dem Bildformat, der Hintergrund hier hängt an keiner Spalte.
//
// Maße wie bei m08-stellentafel/raum.js: viewBox 2600 × 1080 und `slice`, 1 rem (Bildhöhe / 108) = 10 Einheiten.
// Die Wandkante liegt bei HORIZONT (= 55 rem), knapp unter Kofis Füßen.
import { dunkler, flach, form, heller, naht, zeichner, zusammen } from "../../start/zeichnen.js";

/** Wandkante in Einheiten (= 55 rem). */
export const HORIZONT = 550;
const B = 2600;
const H = 1080;
const WAND = "#F3DFC8";
const PFLASTER = "#DAD3CB";
const HOLZ = "#C9A06E";
const ROT = "#F26B5B";
const SONNE = "#F2C14E";
const WIESE = "#7DC28A";
const WASSER = "#8FD3EE";

/** @param {number} n */
const r = (n) => Math.round(n);

/** Boden: Pflasterplatten, Fugen laufen leicht auf einen Fluchtpunkt über der Mitte zu, Querfugen werden nach vorn weiter. */
function boden() {
  const fx = B / 2;
  const fy = -2200;
  const fugen = [];
  const t0 = (HORIZONT - fy) / (H - fy);
  for (let x = -1500; x <= B + 1500; x += 230) {
    fugen.push(naht(`M${r(fx + (x - fx) * t0)} ${HORIZONT} L${x} ${H}`, PFLASTER, 2.4, 0.14));
  }
  for (let i = 0, y = HORIZONT + 46; y < H; i++) {
    fugen.push(naht(`M0 ${r(y)} L${B} ${r(y)}`, PFLASTER, 2.4, 0.14));
    y += 46 + i * 20;
  }
  return zusammen(flach(`rect x="0" y="${HORIZONT}" width="${B}" height="${H - HORIZONT}"`, heller(PFLASTER, 0.06), false), ...fugen);
}

/** Fenster mit Rahmen, zwei Scheiben und Blick auf Himmel und Büsche. @param {number} x @param {number} y */
function fenster(x, y) {
  const w = 360;
  const h = 330;
  return zusammen(
    form(`rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14"`, "#B98E5E", [x + 80, y + 60], { tiefe: 0.6 }),
    { svg: `<clipPath id="g01fenster"><rect x="${x + 22}" y="${y + 22}" width="${w - 44}" height="${h - 44}"/></clipPath>`
      + `<g clip-path="url(#g01fenster)"><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#EAF3F3"/>`
      + `<ellipse cx="${x + 110}" cy="${y + h - 20}" rx="150" ry="80" fill="#CFE0C5"/><ellipse cx="${x + 280}" cy="${y + h - 10}" rx="130" ry="70" fill="#DCE9D2"/></g>`, kontur: "" },
    flach(`rect x="${x + w / 2 - 10}" y="${y}" width="20" height="${h}"`, "#B98E5E", false),
    flach(`rect x="${x}" y="${y + h / 2 - 9}" width="${w}" height="18"`, "#B98E5E", false),
  );
}

/** Blumenkasten unter dem Fenster mit Blüten in Korallen, Sonne und Weiß. @param {number} x @param {number} y */
function blumenkasten(x, y) {
  const bl = [];
  const farben = [ROT, SONNE, "#FFFCF7", "#F6A5C0", SONNE, ROT, "#FFFCF7", "#F6A5C0", ROT];
  for (let i = 0; i < 9; i++) {
    const cx = x + 36 + i * 36;
    bl.push(flach(`ellipse cx="${cx}" cy="${y - 4 - (i % 3) * 14}" rx="22" ry="17"`, WIESE, false));
    bl.push(flach(`circle cx="${cx + (i % 2 ? 6 : -6)}" cy="${y - 20 - (i % 3) * 14}" r="9"`, farben[i], false));
  }
  return zusammen(
    ...bl,
    form(`rect x="${x - 6}" y="${y}" width="372" height="62" rx="8"`, HOLZ, [x + 60, y + 14], { tiefe: 0.7 }),
    naht(`M${x + 2} ${y + 30} L${x + 358} ${y + 30}`, HOLZ, 2.4, 0.3),
  );
}

/** Ein Blumentopf mit Pflanze an der Wand. @param {number} x Mitte @param {number} y Boden */
function topf(x, y) {
  const blaetter = [-40, -14, 14, 40].map((dx, i) =>
    flach(`ellipse cx="${x + dx}" cy="${y - 150 - (i % 2) * 30}" rx="26" ry="62" transform="rotate(${dx > 0 ? 18 : -18} ${x + dx} ${y - 100})"`, i % 2 ? "#7DC28A" : "#5FAE74", true));
  return zusammen(
    ...blaetter,
    form(`path d="M${x - 62} ${y - 100} L${x + 62} ${y - 100} L${x + 48} ${y} L${x - 48} ${y} Z"`, ROT, [x - 30, y - 70], { tiefe: 0.7 }),
    flach(`rect x="${x - 70}" y="${y - 116}" width="140" height="24" rx="8"`, "#FF9F8A"),
  );
}

/** Der ganze Hof als SVG (aria-hidden). */
export function raumSvg() {
  const zz = zeichner("g01hof", 4.5);
  const wand = `<rect x="0" y="0" width="${B}" height="${HORIZONT}" fill="${WAND}"/>`
    // ein ruhiger, etwas dunklerer Streifen oben unter der Kopfleiste, dazu ein heller Streifen links (Licht)
    + `<rect x="0" y="0" width="${B}" height="160" fill="${dunkler(WAND, 0.04)}"/>`
    + `<rect x="0" y="160" width="520" height="${HORIZONT - 160}" fill="${heller(WAND, 0.05)}"/>`;
  const sockel = zz.guss(flach(`rect x="-10" y="${HORIZONT - 14}" width="${B + 20}" height="16"`, "#BFB5AA"));
  const rohr = zz.guss(flach(`rect x="2380" y="150" width="34" height="${HORIZONT - 160}" rx="8"`, "#B4C0CC"), flach(`rect x="2370" y="${HORIZONT - 46}" width="54" height="30" rx="6"`, "#7C8A99"));
  const szene = zz.guss(fenster(1280, 150), blumenkasten(1274, 470), topf(1790, HORIZONT - 16));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${B} ${H}" preserveAspectRatio="xMidYMin slice" aria-hidden="true" focusable="false">`
    + wand + rohr + szene + zz.guss(boden()) + sockel + `</svg>`;
}
