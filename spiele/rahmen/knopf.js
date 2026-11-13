// <ls-knopf symbol="haus.svg" name="Alle Spiele" groesse="bedien" gespiegelt>
// Runder Grundknopf mit Symbol. Beim ersten Tippen je Sitzung spricht er seinen Namen (nur bei Ton an).

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { schonGesagt, merkeGesagt } from "../kern/sitzung.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;

/**
 * Spiel-Kennung: eigenes Attribut, dann Shadow-Host-Kette, dann die Leiste der Seite.
 * @param {Element} el
 * @returns {string | null}
 */
export function findeSpiel(el) {
  /** @type {Element | null} */
  let k = el;
  while (k) {
    const s = k.getAttribute("spiel");
    if (s) return s;
    const wurzel = /** @type {any} */ (k.getRootNode());
    k = wurzel?.host ?? null;
  }
  return document.querySelector("ls-leiste")?.getAttribute("spiel") ?? null;
}

// Die ganze Fläche (mindestens Tippfläche) gehört dem Button; der sichtbare Kreis sitzt darin.
const KNOPF_CSS = `
.knopf {
  width: max(var(--ls-knopf), ${MASSE.bedien}rem);
  height: max(var(--ls-knopf), ${MASSE.bedien}rem);
  padding: 0;
  background: none;
  box-shadow: none;
}
.knopf:active { transform: none; box-shadow: none; }
.kreis {
  box-sizing: border-box;
  width: var(--ls-knopf);
  height: var(--ls-knopf);
  padding: 2rem;
  border-radius: 50%;
  background: var(--ls-papier);
  box-shadow: var(--ls-schatten);
  display: flex;
  align-items: center;
  justify-content: center;
}
.knopf:active .kreis { transform: translateY(0.3rem); box-shadow: var(--ls-schatten-unten); }
.knopf:focus-visible { outline: none; }
.knopf:focus-visible .kreis { outline: 0.4rem solid var(--ls-tinte); outline-offset: 0.4rem; }
`;

export class LsKnopf extends HTMLElement {
  static observedAttributes = ["symbol", "name", "groesse", "gespiegelt"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${KNOPF_CSS}</style>
      <button class="knopf" type="button"><span class="kreis"><img alt="" draggable="false"></span></button>`;
    this.knopf = /** @type {HTMLButtonElement} */ (wurzel.querySelector("button"));
    this.bild = /** @type {HTMLImageElement} */ (wurzel.querySelector("img"));
    this.knopf.addEventListener("click", () => this.sagName());
  }

  connectedCallback() {
    this.zeichne();
  }

  attributeChangedCallback() {
    this.zeichne();
  }

  /** @returns {string} */
  get name() {
    return this.getAttribute("name") ?? "";
  }

  zeichne() {
    const symbol = this.getAttribute("symbol");
    if (symbol) this.bild.src = SYMBOLE + symbol.replace(/^.*\//, "");
    else this.bild.removeAttribute("src");
    this.knopf.setAttribute("aria-label", this.name);
    const g = this.getAttribute("groesse");
    const rem = g === "haupt" ? MASSE.haupt : g === "klein" ? MASSE.klein : MASSE.bedien;
    this.style.setProperty("--ls-knopf", `${rem}rem`);
    this.knopf.classList.toggle("gespiegelt", this.hasAttribute("gespiegelt"));
  }

  async sagName() {
    const name = this.name;
    if (this.hasAttribute("stumm")) return; // der Besitzer spricht selbst (z. B. die Leiste beim Ton-Umschalten)
    if (!name || schonGesagt(name)) return;
    await ladeEinstellungen();
    const spiel = findeSpiel(this);
    const tonAn = spiel ? einstellung(`ton.${spiel}`, true) : true;
    if (!tonAn) return;
    merkeGesagt(name);
    sprich(name);
  }
}

definiere("ls-knopf", LsKnopf);
