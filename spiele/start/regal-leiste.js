// Regal-Daten und -Darstellung (Spec 2026-11-14-startseite-karten-design.md §3.2, Nachtrag Christian 2026-11-14):
// „Was ich kann“, gegliedert wie der Lernplan: Fach → Bereich → Thema. Auf der Startseite nur „Zuletzt gelernt“
// (bleibt kurz, egal wie viel das Kind kann), die eigene Regal-Seite zeigt Reiter (Fächer) und Bretter (Bereiche),
// das Neueste oben: Bereiche nach ihrem jüngsten Thema, darin neueste zuerst.
// Jedes Thema mit Namen und klein dem Material, das das Kind aus dem Spiel kennt. Ohne Zahl, ohne Datum (N5, N8).
// Daten vom Aufrufer (gekonnteThemen, spieleFuer aus lernsteuerung.js).
import { FACH, FACH_SYMBOLE } from "../rahmen/stil.js";
import { materialFuer, bausteinHtml } from "../rahmen/material.js";
import { esc } from "./zeichnen.js";

/** So viele Themen zeigt „Zuletzt gelernt“. */
export const ZULETZT = 5;

/**
 * @typedef {{id: string, name: string, strang: string, art: string|null, zahl: number|null, bereich: string, sprich?: string}} Gekonnt
 * @typedef {{id: string, titel: string, datei: string}} SpielLink
 * @typedef {Gekonnt & {spiele: SpielLink[], eltern: boolean}} RegalThema
 * @typedef {{fach: string, name: string, bereiche: {name: string, themen: RegalThema[]}[]}} RegalFach
 */

/**
 * @param {Gekonnt[]} gekonnt gekonnteThemen(ctx, stand), älteste zuerst
 * @param {{plan: {themen?: {id: string, bereich?: string, eltern?: string}[]}, spiele: {kategorien?: {id: string, name: string}[], spiele?: SpielLink[]}}} ctx
 * @param {(ctx: any, themaId: string) => string[]} spieleFuer
 * @returns {RegalFach[]}
 */
export function regalBaum(gekonnt, ctx, spieleFuer) {
  const spielNach = new Map((ctx.spiele?.spiele ?? []).map((s) => [s.id, s]));
  const planThemen = ctx.plan?.themen ?? [];
  const planNach = new Map(planThemen.map((t) => [t.id, t]));
  const bereichVon = (/** @type {Gekonnt} */ g) => planNach.get(g.id)?.bereich || g.bereich || "Weiteres";
  return (ctx.spiele?.kategorien ?? []).map((k) => {
    /** @type {Map<string, RegalThema[]>} */
    const gruppen = new Map();
    /** Stelle des jüngsten Themas je Bereich (gekonnt ist älteste zuerst) */
    const juengstes = new Map();
    gekonnt.forEach((g, i) => { if (g.strang === k.id) juengstes.set(bereichVon(g), i); });
    for (const g of gekonnt.filter((x) => x.strang === k.id)) {
      const b = bereichVon(g);
      const liste = gruppen.get(b) ?? [];
      liste.push({
        ...g,
        spiele: spieleFuer(ctx, g.id).flatMap((id) => {
          const s = spielNach.get(id);
          return s ? [{ id: s.id, titel: s.titel, datei: s.datei }] : [];
        }),
        eltern: typeof planNach.get(g.id)?.eltern === "string" && /** @type {string} */ (planNach.get(g.id)?.eltern).trim() !== "",
      });
      gruppen.set(b, liste);
    }
    // Das Neueste oben: Bereich mit dem jüngsten Thema zuerst, darin neueste zuerst (Christian, 2026-11-14).
    const bereiche = [...gruppen.entries()]
      .sort((a, b) => juengstes.get(b[0]) - juengstes.get(a[0]))
      .map(([name, themen]) => ({ name, themen: themen.reverse() }));
    return { fach: k.id, name: k.name, bereiche };
  }).filter((f) => f.bereiche.length > 0);
}

/** @param {Gekonnt} t @param {string} [klasse] */
const dingHtml = (t, klasse = "ding") => `<button class="${klasse}" type="button" data-thema="${esc(t.id)}">`
  + `<span class="material">${bausteinHtml(materialFuer(t))}</span><span class="name">${esc(t.name)}</span></button>`;

/**
 * „Zuletzt gelernt“ für die Seitenleiste der Startseite; jedes Thema führt ins Regal an genau dieses Thema.
 * @param {Gekonnt[]} gekonnt älteste zuerst
 * @returns {string}
 */
export function zuletztHtml(gekonnt) {
  const liste = gekonnt.slice(-ZULETZT).reverse();
  const inhalt = liste.length
    ? `<ul>${liste.map((t) => `<li><a class="ding" href="regal.html?thema=${encodeURIComponent(t.id)}" data-thema="${esc(t.id)}">`
      + `<span class="material">${bausteinHtml(materialFuer(t))}</span><span class="name">${esc(t.name)}</span></a></li>`).join("")}</ul>`
    : `<p class="leer">Hier steht, was du kannst.</p>`;
  return `<section class="zuletzt" aria-label="Zuletzt gelernt"><h2>Zuletzt gelernt</h2>${inhalt}`
    + `<a class="regal-knopf" href="regal.html"><img src="symbole/regal.svg" alt=""><b>Mein Regal</b></a></section>`;
}

/**
 * Reiter der Regal-Seite: ein Fach je Reiter.
 * @param {RegalFach[]} baum @param {string} aktiv
 */
export function reiterHtml(baum, aktiv) {
  return `<div class="reiter" role="tablist" aria-label="Fächer">` + baum.map((f) => {
    const farbe = FACH[/** @type {keyof typeof FACH} */ (f.fach)];
    const zeichen = FACH_SYMBOLE.has(f.fach) ? `<i style="--bild:url('symbole/${esc(f.fach)}.svg')"></i>` : "";
    return `<button class="reiter-knopf" type="button" role="tab" data-fach="${esc(f.fach)}" aria-selected="${f.fach === aktiv}"`
      + ` style="--fach-fuellung:${farbe?.fuellung ?? "#FFFCF7"};--fach-tief:${farbe?.tief ?? "#3B2A6B"}">`
      + `<span class="knopf" aria-hidden="true">${zeichen}</span><b>${esc(f.name)}</b></button>`;
  }).join("") + `</div>`;
}

/**
 * Bretter eines Fachs: je Bereich ein Brett mit den gekonnten Themen.
 * @param {RegalFach} fach @param {Set<string>} neu Ids, die seit dem letzten Besuch dazugekommen sind
 */
export function bretterHtml(fach, neu) {
  return fach.bereiche.map((b) => `<section class="brett" role="group" aria-label="${esc(b.name)}"><h3>${esc(b.name)}</h3>`
    + `<div class="dinge">${b.themen.map((t) => dingHtml(t, neu.has(t.id) ? "ding neu" : "ding")).join("")}</div></section>`).join("");
}
