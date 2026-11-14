// <ls-pause spiel="vorlage"> … Pausenbild, Sachmoment … </ls-pause>
// Vollflächige Ebene über dem Spiel auf Nacht mit ruhigen Sternen in Sonne, verborgen bis zeige().
// Der Inhalt kommt per <slot> auf eine Papierkarte (ohne Inhalt keine Karte).
// Unten Mitte „Alle Spiele“ und „Weiter“: gleich groß, gleich gestaltet (Papier, Symbol und Wort), N6.
// Kein Timer, kein Ablauf.

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { schonGesagt, sageEinmal } from "../kern/sitzung.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import { findeSpiel } from "./knopf.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;
const HAUS_HREF = new URL("../index.html", import.meta.url).href;
/** Abstand der Knöpfe vom unteren Rand und ihre gemeinsame Breite, in rem. */
const UNTEN = 6;
const BREITE = 50;
const STERNE = `<path d="M180 114 Q187.28 132.72 206 140 Q187.28 147.28 180 166 Q172.72 147.28 154 140 Q172.72 132.72 180 114Z"/><path d="M420 236 Q423.92 246.08 434 250 Q423.92 253.92 420 264 Q416.08 253.92 406 250 Q416.08 246.08 420 236Z"/><path d="M760 92 Q765.04 104.96 778 110 Q765.04 115.04 760 128 Q754.96 115.04 742 110 Q754.96 104.96 760 92Z"/><path d="M1180 156 Q1183.92 166.08 1194 170 Q1183.92 173.92 1180 184 Q1176.08 173.92 1166 170 Q1176.08 166.08 1180 156Z"/><path d="M1510 66 Q1516.72 83.28 1534 90 Q1516.72 96.72 1510 114 Q1503.28 96.72 1486 90 Q1503.28 83.28 1510 66Z"/><path d="M1760 244 Q1764.48 255.52 1776 260 Q1764.48 264.48 1760 276 Q1755.52 264.48 1744 260 Q1755.52 255.52 1760 244Z"/><path d="M110 546 Q113.92 556.08 124 560 Q113.92 563.92 110 574 Q106.08 563.92 96 560 Q106.08 556.08 110 546Z"/><path d="M1820 620 Q1825.6 634.4 1840 640 Q1825.6 645.6 1820 660 Q1814.4 645.6 1800 640 Q1814.4 634.4 1820 620Z"/><path d="M300 844 Q304.48 855.52 316 860 Q304.48 864.48 300 876 Q295.52 864.48 284 860 Q295.52 855.52 300 844Z"/><path d="M1640 886 Q1643.92 896.08 1654 900 Q1643.92 903.92 1640 914 Q1636.08 903.92 1626 900 Q1636.08 896.08 1640 886Z"/>`;
const PUNKTE = `<circle cx="600" cy="330" r="5"/><circle cx="980" cy="80" r="5"/><circle cx="1360" cy="300" r="5"/><circle cx="1100" cy="960" r="5"/><circle cx="520" cy="1000" r="5"/><circle cx="1900" cy="420" r="5"/><circle cx="40" cy="330" r="5"/>`;

const PAUSE_CSS = `
:host {
  position: fixed;
  inset: 0;
  display: block;
  z-index: 100;
  background: var(--ls-nacht);
}
:host(:not([offen])) { display: none; }
.himmel { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.himmel .sterne { fill: var(--ls-sonne); }
.himmel .punkte { fill: var(--ls-papier); opacity: 0.7; }
.inhalt {
  position: absolute;
  top: 8rem;
  left: 0;
  right: 0;
  bottom: calc(${UNTEN + MASSE.pilleGross + 6}rem + env(safe-area-inset-bottom, 0rem));
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 ${MASSE.rand}rem;
}
.karte {
  box-sizing: border-box;
  max-width: min(150rem, 100%);
  max-height: 100%;
  overflow: hidden;
  padding: 4rem;
  border-radius: var(--ls-radius-gross);
  background: var(--ls-papier);
  color: var(--ls-tinte);
  line-height: 1.35;
}
.karte.leer { display: none; }
.aktionen {
  --ls-breite: ${BREITE}rem;
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(${UNTEN}rem + env(safe-area-inset-bottom, 0rem));
  display: flex;
  justify-content: center;
  gap: 8rem;
}
.aktionen:focus { outline: none; }
a.alle { --ls-knopf: ${MASSE.pilleGross}rem; }
`;

