// <ls-perlenstab wert="7" ausrichtung="waagrecht|senkrecht" verdeckt ziffer>
// Perlenstäbchen als Lernzeichen (grundsaetze-bilder §4 M1–M3, M7; Farbwelt 6.2). Jedes Spiel nimmt dieses
// Zeichen, keins zeichnet eigene Perlen.
//
// - Montessori-Farbe je Wert, flach, ohne Glanz und Gesicht, jede Perle mit Tinte-Kontur auf einem Draht in
//   Tinte weich. Ab 6 eine Lücke und eine Marke nach der fünften Perle; die Länge ist proportional zum Wert
//   (Geometrie in perlen-geometrie.js). Die Farbe steht nie allein (C1): Länge und Fünfergliederung tragen.
// - `ziffer`: die Ziffer (Andika fett, Tinte) steht vor dem Stäbchen, waagrecht links, senkrecht darüber
//   (M7). Das Feld ist für alle Werte gleich breit, damit Stäbchen untereinander bündig an der ersten Perle
//   beginnen.
// - `verdeckt` (Stufe Vorstellung): ein Tuch liegt über den Perlen – ein Deckel in Nebel (leicht getöntes
//   Papier, nicht weiß wie ein Eingabefeld, nicht gestrichelt wie ein freies Ziel) mit Tinte-Kontur, so lang
//   wie das Stäbchen. Ab 6 liegt die Fünfermarke quer über dem Tuch (die Gliederung bleibt, die Perlen sind
//   nicht zu zählen). Mit `ziffer` steht die Ziffer auf dem Tuch, ab 6 mittig über den ersten fünf.
//   Mit `ziffer` mindestens 6 rem dick, sonst wird die Ziffer kleiner als 3,2 rem.
// - Ungültiger Wert (nicht 1 bis 10) oder fehlender Wert: es wird nichts gezeichnet und einmal je Element
//   ins Protokoll geschrieben (kern/protokoll.js).
//
// Größe bestimmt das Spiel per CSS am Host: waagrecht über `height`, senkrecht über `width` (die Dicke);
// die andere Seite ergibt sich aus dem Wert. Vorgabe 7 rem. Senkrecht steht die erste Perle oben.
// Flach heißt zum Ansehen (6.4): ein ziehbares Stäbchen bekommt die Klasse `teil` aus seite.css
// (`<ls-perlenstab class="teil">`, dazu ziehbar() aus ziehen.js); dann liegt es auf einer Papierkarte mit
// Schatten. Keine Bewegung (B3). Kein Ton: der Name „Perlenstab 7“ steht nur als aria-label am Bild.

import { protokoll } from "../kern/protokoll.js";
import { TOKENS, LERNFARBE, definiere } from "./stil.js";
import { perlenstab, wertAus, DRAHT, LUECKE } from "./perlen-geometrie.js";

/** Feld für die Ziffer entlang des Stäbchens (in Perlen-Durchmessern) und Schriftgröße darin. */
const ZIFFER = {
  waagrecht: { feld: 1.75, schrift: 1.15 },
  senkrecht: { feld: 1.35, schrift: 0.95 },
  deckel: 0.8,
};
/** Andika: Ziffern sind etwa 0,7 em hoch; so weit liegt die Grundlinie unter der Mitte. */
const GRUNDLINIE = 0.35;
/** Der Deckel ist etwas größer als die Perlen (Kontur liegt außen). */
const DECKEL_RAND = 0.05;

const TOKEN_CSS = Object.entries(TOKENS)
  .map(([name, wert]) => `${name}: ${wert};`)
  .join(" ");

const CSS = `
:host { ${TOKEN_CSS} display: inline-block; vertical-align: middle; height: 7rem; line-height: 0; }
:host([ausrichtung="senkrecht"]) { height: auto; width: 7rem; }
:host([hidden]) { display: none; }
svg { display: block; height: 100%; width: auto; overflow: visible; }
:host([ausrichtung="senkrecht"]) svg { width: 100%; height: auto; }
svg.leer { display: none; }
.kontur { stroke: var(--ls-tinte); stroke-width: var(--ls-kontur); vector-effect: non-scaling-stroke; }
.marke { stroke: var(--ls-tinte); stroke-width: 0.45rem; stroke-linecap: round; vector-effect: non-scaling-stroke; }
text { font-family: "Andika", sans-serif; font-weight: 700; fill: var(--ls-tinte); }
`;

/** @param {number} x */
const z = (x) => String(Math.round(x * 1000) / 1000);

