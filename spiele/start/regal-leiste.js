// Regal als Seitenleiste rechts (Spec 2026-11-14-startseite-karten-design.md §3.2): „Was ich kann“ als aufklappbare
// Liste, nicht grafisch, hierarchisch Fach → Thema → Detail. Jedes Thema mit seinem Namen und klein dem Material,
// das das Kind aus dem Spiel kennt; im Detail die Spiele zum Nochmal-Spielen und „Mit echten Dingen“.
// Ohne Zahl, ohne Datum (N5, N8). Daten vom Aufrufer (gekonnteThemen, spieleFuer aus lernsteuerung.js).
import { FACH, FACH_SYMBOLE } from "../rahmen/stil.js";
import { materialFuer, bausteinHtml } from "../rahmen/material.js";
import { esc } from "./zeichnen.js";

/**
 * @typedef {{id: string, name: string, strang: string, art: string|null, zahl: number|null, bereich: string, sprich?: string}} Gekonnt
 * @typedef {{id: string, titel: string, datei: string}} SpielLink
 * @typedef {{fach: string, name: string, themen: (Gekonnt & {spiele: SpielLink[], eltern: boolean})[]}} RegalFach
 */

/**
 * @param {Gekonnt[]} gekonnt gekonnteThemen(ctx, stand), älteste zuerst
 * @param {{plan: {themen?: {id: string, eltern?: string}[]}, spiele: {kategorien?: {id: string, name: string}[], spiele?: SpielLink[]}}} ctx
 * @param {(ctx: any, themaId: string) => string[]} spieleFuer
 * @returns {RegalFach[]}
 */
export function regalBaum(gekonnt, ctx, spieleFuer) {
  const spielNach = new Map((ctx.spiele?.spiele ?? []).map((s) => [s.id, s]));
  const eltern = new Map((ctx.plan?.themen ?? []).map((t) => [t.id, typeof t.eltern === "string" && t.eltern.trim() !== ""]));
  return (ctx.spiele?.kategorien ?? []).map((k) => ({
    fach: k.id,
    name: k.name,
    themen: gekonnt.filter((g) => g.strang === k.id).map((g) => ({
      ...g,
      spiele: spieleFuer(ctx, g.id).map((id) => spielNach.get(id)).filter((s) => !!s)
        .map((s) => ({ id: /** @type {SpielLink} */ (s).id, titel: /** @type {SpielLink} */ (s).titel, datei: /** @type {SpielLink} */ (s).datei })),
      eltern: eltern.get(g.id) ?? false,
    })),
  })).filter((f) => f.themen.length > 0);
}

/**
 * @param {RegalFach[]} baum
 * @returns {string}
 */
export function regalHtml(baum) {
  const kopf = `<section class="regal-leiste" aria-label="Was ich kann"><h2>Was ich kann</h2>`;
  if (!baum.length) return `${kopf}<p class="leer">Hier steht, was du kannst.</p></section>`;
  return kopf + baum.map((f) => {
    const zeichen = FACH_SYMBOLE.has(f.fach) ? `<i style="--bild:url('symbole/${esc(f.fach)}.svg')"></i>` : "";
    const themen = f.themen.map((t) => {
      const spiele = t.spiele.map((s) => `<a class="nochmal" href="${esc(s.datei)}?thema=${encodeURIComponent(t.id)}">${esc(s.titel)}</a>`).join("");
      const echt = t.eltern ? `<button class="echt" type="button" data-thema="${esc(t.id)}">Mit echten Dingen</button>` : "";
      return `<li><details class="thema" data-thema="${esc(t.id)}"><summary><span class="material">${bausteinHtml(materialFuer(t))}</span>`
        + `<span class="name">${esc(t.name)}</span></summary><div class="detail">${spiele}${echt}</div></details></li>`;
    }).join("");
    const fuellung = FACH[/** @type {keyof typeof FACH} */ (f.fach)]?.fuellung ?? "#F4F0FA";
    return `<details class="fach" data-fach="${esc(f.fach)}" style="--fach-fuellung:${fuellung}"><summary><span class="knopf" aria-hidden="true">${zeichen}</span>`
      + `<span class="name">${esc(f.name)}</span></summary><ul>${themen}</ul></details>`;
  }).join("") + `</section>`;
}
