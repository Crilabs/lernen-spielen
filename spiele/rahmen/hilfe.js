// <ls-hilfe spiel="einmaleins">
// Hilfe-Knopf unten rechts im sicheren Feld (192 × 108 rem, mittig). Tippen löst das Ereignis „hilfe“ aus.
// leuchte(): einmaliges ruhiges Aufleuchten (~1 s); bei reduced motion ein ruhiger Rahmen für 1 s.

import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import "./knopf.js";

const LEUCHT_MS = 1000;

const HILFE_CSS = `
:host {
  position: fixed;
  top: 0;
  bottom: 0;
  left: max(0px, calc((100vw - 192rem) / 2));
  width: min(100vw, 192rem);
  display: block;
  pointer-events: none;
  z-index: 50;
}
.platz {
  position: absolute;
  right: calc(${MASSE.rand}rem + env(safe-area-inset-right, 0px));
  bottom: calc(${MASSE.rand}rem + env(safe-area-inset-bottom, 0px));
  width: ${MASSE.bedien}rem;
  height: ${MASSE.bedien}rem;
  border-radius: 50%;
  pointer-events: auto;
}
.platz ls-knopf { display: block; }
.leuchtet { animation: leuchte ${LEUCHT_MS}ms ease-in-out 1; }
@keyframes leuchte {
  0%, 100% { box-shadow: 0 0 0 0 rgba(255, 214, 90, 0); }
  50% { box-shadow: 0 0 0 1.6rem rgba(255, 214, 90, 0.85), 0 0 4rem 2rem rgba(255, 214, 90, 0.6); }
}
@media (prefers-reduced-motion: reduce) {
  .leuchtet { box-shadow: 0 0 0 0.8rem var(--ls-tinte); }
}
`;

export class LsHilfe extends HTMLElement {
  static observedAttributes = ["spiel"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${HILFE_CSS}</style>
      <div class="platz"><ls-knopf symbol="hilfe.svg" name="Hilfe"></ls-knopf></div>`;
    this.platz = /** @type {HTMLElement} */ (wurzel.querySelector(".platz"));
    this.knopf = /** @type {HTMLElement} */ (wurzel.querySelector("ls-knopf"));
    this._timer = null;
    this.knopf.addEventListener("click", () => {
      this.dispatchEvent(new CustomEvent("hilfe", { bubbles: true, composed: true }));
    });
  }

  connectedCallback() {
    this.gebeSpielWeiter();
  }

  attributeChangedCallback() {
    this.gebeSpielWeiter();
  }

  gebeSpielWeiter() {
    const spiel = this.getAttribute("spiel");
    if (spiel) this.knopf.setAttribute("spiel", spiel);
    else this.knopf.removeAttribute("spiel");
  }

  /** Leuchtet einmal ~1 s; ein Aufruf währenddessen verlängert nicht und startet nicht neu. */
  leuchte() {
    if (this._timer !== null) return;
    this.platz.classList.add("leuchtet");
    this._timer = setTimeout(() => {
      this.platz.classList.remove("leuchtet");
      this._timer = null;
    }, LEUCHT_MS);
  }
}

definiere("ls-hilfe", LsHilfe);
