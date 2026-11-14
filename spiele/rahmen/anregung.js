// <ls-anregung></ls-anregung>   →   await anregung.oeffne({ titel, text, thema, fach, form })
// Karte „Mit echten Dingen“ (docs/mit-echten-dingen.md): ein kurzes Spiel mit Dingen aus dem Alltag, das Kind und
// Erwachsene zusammen spielen. Ohne PIN. Fach-Seite, Regal, Kachel und Pause nutzen sie.
//
// Gibt es zum Thema eine Anleitung (spiele/mit-echten-dingen/<fach>/<thema>.md, siehe echte-dinge.js), zeigt die Karte
// ihre Formen (Am Tisch / In Bewegung / Unterwegs) als kleine Wahl mit Symbol und Wort, darunter die gewählte Form:
// links „Ihr braucht“ und die Schritte, rechts „Darauf kommt es an“ und Leichter/Schwerer. Die letzte Wahl gilt beim
// nächsten Öffnen als Voreinstellung (Einstellung `echte-dinge.form`). Ohne Anleitung bleibt der Einzeiler aus dem
// Lernplan (`text`, Elternsprache). Der Kopf mit den Quellen wird nie gezeigt. Nichts wird vorgelesen (kein
// Noch-mal-hören), und nichts hier zählt für den Lernstand.
//
// Liegt über der ganzen Seite, auch über der Kopfleiste: ein ruhiger Schleier in Nebel, darauf eine flache Karte aus
// Papier mit Tinte-Kontur (keine Nacht: das ist keine Pause). Oben links Zurück (schließt), daneben die Überschrift
// „Mit echten Dingen“ und leiser der Name des Themas.
// Schließen: Zurück, Escape oder Tippen auf den Schleier. Schließen beendet laufende Sprache (z. B. den Namen des
// Zurück-Knopfs). Solange die Karte offen ist, sind ihre Geschwister `inert`; danach kehrt der Fokus zurück.
// Keine Attribute im Konstruktor.

import { stille } from "../kern/stimme.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import { blockHtml, escape } from "./markdown.js";
import { findeAnleitung, ladeAnleitung, letzteForm, merkeForm, waehleForm } from "./echte-dinge.js";
import "./knopf.js";

/** Überschrift der Karte, zugleich der Name des Knopfs, der sie öffnet. */
export const ANREGUNG_TITEL = "Mit echten Dingen";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;

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
  width: min(140rem, calc(100vw - ${2 * MASSE.rand}rem));
  max-height: calc(100dvh - ${2 * MASSE.rand}rem);
  overflow: auto;
  padding: 3.6rem 4.4rem 4.4rem;
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
.rumpf { padding: 0 0 0 calc(${MASSE.bedien}rem + ${MASSE.rand}rem); }
.rumpf[aria-busy="true"] { visibility: hidden; }
.text {
  margin: 4rem 0 0;
  max-width: 62ch;
  font-size: 4.4rem;
  line-height: 1.45;
  text-wrap: pretty;
  -webkit-user-select: text;
  user-select: text;
}
.text[hidden], .anleitung[hidden], .reiter[hidden] { display: none; }

/* Wahl der Form: Reiter mit Symbol und Wort, Nebenknöpfe aus Papier; die gewählte Form trägt den Sonnenring
   (Auswahl, bedienung.md §6), nie eine Füllung. */
.reiter {
  --ls-knopf: ${MASSE.pille}rem;
  display: flex;
  flex-wrap: wrap;
  gap: 2.4rem 3.2rem;
  margin: 3.2rem 0 0;
}
.reiter .form { min-width: 0; font-size: 3.4rem; padding: 0 3.6rem 0 2.6rem; }
.reiter [aria-selected="true"] .form::after { opacity: 1; }

.anleitung {
  margin: 3.6rem 0 0;
  -webkit-user-select: text;
  user-select: text;
}
.anleitung h3 {
  margin: 0;
  font-size: 4.4rem;
  line-height: 1.2;
  font-weight: 700;
}
.spalten {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 44rem;
  gap: 5.6rem;
  margin-top: 2.4rem;
  font-size: 3.4rem;
  line-height: 1.42;
}
.spalten p { margin: 0 0 2rem; text-wrap: pretty; }
.spalten b { font-weight: 700; }
/* Schritte: wirklich eine Reihenfolge, deshalb Zahlen; flache Kreise in Tinte weich, kein Schatten. */
ol { margin: 0; padding: 0; list-style: none; counter-reset: schritt; }
ol li {
  position: relative;
  counter-increment: schritt;
  padding: 0 0 0 7rem;
  margin: 0 0 1.6rem;
  min-height: 5rem;
  text-wrap: pretty;
}
ol li::before {
  content: counter(schritt);
  position: absolute;
  left: 0;
  top: -0.1rem;
  width: 5rem;
  height: 5rem;
  box-sizing: border-box;
  display: grid;
  place-items: center;
  border: var(--ls-kontur) solid var(--ls-tinte-weich);
  border-radius: 50%;
  font-size: 2.8rem;
  font-weight: 700;
  line-height: 1;
  color: var(--ls-tinte-weich);
}
ul { margin: 0 0 2rem; padding-left: 3rem; }
/* Rechts: der Kern auf Nebel (flach), darunter Leichter und Schwerer leiser. */
.kern {
  padding: 2.6rem 3rem;
  border-radius: var(--ls-radius);
  background: var(--ls-nebel);
}
.kern b { display: block; margin-bottom: 0.6rem; }
.stufen { color: var(--ls-tinte-weich); font-size: 3rem; }
.stufen b { color: var(--ls-tinte); }
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

