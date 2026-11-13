// <ls-blase spiel="einmaleins">
// Sprechblase des Erzählers: Papier mit Tinte-Kontur, großer Radius, ohne Zipfel (gehört keiner Figur).
// Text links (Andika 3,6 rem, Tinte), kleiner Nebenknopf „Noch mal hören“ rechts. Flach: kein Schatten.
// Das Spiel platziert den Host per CSS.
// Spiel-Kennung wie bei ls-knopf (eigenes Attribut, Host-Kette, sonst ls-leiste); ohne Kennung ist der Ton an.

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import { findeSpiel } from "./knopf.js";

const BLASE_CSS = `
:host { display: block; }
.blase {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: ${MASSE.abstand}rem;
  min-height: 15rem;
  padding: 1.6rem 1.6rem 1.6rem 4rem;
  border: var(--ls-kontur) solid var(--ls-tinte);
  border-radius: var(--ls-radius-gross);
  background: var(--ls-papier);
}
.text {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 3.6rem;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
ls-knopf { flex: none; }
`;

export class LsBlase extends HTMLElement {
  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${BLASE_CSS}</style>
      <div class="blase">
        <div class="text" aria-live="polite"></div>
        <ls-knopf symbol="vorlesen.svg" name="Noch mal hören" groesse="klein" stumm></ls-knopf>
      </div>`;
    this.textFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".text"));
    this.knopf = /** @type {HTMLElement} */ (wurzel.querySelector("ls-knopf"));
    this._text = "";
    this._tempo = undefined;
    // Stumm: der Knopf spricht nicht seinen Namen, sondern wiederholt den Text.
    this.knopf.addEventListener("click", () => {
      if (this._text) this.spricht(this._text, this._tempo);
    });
  }

  /** @returns {string} der zuletzt gesagte Text */
  get text() {
    return this._text;
  }

  connectedCallback() {
    const spiel = this.getAttribute("spiel");
    if (spiel) this.knopf.setAttribute("spiel", spiel);
  }

  /**
   * Setzt den Text und spricht ihn (bei sprechen und Ton an).
   * @param {string} text
   * @param {{ sprechen?: boolean, tempo?: number }} [opt]
   * @returns {Promise<string>} Ergebnis von sprich, "still" wenn nicht gesprochen wurde
   */
  async sage(text, { sprechen = true, tempo } = {}) {
    this._text = text;
    this._tempo = tempo;
    this.textFeld.textContent = text;
    if (!sprechen) return "still";
    return this.spricht(text, tempo);
  }

  /**
   * @param {string} text
   * @param {number | undefined} tempo
   * @returns {Promise<string>}
   */
  async spricht(text, tempo) {
    let tonAn = true;
    try {
      await ladeEinstellungen();
      const spiel = findeSpiel(this);
      tonAn = spiel ? einstellung(`ton.${spiel}`, true) !== false : true;
    } catch {
      tonAn = true;
    }
    if (!tonAn) return "still";
    return sprich(text, tempo === undefined ? {} : { tempo });
  }
}

definiere("ls-blase", LsBlase);
