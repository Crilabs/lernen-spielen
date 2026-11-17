// <ls-pause spiel="vorlage"> … Pausenbild, Sachmoment … </ls-pause>
// Vollflächige Ebene über dem Spiel auf Nacht mit ruhigen Sternen in Sonne, verborgen bis zeige().
// Der Inhalt kommt per <slot> auf eine Papierkarte (ohne Inhalt keine Karte).
// Unten Mitte „Alle Spiele“ und „Weiter“: gleich groß, gleich gestaltet (Papier, Symbol und Wort), N6.
// Optional in derselben Reihe nach den beiden ein ruhiges Angebot „Mit echten Dingen“ (kleine Papier-Pille in der Größe
// eines Nebenknopfs mit Hand und Wort, kleiner als die beiden Pausenknöpfe; kein Muss, keine Belohnung, K8): zeige({ echteDinge: { thema, fach, titel, text } }) führt damit zur Seite „Mit echten Dingen“
// zum Thema der Runde (echt.html). Ohne Anleitung und ohne Einzeiler gibt es den Knopf nicht.
// „Weißt du noch?“ (Christian, 2026-11-17; geschichten.md §2b): Ist eine Kapitelfrage fällig (höchstens zwei am Tag, mit
// Bibliothek zusammen), steht sie auf einer eigenen Papierkarte statt der Karte des Spiels. Kein Muss: Alle Spiele und
// Weiter gehen jederzeit; ohne Wahl zählt sie nicht als gestellt. Nicht bei schluss (Spielzeit vorbei).
// Kein Timer, kein Ablauf. Spielzeit (Spec 2026-11-14-spielzeit): zeige({ satz, schluss }) stellt einen ruhigen
// Satz über die Knöpfe (Vorwarnung oder Schluss); bei schluss gibt es kein Weiter, nur „Alle Spiele“.

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { schonGesagt, sageEinmal } from "../kern/sitzung.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import { findeSpiel } from "./knopf.js";
import { ANREGUNG_TITEL } from "./anregung.js";
import { findeAnleitung } from "./echte-dinge.js";
import { holeErinnerung, merkeErinnert } from "./weisst-du-noch.js";
import "./erinnern.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;
const HAUS_HREF = new URL("../index.html", import.meta.url).href;
const ECHT_HREF = new URL("../echt.html", import.meta.url).href;
/** Abstand der Knöpfe vom unteren Rand und ihre gemeinsame Breite, in rem. */
const UNTEN = 6;
/** Abstand unten, wenn das Angebot eine eigene Reihe hat (schmale Bildschirme), in rem. */
const UNTEN_SCHMAL = 3.6;
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
.satz {
  position: absolute;
  left: 0;
  right: 0;
  bottom: calc(${UNTEN + MASSE.pilleGross + 2}rem + env(safe-area-inset-bottom, 0rem));
  margin: 0;
  padding: 0 ${MASSE.rand}rem;
  text-align: center;
  font-size: 3.2rem;
  line-height: 1.3;
  color: var(--ls-papier);
}
.satz:empty { display: none; }
a.alle { --ls-knopf: ${MASSE.pilleGross}rem; }
/* Angebot: kleine Pille nach Weiter, auf der Mitte der Pausenknöpfe. Ist der Bildschirm dafür zu schmal (4:3, Tablet;
   die Reihe braucht etwa 170 rem, 1 rem = Höhe/108), steht die Pille allein in einer ruhigen Reihe unter den beiden;
   die Knöpfe rücken dafür tiefer, die Karte endet entsprechend höher. Nur CSS, keine Messung. */
