// <ls-leiste spiel="perlenbruecke" fach="mathe" titel="Perlenbrücke" thema="Die 7 zerlegen">
// Kopfleiste (Rahmen-Schicht): ein Band in der Fach-Tönung oben über das sichere Feld (192 × 108 rem, mittig).
// Links Haus (Alle Spiele, Nebenknopf), daneben das Fachsymbol als flache Kachel (nur Anzeige), dann der
// Spielname in Fach-Tief und darunter leiser das Thema; rechts Ton an/aus (Nebenknopf).
// Ohne bekanntes Fach: Band in Nebel, keine Kachel, Name in Tinte. `thema` darf sich zur Laufzeit ändern.
// Setzt --ls-leiste-hoehe am <html>: dort beginnt die freie Fläche des Spiels (top: var(--ls-leiste-hoehe)).

import { ladeEinstellungen, einstellung, setzeEinstellung } from "../kern/einstellungen.js";
import { sprich, stille } from "../kern/stimme.js";
import { schonGesagt, merkeGesagt } from "../kern/sitzung.js";
import { protokoll } from "../kern/protokoll.js";
import { FACH, GRUND_CSS, LEISTE_HOEHE, MASSE, bild, definiere } from "./stil.js";
import "./knopf.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;
const HAUS_HREF = new URL("../index.html", import.meta.url).href;
const HAUS_NAME = "Alle Spiele";
/** Fächer mit eigenem Symbol in spiele/symbole/ (Sprechen hat noch keins). */
const FACH_SYMBOLE = new Set(["mathe", "lesen", "schreiben", "grammatik", "geometrie"]);

const FACH_CSS = Object.entries(FACH)
  .map(([fach, f]) => `:host([fach="${fach}"]) { --fach-fuellung: ${f.fuellung}; --fach-tief: ${f.tief}; --fach-toenung: ${f.toenung}; }`)
  .join("\n");

const LEISTE_CSS = `
:host {
  --fach-fuellung: var(--ls-papier);
  --fach-tief: var(--ls-tinte);
  --fach-toenung: var(--ls-nebel);
  position: fixed;
  top: 0;
  bottom: 0;
  left: max(0rem, calc((100vw - 192rem) / 2));
  width: min(100vw, 192rem);
  display: block;
  pointer-events: none;
  z-index: 50;
}
${FACH_CSS}
.band {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  box-sizing: border-box;
  height: ${LEISTE_HOEHE};
  padding: calc(${MASSE.rand}rem + env(safe-area-inset-top, 0rem))
    calc(${MASSE.rand}rem + env(safe-area-inset-right, 0rem)) ${MASSE.rand}rem
    calc(${MASSE.rand}rem + env(safe-area-inset-left, 0rem));
  display: flex;
  align-items: center;
  gap: ${MASSE.rand}rem;
  background: var(--fach-toenung);
  pointer-events: auto;
}
.fach {
  flex: none;
  box-sizing: border-box;
  width: ${MASSE.fach}rem;
  height: ${MASSE.fach}rem;
  padding: 1.5rem;
  border: var(--ls-kontur) solid var(--ls-tinte);
  border-radius: var(--ls-radius);
  background: var(--fach-fuellung);
  display: block;
}
.fach[hidden] { display: none; }
.fach i {
  display: block;
  width: 100%;
  height: 100%;
  background: var(--ls-tinte);
  -webkit-mask: var(--bild) center / contain no-repeat;
  mask: var(--bild) center / contain no-repeat;
}
.titel {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.2rem;
}
.name, .thema {
  margin: 0;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.name { font-size: 5.2rem; line-height: 1.2; font-weight: 700; color: var(--fach-tief); }
.thema { font-size: 3.4rem; line-height: 1.3; font-weight: 400; color: var(--ls-tinte-weich); }
.name[hidden], .thema[hidden] { display: none; }
.ton { margin-left: auto; flex: none; }
`;

