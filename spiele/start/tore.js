// Tore der Startseite: ein Dran-Spiel als Weidentor auf der Anhöhe (Spec §5.2).
// Im Bogen der Himmel in Fachtönung, davor die gezeichnete Weltandeutung (falls es sie gibt), unten am Tor das
// Spielsymbol auf einem Schild in Fachfüllung, darunter Spielname und leiser das Thema.
import { FACH } from "../rahmen/stil.js";
import { ANDEUTUNGEN } from "./welten/index.js";
import { zeichner, flaeche, esc } from "./zeichnen.js";

/**
 * @typedef {{titel: string, symbol: string, datei: string, welt?: string}} Spiel
 * @typedef {{id: string, name: string, strang: string, spiel: Spiel}} DranTor
 */

const { guss } = zeichner("tor", 4);

/** Öffnung des Bogens (innen), Koordinaten 0 0 240 280. */
const OEFFNUNG = "M40 280 L40 124 A80 80 0 0 1 200 124 L200 280Z";

/** Der Weidenbogen: Pfosten und Bogen als ein Band, dazu Blätter. */
const BOGEN = (() => {
  const band = guss([
    `<path d="M22 262 L22 124 A98 98 0 0 1 218 124 L218 262 L194 262 L194 124 A74 74 0 0 0 46 124 L46 262Z"/>`,
  ], "#B98E5E", flaeche("M206 262 L206 124 A86 86 0 0 0 120 38 L120 26 A98 98 0 0 1 218 124 L218 262Z", "#9A7046"));
  const blatt = (/** @type {number} */ x, /** @type {number} */ y, /** @type {number} */ w) =>
    `<ellipse cx="${x}" cy="${y}" rx="15" ry="8" transform="rotate(${w} ${x} ${y})"/>`;
  const blaetter = guss([
    blatt(30, 150, -60), blatt(40, 100, -35), blatt(66, 56, -20), blatt(100, 32, -5), blatt(146, 34, 10),
    blatt(180, 54, 25), blatt(206, 92, 45), blatt(214, 140, 70), blatt(26, 206, -80), blatt(214, 196, 80),
  ], "#7DBF6E");
  return band + blaetter;
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
    + `<path d="M0 222 C70 210 170 210 240 220 L240 280 L0 280Z" fill="#A5D78E"/>${andeutung}</g>${BOGEN}</svg>`
    + `<span class="schild"><img src="${esc(t.spiel.symbol)}" alt=""></span>`
    + `<span class="text"><b>${esc(t.spiel.titel)}</b><span class="thema">${esc(t.name)}</span></span></a>`;
}
