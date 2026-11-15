// <ls-kopf reiter="koennen|wissen" spiel="ansichten">
// Kopf der Übersichtsseiten nach der Designsprache (docs/superpowers/specs/2026-11-15-designsprache-design.md §5.1):
// oben links zwei Reiter „Können“ (Startseite, Spiele) und „Wissen“ (Bibliothek), der aktive mit einem Strich in Sonne
// darunter; oben rechts Ton an/aus und der Slot `rechts` (Zahnrad der Startseite). Kein Band, keine Fläche: der Kopf
// liegt auf dem Grund der Seite. Titel und Zurück stehen auf der Seite selbst.
// Ton-Schnittstelle wie <ls-leiste>: Eigenschaft `ton`, Ereignis `ton` (detail.an), `await kopf.bereit()`, Ereignis
// `bereit`; Einstellung `ton.<spiel>`. Setzt --ls-leiste-hoehe am <html> (Platz des Kopfes, 14 rem plus Aussparung).
// Reiter sprechen ihren Namen beim ersten Tippen je Sitzung (bei Ton an) und wechseln sofort die Seite.

import { ladeEinstellungen, einstellung, setzeEinstellung } from "../kern/einstellungen.js";
import { sprich, stille } from "../kern/stimme.js";
import { sageEinmal } from "../kern/sitzung.js";
import { protokoll } from "../kern/protokoll.js";
import { GRUND_CSS, SEITE, definiere } from "./stil.js";
import "./knopf.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;

/** Die beiden Reiter: Id, Wort, Ziel (relativ zu spiele/), Symbol. */
export const REITER = Object.freeze([
  { id: "koennen", wort: "Können", ziel: "index.html", symbol: "koennen.svg" },
  { id: "wissen", wort: "Wissen", ziel: "bibliothek.html", symbol: "wissen.svg" },
]);

/** Höhe des Kopfes: Rand oben, Knopf, Luft. */
export const KOPF_HOEHE = `calc(14rem + env(safe-area-inset-top, 0rem))`;

const CSS = `
:host {
  position: fixed;
  top: 0;
  left: max(0rem, calc((100vw - 192rem) / 2));
  width: min(100vw, 192rem);
  height: ${KOPF_HOEHE};
  display: block;
  z-index: 50;
  pointer-events: none;
}
.kopf {
  box-sizing: border-box;
  height: 100%;
  padding: calc(2.6rem + env(safe-area-inset-top, 0rem)) calc(${SEITE.rand}rem + env(safe-area-inset-right, 0rem)) 0
    calc(${SEITE.rand}rem + env(safe-area-inset-left, 0rem));
  display: flex;
  align-items: flex-start;
  gap: 2.4rem;
}
.kopf > *, ::slotted(*) { pointer-events: auto; }
nav { display: flex; gap: 5.4rem; margin-right: auto; }
.reiter {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1.4rem;
  height: 11rem;
  padding: 0 0.4rem;
  color: var(--ls-tinte);
  text-decoration: none;
  font-family: var(--ls-schrift-oberflaeche);
  font-feature-settings: var(--ls-schrift-merkmale);
  font-size: 3.3rem;
  font-weight: 650;
  letter-spacing: -0.01em;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  outline: none;
}
.reiter img { width: 3.6rem; height: 3.6rem; display: block; pointer-events: none; }
.reiter span { pointer-events: none; }
/* Sonne als Strich: hier bist du. */
.reiter::after {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 1.4rem;
  height: 0.9rem;
  border-radius: 0.45rem;
  background: var(--ls-sonne);
  opacity: 0;
}
.reiter[aria-current="page"]::after { opacity: 1; }
.reiter:focus-visible { outline: 0.4rem solid var(--ls-tinte); outline-offset: 0.2rem; border-radius: 1.2rem; }
.reiter:active span, .reiter:active img { transform: translateY(0.2rem); }
.rechts { display: flex; align-items: flex-start; gap: 2.4rem; }
`;

export class LsKopf extends HTMLElement {
  /** @type {() => void} */
  #ok = () => {};
  /** @type {Promise<void>} */
  #bereitet = new Promise((ok) => { this.#ok = ok; });

  static observedAttributes = ["reiter", "spiel"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    const reiter = REITER.map((r) => `<a class="reiter" data-reiter="${r.id}" href="${new URL(`../${r.ziel}`, import.meta.url).href}" draggable="false">`
      + `<img alt="" draggable="false" src="${SYMBOLE}${r.symbol}"><span>${r.wort}</span></a>`).join("");
    wurzel.innerHTML = `<style>${GRUND_CSS}${CSS}</style>
      <div class="kopf"><nav aria-label="Bereiche">${reiter}</nav>
        <div class="rechts"><ls-knopf class="ton" groesse="seite" stumm></ls-knopf><slot name="rechts"></slot></div></div>`;
    this.reiterLinks = /** @type {HTMLAnchorElement[]} */ ([...wurzel.querySelectorAll("a.reiter")]);
    this.tonKnopf = /** @type {HTMLElement} */ (wurzel.querySelector(".ton"));
    this._ton = true;
    this._start = false;
    for (const a of this.reiterLinks) a.addEventListener("click", () => {
      if (this._ton) sageEinmal(a.textContent ?? "", sprich);
    });
    this.tonKnopf.addEventListener("click", () => this.schalteTon());
  }

  connectedCallback() {
    document.documentElement.style.setProperty("--ls-leiste-hoehe", KOPF_HOEHE);
    this.zeichne();
    if (!this._start) {
      this._start = true;
      this.lade();
    }
  }

  disconnectedCallback() {
    document.documentElement.style.removeProperty("--ls-leiste-hoehe");
  }

  /** @param {string} name */
  attributeChangedCallback(name) {
    if (name === "spiel" && this._start) this.leseTon();
    else this.zeichne();
  }

  /** @returns {boolean} */
  get ton() {
    return this._ton;
  }

  /** @param {boolean} an */
  set ton(an) {
    this.setze(Boolean(an), true);
  }

  /** @returns {Promise<void>} */
  bereit() {
    return this.#bereitet;
  }

  async lade() {
    try {
      await ladeEinstellungen();
    } catch (e) {
      protokoll("Kopf: Einstellungen nicht geladen: " + e);
    }
    this.leseTon();
    this.#ok();
    this.dispatchEvent(new CustomEvent("bereit"));
  }

  leseTon() {
    const spiel = this.getAttribute("spiel");
    this._ton = spiel ? einstellung(`ton.${spiel}`, true) !== false : true;
    this.zeichne();
  }

  /** @param {boolean} an @param {boolean} speichern */
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
    if (this._ton) sageEinmal("Ton an", sprich);
  }

  zeichne() {
    const aktiv = this.getAttribute("reiter");
    for (const a of this.reiterLinks) {
      if (a.dataset.reiter === aktiv) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    }
    const spiel = this.getAttribute("spiel");
    if (spiel) this.tonKnopf.setAttribute("spiel", spiel);
    this.tonKnopf.setAttribute("symbol", this._ton ? "ton-an.svg" : "ton-aus.svg");
    this.tonKnopf.setAttribute("name", this._ton ? "Ton an" : "Ton aus");
  }
}

definiere("ls-kopf", LsKopf);