.aktionen { align-items: center; flex-wrap: wrap; row-gap: ${MASSE.rand}rem; }
ls-knopf.echt { --ls-breite: 0rem; }
@media (max-aspect-ratio: 157/100) {
  .ebene:has(ls-knopf.echt:not([hidden])) .inhalt { bottom: calc(${UNTEN_SCHMAL + MASSE.pille + MASSE.rand + MASSE.pilleGross + 4}rem + env(safe-area-inset-bottom, 0rem)); }
  .aktionen:has(ls-knopf.echt:not([hidden])) { bottom: calc(${UNTEN_SCHMAL}rem + env(safe-area-inset-bottom, 0rem)); }
  ls-knopf.echt { flex-basis: 100%; text-align: center; }
}
.ebene { position: absolute; inset: 0; }
/* „Weißt du noch?“ statt der Karte des Spiels */
.inhalt.mit-frage .karte:not(.frage-karte) { display: none; }
.frage-karte { width: min(150rem, 100%); overflow-y: auto; scrollbar-width: none; }
.frage-karte::-webkit-scrollbar { display: none; }
.frage-karte[hidden] { display: none; }
.frage-kopf { display: flex; align-items: baseline; justify-content: space-between; gap: 2.4rem; margin: 0 0 3.2rem; }
.frage-kopf h2 { margin: 0; font: 750 5.6rem/1 "Inter", sans-serif; letter-spacing: -0.03em; color: var(--ls-tinte); }
.frage-kopf span { font: 600 2.4rem/1.2 "Inter", sans-serif; color: var(--ls-tinte-weich); text-align: right; }
`;

export class LsPause extends HTMLElement {
  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${PAUSE_CSS}</style>
      <div class="ebene">
      <svg class="himmel" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
        <g class="sterne">${STERNE}</g><g class="punkte">${PUNKTE}</g>
      </svg>
      <div class="inhalt"><div class="karte leer"><slot></slot></div>
        <section class="karte frage-karte" hidden aria-labelledby="frage-titel"><div class="frage-kopf"><h2 id="frage-titel">Weißt du noch?</h2><span></span></div><ls-erinnern></ls-erinnern></section></div>
      <p class="satz" role="status"></p>
      <div class="aktionen" tabindex="-1">
        <a class="knopf alle" href="${HAUS_HREF}" tabindex="0" aria-label="Alle Spiele" draggable="false"><span class="form neben pille"><span class="zeichen"><img alt="" draggable="false" src="${SYMBOLE}haus.svg"></span><span class="wort">Alle Spiele</span></span></a>
        <ls-knopf class="weiter" symbol="zurueck.svg" name="Weiter" wort="Weiter" groesse="gross" gespiegelt></ls-knopf>
        <ls-knopf class="echt" symbol="hand.svg" wort="${ANREGUNG_TITEL}" hidden></ls-knopf>
      </div>
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
    this.satz = /** @type {HTMLElement} */ (wurzel.querySelector(".satz"));
    /** @type {Promise<"weiter"> | null} */
    this._offen = null;
    /** @type {((w: "weiter") => void) | null} */
    this._loese = null;
    this.echt = /** @type {HTMLElement} */ (wurzel.querySelector("ls-knopf.echt"));
    /** @type {{ thema?: string, fach?: string, titel?: string, text?: string } | null} */
    this.echteDinge = null;
    /** Versprechen: Ob es das Angebot gibt, steht fest (für die Browser-Prüfung). */
    this.angebotBereit = Promise.resolve();
    this.alle.addEventListener("click", () => this.sagAlle());
    this.weiter.addEventListener("click", () => this.beendeWeiter());
    this.echt.addEventListener("click", () => this.oeffneEchteDinge());
    this.inhalt = /** @type {HTMLElement} */ (wurzel.querySelector(".inhalt"));
    this.frageKarte = /** @type {HTMLElement} */ (wurzel.querySelector(".frage-karte"));
    this.erinnern = /** @type {import("./erinnern.js").LsErinnern} */ (wurzel.querySelector("ls-erinnern"));
    /** @type {{ id: string, kapitel: number } | null} */
    this.frage = null;
    /** Versprechen: Ob eine Erinnerungsfrage kommt, steht fest (für die Browser-Prüfung). */
    this.frageBereit = Promise.resolve();
    this.erinnern.addEventListener("gewaehlt", () => {
      const f = this.frage;
      if (f) merkeErinnert(f.id, f.kapitel, true).catch(() => {});
    });
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
   * liefert jeder weitere Aufruf dasselbe Versprechen. Mit schluss gibt es kein Weiter: das Versprechen
   * bleibt offen, der Weg führt über „Alle Spiele“ zur Startseite.
   * @param {{ satz?: string | null, schluss?: boolean, echteDinge?: { thema?: string, fach?: string, titel?: string, text?: string } | null }} [optionen]
   *   satz zeigt die Pause (sprechen tut das Spiel); echteDinge: Thema der Runde für das Angebot „Mit echten Dingen“ (ohne: kein Angebot)
   * @returns {Promise<"weiter">}
   */
  zeige({ satz = null, schluss = false, echteDinge = null } = {}) {
    if (this._offen) return this._offen;
    this.echteDinge = echteDinge;
    this.echt.hidden = true;
    this._offen = new Promise((ok) => { this._loese = ok; });
    this.satz.textContent = satz ?? "";
    this.weiter.hidden = schluss;
    this.angebotBereit = this.pruefeAngebot(echteDinge);
    this.frageBereit = schluss ? Promise.resolve() : this.zeigeFrage(this._offen);
    this.setAttribute("offen", "");
    // Fokus auf die Knopfgruppe, nicht auf Weiter: keiner der beiden Wege wird hervorgehoben (N6).
    this.aktionen.focus({ preventScroll: true });
    return this._offen;
  }

  /**
   * Holt die fällige Erinnerungsfrage und zeigt sie (gezählt wird sie schon beim Zeigen).
   * @param {Promise<"weiter">} runde das Versprechen dieser Pause; ist es nicht mehr offen, kommt nichts mehr
   */
  async zeigeFrage(runde) {
    try {
      const f = await holeErinnerung();
      if (!f || this._offen !== runde) return;
      try {
        await ladeEinstellungen();
      } catch {
        // Einstellungen nicht ladbar: Ton gilt als an.
      }
      const spiel = findeSpiel(this);
      const ton = !(spiel && einstellung(`ton.${spiel}`, true) === false);
      this.frage = { id: f.id, kapitel: f.kapitel };
      /** @type {HTMLElement} */ (this.frageKarte.querySelector(".frage-kopf span")).textContent = f.titel;
      this.frageKarte.hidden = false;
      this.inhalt.classList.add("mit-frage");
      if (ton) sprich("Weißt du noch?");
      this.erinnern.zeige(f.frage, { ton, bild: f.bild, knapp: true });
      await merkeErinnert(f.id, f.kapitel, false);
    } catch {
      // Keine Frage (offline, kein Lernstand): die Pause bleibt, wie sie ist.
    }
  }

  /** Nimmt die Erinnerungsfrage wieder weg. */
  versteckeFrage() {
    this.frage = null;
    this.frageKarte.hidden = true;
    this.inhalt.classList.remove("mit-frage");
  }

  /**
   * Zeigt den Knopf „Mit echten Dingen“, wenn es zum Thema eine Anleitung oder einen Einzeiler gibt.
   * @param {{ thema?: string, fach?: string, titel?: string, text?: string } | null} e
   * @returns {Promise<void>}
   */
  async pruefeAngebot(e) {
    if (!e) return;
    const da = !!e.text || !!(await findeAnleitung({ thema: e.thema, fach: e.fach, titel: e.titel }));
    if (this.echteDinge === e && this._offen) this.echt.hidden = !da;
  }

  /**
   * Führt zur Seite „Mit echten Dingen“ zum Thema der Runde (spiele/echt.html, Christian 2026-11-14). Als Link im
   * Schatten-DOM, damit linkKlick (lernspiel.js) wie bei „Alle Spiele“ vorher speichert.
   */
  async oeffneEchteDinge() {
    const e = this.echteDinge;
    if (!e) return;
    const fund = e.thema ? { thema: e.thema } : await findeAnleitung({ fach: e.fach, titel: e.titel });
    if (!fund?.thema) return;
    const a = document.createElement("a");
    a.href = `${ECHT_HREF}?thema=${encodeURIComponent(fund.thema)}`;
    a.hidden = true;
    /** @type {ShadowRoot} */ (this.shadowRoot).append(a);
    a.click();
    a.remove();
  }

  beendeWeiter() {
    const loese = this._loese;
    if (!loese) return;
    this._loese = null;
    this._offen = null;
    this.versteckeFrage();
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