export class LsLeiste extends HTMLElement {
  static observedAttributes = ["spiel", "fach", "titel", "thema"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${LEISTE_CSS}</style>
      <div class="band">
        <a class="knopf haus" href="${HAUS_HREF}" aria-label="${HAUS_NAME}" draggable="false"><span class="form neben rund"><span class="zeichen"><img alt="" draggable="false" src="${SYMBOLE}haus.svg"></span></span></a>
        <span class="fach" hidden><i></i></span>
        <div class="titel"><p class="name" hidden></p><p class="thema" hidden></p></div>
        <ls-knopf class="ton tonknopf" stumm></ls-knopf>
      </div>`;
    this.haus = /** @type {HTMLAnchorElement} */ (wurzel.querySelector("a.haus"));
    this.fachKachel = /** @type {HTMLElement} */ (wurzel.querySelector(".fach"));
    this.fachZeichen = /** @type {HTMLElement} */ (wurzel.querySelector(".fach i"));
    this.nameFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".name"));
    this.themaFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".thema"));
    this.tonKnopf = /** @type {HTMLElement} */ (wurzel.querySelector(".tonknopf"));
    this._ton = true;
    this._start = false;
    this._bereit = false;
    /** @type {Promise<void>} */
    this.bereitet = new Promise((ok) => { this._ok = ok; });
    this.haus.addEventListener("click", () => this.sagHaus());
    this.tonKnopf.addEventListener("click", () => this.schalteTon());
  }

  connectedCallback() {
    // Freie Fläche für das Spiel beginnt unter der Kopfleiste (MASSE.leiste plus Aussparung oben).
    document.documentElement.style.setProperty("--ls-leiste-hoehe", LEISTE_HOEHE);
    this.zeichne();
    if (!this._start) {
      this._start = true;
      this.lade();
    }
  }

  disconnectedCallback() {
    document.documentElement.style.removeProperty("--ls-leiste-hoehe");
  }

  /** @param {string} name */
  attributeChangedCallback(name) {
    if (name === "spiel" && this._start) this.leseTon();
    else this.zeichne();
  }

  /** @returns {boolean} */
  get ton() {
    return this._ton;
  }

  /** @param {boolean} an */
  set ton(an) {
    this.setze(Boolean(an), true);
  }

  /** @returns {boolean} true, sobald die Einstellungen geladen sind (für späte Zuhörer des Ereignisses bereit) */
  get istBereit() {
    return this._bereit;
  }

  /** @returns {Promise<void>} */
  bereit() {
    return this.bereitet;
  }

  async lade() {
    try {
      await ladeEinstellungen();
    } catch (e) {
      protokoll("Leiste: Einstellungen nicht geladen: " + e);
    }
    this.leseTon();
    this._bereit = true;
    this._ok();
    this.dispatchEvent(new CustomEvent("bereit"));
  }

  leseTon() {
    const spiel = this.getAttribute("spiel");
    this._ton = spiel ? einstellung(`ton.${spiel}`, true) !== false : true;
    this.zeichne();
  }

  /**
   * @param {boolean} an
   * @param {boolean} speichern
   */
  setze(an, speichern) {
    this._ton = an;
    const spiel = this.getAttribute("spiel");
    if (speichern && spiel) setzeEinstellung(`ton.${spiel}`, an);
    if (!an) stille();
    this.zeichne();
    this.dispatchEvent(new CustomEvent("ton", { detail: { an } }));
  }

  schalteTon() {
    this.setze(!this._ton, true);
    // Der Knopf selbst bleibt stumm (stumm): sonst spräche er den alten Namen. Hier der neue Zustand.
    const name = this._ton ? "Ton an" : "";
    if (name && !schonGesagt(name)) {
      merkeGesagt(name);
      sprich(name);
    }
  }

  zeichne() {
    const spiel = this.getAttribute("spiel");
    const fach = (this.getAttribute("fach") ?? "").replace(/[^a-z]/g, "");
    if (FACH_SYMBOLE.has(fach)) {
      this.fachZeichen.style.setProperty("--bild", bild(SYMBOLE + fach + ".svg"));
      this.fachKachel.hidden = false;
    } else {
      this.fachZeichen.style.removeProperty("--bild");
      this.fachKachel.hidden = true;
    }
    const titel = this.getAttribute("titel") ?? "";
    const thema = this.getAttribute("thema") ?? "";
    this.nameFeld.textContent = titel;
    this.nameFeld.hidden = !titel;
    this.themaFeld.textContent = thema;
    this.themaFeld.hidden = !thema;
    if (spiel) this.tonKnopf.setAttribute("spiel", spiel);
    this.tonKnopf.setAttribute("symbol", this._ton ? "ton-an.svg" : "ton-aus.svg");
    this.tonKnopf.setAttribute("name", this._ton ? "Ton an" : "Ton aus");
  }

  // Name beim ersten Tippen: nie die Navigation aufhalten, die Sprache darf abgeschnitten werden.
  sagHaus() {
    if (!this._ton || schonGesagt(HAUS_NAME)) return;
    merkeGesagt(HAUS_NAME);
    sprich(HAUS_NAME);
  }
}

definiere("ls-leiste", LsLeiste);
