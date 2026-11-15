// <ls-geschichte src="geschichten/zehnerpaare/geschichte.json">
// Spielt eine Geschichte ab (docs/geschichten.md §4): je Seite links ein quadratisches Bild, so groß wie möglich (Foto
// aus `bild`, 1024 × 1024, oder gezeichnete Szene aus `szene`, rahmen/szene.js), rechts daneben der Text in Andika.
// Weiter und Zurück per Tipp, Wischen und Pfeiltaste. Fortschritt als Punkte ohne Zahl.
// - Startwahl (Christian 2026-11-15): Bei Ton an zeigt die erste Seite „Vorlesen“ und „Selbst lesen“; vorher wird nichts
//   gelesen. Wer ohne Wahl blättert, liest selbst. Bei Ton aus gibt es keine Wahl (Selbst lesen).
// - Vorlesemodus: nach dem Satz und PAUSE_MS Ruhe blättert die Geschichte von selbst um (Ausnahme zu spielbau.md §8,
//   nur für Geschichten); ohne Stimme nach der geschätzten Lesezeit. Ein Tipp auf Bild, Text oder den Vorlese-Knopf
//   hält an, ein zweiter liest weiter. Die Frage-Seite und die letzte Seite blättern nie von selbst.
// Nach der letzten Seite „Fertig“ (Hauptknopf) → Ereignis `fertig` (bubbles, composed).
//
// - Vorlesen: Bei Ton an (Einstellung `ton.<spiel>` wie ls-blase, Spiel-Kennung der Leiste) liest der Erzähler jede
//   Seite beim Aufschlagen vor (`sprich` aus kern/stimme.js, vorab aufgenommen mit `npm run audio`, sonst die
//   Systemstimme); der Knopf Vorlesen liest noch einmal. `sprich` der Seite ersetzt den gesprochenen Text.
//   Ein Satz wird nur durch einen Tipp des Kindes abgebrochen (Blättern), nie vom Abspieler.
// - Frage (`frage: true`): Weiter erscheint erst nach dem Vorlesen und einer Ruhe von RUHE_MS, damit das Kind
//   überlegt; bis dahin blättern auch Wischen und Pfeiltaste nicht weiter. Es wird nichts geprüft oder gespeichert.
// - Fotos tragen klein den Hinweis „Bild erzeugt“ (geschichten.md §2).
// - Seitenwechsel: nur transform und opacity; bei wenig Bewegung nur ein kurzes Überblenden.
// - Testbetrieb (`?pruefen`, rahmen/pruefen.js): window.lsGeschichte = { seite, seiten, weiterBereit, weiter(),
//   zurueck(), fertig } (seite ab 0).
// Eigenschaften: `seite` (Index), `seiten` (Anzahl), `geladen` (Versprechen, löst mit der Geschichte oder null).

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich, stille } from "../kern/stimme.js";
import { protokoll } from "../kern/protokoll.js";
import { GRUND_CSS, definiere } from "./stil.js";
import { findeSpiel } from "./knopf.js";
import { baueBild, SZENE_CSS } from "./szene.js";
import { testbetrieb } from "./pruefen.js";
import "./knopf.js";

/** Ruhe vor Weiter auf der Seite mit Frage (geschichten.md §2, Christian 2026-11-15). */
export const RUHE_MS = 2000;
/** Ruhe nach dem Satz, bevor der Vorlesemodus umblättert (Christian 2026-11-15). */
export const PAUSE_MS = 1500;
/** Ohne Stimme: geschätzte Lesezeit je Zeichen, mindestens LESEZEIT_MIN_MS. */
const LESEZEIT_MS = 60;
const LESEZEIT_MIN_MS = 3000;
/** Wischweg in Pixeln, ab dem geblättert wird. */
const WISCH_PX = 60;
const DAUER_MS = 460;

