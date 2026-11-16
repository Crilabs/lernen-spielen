// <ls-goldmaterial zahl="17">
// Lernzeichen Goldenes Perlenmaterial (grundsaetze-bilder §4 M4): eine Zahl von 0 bis 99 als Zehnerstangen und
// einzelne Perlen. Jedes Spiel nimmt dieses Zeichen, keins zeichnet eigene Goldperlen.
//
// - Gold wie der Zehnerstab (LERNFARBE.perle[10]), jede Perle einzeln mit Tinte-Kontur, die Stangen auf einem
//   Draht in Tinte weich, nach der fünften Perle die Marke. Die einzelnen Perlen stehen in Säulen zu fünf: die Fünf
//   sieht man, ohne zu zählen. Die Zahl steht nie allein in der Farbe (C1): Zahl der Stangen und Perlen trägt.
// - `zahl` 0 bis 99. 0 zeichnet nichts (leer, ohne Fehler); ungültig oder fehlend: nichts, einmal ins Protokoll.
//   Zehnerzahlen (20, 70) zeigen nur Stangen, Zahlen unter 10 nur Perlen: so lassen sich Zehner und Einer getrennt zeigen.
// - Größe bestimmt das Spiel per CSS `height` am Host (Vorgabe 10 rem, so hoch wie eine Stange); die Breite ergibt sich.
//   Keine Bewegung (B3), kein Ton; Name wie „1 Zehnerstange und 7 Perlen“ als aria-label.
// Geometrie ohne DOM in gold-geometrie.js.

import { protokoll } from "../kern/protokoll.js";
import { TOKENS, LERNFARBE, definiere } from "./stil.js";
import { gold, zahlAus } from "./gold-geometrie.js";
import { DRAHT, HOEHE } from "./perlen-geometrie.js";

const TOKEN_CSS = Object.entries(TOKENS).map(([name, wert]) => `${name}: ${wert};`).join(" ");

const CSS = `
:host { ${TOKEN_CSS} display: inline-block; vertical-align: bottom; height: 10rem; line-height: 0; }
:host([hidden]) { display: none; }
svg { display: block; height: 100%; width: auto; overflow: visible; }
svg.leer { display: none; }
.kontur { stroke: var(--ls-tinte); stroke-width: var(--ls-kontur); vector-effect: non-scaling-stroke; }
.marke { stroke: var(--ls-tinte); stroke-width: 0.45rem; stroke-linecap: round; vector-effect: non-scaling-stroke; }
`;

/** @param {number} x */
const z = (x) => String(Math.round(x * 1000) / 1000);

export class LsGoldmaterial extends HTMLElement {
  static observedAttributes = ["zahl"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${CSS}</style><style class="mass"></style><svg xmlns="http://www.w3.org/2000/svg"></svg>`;
    this.svg = /** @type {SVGSVGElement} */ (wurzel.querySelector("svg"));
    this.mass = /** @type {HTMLStyleElement} */ (wurzel.querySelector("style.mass"));
    this.gemeldet = false;
    this.zeichne();
  }

  /** @returns {number | null} die gezeigte Zahl (null bei ungültigem Attribut) */
  get zahl() {
    return zahlAus(this.getAttribute("zahl"));
  }

  attributeChangedCallback() {
    this.zeichne();
  }

  connectedCallback() {
    if (!this.hasAttribute("zahl")) this.melde("keine Zahl");
  }

  /** @param {string} grund */
  melde(grund) {
    if (this.gemeldet) return;
    this.gemeldet = true;
    protokoll(`ls-goldmaterial: ${grund}`);
  }

  zeichne() {
    const g = gold(this.getAttribute("zahl"));
    const svg = this.svg;
    if (!g || g.zahl === 0) {
      const roh = this.getAttribute("zahl");
      if (!g && roh !== null) this.melde(`ungültige Zahl ${roh}`);
      svg.setAttribute("class", "leer");
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
      svg.innerHTML = "";
      this.mass.textContent = "";
      return;
    }
    const farbe = LERNFARBE.perle[10];
    let inhalt = "";
    for (const s of g.stangen) {
      const oben = s.perlen[0] - 0.5;
      const unten = s.perlen[s.perlen.length - 1] + 0.5;
      inhalt += `<rect class="draht" x="${z(s.x - DRAHT / 2)}" y="${z(oben)}" width="${z(DRAHT)}" height="${z(unten - oben)}" fill="${LERNFARBE.draht}"/>`;
      for (const y of s.perlen) inhalt += `<circle class="kontur perle" cx="${z(s.x)}" cy="${z(y)}" r="0.5" fill="${farbe}"/>`;
      inhalt += `<line class="marke" x1="${z(s.x - HOEHE / 2 + 0.06)}" y1="${z(s.marke)}" x2="${z(s.x + HOEHE / 2 - 0.06)}" y2="${z(s.marke)}"/>`;
    }
    for (const p of g.einzel) inhalt += `<circle class="kontur perle" cx="${z(p.x)}" cy="${z(p.y)}" r="0.5" fill="${farbe}"/>`;
    const x0 = g.stangen.length ? 0 : 0.5 - 0.5;
    svg.setAttribute("viewBox", `${z(x0)} ${z(-0.1)} ${z(g.breite)} ${z(g.hoehe + 0.2)}`);
    svg.setAttribute("class", "gold");
    svg.setAttribute("role", "img");
    const teile = [];
    if (g.zehner) teile.push(`${g.zehner} ${g.zehner === 1 ? "Zehnerstange" : "Zehnerstangen"}`);
    if (g.einer) teile.push(`${g.einer} ${g.einer === 1 ? "Perle" : "Perlen"}`);
    svg.setAttribute("aria-label", teile.join(" und "));
    svg.removeAttribute("aria-hidden");
    svg.innerHTML = inhalt;
    this.mass.textContent = `svg { aspect-ratio: ${z(g.breite)} / ${z(g.hoehe + 0.2)}; }`;
  }
}

definiere("ls-goldmaterial", LsGoldmaterial);
