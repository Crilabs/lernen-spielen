// <ls-knopf symbol="haus.svg" name="Alle Spiele" groesse="bedien" gespiegelt>
// <ls-knopf art="haupt" wort="Fertig">
// Grundknopf nach der Farbwelt. Zwei Arten (`art` = Gestalt):
// - Nebenknopf (art="neben", Vorgabe): Papier, Tinte-Kontur, Schatten in Tinte weich; rund mit Symbol allein.
// - Hauptknopf (art="haupt"): Tinte gefüllt, Symbol und Wort in Papier, Pillenform (z. B. Fertig).
// Mit `wort` wird jeder Knopf zur Pille mit sichtbarem Wort. Größe (`groesse`, unabhängig von `art`):
// `groesse="bedien|gross|klein"` (rund 11/16/8 rem; Pille 11 rem hoch, mit gross 14 rem wie die Pausenknöpfe);
// die Tippfläche ist immer mindestens 11 rem.
// Beim ersten Tippen je Sitzung spricht er seinen Namen (nur bei Ton an; `stumm`: nie). Bricht anderer
// Inhalt den Namen ab (z. B. die Probe der Hilfe), gilt er nicht als gesagt und kommt beim nächsten Tippen.

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { schonGesagt, sageEinmal } from "../kern/sitzung.js";
import { GRUND_CSS, MASSE, bild, definiere } from "./stil.js";

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

const KNOPF_CSS = `
:host { line-height: 0; }
`;

export class LsKnopf extends HTMLElement {
  static observedAttributes = ["symbol", "name", "groesse", "gespiegelt", "art", "wort"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${KNOPF_CSS}</style>
      <button class="knopf" type="button"><span class="form neben rund"><span class="zeichen"><img alt="" draggable="false"></span><span class="wort" hidden></span></span></button>`;
    this.knopf = /** @type {HTMLButtonElement} */ (wurzel.querySelector("button"));
    this.form = /** @type {HTMLElement} */ (wurzel.querySelector(".form"));
    this.zeichen = /** @type {HTMLElement} */ (wurzel.querySelector(".zeichen"));
    this.bild = /** @type {HTMLImageElement} */ (wurzel.querySelector(".zeichen img"));
    this.wortFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".wort"));
    this.knopf.addEventListener("click", () => this.sagName());
  }

  connectedCallback() {
    this.zeichne();
  }

  attributeChangedCallback() {
    this.zeichne();
  }

  /** @returns {string} gesprochener Name; ohne `name` das sichtbare Wort */
  get name() {
    return this.getAttribute("name") ?? this.getAttribute("wort") ?? "";
  }

  zeichne() {
    const symbol = this.getAttribute("symbol");
    if (symbol) {
      const href = SYMBOLE + symbol.replace(/^.*\//, "");
      this.bild.src = href;
      this.zeichen.style.setProperty("--bild", bild(href));
      this.zeichen.hidden = false;
    } else {
      this.bild.removeAttribute("src");
      this.zeichen.style.removeProperty("--bild");
      this.zeichen.hidden = true;
    }
    const wort = this.getAttribute("wort") ?? "";
    this.wortFeld.textContent = wort;
    this.wortFeld.hidden = !wort;
    const haupt = this.getAttribute("art") === "haupt";
    const pille = haupt || Boolean(wort);
    this.form.classList.toggle("haupt", haupt);
    this.form.classList.toggle("neben", !haupt);
    this.form.classList.toggle("pille", pille);
    this.form.classList.toggle("rund", !pille);
    this.form.classList.toggle("gespiegelt", this.hasAttribute("gespiegelt"));
    this.knopf.setAttribute("aria-label", this.name);
    const g = this.getAttribute("groesse");
    const rem = pille
      ? g === "gross" ? MASSE.pilleGross : MASSE.pille
      : g === "gross" ? MASSE.gross : g === "klein" ? MASSE.klein : MASSE.bedien;
    this.style.setProperty("--ls-knopf", `${rem}rem`);
  }

  async sagName() {
    const name = this.name;
    if (this.hasAttribute("stumm")) return; // der Besitzer spricht selbst (z. B. die Leiste beim Ton-Umschalten)
    if (!name || schonGesagt(name)) return;
    try {
      await ladeEinstellungen();
    } catch {
      // Einstellungen nicht ladbar: Ton gilt als an.
    }
    const spiel = findeSpiel(this);
    if (spiel && einstellung(`ton.${spiel}`, true) === false) return;
    await sageEinmal(name, sprich);
  }
}

definiere("ls-knopf", LsKnopf);