/**
 * Aufbau (geschichten.md §4, Christian 2026-11-15): links das Bild, quadratisch und so groß, wie der Platz unter der
 * Leiste es erlaubt; rechts der Text, darunter Punkte und Knöpfe (Zurück, Vorlesen, Weiter bzw. Fertig). Bei sehr
 * schmalem Hochformat stehen Bild und Text untereinander. Szene: das Bild ist 60 × 60 Einheiten (Elemente skalieren mit).
 */
const CSS = `
:host { display: block; position: relative; width: 100%; height: 100%; font-size: 3.2rem; line-height: 1.3;
  -webkit-user-select: none; user-select: none; }
* { box-sizing: border-box; }
.buch { position: absolute; inset: 0; container: buch / size; }
.blatt { --rand: 3.6rem; --luft: 6rem;
  --bild: min(calc(100cqh - 2 * var(--rand)), calc(58cqw - var(--rand)));
  position: absolute; inset: 0; padding: var(--rand) calc(var(--rand) + 1rem);
  display: grid; grid-template-columns: var(--bild) minmax(0, 1fr); grid-template-rows: var(--bild);
  column-gap: var(--luft); align-content: center; justify-content: center; }

/* Das Bild: eine flache Papierkarte mit Tinte-Kontur (Matte, kein Schatten: nicht drückbar). */
.rahmen { position: relative; width: var(--bild); height: var(--bild); border-radius: var(--ls-radius-gross);
  border: var(--ls-kontur) solid var(--ls-tinte); background: var(--ls-papier); overflow: hidden; touch-action: pan-y; }
.seite { position: absolute; inset: 0; container-type: size; will-change: transform, opacity; }
.seite.foto img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.figuren { position: absolute; inset: 0; container-type: size; pointer-events: none; }

/* Gezeichnete Szene auf der quadratischen Bühne: hinten die Häuser am Rand der Wiese, vorn die Kinder. Die Kinder
   reichen nie bis an die Fenster der Häuser, damit jede Perle zu sehen bleibt. */
.szene { --szene-u: calc(100cqh / 60); }
.szene .boden { position: absolute; left: 0; right: 0; bottom: 0; height: 44cqh; background: #EAF0DD;
  border-top: var(--ls-kontur) solid #CBD9B5; }
.el { position: absolute; top: 50%; transform: translate(-50%, -50%); }
.el.figur-h { top: auto; bottom: 3cqh; height: 44cqh; transform: translateX(-50%); }
.el.figur-h svg { display: block; height: 100%; width: auto; overflow: visible; }
.el.perlen { display: flex; gap: calc(var(--szene-u) * 3); align-items: center; }
.el.perlen ls-perlenstab { height: calc(var(--szene-u) * var(--szene-perlen, calc(10 * var(--szene-stab, 1)))); }
.el.zahl { font: 700 calc(var(--szene-u) * 18)/1 "Andika", sans-serif; color: var(--ls-tinte); }
.el.objekt { top: auto; bottom: 8cqh; transform: translateX(-50%); }
.el.objekt ls-objekt { display: block; height: calc(var(--szene-u) * 18); }
${SZENE_CSS}
.el.haeuser { top: auto; bottom: 42cqh; transform: translateX(-50%); --haus-breite: 27.5; gap: calc(var(--szene-u) * 2); }
.el.paare { --paar-stab: 4.4; }
.erzeugt { position: absolute; right: 1.6rem; bottom: 1.4rem; padding: .3rem 1.2rem; border-radius: 2rem; font-size: 2.2rem;
  color: var(--ls-tinte-weich); background: color-mix(in srgb, var(--ls-papier) 82%, transparent); pointer-events: none; }
.erzeugt[hidden] { display: none; }

/* Rechts: der Text in der Mitte, unten Punkte und Knöpfe auf der Höhe der Bildkante. */
.lese { min-width: 0; display: grid; grid-template-rows: minmax(0, 1fr) auto auto; row-gap: 3.2rem; }
.textfeld { display: flex; align-items: center; min-height: 0; }
.text { margin: 0; font-size: 5.4rem; line-height: 1.38; max-width: 17em; text-wrap: pretty; hyphens: manual; }
.knoepfe { display: flex; align-items: center; gap: 2.4rem; min-height: 16.6rem; }
.knoepfe .rechts { margin-left: auto; display: grid; place-items: center; }
.rechts > * { grid-area: 1 / 1; }
.weiter { width: 16rem; height: 16rem; border-radius: 50%; cursor: pointer; padding: 0; color: var(--ls-tinte);
  background: var(--ls-sonne); border: var(--ls-kontur) solid var(--ls-tinte); box-shadow: 0 .6rem 0 var(--ls-tinte);
  display: flex; align-items: center; justify-content: center; touch-action: manipulation; -webkit-tap-highlight-color: transparent;
  transition: opacity .35s ease, transform .45s cubic-bezier(.3, 1.5, .5, 1); }
.weiter svg { width: 8rem; height: 8rem; display: block; }
.weiter:active { transform: translateY(.3rem); box-shadow: 0 .3rem 0 var(--ls-tinte); }
.weiter:focus-visible { outline: .8rem solid var(--ls-sonne); outline-offset: .5rem; box-shadow: 0 .6rem 0 var(--ls-tinte), 0 0 0 1.1rem var(--ls-tinte); }
.weiter.wartet { opacity: 0; transform: scale(.6); pointer-events: none; }
.weiter[hidden], .fertig[hidden], .zurueck[hidden] { display: none; }
.zurueck.unsichtbar { visibility: hidden; }

/* Fortschritt: Punkte ohne Zahl; die aufgeschlagene Seite ist ein längerer Strich. */
.punkte { display: flex; gap: 1.4rem; align-items: center; height: 2.4rem; }
.punkte i { display: block; width: 2rem; height: 2rem; border-radius: 1rem; border: var(--ls-kontur) solid var(--ls-tinte-weich);
  background: transparent; transition: width .3s ease, background-color .3s ease; }
.punkte i.gelesen { background: var(--ls-tinte-weich); }
.punkte i.jetzt { width: 5rem; background: var(--ls-tinte); border-color: var(--ls-tinte); }
.startwahl { display: flex; flex-wrap: wrap; gap: 2.4rem; align-items: center; }
.startwahl[hidden] { display: none; }
.fehler { font-size: 4rem; color: var(--ls-tinte-weich); }

/* Schmaleres Querformat (iPad quer): etwas kleineres Bild, etwas kleinerer Text. */
@container buch (aspect-ratio < 17 / 10) {
  .blatt { --bild: min(calc(100cqh - 2 * var(--rand)), calc(54cqw - var(--rand))); --luft: 4.8rem; }
  .text { font-size: 4.8rem; }
}
/* Hochformat und fast quadratisch: Bild oben, Text und Knöpfe darunter. */
@container buch (aspect-ratio < 4 / 3) {
  .blatt { --bild: min(calc(100cqw - 2 * var(--rand) - 2rem), calc(44cqh - var(--rand)));
    grid-template-columns: minmax(0, 1fr); grid-template-rows: var(--bild) minmax(0, 1fr); row-gap: 3rem;
    align-content: stretch; justify-items: center; }
  .lese { width: 100%; row-gap: 2.4rem; }
  .textfeld { align-items: flex-start; }
  .text { font-size: 4.4rem; max-width: none; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;

const PFEIL = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h12M12 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>';

/**
 * @typedef {{ text: string, sprich?: string, bild?: string, szene?: any[], frage?: boolean }} Seite
 * @typedef {{ id: string, titel: string, art: string, klasse: number, seiten: Seite[] }} Geschichte
 */

const weniger = () => {
  try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

export class LsGeschichte extends HTMLElement {
  static observedAttributes = ["src"];

  constructor() {
    super();
    const w = this.attachShadow({ mode: "open" });
    w.innerHTML = `<style>${GRUND_CSS}${CSS}</style>
      <div class="buch"><div class="blatt">
        <div class="rahmen" part="bild"><div class="figuren"></div><span class="erzeugt" hidden>Bild erzeugt</span></div>
        <div class="lese">
          <div class="textfeld"><p class="text" aria-live="polite"></p></div>
          <div class="startwahl" hidden>
            <ls-knopf class="waehle-vorlesen" art="haupt" symbol="vorlesen.svg" wort="Vorlesen" stumm></ls-knopf>
            <ls-knopf class="waehle-selbst" symbol="buch.svg" wort="Selbst lesen" stumm></ls-knopf>
          </div>
          <div class="punkte" aria-hidden="true"></div>
          <div class="knoepfe">
            <ls-knopf class="zurueck" symbol="zurueck.svg" name="Zurück" stumm></ls-knopf>
            <ls-knopf class="vorlesen" symbol="vorlesen.svg" name="Vorlesen" stumm></ls-knopf>
            <div class="rechts">
              <button type="button" class="weiter" aria-label="Weiter">${PFEIL}</button>
              <ls-knopf class="fertig" art="haupt" symbol="fertig.svg" wort="Fertig" stumm hidden></ls-knopf>
            </div>
          </div>
        </div>
      </div></div>`;
    /** @param {string} s */
    const q = (s) => /** @type {HTMLElement} */ (w.querySelector(s));
    this.rahmen = q(".rahmen");
    this.figurenEbene = q(".figuren");
    this.erzeugtEl = q(".erzeugt");
    this.textEl = q(".text");
    this.zurueckEl = q(".zurueck");
    this.vorlesenEl = q(".vorlesen");
    this.weiterEl = /** @type {HTMLButtonElement} */ (q(".weiter"));
    this.fertigEl = q(".fertig");
    this.punkteEl = q(".punkte");
    this.startwahlEl = q(".startwahl");
    /** @type {"vorlesen" | "selbst" | null} null = noch nicht gewählt */
    this.modus = null;
    /** Vorlesemodus angehalten (Tipp des Kindes). */
    this.angehalten = false;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this.autoTimer = undefined;
    /** @type {Geschichte | null} */
    this.daten = null;
    /** Adresse der geladenen Datei (Bilder liegen relativ dazu). */
    this.basis = "";
    this._seite = -1;
    /** Weiter ist frei (auf der Frage-Seite erst nach der Ruhe). */
    this.weiterBereit = false;
    /** @type {HTMLElement | null} */
    this.aktuellEl = null;
    /** @type {Map<string, any>} */
    this.kinder = new Map();
    /** @type {any} */
    this.R = null;
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    this.ruheTimer = undefined;
    this.nummer = 0;
    /** @type {(g: Geschichte | null) => void} */
    let fertig = () => {};
    /** @type {Promise<Geschichte | null>} */
    this.geladen = new Promise((ok) => { fertig = ok; });
    this._geladen = fertig;

    this.weiterEl.addEventListener("click", () => this.weiter());
    this.zurueckEl.addEventListener("click", () => this.zurueck());
    this.vorlesenEl.addEventListener("click", () => (this.modus === "vorlesen" ? this.halte() : this.lies()));
    q(".waehle-vorlesen").addEventListener("click", () => this.waehle("vorlesen"));
    q(".waehle-selbst").addEventListener("click", () => this.waehle("selbst"));
    this.textEl.addEventListener("click", () => this.halte());
    this.fertigEl.addEventListener("click", () => this.beende());
    this.beiTaste = (/** @type {KeyboardEvent} */ e) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      if (e.key === "ArrowRight") { e.preventDefault(); this.weiter(); }
      else if (e.key === "ArrowLeft") { e.preventDefault(); this.zurueck(); }
    };
    // Wischen über dem Bild (waagrecht; senkrecht bleibt dem Blättern der Seite)
    /** @type {{ x: number, y: number, id: number } | null} */
    let start = null;
    this.rahmen.addEventListener("pointerdown", (e) => { start = { x: e.clientX, y: e.clientY, id: e.pointerId }; });
    this.rahmen.addEventListener("pointerup", (e) => {
      if (!start || start.id !== e.pointerId) return;
      const dx = e.clientX - start.x, dy = e.clientY - start.y;
      start = null;
      if (Math.abs(dx) < WISCH_PX && Math.abs(dy) < WISCH_PX) return void this.halte();
      if (Math.abs(dx) < WISCH_PX || Math.abs(dx) < Math.abs(dy) * 1.2) return;
      if (dx < 0) this.weiter(); else this.zurueck();
    });
    this.rahmen.addEventListener("pointercancel", () => { start = null; });
  }

  get seite() { return this._seite; }
  get seiten() { return this.daten?.seiten.length ?? 0; }

  connectedCallback() {
    window.addEventListener("keydown", this.beiTaste);
    const el = this;
    if (testbetrieb()) {
      /** @type {any} */ (window).lsGeschichte = {
        get seite() { return el.seite; },
        get seiten() { return el.seiten; },
        get weiterBereit() { return el.weiterBereit; },
        get modus() { return el.modus; },
        get angehalten() { return el.angehalten; },
        get frageSeite() { return el.daten ? el.daten.seiten.findIndex((s) => s.frage === true) : -1; },
        waehle: (/** @type {"vorlesen" | "selbst"} */ m) => el.waehle(m),
        halte: () => el.halte(),
        weiter: () => el.weiter(),
        zurueck: () => el.zurueck(),
        fertig: () => el.beende(),
      };
    }
    if (!this.daten && this.getAttribute("src")) this.lade();
  }

  disconnectedCallback() {
    window.removeEventListener("keydown", this.beiTaste);
    clearTimeout(this.ruheTimer);
    clearTimeout(this.autoTimer);
    stille();
    this.kinder.forEach((f) => f.steuer.halt());
  }

  attributeChangedCallback() {
    if (this.isConnected) this.lade();
  }

  async lade() {
    const src = this.getAttribute("src") ?? "";
    try {
      const url = new URL(src, document.baseURI).href;
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status}`);
      const g = /** @type {Geschichte} */ (await r.json());
      if (!g || !Array.isArray(g.seiten) || !g.seiten.length) throw new Error("keine Seiten");
      this.basis = url;
      await this.ladeBausteine(g);
      this.daten = g;
      this.punkteEl.replaceChildren(...g.seiten.map(() => document.createElement("i")));
      this.modus = (await this.tonAn()) ? null : "selbst";
      this.startwahlEl.hidden = this.modus !== null;
      this.zeige(0, 0);
      this._geladen(g);
    } catch (e) {
      protokoll(`ls-geschichte: ${src} nicht geladen (${e})`);
      this.textEl.textContent = "Die Geschichte geht gerade nicht.";
      this.textEl.classList.add("fehler");
      this.weiterEl.hidden = true;
      this.zurueckEl.classList.add("unsichtbar");
      this.vorlesenEl.hidden = true;
      this._geladen(null);
    }
  }

  /** Lädt, was die Szenen brauchen: Perlen, Dinge, die Runde. Fehlt etwas, bleibt es still weg. @param {Geschichte} g */
  async ladeBausteine(g) {
    const szenen = g.seiten.flatMap((s) => (Array.isArray(s.szene) ? s.szene : []));
    if (!szenen.length) return;
    try { await import("./perlenstab.js"); } catch { /* ohne Baustein bleiben die Perlen weg */ }
    if (szenen.some((b) => b && typeof b.objekt === "string"))
      try { await import("../objekte/objekt.js"); } catch { /* ohne Baustein bleiben die Dinge weg */ }
    if (szenen.some((b) => b && b.figur))
      try { this.R = await import("../runde/runde.js"); } catch { /* ohne Runde bleiben die Kinder weg */ }
  }

  /** Ton an für diese Seite? (wie ls-blase) */
  async tonAn() {
    try {
      await ladeEinstellungen();
      const spiel = findeSpiel(this);
      return spiel ? einstellung(`ton.${spiel}`, true) !== false : true;
    } catch {
      return true;
    }
  }

  /**
   * Schlägt eine Seite auf.
   * @param {number} i
   * @param {number} richtung 1 vorwärts, -1 zurück, 0 ohne Bewegung
   */
  zeige(i, richtung) {
    const g = this.daten;
    if (!g || i < 0 || i >= g.seiten.length) return;
    const s = g.seiten[i];
    this._seite = i;
    this.nummer += 1;
    clearTimeout(this.ruheTimer);
    clearTimeout(this.autoTimer);

    // Neue Bildseite
    const neu = document.createElement("div");
    neu.className = "seite";
    if (typeof s.bild === "string" && s.bild) {
      neu.classList.add("foto");
      const img = document.createElement("img");
      img.alt = "";
      img.src = new URL(s.bild, this.basis).href;
      neu.appendChild(img);
    } else {
      neu.classList.add("szene");
      const boden = document.createElement("div");
      boden.className = "boden";
      neu.appendChild(boden);
      const kinder = baueBild(neu, Array.isArray(s.szene) ? s.szene : [], this.R, this.kinder);
      // Die Kinder stehen in einer eigenen Ebene: wer bleibt, bleibt stehen, während das Bild wechselt.
      const neuesKind = [];
      for (const f of kinder.values()) {
        if (f.el.parentElement !== this.figurenEbene) neuesKind.push(f.el);
        this.figurenEbene.appendChild(f.el);
      }
      for (const [id, f] of this.kinder) if (!kinder.has(id) || kinder.get(id) !== f) f.el.remove();
      this.kinder = kinder;
      for (const el of neuesKind) this.blende(el, 0, 1);
    }
    this.erzeugtEl.hidden = !neu.classList.contains("foto");
    if (neu.classList.contains("foto")) for (const f of this.kinder.values()) { f.steuer.halt(); f.el.remove(); }
    if (neu.classList.contains("foto")) this.kinder = new Map();
    this.rahmen.insertBefore(neu, this.figurenEbene);

    const alt = this.aktuellEl;
    this.aktuellEl = neu;
    const weg = weniger() ? 0 : 4;
    if (alt) {
      this.bewege(alt, [{ opacity: 1, transform: "translateX(0)" }, { opacity: 0, transform: `translateX(${-richtung * weg}%)` }])
        .then(() => alt.remove());
      this.bewege(neu, [{ opacity: 0, transform: `translateX(${richtung * weg}%)` }, { opacity: 1, transform: "translateX(0)" }]);
    }

    // Text
    this.textEl.textContent = s.text;
    if (alt) this.blende(this.textEl, 0, 1);

    // Knöpfe und Punkte
    const letzte = i === g.seiten.length - 1;
    this.zurueckEl.classList.toggle("unsichtbar", i === 0);
    this.weiterEl.hidden = letzte;
    this.fertigEl.hidden = !letzte;
    [...this.punkteEl.children].forEach((p, k) => {
      p.classList.toggle("jetzt", k === i);
      p.classList.toggle("gelesen", k < i);
    });
    this.weiterBereit = !s.frage;
    this.weiterEl.classList.toggle("wartet", !!s.frage);
    if (this.modus === null) { /* Startwahl: noch nichts lesen */ }
    else if (!s.frage) this.liesUndBlaettere();
    else {
      const meine = this.nummer;
      const frei = () => {
        if (meine !== this.nummer) return;
        this.ruheTimer = setTimeout(() => {
          if (meine !== this.nummer) return;
          this.weiterBereit = true;
          this.weiterEl.classList.remove("wartet");
        }, RUHE_MS);
      };
      this.lies().then(frei, frei);
    }
  }

  /**
   * Liest die aufgeschlagene Seite vor (bei Ton an).
   * @returns {Promise<string>}
   */
  async lies() {
    const s = this.daten?.seiten[this._seite];
    if (!s) return "still";
    const meine = this.nummer;
    if (!(await this.tonAn()) || meine !== this.nummer) return "still";
    const text = typeof s.sprich === "string" && s.sprich ? s.sprich : s.text;
    return sprich(text);
  }

  /**
   * Startwahl: Vorlesen (blättert von selbst) oder Selbst lesen.
   * @param {"vorlesen" | "selbst"} modus
   */
  waehle(modus) {
    if (!this.daten || this.modus !== null) return;
    this.modus = modus === "vorlesen" ? "vorlesen" : "selbst";
    this.startwahlEl.hidden = true;
    this.angehalten = false;
    this.liesUndBlaettere();
  }

  /** Hält den Vorlesemodus an bzw. liest weiter (Tipp des Kindes). */
  halte() {
    if (this.modus !== "vorlesen") return;
    this.angehalten = !this.angehalten;
    this.vorlesenEl.classList.toggle("angehalten", this.angehalten);
    clearTimeout(this.autoTimer);
    if (this.angehalten) stille();
    else this.liesUndBlaettere();
  }

  /** Liest die Seite und blättert im Vorlesemodus danach von selbst um. */
  liesUndBlaettere() {
    const meine = this.nummer;
    this.lies().then((e) => this.blaettereSelbst(e, meine), () => this.blaettereSelbst("still", meine));
  }

  /**
   * @param {string} ergebnis von sprich: "gesprochen", "still" oder "abgebrochen"
   * @param {number} meine Nummer der Seite, für die gelesen wurde
   */
  blaettereSelbst(ergebnis, meine) {
    const g = this.daten;
    if (!g || this.modus !== "vorlesen" || this.angehalten || meine !== this.nummer) return;
    const s = g.seiten[this._seite];
    if (!s || s.frage || this._seite >= g.seiten.length - 1 || ergebnis === "abgebrochen") return;
    const warte = ergebnis === "still" ? Math.max(LESEZEIT_MIN_MS, s.text.length * LESEZEIT_MS) : PAUSE_MS;
    clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(() => {
      if (meine !== this.nummer || this.angehalten || this.modus !== "vorlesen") return;
      this.weiter();
    }, warte);
  }

  weiter() {
    if (!this.daten || !this.weiterBereit) return;
    if (this.modus === null) { this.modus = "selbst"; this.startwahlEl.hidden = true; }
    if (this._seite >= this.daten.seiten.length - 1) return;
    this.zeige(this._seite + 1, 1);
  }

  zurueck() {
    if (!this.daten || this._seite <= 0) return;
    this.zeige(this._seite - 1, -1);
  }

  beende() {
    if (!this.daten || this._seite !== this.daten.seiten.length - 1) return;
    stille();
    this.dispatchEvent(new CustomEvent("fertig", { bubbles: true, composed: true, detail: { id: this.daten.id } }));
  }

  /** @param {Element} el @param {Keyframe[]} bilder @returns {Promise<void>} */
  bewege(el, bilder) {
    try {
      const a = el.animate(bilder, { duration: weniger() ? 160 : DAUER_MS, easing: "cubic-bezier(.33, 0, .2, 1)" });
      return a.finished.then(() => {}, () => {});
    } catch {
      return Promise.resolve();
    }
  }

  /** @param {Element} el @param {number} von @param {number} bis */
  blende(el, von, bis) {
    return this.bewege(el, [{ opacity: von }, { opacity: bis }]);
  }
}

definiere("ls-geschichte", LsGeschichte);