export class LsPause extends HTMLElement {
  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${PAUSE_CSS}</style>
      <svg class="himmel" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g class="sterne">${STERNE}</g><g class="punkte">${PUNKTE}</g>
      </svg>
      <div class="inhalt"><div class="karte leer"><slot></slot></div></div>
      <div class="aktionen" tabindex="-1">
        <a class="knopf alle" href="${HAUS_HREF}" tabindex="0" aria-label="Alle Spiele" draggable="false"><span class="form neben pille"><span class="zeichen"><img alt="" draggable="false" src="${SYMBOLE}haus.svg"></span><span class="wort">Alle Spiele</span></span></a>
        <ls-knopf class="weiter" symbol="zurueck.svg" name="Weiter" wort="Weiter" groesse="gross" gespiegelt></ls-knopf>
      </div>`;
    this.karte = /** @type {HTMLElement} */ (wurzel.querySelector(".karte"));
    const slot = /** @type {HTMLSlotElement} */ (wurzel.querySelector("slot"));
    // Die Papierkarte erscheint nur, wenn das Spiel Inhalt hineinlegt.
    slot.addEventListener("slotchange", () => {
      const hatInhalt = slot.assignedNodes().some((n) => n.nodeType === 1 || (n.textContent ?? "").trim() !== "");
      this.karte.classList.toggle("leer", !hatInhalt);
    });
    this.aktionen = /** @type {HTMLElement} */ (wurzel.querySelector(".aktionen"));
    this.alle = /** @type {HTMLAnchorElement} */ (wurzel.querySelector("a.alle"));
    this.weiter = /** @type {HTMLElement} */ (wurzel.querySelector("ls-knopf.weiter"));
    /** @type {Promise<"weiter"> | null} */
    this._offen = null;
    /** @type {((w: "weiter") => void) | null} */
    this._loese = null;
    this.alle.addEventListener("click", () => this.sagAlle());
    this.weiter.addEventListener("click", () => this.beendeWeiter());
  }

  connectedCallback() {
    this.gebeSpielWeiter();
  }

  static observedAttributes = ["spiel"];

  attributeChangedCallback() {
    this.gebeSpielWeiter();
  }

  gebeSpielWeiter() {
    const spiel = this.getAttribute("spiel");
    if (spiel) this.weiter.setAttribute("spiel", spiel);
    else this.weiter.removeAttribute("spiel");
  }

  /**
   * Macht die Ebene sichtbar; löst beim Tippen auf Weiter genau einmal auf. Während sie offen ist,
   * liefert jeder weitere Aufruf dasselbe Versprechen.
   * @returns {Promise<"weiter">}
   */
  zeige() {
    if (this._offen) return this._offen;
    this._offen = new Promise((ok) => { this._loese = ok; });
    this.setAttribute("offen", "");
    // Fokus auf die Knopfgruppe, nicht auf Weiter: keiner der beiden Wege wird hervorgehoben (N6).
    this.aktionen.focus({ preventScroll: true });
    return this._offen;
  }

  beendeWeiter() {
    const loese = this._loese;
    if (!loese) return;
    this._loese = null;
    this._offen = null;
    this.removeAttribute("offen");
    loese("weiter");
  }

  // Der Link navigiert sofort (linkKlick speichert vorher); der Name wird nur beim ersten Tippen und bei Ton an
  // gesprochen (sageEinmal: bricht Inhalt ihn ab, kommt er beim nächsten Tippen).
  async sagAlle() {
    const name = "Alle Spiele";
    if (schonGesagt(name)) return;
    try {
      await ladeEinstellungen();
    } catch {
      // Einstellungen nicht ladbar: Ton gilt als an.
    }
    const spiel = findeSpiel(this);
    if (spiel && einstellung(`ton.${spiel}`, true) === false) return;
    sageEinmal(name, sprich); // gilt als gesagt, sobald er beginnt; nur ein Abbruch durch Inhalt nimmt das zurück
  }
}

definiere("ls-pause", LsPause);
