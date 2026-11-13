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
function findeSpiel(el) {
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

export class LsKnopf extends HTMLElement {
  static observedAttributes = ["symbol", "name", "groesse", "gespiegelt"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}</style>
      <button class="knopf" type="button"><img alt="" draggable="false"></button>`;
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
    // Kleiner Knopf: sichtbar 8 rem, Tippfläche 11 rem (unsichtbarer Rand).
    this.knopf.style.margin = g === "klein" ? `${(MASSE.bedien - MASSE.klein) / 2}rem` : "";
    this.knopf.classList.toggle("gespiegelt", this.hasAttribute("gespiegelt"));
  }

  async sagName() {
    const name = this.name;
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
