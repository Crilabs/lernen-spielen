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
 * Spielkarte: die ganze Karte ist der Link ins Spiel (mit ?thema). Kartenbild nach grundsaetze-bilder.md §16:
 * hinten die Welt-Vignette, vorn groß die Figur des Spiels (`karte.figur` als <ls-objekt still>); kein Knopf, kein
 * Text im Bild (Christian). Ohne Figur: das Spielsymbol groß auf der Fachtönung bzw. vor der Vignette.
 * @param {{spiel: {titel: string, datei: string, symbol: string, karte?: {figur?: string, zustand?: string}}, thema: {id: string, name: string}}} k
 * @param {string} fach
 * @param {string|null} vignette SVG der Welt oder null (dann Fachtönung)
 */
export function spielKarteHtml(k, fach, vignette) {
  const figur = k.spiel.karte?.figur;
  const vorn = figur
    ? `<ls-objekt class="figur" art="${esc(figur)}"${k.spiel.karte?.zustand ? ` zustand="${esc(k.spiel.karte.zustand)}"` : ""} still aria-hidden="true"></ls-objekt>`
    : `<img class="figur" src="${esc(k.spiel.symbol)}" alt="">`;
  const bild = `<span class="bild${vignette ? "" : " ohne"}">${vignette ?? ""}${vorn}</span>`;
  return `<a class="karte spiel" href="${esc(k.spiel.datei)}?thema=${encodeURIComponent(k.thema.id)}" aria-label="${esc(`${k.spiel.titel}, ${k.thema.name}`)}" style="${farben(fach)}">`
    + `${bild}<span class="unten"><span class="text"><b>${esc(k.spiel.titel)}</b><span class="thema">${esc(k.thema.name)}</span></span></span></a>`;
}

/**
 * Karte „Mit echten Dingen“: führt zur Seite der Anleitung (echt.html). titel = Titel der Anleitung aus dem
 * Verzeichnis (spiele/rahmen/echte-dinge.js); ohne steht „Mit echten Dingen“ (die Startseite setzt ihn nachträglich).
 * @param {{thema: {id: string, name: string}}} k
 * @param {string} fach
 * @param {string} [titel]
 */
export function echtKarteHtml(k, fach, titel = "") {
  return `<a class="karte echt" href="echt.html?thema=${encodeURIComponent(k.thema.id)}" data-thema="${esc(k.thema.id)}" aria-label="${esc(`Mit echten Dingen: ${k.thema.name}`)}" style="${farben(fach)}">`
    + `<span class="bild"><img src="symbole/hand.svg" alt=""></span>`
    + `<span class="unten"><span class="text"><b>${esc(titel || "Mit echten Dingen")}</b><span class="thema">${esc(k.thema.name)}</span></span></span></a>`;
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
