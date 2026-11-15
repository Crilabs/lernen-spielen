// <ls-muster art="huegel|wellen|blaetter|ringe">
// Grundmuster der Designsprache (docs/superpowers/specs/2026-11-15-designsprache-design.md §3): jeder Bereich hat ein
// Muster im Ton des Grundes – Hügel = Können, Wellen = Wissen, Blätter = eine Welt (Raum), Jahresringe = Regal.
// Zwei bis drei Stufen, kaum dunkler als die Fläche, an einem Rand oder in einer Ecke, höchstens ein Drittel der Fläche.
// Liegt fest hinter allem (z-index 0, keine Zeiger), nie hinter dem Lernfeld; Lesebildschirme bekommen keins.
// Ohne Kontur, ohne Verlauf, ohne Bewegung.

import { FARBE, definiere } from "./stil.js";

/** Stufen: Nebel→Linie gemischt, Linie, Linie→Naht gemischt (nur Töne des Grundes, Farbwelt 6.2). */
const HELL = "#ECE6F5";
const MITTE = FARBE.linie.toUpperCase();
const TIEF = "#DAD1EA";

/** Alle Farben, die ein Muster nutzen darf (tests/rahmen-muster.test.mjs). */
export const MUSTER_FARBEN = Object.freeze([HELL, MITTE, TIEF]);

/** Wellenreihe als Pfad: Bogen an Bogen über die Breite, unten geschlossen.
 * @param {number} y @param {number} hoehe @param {number} breite @param {number} gesamt @param {number} unten */
function welle(y, hoehe, breite, gesamt, unten) {
  let d = `M0 ${y}`;
  for (let x = 0; x < gesamt; x += breite) d += ` q${breite / 4} ${-hoehe} ${breite / 2} 0 t${breite / 2} 0`;
  return `${d} L${gesamt} ${unten} L0 ${unten}Z`;
}

/** @param {[number, number, number]} p Mitte x, Mitte y, Drehung */
const blatt = ([x, y, r]) => `<path d="M0 0 C18 -34 66 -40 96 0 C66 40 18 34 0 0Z" transform="translate(${x} ${y}) rotate(${r})" fill="${MITTE}"/>`;

/** @type {Record<string, () => string>} */
const ARTEN = {
  // Zwei weiche Bänder am unteren Rand, wie flache Hügel.
  huegel: () => `<svg viewBox="0 0 1920 360" preserveAspectRatio="none" aria-hidden="true" focusable="false">`
    + `<path d="M0 150 C380 40 760 40 1120 110 C1460 176 1720 120 1920 70 L1920 360 L0 360Z" fill="${HELL}"/>`
    + `<path d="M0 290 C420 210 880 200 1280 240 C1560 268 1780 250 1920 230 L1920 360 L0 360Z" fill="${MITTE}"/></svg>`,
  // Drei Reihen Wellen am unteren Rand.
  wellen: () => `<svg viewBox="0 0 1920 240" preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">`
    + `<path d="${welle(70, 56, 240, 1920, 240)}" fill="${HELL}"/>`
    + `<path d="${welle(130, 56, 240, 1920, 240)}" transform="translate(-120 0)" fill="${MITTE}"/>`
    + `<path d="${welle(190, 56, 240, 2160, 240)}" fill="${TIEF}"/></svg>`,
  // Ein Zweig mit Blättern, oben rechts in die Ecke gelehnt.
  blaetter: () => `<svg viewBox="0 0 760 360" aria-hidden="true" focusable="false">`
    + `<path d="M40 340 C220 200 480 90 760 40" fill="none" stroke="${HELL}" stroke-width="14" stroke-linecap="round"/>`
    + [[150, 268, -120], [260, 196, -60], [360, 150, -130], [470, 104, -50], [580, 78, -120], [680, 48, -40], [240, 230, 70]].map((p) => blatt(/** @type {[number, number, number]} */ (p))).join("")
    + `</svg>`,
  // Jahresringe: Viertelbögen um die Ecke unten rechts.
  ringe: () => `<svg viewBox="0 0 520 520" aria-hidden="true" focusable="false">`
    + [470, 350, 230, 110].map((r, i) => `<circle cx="560" cy="560" r="${r}" fill="none" stroke="${i % 2 ? MITTE : HELL}" stroke-width="40"/>`).join("")
    + `</svg>`,
};

/**
 * @param {string} art huegel, wellen, blaetter oder ringe
 * @returns {string} SVG oder "" (unbekannt)
 */
export function musterSvg(art) {
  return Object.hasOwn(ARTEN, art) ? ARTEN[art]() : "";
}

const CSS = `
:host { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; display: block; }
:host([hidden]) { display: none; }
svg { position: absolute; display: block; }
:host([art="huegel"]) svg { left: 0; right: 0; bottom: 0; width: 100%; height: 30rem; }
:host([art="wellen"]) svg { left: 0; bottom: 0; width: 100%; height: 22rem; }
:host([art="blaetter"]) svg { top: 0; right: 0; width: 100rem; height: 47.4rem; }
:host([art="ringe"]) svg { right: 0; bottom: 0; width: 52rem; height: 52rem; }
`;

export class LsMuster extends (globalThis.HTMLElement ?? class {}) {
  static observedAttributes = ["art"];

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.setAttribute("aria-hidden", "true");
    this.zeichne();
  }

  attributeChangedCallback() {
    this.zeichne();
  }

  zeichne() {
    if (!this.shadowRoot) return;
    this.shadowRoot.innerHTML = `<style>${CSS}</style>${musterSvg(this.getAttribute("art") ?? "")}`;
  }
}

if (typeof customElements !== "undefined") definiere("ls-muster", LsMuster);
