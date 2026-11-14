// <ls-wortart art="nomen|artikel|adjektiv|verb">
// Wortartensymbol als Lernzeichen (grundsaetze-bilder §5 D1, Farbwelt 6.2): die Form trägt, Größe und Farbe
// helfen. Nomen großes schwarzes Dreieck, Artikel kleines hellblaues Dreieck, Adjektiv mittleres
// dunkelblaues Dreieck, Verb großer roter Kreis; alle flach mit Tinte-Kontur. In Kl. 1–2 nur diese vier (D2).
//
// Alle vier stehen im selben quadratischen Feld auf einer gemeinsamen Grundlinie und mittig, damit sie über
// Wörtern gleich sitzen und die Größen sich vergleichen lassen. Größe bestimmt das Spiel per CSS am Host
// über `height` (Vorgabe 8 rem, die Breite ist gleich der Höhe). Unbekannte Art: es wird nichts gezeichnet.
// Flach heißt zum Ansehen (6.4); ziehbar wird ein Symbol über die Klasse `teil` aus seite.css. Keine
// Bewegung, kein Ton; der Name („Nomen“ …) steht als aria-label am Bild.

import { TOKENS, LERNFARBE, definiere } from "./stil.js";

/** Formen im Feld 0…100, Grundlinie bei 96. */
const FORM = {
  nomen: { name: "Nomen", form: "M4 96 L50 16 L96 96 Z" },
  adjektiv: { name: "Adjektiv", form: "M15 96 L50 35 L85 96 Z" },
  artikel: { name: "Artikel", form: "M26 96 L50 54 L74 96 Z" },
  verb: { name: "Verb", kreis: { cx: 50, cy: 52, r: 44 } },
};

const TOKEN_CSS = Object.entries(TOKENS)
  .map(([name, wert]) => `${name}: ${wert};`)
  .join(" ");

const CSS = `
:host { ${TOKEN_CSS} display: inline-block; vertical-align: bottom; height: 8rem; line-height: 0; }
:host([hidden]) { display: none; }
svg { display: block; height: 100%; width: auto; aspect-ratio: 1; overflow: visible; }
svg.leer { display: none; }
.kontur { stroke: var(--ls-tinte); stroke-width: var(--ls-kontur); stroke-linejoin: round; vector-effect: non-scaling-stroke; }
`;

export class LsWortart extends HTMLElement {
  static observedAttributes = ["art"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${CSS}</style><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"></svg>`;
    this.svg = /** @type {SVGSVGElement} */ (wurzel.querySelector("svg"));
    this.zeichne();
  }

  attributeChangedCallback() {
    this.zeichne();
  }

  zeichne() {
    const art = this.getAttribute("art") ?? "";
    const svg = this.svg;
    if (!Object.hasOwn(FORM, art)) {
      svg.setAttribute("class", "leer");
      svg.setAttribute("aria-hidden", "true");
      svg.removeAttribute("role");
      svg.removeAttribute("aria-label");
      svg.innerHTML = "";
      return;
    }
    const f = FORM[/** @type {keyof typeof FORM} */ (art)];
    const farbe = LERNFARBE.wortart[/** @type {keyof typeof FORM} */ (art)];
    svg.innerHTML =
      "kreis" in f
        ? `<circle class="kontur" cx="${f.kreis.cx}" cy="${f.kreis.cy}" r="${f.kreis.r}" fill="${farbe}"/>`
        : `<path class="kontur" d="${f.form}" fill="${farbe}"/>`;
    svg.setAttribute("class", art);
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", f.name);
    svg.removeAttribute("aria-hidden");
  }
}

definiere("ls-wortart", LsWortart);
