// <ls-erinnern> – Erinnerungsfrage eines Sachbuch-Kapitels (docs/geschichten.md §2b, Christian 2026-11-16).
// Frage, drei Antworten; nach dem Tipp leuchtet die passende Antwort auf und die Auflösung erscheint. Bewertet nicht:
// kein „richtig“/„falsch“, die gewählte Antwort bekommt nur einen Rand, jede Wahl führt zur selben ruhigen Auflösung (N7).
// Vorgelesen wird alles (bei ton): Frage, jede Antwort, die gewählte Antwort, die Auflösung.
// Während eine Antwort vorgelesen wird, trägt sie den Sonnenring (Klasse `liest`). Wählen geht erst, wenn alle Antworten
// vorgelesen sind (Christian, 2026-11-17); bricht etwas das Vorlesen ab, ist die Wahl sofort frei.
//
// Benutzung: el.zeige({ frage, antworten, richtig, aufloesung }, { ton, bild?, nachlesen? })
//   bild: Adresse eines Fotos über der Frage (Bibliothek); im Buch steht das Foto in der Bildhälfte.
//   nachlesen: Knopf „Nachlesen“ nach der Wahl → Ereignis `nachlesen`.
//   knapp (Pause am Rundenende): nach der Wahl bleiben nur die gewählte und die passende Antwort stehen, damit die
//   Auflösung Platz hat; die Auflösung wird ins Bild gerollt, falls die Karte doch zu klein ist.
// Ereignis `gewaehlt` (detail { index }) gleich nach dem Tipp; Eigenschaft `gewaehlt` (Index oder -1);
// `gesperrt` (true, solange die Antworten vorgelesen werden) und Versprechen `frei` (löst auf, sobald gewählt werden kann).

import { sprich } from "../kern/stimme.js";
import { GRUND_CSS, definiere } from "./stil.js";
import "./knopf.js";

const CSS = `
:host { display: block; }
.bild { width: 100%; aspect-ratio: 2 / 1; border-radius: var(--ls-radius-teil); overflow: hidden; margin-bottom: 3.2rem; background: var(--ls-nebel); }
.bild[hidden] { display: none; }
.bild img { width: 100%; height: 100%; object-fit: cover; display: block; }
.frage { margin: 0 0 3.2rem; font: 650 4.4rem/1.3 "Andika", sans-serif; color: var(--ls-tinte); text-wrap: pretty; }
.antworten { list-style: none; margin: 0; padding: 0; display: grid; gap: 1.8rem; }
.antwort {
  width: 100%; min-height: 9.6rem; padding: 1.8rem 3.2rem; text-align: left; cursor: pointer;
  font: 500 3.6rem/1.3 "Andika", sans-serif; color: var(--ls-tinte);
  background: var(--ls-knopf); border: 0.5rem solid var(--ls-kante); border-radius: var(--ls-radius);
  box-shadow: var(--ls-neben-schatten); transition: background-color .2s, border-color .2s, opacity .2s;
  -webkit-tap-highlight-color: transparent;
}
.antwort:focus-visible { outline: 0.6rem solid var(--ls-beere); outline-offset: 0.4rem; }
/* Gerade vorgelesen: Sonnenring wie das Aufleuchten in ls-hilfe – ein Ring, nie eine Fläche (die Fläche heißt „passt“). */
.antwort.liest { outline: 0.8rem solid var(--ls-sonne); outline-offset: 0.4rem; }
:host(.gesperrt) .antwort { cursor: default; }
:host(.entschieden) .antwort { cursor: default; box-shadow: none; }
:host(.entschieden) .antwort:not(.passt):not(.gewaehlt) { opacity: .55; }
:host(.knapp.entschieden) li:has(.antwort:not(.passt):not(.gewaehlt)) { display: none; }
.antwort.gewaehlt { border-color: var(--ls-tinte-weich); }
.antwort.passt { background: var(--ls-sonne); border-color: var(--ls-sonne); }
.aufloesung { margin: 3.2rem 0 0; font: 400 3.8rem/1.45 "Andika", sans-serif; color: var(--ls-tinte); max-width: 36ch; }
.aufloesung[hidden], .nachlesen[hidden] { display: none; }
.nachlesen { margin-top: 2.4rem; }
/* Mit Foto im Querformat (Bibliothek): Foto links quadratisch, Frage und Antworten rechts – alles ohne Rollen. */
@media (min-aspect-ratio: 4/3) {
  :host(.mit-bild) { display: grid; grid-template-columns: minmax(0, 4fr) minmax(0, 6fr); gap: 4.8rem; align-items: start; }
  :host(.mit-bild) .bild { aspect-ratio: 1; margin: 0; }
}
@media (prefers-reduced-motion: reduce) { .antwort { transition: none; } }
`;

