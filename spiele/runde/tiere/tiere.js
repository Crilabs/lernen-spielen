// Tiere im Stil der Runde (gemeinsamer Bestand, figuren.md §4 „Erweitern“): stilisiert, aber artrichtig
// (grundsaetze-bilder §3, T1–T4). Gleiche Machart wie die Kinder: alle Konturen als Tinte unter allen Flächen,
// Kontur 6 in Einheiten der Runde (viewBox-Einheiten wie bei den Kindern, 280 Einheiten = Bildhöhe einer Figur).
// Ein Spiel zeigt ein Tier mit tierSvg(id); die Größe in rem ergibt sich wie bei den Kindern aus der viewBox.
import { INK } from "../kinder/stil.js";
import hase from "./hase.js";
import maus from "./maus.js";
import rotkehlchen from "./rotkehlchen.js";

/**
 * @typedef {import("../kinder/stil.js").Stueck} Stueck
 * @typedef {{id: string, name: string, groesse: [number, number], fuss: [number, number], teile: () => Stueck[]}} Tier
 */

const KONTUR = 6;

/** @type {Readonly<Record<string, Tier>>} */
export const TIERE = Object.freeze({ hase, maus, rotkehlchen });

/**
 * Ein Tier als SVG-Text.
 * @param {string} id
 * @param {{blick?: "rechts"|"links"}} [o]
 * @returns {string}
 */
export function tierSvg(id, o = {}) {
  const tier = TIERE[id];
  if (!tier) throw new Error(`Runde: unbekanntes Tier „${id}“`);
  const [b, h] = tier.groesse;
  const teile = tier.teile();
  const blick = o.blick === "links" ? `<g data-blick="links" transform="translate(${b} 0) scale(-1 1)">` : `<g data-blick="rechts">`;
  return `<svg class="tier" viewBox="0 0 ${b} ${h}" overflow="visible" data-tier="${tier.id}" role="img" aria-label="${tier.name}"`
    + ` stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg">${blick}`
    + `<g data-schicht="kontur" fill="${INK}" stroke="${INK}" stroke-width="${KONTUR}">${teile.map((t) => t.kontur).join("")}</g>`
    + `<g data-schicht="flaeche">${teile.map((t) => t.svg).join("")}</g></g></svg>`;
}
