// Karten der Startseite (Spec 2026-11-14-startseite-karten-design.md §3.1): Spielkarte mit Welt-Vignette,
// Karte „Mit echten Dingen“ in eigener Gestalt, Abschnitt je Fach mit Kopf (Fachsymbol, Name → Fach-Seite).
import { FACH, FACH_SYMBOLE } from "../rahmen/stil.js";
import { esc } from "./zeichnen.js";

/** @param {string} fach */
function farben(fach) {
  const f = FACH[/** @type {keyof typeof FACH} */ (fach)] ?? { fuellung: "#FFFCF7", tief: "#3B2A6B", toenung: "#F4F0FA" };
  return `--fach-fuellung:${f.fuellung};--fach-tief:${f.tief};--fach-toenung:${f.toenung}`;
}

/** @param {string} fach */
const fachZeichen = (fach) => FACH_SYMBOLE.has(fach) ? `<i style="--bild:url('symbole/${esc(fach)}.svg')"></i>` : "";

/**
 * Spielkarte: die ganze Karte ist der Link ins Spiel (mit ?thema).
 * @param {{spiel: {titel: string, datei: string, symbol: string}, thema: {id: string, name: string}}} k
 * @param {string} fach
 * @param {string|null} vignette SVG der Welt oder null (dann Fachtönung mit Spielsymbol)
 */
export function spielKarteHtml(k, fach, vignette) {
  const bild = vignette ? `<span class="bild">${vignette}</span>` : `<span class="bild ohne"><img src="${esc(k.spiel.symbol)}" alt=""></span>`;
  return `<a class="karte spiel" href="${esc(k.spiel.datei)}?thema=${encodeURIComponent(k.thema.id)}" aria-label="${esc(`${k.spiel.titel}, ${k.thema.name}`)}" style="${farben(fach)}">`
    + `${bild}<span class="unten"><span class="knopf" aria-hidden="true"><img src="${esc(k.spiel.symbol)}" alt=""></span>`
    + `<span class="text"><b>${esc(k.spiel.titel)}</b><span class="thema">${esc(k.thema.name)}</span></span></span></a>`;
}

/**
 * Karte „Mit echten Dingen“: öffnet die Anleitung (die Seite bindet den Klick über data-thema).
 * @param {{thema: {id: string, name: string}}} k
 * @param {string} fach
 */
export function echtKarteHtml(k, fach) {
  return `<button class="karte echt" type="button" data-thema="${esc(k.thema.id)}" aria-label="${esc(`Mit echten Dingen: ${k.thema.name}`)}" style="${farben(fach)}">`
    + `<span class="bild"><img src="symbole/hand.svg" alt=""></span>`
    + `<span class="unten"><span class="text"><b>Mit echten Dingen</b><span class="thema">${esc(k.thema.name)}</span></span></span></button>`;
}

/**
 * Abschnitt eines Fachs.
 * @param {{id: string, name: string}} fach
 * @param {string} kartenHtml
 */
export function abschnittHtml(fach, kartenHtml) {
  return `<section class="fach-abschnitt" style="${farben(fach.id)}" aria-label="${esc(fach.name)}">`
    + `<a class="fach-kopf" href="themen.html?fach=${encodeURIComponent(fach.id)}"><span class="knopf" aria-hidden="true">${fachZeichen(fach.id)}</span><b>${esc(fach.name)}</b></a>`
    + `<div class="karten">${kartenHtml}</div></section>`;
}
