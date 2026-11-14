// <ls-anregung></ls-anregung>   →   await anregung.oeffne({ titel, text })
// Karte „Mit echten Dingen“ (Spec 2026-11-14-ansichten): eine Anregung aus dem Alltag für den Erwachsenen, der mit
// dem Kind schaut (`eltern` im Lernplan). Ohne PIN, kein Kindertext, keine Aufgabe. Fach-Seite und Regal nutzen sie.
// Der Text ist Elternsprache („Lassen Sie Ihr Kind …“) und wird nicht vorgelesen (kein Noch-mal-hören).
//
// Liegt über der ganzen Seite, auch über der Kopfleiste: ein ruhiger Schleier in Nebel, darauf eine flache Karte aus
// Papier mit Tinte-Kontur (keine Nacht: das ist keine Pause). Oben links Zurück (schließt), daneben die Überschrift
// „Mit echten Dingen“ und leiser der Name des Themas. Darunter der Text groß und gut lesbar.
// Schließen: Zurück, Escape oder Tippen auf den Schleier. Schließen beendet laufende Sprache (z. B. den Namen des
// Zurück-Knopfs). Solange die Karte offen ist, ist der Rest der Seite `inert`; danach kehrt der Fokus zurück.
// Keine Attribute im Konstruktor.

import { stille } from "../kern/stimme.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
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

/**
 * Das wirklich fokussierte Element, auch in Shadow DOM (document.activeElement zeigt nur auf den Host).
 * @returns {HTMLElement | null}
 */
function fokussiert() {
  /** @type {Element | null} */
  let el = document.activeElement;
  while (el?.shadowRoot?.activeElement) el = el.shadowRoot.activeElement;
  return el instanceof HTMLElement && el !== document.body ? el : null;
}

export class LsAnregung extends HTMLElement {
  /** @type {(() => void) | null} */
  #zu = null;
  /** @type {HTMLElement | null} */
  #vorher = null;
  /** Elemente, die diese Karte inert gemacht hat (nur die gibt sie wieder frei). @type {HTMLElement[]} */
  #still = [];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${ANREGUNG_CSS}</style>
      <div class="schleier"></div>
      <section class="karte" role="dialog" aria-modal="true" aria-labelledby="titel">
        <div class="kopf">
          <ls-knopf class="zurueck" symbol="zurueck.svg" name="Zurück"></ls-knopf>
          <div class="ueber"><h2 id="titel">${ANREGUNG_TITEL}</h2><p class="thema"></p></div>
        </div>
        <p class="text"></p>
      </section>`;
    this.themaFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".thema"));
    this.textFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".text"));
    this.zurueck = /** @type {HTMLElement} */ (wurzel.querySelector(".zurueck"));
    this.zurueck.addEventListener("click", () => this.schliesse());
    /** @type {HTMLElement} */ (wurzel.querySelector(".schleier")).addEventListener("click", () => this.schliesse());
    this.taste = this.taste.bind(this);
  }

  /** @returns {boolean} */
  get offen() {
    return this.hasAttribute("offen");
  }

  /**
   * Zeigt die Karte. Löst auf, sobald sie wieder geschlossen ist (Zurück, Escape, Schleier oder schliesse()).
   * Ein zweites oeffne() ersetzt den Inhalt; das frühere Versprechen löst dann auf.
   * @param {{ titel?: string, text: string }} anregung titel: Name des Themas (leise unter der Überschrift);
   *   text: die Anregung (Elternsprache, wird nicht vorgelesen)
   * @returns {Promise<void>}
   */
  oeffne({ titel = "", text }) {
    this.#zu?.();
    this.themaFeld.textContent = titel;
    this.textFeld.textContent = text;
    if (!this.offen) {
      this.#vorher = fokussiert();
      this.stilleSeite(true);
    }
    this.setAttribute("offen", "");
    document.addEventListener("keydown", this.taste);
    // Fokus in die Karte (auf Zurück), damit Tastatur und Vorleser dort weitermachen.
    requestAnimationFrame(() => this.zurueck.shadowRoot?.querySelector("button")?.focus({ preventScroll: true }));
    return new Promise((ok) => { this.#zu = ok; });
  }

  /** Schließt die Karte (still, wenn sie schon zu ist) und beendet laufende Sprache. */
  schliesse() {
    if (!this.offen) return;
    this.removeAttribute("offen");
    document.removeEventListener("keydown", this.taste);
    stille();
    this.stilleSeite(false);
    const vorher = this.#vorher;
    this.#vorher = null;
    if (vorher?.isConnected) vorher.focus({ preventScroll: true });
    const zu = this.#zu;
    this.#zu = null;
    zu?.();
  }

  /**
   * Hintergrund inert (an) bzw. wieder frei (aus): alle Geschwister der Karte, auch die Kopfleiste.
   * @param {boolean} an
   */
  stilleSeite(an) {
    if (!an) {
      for (const el of this.#still) el.inert = false;
      this.#still = [];
      return;
    }
    const eltern = this.parentElement ?? document.body;
    for (const el of /** @type {HTMLElement[]} */ ([...eltern.children])) {
      if (el === this || el.inert || el.tagName === "SCRIPT") continue;
      el.inert = true;
      this.#still.push(el);
    }
  }

  /** @param {KeyboardEvent} e */
  taste(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      this.schliesse();
    }
  }

  disconnectedCallback() {
    document.removeEventListener("keydown", this.taste);
    this.stilleSeite(false);
  }
}

definiere("ls-anregung", LsAnregung);
