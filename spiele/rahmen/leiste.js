// <ls-leiste spiel="einmaleins" fach="mathe">
// Feste Plätze oben: Haus (Alle Spiele) links, Fachsymbol rechts daneben, Ton an/aus rechts.
// Steht fest im sicheren Feld (192 × 108 rem, mittig), 2,4 rem vom Rand.

import { ladeEinstellungen, einstellung, setzeEinstellung } from "../kern/einstellungen.js";
import { sprich, stille } from "../kern/stimme.js";
import { schonGesagt, merkeGesagt } from "../kern/sitzung.js";
import { protokoll } from "../kern/protokoll.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import "./knopf.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;
const HAUS_HREF = new URL("../index.html", import.meta.url).href;
const HAUS_NAME = "Alle Spiele";

const LEISTE_CSS = `
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
.feld {
  position: absolute;
  inset: 0;
  padding-top: calc(${MASSE.rand}rem + env(safe-area-inset-top, 0px));
  padding-right: calc(${MASSE.rand}rem + env(safe-area-inset-right, 0px));
  padding-left: calc(${MASSE.rand}rem + env(safe-area-inset-left, 0px));
  box-sizing: border-box;
}
.links {
  position: absolute;
  top: calc(${MASSE.rand}rem + env(safe-area-inset-top, 0px));
  left: calc(${MASSE.rand}rem + env(safe-area-inset-left, 0px));
  display: flex;
  align-items: center;
  gap: ${MASSE.abstand}rem;
}
.rechts {
  position: absolute;
  top: calc(${MASSE.rand}rem + env(safe-area-inset-top, 0px));
  right: calc(${MASSE.rand}rem + env(safe-area-inset-right, 0px));
}
.links > *, .rechts > * { pointer-events: auto; }
a.haus {
  box-sizing: border-box;
  width: ${MASSE.bedien}rem;
  height: ${MASSE.bedien}rem;
  display: block;
  color: inherit;
  text-decoration: none;
  -webkit-tap-highlight-color: transparent;
}
a.haus .kreis {
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding: 2rem;
  border-radius: 50%;
  background: var(--ls-papier);
  box-shadow: var(--ls-schatten);
  display: flex;
  align-items: center;
  justify-content: center;
}
a.haus:active .kreis { transform: translateY(0.3rem); box-shadow: var(--ls-schatten-unten); }
a.haus:focus-visible { outline: none; }
a.haus:focus-visible .kreis { outline: 0.4rem solid var(--ls-tinte); outline-offset: 0.4rem; }
a.haus img { width: 100%; height: 100%; display: block; pointer-events: none; }
.fach { width: ${MASSE.klein}rem; height: ${MASSE.klein}rem; display: block; pointer-events: none; }
.fach[hidden] { display: none; }
`;

export class LsLeiste extends HTMLElement {
  static observedAttributes = ["spiel", "fach"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${LEISTE_CSS}</style>
      <div class="feld">
        <div class="links">
          <a class="haus" href="${HAUS_HREF}" aria-label="${HAUS_NAME}"><span class="kreis"><img alt="" draggable="false" src="${SYMBOLE}haus.svg"></span></a>
          <img class="fach" alt="" draggable="false" hidden>
        </div>
        <div class="rechts"><ls-knopf class="tonknopf" stumm></ls-knopf></div>
      </div>`;
    this.haus = /** @type {HTMLAnchorElement} */ (wurzel.querySelector("a.haus"));
    this.fachBild = /** @type {HTMLImageElement} */ (wurzel.querySelector("img.fach"));
    this.tonKnopf = /** @type {HTMLElement} */ (wurzel.querySelector(".tonknopf"));
    this._ton = true;
    this._start = false;
    this._bereit = false;
    /** @type {Promise<void>} */
    this.bereitet = new Promise((ok) => { this._ok = ok; });
    this.haus.addEventListener("click", () => this.sagHaus());
    this.tonKnopf.addEventListener("click", () => this.schalteTon());
  }

  connectedCallback() {
    this.zeichne();
    if (!this._start) {
      this._start = true;
      this.lade();
    }
  }

  attributeChangedCallback() {
    this.zeichne();
    if (this._start) this.leseTon();
  }

  /** @returns {boolean} */
  get ton() {
    return this._ton;
  }

  /** @param {boolean} an */
  set ton(an) {
    this.setze(Boolean(an), true);
  }

  /** @returns {boolean} true, sobald die Einstellungen geladen sind (für späte Zuhörer des Ereignisses bereit) */
  get istBereit() {
    return this._bereit;
  }

  /** @returns {Promise<void>} */
  bereit() {
    return this.bereitet;
  }

  async lade() {
    try {
      await ladeEinstellungen();
    } catch (e) {
      protokoll("Leiste: Einstellungen nicht geladen: " + e);
    }
    this.leseTon();
    this._bereit = true;
    this._ok();
    this.dispatchEvent(new CustomEvent("bereit"));
  }

  leseTon() {
    const spiel = this.getAttribute("spiel");
    this._ton = spiel ? einstellung(`ton.${spiel}`, true) !== false : true;
    this.zeichne();
  }

  /**
   * @param {boolean} an
   * @param {boolean} speichern
   */
  setze(an, speichern) {
    this._ton = an;
    const spiel = this.getAttribute("spiel");
    if (speichern && spiel) setzeEinstellung(`ton.${spiel}`, an);
    if (!an) stille();
    this.zeichne();
    this.dispatchEvent(new CustomEvent("ton", { detail: { an } }));
  }

  schalteTon() {
    this.setze(!this._ton, true);
    // Der Knopf selbst bleibt stumm (stumm): sonst spräche er den alten Namen. Hier der neue Zustand.
    const name = this._ton ? "Ton an" : "";
    if (name && !schonGesagt(name)) {
      merkeGesagt(name);
      sprich(name);
    }
  }

  zeichne() {
    const spiel = this.getAttribute("spiel");
    const fach = this.getAttribute("fach");
    if (fach) {
      this.fachBild.src = SYMBOLE + fach.replace(/[^a-z]/g, "") + ".svg";
      this.fachBild.hidden = false;
    } else {
      this.fachBild.removeAttribute("src");
      this.fachBild.hidden = true;
    }
    if (spiel) this.tonKnopf.setAttribute("spiel", spiel);
    this.tonKnopf.setAttribute("symbol", this._ton ? "ton-an.svg" : "ton-aus.svg");
    this.tonKnopf.setAttribute("name", this._ton ? "Ton an" : "Ton aus");
  }

  // Name beim ersten Tippen: nie die Navigation aufhalten, die Sprache darf abgeschnitten werden.
  sagHaus() {
    if (!this._ton || schonGesagt(HAUS_NAME)) return;
    merkeGesagt(HAUS_NAME);
    sprich(HAUS_NAME);
  }
}

definiere("ls-leiste", LsLeiste);
