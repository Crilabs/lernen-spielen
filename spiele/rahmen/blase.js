// <ls-blase spiel="vorlage">
// Sprechblase des Erzählers: Papier mit Tinte-Kontur, großer Radius, ohne Zipfel (gehört keiner Figur).
// Text links (Andika 3,6 rem, Tinte), kleiner Nebenknopf „Noch mal hören“ rechts. Flach: kein Schatten.
// Das Spiel platziert den Host per CSS.
// Attribut `versalien`: die sichtbare Blase (nur mit ohne-text) zeigt den Text in Versalien, ß bleibt ß (G01; gesprochen wird er unverändert).
// Attribut `ohne-text` (Christian, 2026-11-15): keine sichtbare Blase, nur der runde Knopf „Noch mal hören“
// (Größe bedien). Er erscheint erst, wenn es einen Satz gibt (Attribut `hat-text` am Host), und spricht den
// zuletzt gesagten noch einmal; `sage(text)` spricht und merkt sich den Text. Der Text bleibt für Vorleser im
// Baum (aria-live), ist aber nicht zu sehen. Ohne das Attribut alles wie bisher.
// Mit `sage(text, { zeigen: true })` erscheint der Satz dort kurz als Blase neben dem Knopf (ruhig ein- und
// ausgeblendet, Host-Attribut `zeigt`) und verschwindet von selbst, wenn er gesprochen ist, frühestens nach einer
// Lesezeit (lesezeit(text)). Ein neuer Satz ersetzt ihn sofort.
// Spiel-Kennung wie bei ls-knopf (eigenes Attribut, Host-Kette, sonst ls-leiste); ohne Kennung ist der Ton an.

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import { findeSpiel } from "./knopf.js";
import { lesezeit } from "./lesezeit.js";

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
:host([ohne-text]) .blase { display: block; min-height: 0; padding: 0; border: 0; background: none; }
:host([ohne-text]) .text {
  position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
:host([ohne-text]) .blase { position: relative; }
:host([ohne-text]) .zeige {
  position: absolute; left: calc(100% + 2rem); top: 0; box-sizing: border-box;
  width: max-content; max-width: 70rem; min-height: 11rem; display: flex; align-items: center;
  padding: 1.6rem 3.2rem; border: var(--ls-kontur) solid var(--ls-tinte); border-radius: var(--ls-radius-gross);
  background: var(--ls-papier); font-size: 3.6rem; line-height: 1.3;
  opacity: 0; transform: translateY(-0.6rem); pointer-events: none;
  transition: opacity 0.25s ease, transform 0.25s ease;
}
:host(:not([ohne-text])) .zeige { display: none; }
:host([ohne-text][zeigt]) .zeige { opacity: 1; transform: none; }
@media (prefers-reduced-motion: reduce) { :host([ohne-text]) .zeige { transition: none; } }
:host([ohne-text]:not([hat-text])) ls-knopf { visibility: hidden; }
`;

export { lesezeit } from "./lesezeit.js";

export class LsBlase extends HTMLElement {
  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${BLASE_CSS}</style>
      <div class="blase">
        <div class="text" aria-live="polite"></div>
        <ls-knopf symbol="vorlesen.svg" name="Noch mal hören" groesse="klein" stumm></ls-knopf>
        <div class="zeige" aria-hidden="true"></div>
      </div>`;
    this.zeigeFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".zeige"));
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this._uhr = undefined;
    this._nr = 0;
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
    if (this.hasAttribute("ohne-text")) this.knopf.setAttribute("groesse", "bedien");
  }

  /**
   * Setzt den Text und spricht ihn (bei sprechen und Ton an).
   * @param {string} text
   * @param {{ sprechen?: boolean, tempo?: number, zeigen?: boolean }} [opt] zeigen: mit ohne-text kurz als Blase
   * @returns {Promise<string>} Ergebnis von sprich, "still" wenn nicht gesprochen wurde
   */
  async sage(text, { sprechen = true, tempo, zeigen = false } = {}) {
    this._text = text;
    this._tempo = tempo;
    this.textFeld.textContent = text;
    this.toggleAttribute("hat-text", !!text);
    const nr = ++this._nr;
    clearTimeout(this._uhr);
    const kurz = zeigen && !!text && this.hasAttribute("ohne-text");
    if (kurz) this.zeigeFeld.textContent = this.hasAttribute("versalien") ? text.split("ß").map((t) => t.toUpperCase()).join("ß") : text;
    this.toggleAttribute("zeigt", kurz);
    const lesen = kurz ? new Promise((ok) => { this._uhr = setTimeout(ok, lesezeit(text)); }) : null;
    const gesagt = sprechen ? this.spricht(text, tempo) : Promise.resolve("still");
    if (lesen) Promise.all([lesen, gesagt.catch(() => undefined)]).then(() => { if (nr === this._nr) this.removeAttribute("zeigt"); });
    return gesagt;
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
