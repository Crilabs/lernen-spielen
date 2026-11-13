// <ls-pause spiel="einmaleins"> … Pausenbild, Sachmoment … </ls-pause>
// Vollflächige Ebene über dem Spiel, verborgen bis zeige(). Unten Mitte: „Alle Spiele“ und „Weiter“.
// Kein Timer, kein Ablauf. Der Inhalt kommt per <slot>.

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { schonGesagt, merkeGesagt } from "../kern/sitzung.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import { findeSpiel } from "./knopf.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;
const HAUS_HREF = new URL("../index.html", import.meta.url).href;

const PAUSE_CSS = `
:host {
  position: fixed;
  inset: 0;
  display: block;
  z-index: 100;
  background: rgba(255, 255, 255, 0.82);
}
:host(:not([offen])) { display: none; }
.inhalt {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: ${MASSE.haupt + 8}rem;
}
.aktionen {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(6rem + env(safe-area-inset-bottom, 0px));
  display: flex;
  justify-content: center;
  gap: 8rem;
}
a.alle {
  box-sizing: border-box;
  width: ${MASSE.haupt}rem;
  height: ${MASSE.haupt}rem;
  padding: 3.4rem;
  border-radius: 50%;
  background: var(--ls-papier);
  box-shadow: var(--ls-schatten);
  display: flex;
  align-items: center;
  justify-content: center;
  color: inherit;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
a.alle:active { transform: translateY(0.3rem); box-shadow: var(--ls-schatten-unten); }
a.alle:focus-visible { outline: 0.4rem solid var(--ls-tinte); outline-offset: 0.4rem; }
a.alle img { width: 100%; height: 100%; display: block; pointer-events: none; }
`;

export class LsPause extends HTMLElement {
  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${PAUSE_CSS}</style>
      <div class="inhalt"><slot></slot></div>
      <div class="aktionen">
        <a class="alle" href="${HAUS_HREF}" aria-label="Alle Spiele"><img alt="" draggable="false" src="${SYMBOLE}haus.svg"></a>
        <ls-knopf class="weiter" symbol="zurueck.svg" name="Weiter" groesse="haupt" gespiegelt></ls-knopf>
      </div>`;
    this.alle = /** @type {HTMLAnchorElement} */ (wurzel.querySelector("a.alle"));
    this.weiter = /** @type {HTMLElement} */ (wurzel.querySelector("ls-knopf.weiter"));
    /** @type {Promise<"weiter"> | null} */
    this._offen = null;
    /** @type {((w: "weiter") => void) | null} */
    this._loese = null;
    this.alle.addEventListener("click", () => this.sagAlle());
    this.weiter.addEventListener("click", () => this.beendeWeiter());
  }

  connectedCallback() {
    this.gebeSpielWeiter();
  }

  static observedAttributes = ["spiel"];

  attributeChangedCallback() {
    this.gebeSpielWeiter();
  }

  gebeSpielWeiter() {
    const spiel = this.getAttribute("spiel");
    if (spiel) this.weiter.setAttribute("spiel", spiel);
    else this.weiter.removeAttribute("spiel");
  }

  /**
   * Macht die Ebene sichtbar; löst beim Tippen auf Weiter genau einmal auf. Während sie offen ist,
   * liefert jeder weitere Aufruf dasselbe Versprechen.
   * @returns {Promise<"weiter">}
   */
  zeige() {
    if (this._offen) return this._offen;
    this._offen = new Promise((ok) => { this._loese = ok; });
    this.setAttribute("offen", "");
    this.weiter.shadowRoot?.querySelector("button")?.focus({ preventScroll: true });
    return this._offen;
  }

  beendeWeiter() {
    const loese = this._loese;
    if (!loese) return;
    this._loese = null;
    this._offen = null;
    this.removeAttribute("offen");
    loese("weiter");
  }

  // Der Link navigiert sofort (linkKlick speichert vorher); der Name wird nur beim ersten Tippen und bei Ton an gesprochen.
  async sagAlle() {
    const name = "Alle Spiele";
    if (schonGesagt(name)) return;
    try {
      await ladeEinstellungen();
    } catch {
      // Einstellungen nicht ladbar: Ton gilt als an.
    }
    const spiel = findeSpiel(this);
    if (spiel && einstellung(`ton.${spiel}`, true) === false) return;
    merkeGesagt(name);
    sprich(name);
  }
}

definiere("ls-pause", LsPause);