/**
 * HTML einer Form in zwei Spalten: links „Ihr braucht“ und die Schritte, rechts „Darauf kommt es an“ und
 * Leichter/Schwerer. Aller Text ist escaped (markdown.js).
 * @param {import("./markdown.js").Form} form
 * @returns {string}
 */
export function formHtml(form) {
  /** @type {import("./markdown.js").Block[]} */
  const links = [];
  /** @type {string[]} */
  const rechts = [];
  for (const b of form.bloecke) {
    if (b.typ === "p" && /^\*\*Darauf kommt es an:?\*\*/.test(b.text)) rechts.unshift(blockHtml([b]).replace("<p>", '<p class="kern">'));
    else if (b.typ === "p" && /^\*\*(Leichter|Schwerer)\b/.test(b.text)) {
      rechts.push(blockHtml([b]).replace("<p>", '<p class="stufen">').replace(/ <b>Schwerer:/, "<br><b>Schwerer:"));
    }
    else links.push(b);
  }
  const linksHtml = blockHtml(links, { ebene: 4 }).replace(/<p>Ihr braucht:/, "<p><b>Ihr braucht:</b>");
  return `<div class="spalten"><div class="links">${linksHtml}</div><div class="rechts">${rechts.join("")}</div></div>`;
}

export class LsAnregung extends HTMLElement {
  /** @type {(() => void) | null} */
  #zu = null;
  /** @type {HTMLElement | null} */
  #vorher = null;
  /** Elemente, die diese Karte inert gemacht hat (nur die gibt sie wieder frei). @type {HTMLElement[]} */
  #still = [];
  /** Zählt die Aufrufe von oeffne(), damit ein später fertiges Laden keinen neueren Inhalt überschreibt. */
  #lauf = 0;
  /** @type {import("./markdown.js").Form[]} */
  #formen = [];

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
        <div class="rumpf">
          <div class="reiter" role="tablist" aria-label="Wo spielt ihr?" hidden></div>
          <div class="anleitung" role="tabpanel" hidden></div>
          <p class="text"></p>
        </div>
      </section>`;
    this.themaFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".thema"));
    this.textFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".text"));
    this.rumpf = /** @type {HTMLElement} */ (wurzel.querySelector(".rumpf"));
    this.reiter = /** @type {HTMLElement} */ (wurzel.querySelector(".reiter"));
    this.anleitung = /** @type {HTMLElement} */ (wurzel.querySelector(".anleitung"));
    this.zurueck = /** @type {HTMLElement} */ (wurzel.querySelector(".zurueck"));
    this.zurueck.addEventListener("click", () => this.schliesse());
    /** @type {HTMLElement} */ (wurzel.querySelector(".schleier")).addEventListener("click", () => this.schliesse());
    this.reiter.addEventListener("click", (e) => {
      const b = /** @type {HTMLElement | null} */ (/** @type {HTMLElement} */ (e.target).closest("[data-situation]"));
      if (b) this.zeigeForm(b.dataset.situation ?? "", { merken: true });
    });
    this.reiter.addEventListener("keydown", (e) => this.pfeil(e));
    this.taste = this.taste.bind(this);
    /** Versprechen: Inhalt der zuletzt geöffneten Karte steht (für Seiten und die Browser-Prüfung). */
    this.geladen = Promise.resolve();
  }

  /** @returns {boolean} */
  get offen() {
    return this.hasAttribute("offen");
  }

  /** Die Situation der gezeigten Form ("" ohne Anleitung). @returns {string} */
  get form() {
    return this.reiter.querySelector('[aria-selected="true"]')?.getAttribute("data-situation")
      ?? (this.#formen.length === 1 ? this.#formen[0].situation : "");
  }

  /**
   * Zeigt die Karte. Löst auf, sobald sie wieder geschlossen ist (Zurück, Escape, Schleier oder schliesse()).
   * Ein zweites oeffne() ersetzt den Inhalt; das frühere Versprechen löst dann auf.
   * @param {{ titel?: string, text?: string, thema?: string, fach?: string, form?: string }} anregung
   *   titel: Name des Themas (leise unter der Überschrift); text: Einzeiler aus dem Lernplan (ohne Anleitung);
   *   thema/fach: Id und Fach des Themas (ohne thema sucht die Karte die Anleitung über den Namen);
   *   form: gewünschte Situation (sonst die zuletzt gewählte, sonst die erste)
   * @returns {Promise<void>}
   */
  oeffne({ titel = "", text = "", thema = "", fach = "", form = "" }) {
    this.#zu?.();
    const lauf = ++this.#lauf;
    this.themaFeld.textContent = titel;
    this.textFeld.textContent = text;
    this.rumpf.setAttribute("aria-busy", "true");
    this.geladen = this.fuelle(lauf, { titel, text, thema, fach, form });
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

  /**
   * Lädt die Anleitung (falls es eine gibt) und füllt die Karte.
   * @param {number} lauf
   * @param {{ titel: string, text: string, thema: string, fach: string, form: string }} a
   * @returns {Promise<void>}
   */
  async fuelle(lauf, { titel, text, thema, fach, form }) {
    const ort = await findeAnleitung({ thema, fach, titel });
    const anleitung = ort ? await ladeAnleitung(ort.fach, ort.thema) : null;
    const gewuenscht = form || (await letzteForm());
    if (lauf !== this.#lauf) return;
    this.#formen = anleitung?.formen ?? [];
    this.reiter.innerHTML = this.#formen.length > 1
      ? this.#formen.map((f) => `<button class="knopf" type="button" role="tab" tabindex="-1" data-situation="${escape(f.situation)}"
          aria-selected="false" aria-label="${escape(f.wort)}"><span class="form neben pille"><span class="zeichen"><img alt=""
          draggable="false" src="${SYMBOLE}${escape(f.symbol)}"></span><span class="wort">${escape(f.wort)}</span></span></button>`).join("")
      : "";
    this.reiter.hidden = this.#formen.length < 2;
    this.anleitung.hidden = !this.#formen.length;
    if (!this.#formen.length) this.anleitung.replaceChildren();
    this.textFeld.hidden = this.#formen.length > 0 || !text;
    if (this.#formen.length) this.zeigeForm(waehleForm(this.#formen, gewuenscht)?.situation ?? "");
    this.rumpf.removeAttribute("aria-busy");
  }

  /**
   * Zeigt eine Form der geladenen Anleitung.
   * @param {string} situation
   * @param {{ merken?: boolean, fokus?: boolean }} [optionen] merken: als Voreinstellung speichern (Wahl auf der Karte)
   */
  zeigeForm(situation, { merken = false, fokus = false } = {}) {
    const f = waehleForm(this.#formen, situation);
    if (!f) return;
    for (const b of /** @type {HTMLElement[]} */ ([...this.reiter.querySelectorAll("[data-situation]")])) {
      const an = b.dataset.situation === f.situation;
      b.setAttribute("aria-selected", String(an));
      b.tabIndex = an ? 0 : -1;
      if (an && fokus) b.focus({ preventScroll: true });
    }
    this.anleitung.innerHTML = `<h3></h3>${formHtml(f)}`;
    // Mit nur einer Form gibt es keine Wahl: die Situation steht dann vor dem Namen.
    /** @type {HTMLElement} */ (this.anleitung.querySelector("h3")).textContent = this.#formen.length > 1 ? f.name : `${f.wort}: ${f.name}`;
    if (merken) merkeForm(f.situation);
  }

  /** Pfeiltasten in der Wahl (Reiter-Muster). @param {KeyboardEvent} e */
  pfeil(e) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key) || this.#formen.length < 2) return;
    e.preventDefault();
    const i = this.#formen.findIndex((f) => f.situation === this.form);
    const n = this.#formen.length;
    const j = e.key === "Home" ? 0 : e.key === "End" ? n - 1 : (i + (e.key === "ArrowRight" ? 1 : -1) + n) % n;
    this.zeigeForm(this.#formen[j].situation, { merken: true, fokus: true });
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
   * Hintergrund inert (an) bzw. wieder frei (aus): alle Geschwister der Karte, auch die Kopfleiste. Liegt die Karte
   * direkt in einem Shadow DOM (z. B. in der Pause), sind es die Geschwister dort.
   * @param {boolean} an
   */
  stilleSeite(an) {
    if (!an) {
      for (const el of this.#still) el.inert = false;
      this.#still = [];
      return;
    }
    const eltern = this.parentElement ?? (this.parentNode instanceof ShadowRoot ? this.parentNode : document.body);
    for (const el of /** @type {HTMLElement[]} */ ([...eltern.children])) {
      if (el === this || el.inert || el.tagName === "SCRIPT" || el.tagName === "STYLE") continue;
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
