// Wegweiser der Startseite: ein Pfeilbrett je Fach mit Spielen, am Pfahl links (Spec §5.3).
// Bretter sind drückbar (fester Schatten im Fach-Tief, grundsaetze-bilder §6.4); Fachsymbol in Tinte auf der
// Fachfüllung wie in der Kopfleiste. Sie zeigen abwechselnd nach rechts und links, wie an einem echten Wegweiser.
import { FACH, FACH_SYMBOLE } from "../rahmen/stil.js";
import { esc } from "./zeichnen.js";

/**
 * @param {{id: string, name: string}[]} faecher in der Reihenfolge der Kategorien
 * @returns {string}
 */
export function wegweiserHtml(faecher) {
  return faecher.map((k, i) => {
    const f = FACH[/** @type {keyof typeof FACH} */ (k.id)];
    const bild = FACH_SYMBOLE.has(k.id) ? `<i style="--bild:url('symbole/${esc(k.id)}.svg')"></i>` : "";
    return `<a class="brett ${i % 2 ? "links" : "rechts"}" href="themen.html?fach=${encodeURIComponent(k.id)}" aria-label="${esc(k.name)}"`
      + ` style="--fach-fuellung:${f?.fuellung ?? "#FFFCF7"};--fach-tief:${f?.tief ?? "#3B2A6B"}">`
      + `<span class="zeichen" aria-hidden="true">${bild}</span><b>${esc(k.name)}</b></a>`;
  }).join("");
}