export class LsPerlenstab extends HTMLElement {
  static observedAttributes = ["wert", "ausrichtung", "verdeckt", "ziffer"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${CSS}</style><style class="mass"></style><svg xmlns="http://www.w3.org/2000/svg"></svg>`;
    this.svg = /** @type {SVGSVGElement} */ (wurzel.querySelector("svg"));
    this.mass = /** @type {HTMLStyleElement} */ (wurzel.querySelector("style.mass"));
    /** Schon ins Protokoll geschrieben (einmal je Element). */
    this.gemeldet = false;
    this.zeichne();
  }

  /** @returns {number | null} der gezeigte Wert (null bei ungültigem Attribut) */
  get wert() {
    return wertAus(this.getAttribute("wert"));
  }

  attributeChangedCallback() {
    this.zeichne();
  }

  connectedCallback() {
    if (!this.hasAttribute("wert")) this.melde("kein Wert");
  }

  /** @param {string} grund */
  melde(grund) {
    if (this.gemeldet) return;
    this.gemeldet = true;
    protokoll(`ls-perlenstab: ${grund}`);
  }

  zeichne() {
    const stab = perlenstab(this.getAttribute("wert"));
    const svg = this.svg;
    if (!stab) {
      const roh = this.getAttribute("wert");
      if (roh !== null) this.melde(`ungültiger Wert ${roh}`);
      svg.setAttribute("class", "leer");
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
      svg.innerHTML = "";
      this.mass.textContent = "";
      return;
    }
    const senkrecht = this.getAttribute("ausrichtung") === "senkrecht";
    const verdeckt = this.hasAttribute("verdeckt");
    const ziffer = this.hasAttribute("ziffer");
    const art = senkrecht ? ZIFFER.senkrecht : ZIFFER.waagrecht;
    const feld = ziffer && !verdeckt ? art.feld : 0;
    const { laenge, hoehe, mitte } = stab;

    // Gezeichnet wird entlang (a) und quer (q); senkrecht werden die Achsen getauscht.
    /** @param {number} a @param {number} q */
    const p = (a, q) => (senkrecht ? `x="${z(q)}" y="${z(a)}"` : `x="${z(a)}" y="${z(q)}"`);
    /** @param {number} a @param {number} q */
    const c = (a, q) => (senkrecht ? `cx="${z(q)}" cy="${z(a)}"` : `cx="${z(a)}" cy="${z(q)}"`);
    /** Rechteck von a0 entlang der Länge l, quer von q0 mit der Dicke d. @param {number} a0 @param {number} l @param {number} q0 @param {number} d */
    const r = (a0, l, q0, d) => `${p(a0, q0)} ${senkrecht ? `width="${z(d)}" height="${z(l)}"` : `width="${z(l)}" height="${z(d)}"`}`;
    /** @param {number} a @param {number} groesse @param {string} text */
    const schrift = (a, groesse, text) => {
      const [x, y] = senkrecht ? [mitte, a + GRUNDLINIE * groesse] : [a, mitte + GRUNDLINIE * groesse];
      return `<text x="${z(x)}" y="${z(y)}" font-size="${z(groesse)}" text-anchor="middle">${text}</text>`;
    };

    /** Fünfermarke quer zum Stäbchen. @param {number} a */
    const marke = (a) => {
      const [q0, q1] = [0.06, hoehe - 0.06];
      return senkrecht
        ? `<line class="marke" x1="${z(q0)}" y1="${z(a)}" x2="${z(q1)}" y2="${z(a)}"/>`
        : `<line class="marke" x1="${z(a)}" y1="${z(q0)}" x2="${z(a)}" y2="${z(q1)}"/>`;
    };

    let inhalt = "";
    if (feld) inhalt += schrift(-feld / 2 - 0.12, art.schrift, String(stab.wert));
    if (verdeckt) {
      const d = 1 + 2 * DECKEL_RAND;
      inhalt += `<rect class="kontur deckel" ${r(0, laenge, mitte - d / 2, d)} rx="${z(d / 2)}" fill="${TOKENS["--ls-nebel"]}"/>`;
      if (stab.marke !== null) inhalt += marke(stab.marke);
      // Ab 6 steht die Ziffer über den ersten fünf, damit die Marke sie nicht kreuzt.
      if (ziffer) inhalt += schrift(stab.marke !== null ? (stab.marke - LUECKE / 2) / 2 : laenge / 2, ZIFFER.deckel, String(stab.wert));
    } else {
      inhalt += `<rect class="draht" ${r(0, laenge, mitte - DRAHT / 2, DRAHT)} rx="${z(DRAHT / 2)}" fill="${LERNFARBE.draht}"/>`;
      const farbe = LERNFARBE.perle[/** @type {keyof typeof LERNFARBE.perle} */ (stab.wert)];
      for (const a of stab.perlen) inhalt += `<circle class="kontur perle" ${c(a, mitte)} r="0.5" fill="${farbe}"/>`;
      if (stab.marke !== null) inhalt += marke(stab.marke);
    }

    const [x0, y0, w, h] = senkrecht ? [0, -feld, hoehe, laenge + feld] : [-feld, 0, laenge + feld, hoehe];
    svg.setAttribute("viewBox", `${z(x0)} ${z(y0)} ${z(w)} ${z(h)}`);
    svg.setAttribute("class", senkrecht ? "senkrecht" : "waagrecht");
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", verdeckt && !ziffer ? "Perlenstab" : `Perlenstab ${stab.wert}`);
    svg.removeAttribute("aria-hidden");
    svg.innerHTML = inhalt;
    this.mass.textContent = `svg { aspect-ratio: ${z(w)} / ${z(h)}; }`;
  }
}

definiere("ls-perlenstab", LsPerlenstab);
