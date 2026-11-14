// Fach-Knöpfe der Startseite: Navigation am linken Rand, ein runder Knopf je Fach mit Spielen (Spec §5.3, geändert
// 2026-11-14: Knöpfe statt Wegweiser). Fachsymbol in Tinte auf der Fachfüllung, fester Schatten im Fach-Tief
// (drückbar, grundsaetze-bilder §6.4), der Name klein darunter; beim Antippen spricht der Erzähler ihn (K3).
import { FACH, FACH_SYMBOLE } from "../rahmen/stil.js";
import { esc } from "./zeichnen.js";

/**
 * @param {{id: string, name: string}[]} faecher in der Reihenfolge der Kategorien
 * @returns {string}
 */
export function faecherHtml(faecher) {
  return faecher.map((k) => {
    const f = FACH[/** @type {keyof typeof FACH} */ (k.id)];
    const bild = FACH_SYMBOLE.has(k.id) ? `<i style="--bild:url('symbole/${esc(k.id)}.svg')"></i>` : "";
    return `<a class="fach" href="themen.html?fach=${encodeURIComponent(k.id)}" aria-label="${esc(k.name)}"`
      + ` style="--fach-fuellung:${f?.fuellung ?? "#FFFCF7"};--fach-tief:${f?.tief ?? "#3B2A6B"}">`
      + `<span class="knopf" aria-hidden="true">${bild}</span><b>${esc(k.name)}</b></a>`;
  }).join("");
}
