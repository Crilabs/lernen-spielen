// Tore der Startseite: ein Dran-Spiel als Weidentor auf der Anhöhe (Spec §5.2).
// Im Bogen der Himmel in Fachtönung, davor die gezeichnete Weltandeutung (falls es sie gibt). Quer über die Pfosten
// ist ein Namensbrett befestigt (Spielname, leiser das Thema), oben darauf das Spielsymbol; darunter laufen die
// Pfosten weiter bis in den Boden.
import { FACH } from "../rahmen/stil.js";
import { ANDEUTUNGEN } from "./welten/index.js";
import { zeichner, form, flach, naht, dunkler, heller, esc, TOR_KONTUR } from "./zeichnen.js";

/**
 * @typedef {{titel: string, symbol: string, datei: string, welt?: string}} Spiel
 * @typedef {{id: string, name: string, strang: string, spiel: Spiel}} DranTor
 */

const zz = zeichner("tor", TOR_KONTUR);

/** Öffnung des Bogens (innen), Koordinaten 0 0 240 380; die Pfosten stehen bei y 370 im Boden. */
const OEFFNUNG = "M40 380 L40 124 A80 80 0 0 1 200 124 L200 380Z";
const WEIDE = "#B98E5E";
const BLATT = "#7DBF6E";

/** Der Weidenbogen: Pfosten und Bogen als ein Band mit Stufen und Flechtfugen, dazu Blätter mit Ader. */
const BOGEN = (() => {
  const band = "M22 370 L22 124 A98 98 0 0 1 218 124 L218 370 L194 370 L194 124 A74 74 0 0 0 46 124 L46 370Z";
  const geo = `path d="${band}"`;
  let fugen = "";
  for (let w = 186; w >= -6; w -= 12) {
    const a = (w * Math.PI) / 180;
    const [x1, y1, x2, y2] = [120 + 76 * Math.cos(a), 124 - 76 * Math.sin(a), 120 + 96 * Math.cos(a + 0.09), 124 - 96 * Math.sin(a + 0.09)];
    fugen += `M${x1.toFixed(1)} ${y1.toFixed(1)} L${x2.toFixed(1)} ${y2.toFixed(1)}`;
  }
  for (let y = 136; y < 366; y += 14) fugen += `M24 ${y} L44 ${y + 8}M196 ${y} L216 ${y + 8}`;
  const stufen = zz.innen([geo],
    `<path d="M206 370 L206 124 A86 86 0 0 0 120 38 L120 26 A98 98 0 0 1 218 124 L218 330Z" fill="${dunkler(WEIDE, 0.22)}"/>`
    + `<path d="M213 370 L213 124 A93 93 0 0 0 120 31 L120 26 A98 98 0 0 1 218 124 L218 330Z" fill="${dunkler(WEIDE, 0.38)}"/>`
    + `<path d="M24 370 L24 124 A96 96 0 0 1 120 28 L120 34 A90 90 0 0 0 30 124 L30 370Z" fill="${heller(WEIDE, 0.28)}"/>`
    + naht(fugen, WEIDE, 1.4).svg);
  /** @param {number} x @param {number} y @param {number} w */
  const blatt = (x, y, w) => {
    const [dx, dy] = [11 * Math.cos((w * Math.PI) / 180), 11 * Math.sin((w * Math.PI) / 180)];
    return [
      form(`ellipse cx="${x}" cy="${y}" rx="15" ry="7.5" transform="rotate(${w} ${x} ${y})"`, BLATT, [x - 6, y - 3], { s: 0.82 }),
      naht(`M${(x - dx).toFixed(1)} ${(y - dy).toFixed(1)} L${(x + dx).toFixed(1)} ${(y + dy).toFixed(1)}`, BLATT, 1.2),
    ];
  };
  // Füße: Bodenschatten und ein paar Halme vor den Pfosten, damit das Tor im Boden steht.
  const halme = (/** @type {number} */ x) => [-8, 0, 8].map((dx, i) => flach(`path d="M${x + dx - 4} 374 Q${x + dx - 2} ${362 - i * 2} ${x + dx + (i - 1) * 6} ${352 - (i % 2) * 6} Q${x + dx + 2} 362 ${x + dx + 4} 374Z"`, i === 1 ? "#8CC777" : "#74B962"));
  const fuesse = `<ellipse cx="34" cy="373" rx="26" ry="5" fill="${dunkler("#A3D68B", 0.26)}"/><ellipse cx="206" cy="373" rx="26" ry="5" fill="${dunkler("#A3D68B", 0.26)}"/>`;
  return fuesse + zz.guss(flach(geo, WEIDE), stufen,
    ...[[30, 150, -60], [40, 100, -35], [66, 56, -20], [100, 32, -5], [146, 34, 10], [180, 54, 25], [206, 92, 45], [214, 140, 70], [26, 206, -80], [214, 196, 80]]
      .flatMap(([x, y, w]) => blatt(x, y, w)), ...halme(26), ...halme(214));
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
    + `<svg class="bogen" viewBox="0 0 240 380" aria-hidden="true" focusable="false" stroke-linecap="round">`
    + `<clipPath id="tor-${esc(t.id)}"><path d="${OEFFNUNG}"/></clipPath>`
    + `<g clip-path="url(#tor-${esc(t.id)})"><rect width="240" height="380" style="fill:var(--fach-toenung)"/>`
    + `<path d="M0 186 C70 174 170 174 240 184 L240 380 L0 380Z" fill="${heller("#A5D78E", 0.3)}"/>`
    + `<path d="M0 190 C70 178 170 178 240 188 L240 380 L0 380Z" fill="#A5D78E"/>`
    + `<path d="M0 214 C70 204 170 204 240 212 L240 380 L0 380Z" fill="${dunkler("#A5D78E", 0.1)}"/><g transform="translate(0 -36)">${andeutung}</g></g>${BOGEN}</svg>`
    + `<span class="schild"><img src="${esc(t.spiel.symbol)}" alt=""></span>`
    + `<span class="text"><b>${esc(t.spiel.titel)}</b><span class="thema">${esc(t.name)}</span></span></a>`;
}
