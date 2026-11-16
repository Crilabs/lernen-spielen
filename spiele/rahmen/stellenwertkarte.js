// <ls-stellenwertkarte zahl="10" stelle="z" umriss hohl>
// Stellenwertkarte als Lernzeichen (Montessori, M08 Stellentafel; Farbwelt 6.2, M5): eine Karte trägt eine Zahl mit
// Nullen („4“, „10“, „300“) und ist so lang wie ihre Stellen: jede Ziffer hat ein Feld gleicher Breite. Legt man die
// Einerkarte „4“ rechtsbündig auf die Zehnerkarte „10“, deckt sie genau die Null – es steht „14“. Das Zeichen
// trägt diese Länge; das Spiel schiebt die Karten (transform) und legt sie rechtsbündig übereinander.
//
// - `zahl`: die Karte, nur Ziffern (1 bis 4 Stellen), z. B. „40“ für vier Zehner.
// - `stelle`: z = Zehner (orange), e = Einer (türkis), h = Hunderter (schiefergrau). Der Rahmen hat die
//   Stellenwertfarbe, die Ziffer steht in Tinte (Orange nie als Schrift, M5); die Farbe steht nie allein:
//   Länge der Karte und die Ziffer tragen (C1).
// - `umriss`: nur der Rahmen in der Stellenwertfarbe, ohne Ziffer (Stufe Vorstellung: das Kind schreibt sie selbst).
// - `hohl`: gestrichelter Rahmen ohne Füllung, durchscheinend – die Karte der getippten Zahl, die nicht passt.
// - Ungültige `zahl` oder `stelle`: es wird nichts gezeichnet und einmal je Element ins Protokoll geschrieben.
//
// Größe bestimmt das Spiel am Host mit der Variable `--karte-hoehe` (Vorgabe 12 rem); die Breite ergibt sich aus der
// Zahl der Stellen. Flach und still (B3, keine Bewegung im Element); der Name („Karte 10“) steht als aria-label.

import { protokoll } from "../kern/protokoll.js";
import { TOKENS, LERNFARBE, definiere } from "./stil.js";

const TOKEN_CSS = Object.entries(TOKENS)
  .map(([name, wert]) => `${name}: ${wert};`)
  .join(" ");

/** Breite eines Ziffernfelds im Verhältnis zur Kartenhöhe. */
export const ZELLE = 0.62;

const CSS = `
:host { ${TOKEN_CSS} display: inline-block; vertical-align: middle; line-height: 0; --h: var(--karte-hoehe, 12rem); }
:host([hidden]) { display: none; }
.karte {
  box-sizing: border-box; display: inline-flex; align-items: center; height: var(--h); padding: 0 calc(var(--h) * 0.06);
  border: calc(var(--h) * 0.06) solid var(--farbe); border-radius: calc(var(--h) * 0.14);
  background: var(--ls-papier); box-shadow: 0 0 0 var(--ls-kontur) var(--ls-tinte);
  font: 700 calc(var(--h) * 0.62) / 1 "Andika", sans-serif; color: var(--ls-tinte);
}
.karte.leer { display: none; }
.karte.hohl { border-style: dashed; background: transparent; box-shadow: none; opacity: 0.75; }
.zelle { display: block; width: calc(var(--h) * ${ZELLE}); text-align: center; padding-bottom: calc(var(--h) * 0.05); }
.karte.umriss .zelle { visibility: hidden; }
`;

/** Gültige Zahl der Karte (1 bis 4 Ziffern) oder null. @param {string | null} roh @returns {string | null} */
export const zahlAus = (roh) => (roh !== null && /^\d{1,4}$/.test(roh.trim()) ? roh.trim() : null);

export class LsStellenwertkarte extends HTMLElement {
  static observedAttributes = ["zahl", "stelle", "umriss", "hohl"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${CSS}</style><div class="karte leer"></div>`;
    this.karte = /** @type {HTMLElement} */ (wurzel.querySelector(".karte"));
    /** Schon ins Protokoll geschrieben (einmal je Element). */
    this.gemeldet = false;
    this.zeichne();
  }

  attributeChangedCallback() {
    this.zeichne();
  }

  /** @param {string} grund */
  melde(grund) {
    if (this.gemeldet) return;
    this.gemeldet = true;
    protokoll(`ls-stellenwertkarte: ${grund}`);
  }

  zeichne() {
    const zahl = zahlAus(this.getAttribute("zahl"));
    const stelle = this.getAttribute("stelle");
    const farbe = stelle && stelle in LERNFARBE.stelle ? LERNFARBE.stelle[/** @type {"e" | "z" | "h"} */ (stelle)] : null;
    const k = this.karte;
    if (!zahl || !farbe) {
      // Erst nach dem Aufbau melden: setAttribute("zahl") kommt vor setAttribute("stelle"), das ist noch kein Fehler.
      if (this.hasAttribute("zahl") || this.hasAttribute("stelle")) {
        queueMicrotask(() => {
          const z = zahlAus(this.getAttribute("zahl"));
          const st = this.getAttribute("stelle");
          if (!z || !(st && st in LERNFARBE.stelle)) this.melde(!z ? `ungültige Zahl ${this.getAttribute("zahl")}` : `ungültige Stelle ${st}`);
        });
      }
      k.className = "karte leer";
      k.innerHTML = "";
      k.removeAttribute("role");
      k.removeAttribute("aria-label");
      return;
    }
    k.className = `karte${this.hasAttribute("umriss") ? " umriss" : ""}${this.hasAttribute("hohl") ? " hohl" : ""}`;
    k.style.setProperty("--farbe", farbe);
    k.innerHTML = [...zahl].map((z) => `<span class="zelle">${z}</span>`).join("");
    k.setAttribute("role", "img");
    k.setAttribute("aria-label", this.hasAttribute("umriss") ? "Karte" : `Karte ${zahl}`);
  }
}

definiere("ls-stellenwertkarte", LsStellenwertkarte);
