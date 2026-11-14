// <ls-echte-dinge-kachel thema="zerlegen-7" fach="mathe" titel="Die 7 zerlegen" text="…Einzeiler…">
// Kachel „Mit echten Dingen“ (docs/mit-echten-dingen.md „Wo es zu sehen ist“): das analoge Spiel eines Themas,
// gleichwertig neben den digitalen Spielen und genau so groß wie eine Spiel-Kachel der Fach-Seite (mindestens
// 40 × 16 rem, Symbolfeld 12 rem in der Füllung des Fachs, Papier, Tinte-Kontur, Schatten: drückbar).
// Symbol: die Hand. Groß der Name der Form (die zuletzt gewählte Situation, sonst die erste), darunter leiser
// „Mit echten Dingen“. Ohne Anleitung steht „Mit echten Dingen“ allein (dann öffnet sie den Einzeiler aus `text`);
// ohne Anleitung und ohne text ist die Kachel verborgen.
// Antippen öffnet die Karte (<ls-anregung>) mit dieser Form; gibt es auf der Seite keine Karte, legt die Kachel
// eine an. Analoges Spielen zählt nicht für den Lernstand: die Kachel schreibt nichts.
// Attribute: thema, fach (Pflicht), titel (Name des Themas, auf der Karte), text; Ereignis `bereit` nach dem Laden.

import { GRUND_CSS, FACH, definiere } from "./stil.js";
import { ladeVerzeichnis, letzteForm, waehleForm } from "./echte-dinge.js";
import { SITUATIONEN } from "./markdown.js";
import { ANREGUNG_TITEL } from "./anregung.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;

const KACHEL_CSS = `
:host { display: inline-block; vertical-align: top; }
.kachel {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 2.4rem;
  min-height: 16rem;
  min-width: 40rem;
  padding: 2rem 4rem 2rem 2rem;
  margin: 0;
  background: var(--ls-papier);
  border: var(--ls-kontur) solid var(--ls-tinte);
  border-radius: var(--ls-radius);
  box-shadow: var(--ls-schatten);
  color: var(--ls-tinte);
  font: inherit;
  text-align: left;
  cursor: pointer;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}
.kachel:active { transform: translateY(var(--ls-kontur)); box-shadow: var(--ls-schatten-unten); }
.kachel:focus-visible { outline: 0.5rem solid var(--ls-tinte); outline-offset: 0.8rem; }
.ico {
  flex: none;
  box-sizing: border-box;
  width: 12rem;
  height: 12rem;
  padding: 1.8rem;
  border: var(--ls-kontur) solid var(--ls-tinte);
  border-radius: var(--ls-radius-klein);
  background: var(--fach-fuellung, var(--ls-nebel));
}
.ico img { display: block; width: 100%; height: 100%; pointer-events: none; }
.worte { display: flex; flex-direction: column; gap: 0.8rem; min-width: 0; }
b { font-size: 4rem; line-height: 1.15; font-weight: 700; }
.leise { font-size: 3rem; line-height: 1.2; color: var(--ls-tinte-weich); }
.leise:empty { display: none; }
`;

export class LsEchteDingeKachel extends HTMLElement {
  static observedAttributes = ["thema", "fach"];
  #lauf = 0;
  /** Situation der gezeigten Form ("" ohne Anleitung). */
  situation = "";

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${KACHEL_CSS}</style>
      <button class="kachel" type="button" tabindex="0"><span class="ico"><img alt="" draggable="false" src="${SYMBOLE}hand.svg"></span>
        <span class="worte"><b></b><span class="leise"></span></span></button>`;
    this.knopf = /** @type {HTMLButtonElement} */ (wurzel.querySelector("button"));
    this.nameFeld = /** @type {HTMLElement} */ (wurzel.querySelector("b"));
    this.leiseFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".leise"));
    this.addEventListener("click", () => this.oeffneKarte()); // am Host: auch ein ausgelöstes click() am Element öffnet
    /** Versprechen: Name der Form steht. */
    this.geladen = Promise.resolve();
  }

  connectedCallback() {
    this.geladen = this.zeichne();
  }

  attributeChangedCallback() {
    if (this.isConnected) this.geladen = this.zeichne();
  }

  async zeichne() {
    const lauf = ++this.#lauf;
    const thema = this.getAttribute("thema") ?? "", fach = this.getAttribute("fach") ?? "";
    const farbe = Object.hasOwn(FACH, fach) ? FACH[fach].fuellung : "";
    if (farbe) this.style.setProperty("--fach-fuellung", farbe);
    else this.style.removeProperty("--fach-fuellung");
    const [{ themen }, letzte] = await Promise.all([ladeVerzeichnis(), letzteForm()]);
    if (lauf !== this.#lauf) return;
    const e = Object.hasOwn(themen, thema) && themen[thema].fach === fach ? themen[thema] : null;
    const formen = (e?.formen ?? []).filter((f) => SITUATIONEN.some((s) => s.id === f.situation));
    const form = waehleForm(formen, letzte);
    this.situation = form?.situation ?? "";
    this.nameFeld.textContent = form?.name ?? ANREGUNG_TITEL;
    this.leiseFeld.textContent = form ? ANREGUNG_TITEL : "";
    this.knopf.setAttribute("aria-label", form ? `${form.name}, ${ANREGUNG_TITEL}` : ANREGUNG_TITEL);
    this.hidden = !form && !this.getAttribute("text");
    this.dispatchEvent(new CustomEvent("bereit"));
  }

  /** Öffnet die Karte zum Thema mit der gezeigten Form. */
  oeffneKarte() {
    /** @type {any} */
    let karte = document.querySelector("ls-anregung");
    if (!karte) {
      karte = document.createElement("ls-anregung");
      document.body.append(karte);
    }
    karte.oeffne({
      titel: this.getAttribute("titel") ?? "", text: this.getAttribute("text") ?? "",
      thema: this.getAttribute("thema") ?? "", fach: this.getAttribute("fach") ?? "", form: this.situation,
    });
  }
}

definiere("ls-echte-dinge-kachel", LsEchteDingeKachel);
