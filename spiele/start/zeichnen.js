// Zeichenhilfen für die Startseite (Szene, Tore, Weltandeutungen) im Stil der Runde (figuren.md §4).
// Dieselbe Machart wie spiele/runde/kinder/stil.js, damit Hintergrund und Figuren aus einer Hand wirken:
// - Kontur nur um die Silhouette: alle Konturen als Tintenfläche unter alle Flächen (guss).
// - Licht von oben links in Stufen: Kernschatten, weicher Schatten, Grundton, ggf. Licht (form).
// - Feine Nähte und Falten im dunklen Ton der Fläche, nie in Tinte (naht, falte).
// Die Farbfamilien kommen aus dunkler()/heller() der Runde.
import { dunkler, heller, z } from "../runde/kinder/stil.js";

export { dunkler, heller, z };
export const TINTE = "#3B2A6B";
/** Kontur der Szene, sichtbar wie bei den Figuren auf Szenengröße (3 × 340/280). Eine Stärke für alles. */
export const KONTUR = 3.6;
/** Kontur im Bogen eines Tors (0 0 240 380 auf 28 rem: 1 Einheit = 1,17 Szeneneinheiten), sichtbar ebenfalls 3,6. */
export const TOR_KONTUR = KONTUR * 240 / 280;

/** @typedef {{svg: string, kontur: string}} Stueck */

/**
 * Fläche mit Schattenstufen wie form() der Runde: Kernschatten, darüber weicher Schatten und Grundton, je zum
 * Lichtpunkt oben links verkleinert (bei runden Formen bleibt unten rechts eine Sichel), optional Licht.
 * @param {string} geo Element ohne Füllung, z. B. `circle cx=".." cy=".." r=".."`
 * @param {string} farbe
 * @param {[number, number]} licht Punkt oben links in der Fläche
 * @param {{s?: number, glanz?: boolean, kontur?: boolean, tiefe?: number}} [o] tiefe: Stärke der Schatten (1 = wie
 *   bei den Figuren; Wolken weicher)
 * @returns {Stueck}
 */
export function form(geo, farbe, licht, o = {}) {
  const [lx, ly] = licht;
  const t = o.tiefe ?? 1;
  const s = o.s ?? 0.88;
  const s1 = 1 - (1 - s) * 0.45;
  const um = (/** @type {number} */ f) => `transform="translate(${z(lx)} ${z(ly)}) scale(${z(f)}) translate(${z(-lx)} ${z(-ly)})"`;
  return {
    svg: `<${geo} fill="${dunkler(farbe, 0.42 * t)}"/>`
      + `<${geo} fill="${dunkler(farbe, 0.2 * t)}" ${um(s1)}/>`
      + `<${geo} fill="${farbe}" ${um(s)}/>`
      + (o.glanz ? `<${geo} fill="${heller(farbe, 0.32)}" ${um(s * 0.6)}/>` : ""),
    kontur: o.kontur === false ? "" : `<${geo}/>`,
  };
}

/** Fläche ohne Schattenstufen. @param {string} geo @param {string} farbe @param {boolean} [mitKontur] @returns {Stueck} */
export const flach = (geo, farbe, mitKontur = true) => ({ svg: `<${geo} fill="${farbe}"/>`, kontur: mitKontur ? `<${geo}/>` : "" });

/** Schatten- oder Lichtform ohne Kontur. @param {string} d @param {string} farbe @returns {Stueck} */
export const ton = (d, farbe) => ({ svg: `<path d="${d}" fill="${farbe}"/>`, kontur: "" });

/**
 * Feine Linie im dunklen Ton einer Farbe (Fuge, Maserung, Blattader).
 * @param {string} d @param {string} farbe @param {number} [w] @param {number} [anteil] wie dunkel (0,42 wie bei den Figuren)
 * @returns {Stueck}
 */
export const naht = (d, farbe, w = 2, anteil = 0.42) => ({ svg: `<path d="${d}" fill="none" stroke="${dunkler(farbe, anteil)}" stroke-width="${w}" stroke-linecap="round"/>`, kontur: "" });

/** Mehrere Stücke zu einem. @param {...Stueck} teile @returns {Stueck} */
export const zusammen = (...teile) => ({ svg: teile.map((t) => t.svg).join(""), kontur: teile.map((t) => t.kontur).join("") });

/**
 * Ein Zeichner mit fester Konturbreite und eigener Vorsilbe für clipPath-Kennungen.
 * @param {string} praefix
 * @param {number} kontur sichtbare Konturbreite außen (die Tintenfläche ist doppelt so breit, halb verdeckt)
 */
export function zeichner(praefix, kontur) {
  let zaehler = 0;
  return {
    /**
     * Stücke aus einem Guss: alle Konturen als Tinte unter allen Flächen.
     * @param {...Stueck} teile
     */
    guss(...teile) {
      const k = teile.map((t) => t.kontur).join("");
      return `<g>${k ? `<g fill="${TINTE}" stroke="${TINTE}" stroke-width="${z(kontur * 2)}" stroke-linejoin="round">${k}</g>` : ""}`
        + `<g stroke="none">${teile.map((t) => t.svg).join("")}</g></g>`;
    },
    /**
     * Inhalt auf Formen zuschneiden (Schatten und Licht bleiben in der Silhouette).
     * @param {string[]} geos Elemente ohne Füllung @param {string} inhalt
     * @returns {Stueck}
     */
    innen(geos, inhalt) {
      const id = `${praefix}-${++zaehler}`;
      return { svg: `<clipPath id="${id}">${geos.map((g) => `<${g}/>`).join("")}</clipPath><g clip-path="url(#${id})">${inhalt}</g>`, kontur: "" };
    },
  };
}

/**
 * Text für HTML maskieren. Gleich wie `esc` in lernspiel.js; hier eigen, weil lernspiel.js nicht unter der
 * Typprüfung (tsconfig) steht und ein Import sie dort hineinziehen würde.
 * @param {unknown} text
 */
export function esc(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}
