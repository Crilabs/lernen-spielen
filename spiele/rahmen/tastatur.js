// <ls-tastatur tasten="Die Katze schläft" leertaste loeschen>
// Bildschirm-Tastatur nach docs/bedienung.md 7.3: nur die Tasten, die die Aufgabe braucht, in fester
// Reihenfolge, dazu Leertaste und Löschen, wenn gesetzt. Papier, Tinte-Kontur, Schatten in Tinte weich;
// keine Farbe je Buchstabe. Ereignis `taste` mit detail.zeichen (" " für Leertaste, "loeschen" für Löschen).
// Die Tasten sprechen nichts; was gesagt wird, entscheidet das Spiel. Eine Hardware-Tastatur geht zusätzlich.
// Der Host ist ein Block: wohin die Tastatur kommt (unten Mitte), bestimmt das Spiel.

import { GRUND_CSS, definiere } from "./stil.js";
import { tastenFuer, ausgeglichen } from "./tasten.js";

const TASTE = { breite: 9.4, hoehe: 8.6, abstand: 1.6, tiefe: 0.8, einsinken: 0.7, radius: 2.2 };

const TASTATUR_CSS = `
:host { display: block; line-height: 0; --ls-neben-schatten: var(--ls-tinte-weich); }
.feld { display: flex; flex-direction: column; align-items: center; gap: ${TASTE.tiefe + 1.6}rem; padding-bottom: ${TASTE.tiefe}rem; }
.reihe { display: flex; justify-content: center; gap: ${TASTE.abstand}rem; }
.taste {
  position: relative;
  box-sizing: border-box;
  flex: none;
  min-width: ${TASTE.breite}rem;
  height: ${TASTE.hoehe}rem;
  margin: 0;
  padding: 0 1.4rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: var(--ls-kontur) solid var(--ls-tinte);
  border-radius: ${TASTE.radius}rem;
  background: var(--ls-papier);
  color: var(--ls-tinte);
  box-shadow: 0 ${TASTE.tiefe}rem 0 var(--ls-neben-schatten);
  font: 700 5.6rem/1 "Andika", sans-serif;
  padding-bottom: 0.4rem;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}
.taste:active, .taste.druck {
  transform: translateY(${TASTE.einsinken}rem);
  box-shadow: 0 ${TASTE.tiefe - TASTE.einsinken}rem 0 var(--ls-neben-schatten);
}
.taste:focus-visible { outline: none; }
/* Sonnenring direkt an der Kontur, wie bei den Knöpfen. */
.taste::after {
  content: "";
  position: absolute;
  inset: calc(-1 * (var(--ls-kontur) + 0.8rem));
  border: 0.8rem solid var(--ls-sonne);
  border-radius: ${TASTE.radius + 0.8}rem;
  box-shadow: 0 0 0 0.3rem var(--ls-tinte);
  opacity: 0;
  pointer-events: none;
}
.taste:focus-visible::after { opacity: 1; }
.leer { min-width: 56rem; }
.leer svg { width: 9rem; height: 6rem; display: block; pointer-events: none; }
.weg { min-width: 16rem; }
.weg svg { width: 6.4rem; height: 6.4rem; display: block; pointer-events: none; }
`;

const LOESCHEN_SVG = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 5h12v14H9l-7-7z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M12.5 9l5 6M17.5 9l-5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;

const LEER_SVG = `<svg viewBox="0 0 36 24" aria-hidden="true"><path d="M4 8v9h28V8" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** @type {Record<string, string>} */
const ENTITAET = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" };
/** @param {string} s */
const esc = (s) => s.replace(/[&<>"]/g, (c) => ENTITAET[c]);

export class LsTastatur extends HTMLElement {
  static observedAttributes = ["tasten", "leertaste", "loeschen"];

  constructor() {
    super();
    this.wurzel = this.attachShadow({ mode: "open" });
    this.wurzel.addEventListener("click", (e) => {
      const b = /** @type {Element} */ (e.target).closest?.("button[data-z]");
      if (b) this.sende(/** @type {HTMLElement} */ (b).dataset.z ?? "");
    });
    this.beiTaste = (/** @type {KeyboardEvent} */ e) => this.hardware(e);
  }

  connectedCallback() {
    this.zeichne();
    document.addEventListener("keydown", this.beiTaste);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.beiTaste);
  }

  attributeChangedCallback() {
    if (this.isConnected) this.zeichne();
  }

  /** @returns {string[]} */
  get tastenListe() {
    return tastenFuer(this.getAttribute("tasten") ?? "");
  }

  zeichne() {
    const zeilen = ausgeglichen(this.tastenListe)
      .map((r) => `<div class="reihe">${r.map((z) => `<button class="taste" type="button" tabindex="0" data-z="${esc(z)}">${esc(z)}</button>`).join("")}</div>`)
      .join("");
    const fn = [];
    if (this.hasAttribute("leertaste")) fn.push(`<button class="taste leer" type="button" tabindex="0" data-z=" " aria-label="Leertaste">${LEER_SVG}</button>`);
    if (this.hasAttribute("loeschen")) fn.push(`<button class="taste weg" type="button" tabindex="0" data-z="loeschen" aria-label="Löschen">${LOESCHEN_SVG}</button>`);
    this.wurzel.innerHTML = `<style>${GRUND_CSS}${TASTATUR_CSS}</style><div class="feld">${zeilen}${fn.length ? `<div class="reihe">${fn.join("")}</div>` : ""}</div>`;
  }

  /** @param {string} zeichen */
  sende(zeichen) {
    this.dispatchEvent(new CustomEvent("taste", { detail: { zeichen }, bubbles: true, composed: true }));
  }

  /** @param {KeyboardEvent} e */
  hardware(e) {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    let z = null;
    if (e.key === " ") z = this.hasAttribute("leertaste") ? " " : null;
    else if (e.key === "Backspace") z = this.hasAttribute("loeschen") ? "loeschen" : null;
    else if (this.tastenListe.includes(e.key)) z = e.key;
    if (z === null) return;
    e.preventDefault();
    const b = [...this.wurzel.querySelectorAll("button[data-z]")].find((k) => /** @type {HTMLElement} */ (k).dataset.z === z);
    if (b) {
      b.classList.add("druck");
      setTimeout(() => b.classList.remove("druck"), 140);
    }
    this.sende(z);
  }
}

definiere("ls-tastatur", LsTastatur);
