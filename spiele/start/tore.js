// Tore der Startseite: ein Dran-Spiel als Weidentor auf der Anhöhe (Spec §5.2).
// Im Bogen der Himmel in Fachtönung, davor die gezeichnete Weltandeutung (falls es sie gibt), unten am Tor das
// Spielsymbol auf einem Schild in Fachfüllung, darunter Spielname und leiser das Thema.
import { FACH } from "../rahmen/stil.js";
import { ANDEUTUNGEN } from "./welten/index.js";
import { zeichner, form, flach, naht, dunkler, heller, esc } from "./zeichnen.js";

/**
 * @typedef {{titel: string, symbol: string, datei: string, welt?: string}} Spiel
 * @typedef {{id: string, name: string, strang: string, spiel: Spiel}} DranTor
 */

const zz = zeichner("tor", 2.9);

/** Öffnung des Bogens (innen), Koordinaten 0 0 240 280. */
const OEFFNUNG = "M40 280 L40 124 A80 80 0 0 1 200 124 L200 280Z";
const WEIDE = "#B98E5E";
const BLATT = "#7DBF6E";

/** Der Weidenbogen: Pfosten und Bogen als ein Band mit Stufen und Flechtfugen, dazu Blätter mit Ader. */
const BOGEN = (() => {
  const band = "M22 262 L22 124 A98 98 0 0 1 218 124 L218 262 L194 262 L194 124 A74 74 0 0 0 46 124 L46 262Z";
  const geo = `path d="${band}"`;
  let fugen = "";
  for (let w = 186; w >= -6; w -= 12) {
    const a = (w * Math.PI) / 180;
    const [x1, y1, x2, y2] = [120 + 76 * Math.cos(a), 124 - 76 * Math.sin(a), 120 + 96 * Math.cos(a + 0.09), 124 - 96 * Math.sin(a + 0.09)];
    fugen += `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  for (let y = 136; y < 262; y += 14) fugen += `M24 ${y} L44 ${y + 8}M196 ${y} L216 ${y + 8}`;
  const stufen = zz.innen([geo],
    `<path d="M206 262 L206 124 A86 86 0 0 0 120 38 L120 26 A98 98 0 0 1 218 124 L218 262Z" fill="${dunkler(WEIDE, 0.22)}"/>`
    + `<path d="M213 262 L213 124 A93 93 0 0 0 120 31 L120 26 A98 98 0 0 1 218 124 L218 262Z" fill="${dunkler(WEIDE, 0.38)}"/>`
    + `<path d="M24 262 L24 124 A96 96 0 0 1 120 28 L120 34 A90 90 0 0 0 30 124 L30 262Z" fill="${heller(WEIDE, 0.28)}"/>`
    + naht(fugen, WEIDE, 1.4).svg);
  /** @param {number} x @param {number} y @param {number} w */
  const blatt = (x, y, w) => {
    const [dx, dy] = [11 * Math.cos((w * Math.PI) / 180), 11 * Math.sin((w * Math.PI) / 180)];
    return [
      form(`ellipse cx="${x}" cy="${y}" rx="15" ry="7.5" transform="rotate(${w} ${x} ${y})"`, BLATT, [x - 6, y - 3], { s: 0.82 }),
      naht(`M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)} L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`, BLATT, 1.2),
    ];
  };
  return zz.guss(flach(geo, WEIDE), stufen,
    ...[[30, 150, -60], [40, 100, -35], [66, 56, -20], [100, 32, -5], [146, 34, 10], [180, 54, 25], [206, 92, 45], [214, 140, 70], [26, 206, -80], [214, 196, 80]]
      .flatMap(([x, y, w]) => blatt(x, y, w)));
})();

/**
 * Ein Tor als Link ins Spiel (mit ?thema). Fachfarben kommen als CSS-Variablen an den Link.
 * @param {DranTor} t
 * @returns {string}
 */
export function torHtml(t) {
  const f = FACH[/** @type {keyof typeof FACH} */ (t.strang)] ?? { fuellung: "#FFFCF7", tief: "#3B2A6B", toenung: "#F4F0FA" };
  const welt = t.spiel.welt && Object.hasOwn(ANDEUTUNGEN, t.spiel.welt) ? t.spiel.welt : null;
  const andeutung = welt ? ANDEUTUNGEN[welt] : "";
  return `<a class="tor" href="${esc(t.spiel.datei)}?thema=${encodeURIComponent(t.id)}" aria-label="${esc(t.spiel.titel + ", " + t.name)}"`
    + `${welt ? ` data-welt="${esc(welt)}"` : ""} style="--fach-fuellung:${f.fuellung};--fach-tief:${f.tief};--fach-toenung:${f.toenung}">`
    + `<svg class="bogen" viewBox="0 0 240 280" aria-hidden="true" focusable="false" stroke-linecap="round">`
    + `<clipPath id="tor-${esc(t.id)}"><path d="${OEFFNUNG}"/></clipPath>`
    + `<g clip-path="url(#tor-${esc(t.id)})"><rect width="240" height="280" style="fill:var(--fach-toenung)"/>`
    + `<path d="M0 222 C70 210 170 210 240 220 L240 280 L0 280Z" fill="${heller("#A5D78E", 0.3)}"/>`
    + `<path d="M0 226 C70 214 170 214 240 224 L240 280 L0 280Z" fill="#A5D78E"/>`
    + `<path d="M0 250 C70 240 170 240 240 248 L240 280 L0 280Z" fill="${dunkler("#A5D78E", 0.1)}"/>${andeutung}</g>${BOGEN}</svg>`
    + `<span class="schild"><img src="${esc(t.spiel.symbol)}" alt=""></span>`
    + `<span class="text"><b>${esc(t.spiel.titel)}</b><span class="thema">${esc(t.name)}</span></span></a>`;
}