export class LsErinnern extends HTMLElement {
  constructor() {
    super();
    const w = this.attachShadow({ mode: "open" });
    w.innerHTML = `<style>${GRUND_CSS}${CSS}</style>
      <div class="bild" hidden><img alt=""></div>
      <div class="rest"><p class="frage"></p>
      <ol class="antworten" aria-label="Antworten"></ol>
      <p class="aufloesung" aria-live="polite" hidden></p>
      <ls-knopf class="nachlesen" symbol="buch.svg" wort="Nachlesen" stumm hidden></ls-knopf><slot></slot></div>`;
    /** @param {string} s */
    const q = (s) => /** @type {HTMLElement} */ (w.querySelector(s));
    this.bildEl = q(".bild");
    this.frageEl = q(".frage");
    this.listeEl = q(".antworten");
    this.aufloesungEl = q(".aufloesung");
    this.nachlesenEl = q(".nachlesen");
    this.nachlesenEl.addEventListener("click", () => this.dispatchEvent(new CustomEvent("nachlesen", { bubbles: true, composed: true })));
    this.gewaehlt = -1;
    /** @type {{ frage: string, antworten: string[], richtig: number, aufloesung: string } | null} */
    this.daten = null;
    this.ton = true;
    this.mitNachlesen = false;
    this.gesperrt = false;
    /** @type {Promise<void>} */
    this.frei = Promise.resolve();
    this.runde = 0;
  }

  /**
   * @param {{ frage: string, antworten: string[], richtig: number, aufloesung: string }} e
   * @param {{ ton?: boolean, bild?: string, nachlesen?: boolean, knapp?: boolean }} [o]
   */
  zeige(e, { ton = true, bild = "", nachlesen = false, knapp = false } = {}) {
    this.daten = e;
    this.ton = ton;
    this.mitNachlesen = nachlesen;
    this.gewaehlt = -1;
    this.classList.remove("entschieden");
    this.classList.toggle("knapp", knapp);
    this.bildEl.hidden = !bild;
    this.classList.toggle("mit-bild", !!bild);
    if (bild) /** @type {HTMLImageElement} */ (this.bildEl.firstElementChild).src = bild;
    this.frageEl.textContent = e.frage;
    this.aufloesungEl.hidden = true;
    this.aufloesungEl.textContent = e.aufloesung;
    this.nachlesenEl.hidden = true;
    this.listeEl.replaceChildren(...e.antworten.map((a, i) => {
      const li = document.createElement("li");
      const b = document.createElement("button");
      b.type = "button";
      b.className = "antwort";
      b.textContent = a;
      b.addEventListener("click", () => this.waehle(i));
      li.appendChild(b);
      return li;
    }));
    const runde = ++this.runde;
    const knoepfe = [...this.listeEl.querySelectorAll(".antwort")];
    this.setzeGesperrt(ton);
    if (!ton) {
      this.frei = Promise.resolve();
      return;
    }
    sprich(e.frage);
    const vorgelesen = e.antworten.map((a, i) => sprich(a, {
      beginn: () => {
        if (runde !== this.runde) return;
        knoepfe.forEach((b, k) => b.classList.toggle("liest", k === i));
      },
    }).finally(() => {
      if (runde === this.runde) knoepfe[i].classList.remove("liest");
    }));
    this.frei = Promise.allSettled(vorgelesen).then(() => {
      if (runde === this.runde) this.setzeGesperrt(false);
    });
  }

  /** @param {boolean} an */
  setzeGesperrt(an) {
    this.gesperrt = an;
    this.classList.toggle("gesperrt", an);
    for (const b of this.listeEl.querySelectorAll(".antwort")) {
      if (an) b.setAttribute("aria-disabled", "true");
      else if (this.gewaehlt < 0) b.removeAttribute("aria-disabled");
    }
  }

  /** @param {number} i */
  waehle(i) {
    const e = this.daten;
    if (!e || this.gesperrt || this.gewaehlt >= 0 || i < 0 || i >= e.antworten.length) return;
    this.gewaehlt = i;
    this.classList.add("entschieden");
    [...this.listeEl.querySelectorAll(".antwort")].forEach((b, k) => {
      b.classList.toggle("gewaehlt", k === i);
      b.classList.toggle("passt", k === e.richtig);
      b.classList.remove("liest");
      b.setAttribute("aria-disabled", "true");
    });
    this.aufloesungEl.hidden = false;
    this.nachlesenEl.hidden = !this.mitNachlesen;
    if (this.classList.contains("knapp")) this.aufloesungEl.scrollIntoView({ block: "nearest", behavior: "smooth" });
    if (this.ton) {
      sprich(e.antworten[i]);
      sprich(e.aufloesung);
    }
    this.dispatchEvent(new CustomEvent("gewaehlt", { bubbles: true, composed: true, detail: { index: i } }));
  }
}

definiere("ls-erinnern", LsErinnern);
