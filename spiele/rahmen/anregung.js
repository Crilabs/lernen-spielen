// <ls-anregung></ls-anregung>   →   await anregung.oeffne({ titel, text, sprich })
// Karte „Mit echten Dingen“ (Spec 2026-11-14-ansichten): eine Anregung aus dem Alltag für den Erwachsenen, der mit
// dem Kind schaut (`eltern` im Lernplan). Ohne PIN, kein Kindertext, keine Aufgabe. Fach-Seite und Regal nutzen sie.
//
// Liegt über der ganzen Seite, auch über der Kopfleiste: ein ruhiger Schleier in Nebel, darauf eine flache Karte aus
// Papier mit Tinte-Kontur (keine Nacht: das ist keine Pause). Oben links Zurück (schließt), daneben die Überschrift
// „Mit echten Dingen“ und leiser der Name des Themas, rechts Noch mal hören (liest den Text vor). Darunter der Text
// groß und gut lesbar. Schließen: Zurück, Escape oder Tippen auf den Schleier. Der Text wird nicht von selbst
// vorgelesen; Schließen beendet laufendes Vorlesen.
// Spiel-Kennung für den Ton wie bei ls-blase (Attribut `spiel`, Host-Kette, sonst ls-leiste); ohne Kennung ist der
// Ton an. Keine Attribute im Konstruktor.

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich, stille } from "../kern/stimme.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import { findeSpiel } from "./knopf.js";
import "./knopf.js";

/** Überschrift der Karte, zugleich der Name des Knopfs, der sie öffnet. */
export const ANREGUNG_TITEL = "Mit echten Dingen";

const ANREGUNG_CSS = `
:host {
  position: fixed;
  inset: 0;
  z-index: 70;
  display: none;
}
:host([offen]) { display: block; }
.schleier {
  position: absolute;
  inset: 0;
  background: color-mix(in srgb, var(--ls-nebel) 88%, transparent);
  animation: auf 0.18s ease-out;
}
.karte {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  box-sizing: border-box;
  width: min(124rem, calc(100vw - ${2 * MASSE.rand}rem));
  max-height: calc(100dvh - ${2 * MASSE.rand}rem);
  overflow: auto;
  padding: 3.6rem 4.4rem 5.6rem;
  background: var(--ls-papier);
  border: var(--ls-kontur) solid var(--ls-tinte);
  border-radius: var(--ls-radius-gross);
  animation: auf 0.18s ease-out;
}
.kopf {
  display: flex;
  align-items: center;
  gap: ${MASSE.rand}rem;
}
.ueber { flex: 1 1 auto; min-width: 0; }
h2 {
  margin: 0;
  font-size: 5.2rem;
  line-height: 1.2;
  font-weight: 700;
}
.thema {
  margin: 0.2rem 0 0;
  font-size: 3.4rem;
  line-height: 1.3;
  color: var(--ls-tinte-weich);
}
.thema:empty { display: none; }
.text {
  margin: 4rem 0 0;
  padding: 0 0 0 calc(${MASSE.bedien}rem + ${MASSE.rand}rem);
  max-width: 62ch;
  font-size: 4.4rem;
  line-height: 1.45;
  text-wrap: pretty;
  -webkit-user-select: text;
  user-select: text;
}
@keyframes auf { from { opacity: 0; } }
`;

export class LsAnregung extends HTMLElement {
  /** @type {(() => void) | null} */
  #zu = null;
  /** @type {Element | null} */
  #vorher = null;

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${ANREGUNG_CSS}</style>
      <div class="schleier"></div>
      <section class="karte" role="dialog" aria-modal="true" aria-labelledby="titel">
        <div class="kopf">
          <ls-knopf class="zurueck" symbol="zurueck.svg" name="Zurück"></ls-knopf>
          <div class="ueber"><h2 id="titel">${ANREGUNG_TITEL}</h2><p class="thema"></p></div>
          <ls-knopf class="hoeren" symbol="vorlesen.svg" name="Noch mal hören" stumm></ls-knopf>
        </div>
        <p class="text"></p>
      </section>`;
    this.themaFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".thema"));
    this.textFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".text"));
    this.zurueck = /** @type {HTMLElement} */ (wurzel.querySelector(".zurueck"));
    this.hoeren = /** @type {HTMLElement} */ (wurzel.querySelector(".hoeren"));
    this._sprich = "";
    this.zurueck.addEventListener("click", () => this.schliesse());
    /** @type {HTMLElement} */ (wurzel.querySelector(".schleier")).addEventListener("click", () => this.schliesse());
    this.hoeren.addEventListener("click", () => this.liesVor());
    this.taste = this.taste.bind(this);
  }

  /** @returns {boolean} */
  get offen() {
    return this.hasAttribute("offen");
  }

  /**
   * Zeigt die Karte. Löst auf, sobald sie wieder geschlossen ist (Zurück, Escape, Schleier oder schliesse()).
   * Ein zweites oeffne() ersetzt den Inhalt; das frühere Versprechen löst dann auf.
   * @param {{ titel?: string, text: string, sprich?: string }} anregung titel: Name des Themas (leise unter der
   *   Überschrift); text: die Anregung; sprich: was vorgelesen wird (Vorgabe: text)
   * @returns {Promise<void>}
   */
  oeffne({ titel = "", text, sprich: vorlesen }) {
    this.#zu?.();
    this.themaFeld.textContent = titel;
    this.textFeld.textContent = text;
    this._sprich = vorlesen || text;
    if (!this.offen) this.#vorher = document.activeElement;
    this.setAttribute("offen", "");
    document.addEventListener("keydown", this.taste);
    // Fokus in die Karte (auf Zurück), damit Tastatur und Vorleser dort weitermachen.
    requestAnimationFrame(() => /** @type {any} */ (this.zurueck.shadowRoot)?.querySelector("button")?.focus({ preventScroll: true }));
    return new Promise((ok) => { this.#zu = ok; });
  }

  /** Schließt die Karte (still, wenn sie schon zu ist) und beendet laufendes Vorlesen. */
  schliesse() {
    if (!this.offen) return;
    this.removeAttribute("offen");
    document.removeEventListener("keydown", this.taste);
    stille();
    const vorher = /** @type {HTMLElement | null} */ (this.#vorher);
    this.#vorher = null;
    if (vorher?.isConnected) vorher.focus?.({ preventScroll: true });
    const zu = this.#zu;
    this.#zu = null;
    zu?.();
  }

  /** @param {KeyboardEvent} e */
  taste(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.schliesse();
    }
  }

  async liesVor() {
    if (!this._sprich) return "still";
    let tonAn = true;
    try {
      await ladeEinstellungen();
      const spiel = findeSpiel(this);
      tonAn = spiel ? einstellung(`ton.${spiel}`, true) !== false : true;
    } catch {
      tonAn = true;
    }
    if (!tonAn) return "still";
    return sprich(this._sprich);
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.taste);
  }
}

definiere("ls-anregung", LsAnregung);
