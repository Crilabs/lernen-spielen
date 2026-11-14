// <ls-hilfe spiel="vorlage">
// Hilfe-Knopf (Nebenknopf) unten rechts im sicheren Feld (192 × 108 rem, mittig). Tippen löst „hilfe“ aus.
// leuchte(): ein Sonnenring mit weichem Licht um den Knopf, einmal ~1 s (nie eine Füllung, nie in Schleife);
// bei reduced motion steht der Sonnenring ruhig 1 s.

import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import "./knopf.js";

const LEUCHT_MS = 1000;

const HILFE_CSS = `
:host {
  position: fixed;
  top: 0;
  bottom: 0;
  left: max(0rem, calc((100vw - 192rem) / 2));
  width: min(100vw, 192rem);
  display: block;
  pointer-events: none;
  z-index: 50;
}
.platz {
  position: absolute;
  right: calc(${MASSE.rand}rem + env(safe-area-inset-right, 0rem));
  bottom: calc(${MASSE.rand}rem + env(safe-area-inset-bottom, 0rem));
  width: ${MASSE.bedien}rem;
  height: ${MASSE.bedien}rem;
  border-radius: 50%;
  pointer-events: auto;
}
.platz ls-knopf { display: block; }
/* Sonnenring wie der Fokusring der Knöpfe, dazu weiches Licht. */
.platz::after {
  content: "";
  position: absolute;
  inset: -0.8rem; /* direkt an der Kontur des Knopfs (.platz = Außenkante) */
  border: 0.8rem solid var(--ls-sonne);
  border-radius: 50%;
  box-shadow: 0 0 0 0.3rem var(--ls-tinte), 0 0 4rem 2rem rgba(255, 217, 90, 0.55);
  opacity: 0;
  pointer-events: none;
}
.leuchtet::after { animation: leuchte ${LEUCHT_MS}ms ease-in-out 1; }
@keyframes leuchte {
  0% { opacity: 0; transform: scale(0.9); }
  30%, 70% { opacity: 1; transform: scale(1); }
  100% { opacity: 0; transform: scale(1); }
}
@media (prefers-reduced-motion: reduce) {
  .leuchtet::after { opacity: 1; box-shadow: 0 0 0 0.3rem var(--ls-tinte); }
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
