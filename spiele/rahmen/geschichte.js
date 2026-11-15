// <ls-geschichte src="geschichten/zehnerpaare/geschichte.json">
// Spielt eine Geschichte ab (docs/geschichten.md §4), geteilt nach der Designsprache (Spec 2026-11-15-designsprache §5.5):
// links das Bild randlos über die halbe Breite (Foto aus `bild`, 1024 × 1024, oder gezeichnete Szene aus `szene` auf
// einer quadratischen Bühne vor der Kulisse, rahmen/szene.js), rechts auf Papier der Titel (Inter) und der Text in
// Andika (Kurzgeschichte ein Satz je Zeile, Sachbuch in Absätzen). Oben rechts Vorlesen, unten Zurück, Punkte und Weiter.
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
.ui { font-family: var(--ls-schrift-oberflaeche); font-feature-settings: var(--ls-schrift-merkmale); letter-spacing: -0.01em; }

/* Geteilt: links das Bild randlos, rechts die Bühne für den Text (kein Falz, keine Doppelseite). */
.blatt { position: absolute; inset: 0; display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); grid-template-rows: minmax(0, 1fr); }
.rahmen { position: relative; overflow: hidden; container-type: size; touch-action: pan-y;
  background: var(--kulisse-grund, var(--ls-nebel)) var(--kulisse-bild, none) center bottom / cover no-repeat; }
.seite { position: absolute; inset: 0; container-type: size; will-change: transform, opacity; }
.seite.foto { background: var(--ls-papier); }
.seite.foto img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; display: block; }
.figuren { position: absolute; inset: 0; container-type: size; pointer-events: none; }
/* Gezeichnete Szene: eine quadratische Bühne mitten in der Bildhälfte, davor dieselbe Ebene für die Kinder. */
.seite.szene, .figuren { inset: auto; width: min(100cqw, 100cqh); height: min(100cqw, 100cqh);
  left: calc(50% - min(100cqw, 100cqh) / 2); top: calc(50% - min(100cqw, 100cqh) / 2); }

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
.erzeugt { position: absolute; left: 4.2rem; bottom: 4.2rem; padding: .8rem 1.8rem; border-radius: 1.6rem; font-size: 2.2rem;
  color: var(--ls-tinte-weich); background: var(--ls-papier); pointer-events: none; }
.erzeugt[hidden] { display: none; }

/* Rechts: Papier über die ganze Höhe – oben Vorlesen (neben dem Ton der Seite), dann Titel und Text, unten die Knöpfe. */
.lese { position: relative; min-width: 0; height: 100%; display: grid; grid-template-columns: minmax(0, 1fr);
  grid-template-rows: minmax(0, 1fr) auto auto; row-gap: 3rem;
  padding: 16rem var(--ls-seite-rand) 4.2rem 10.4rem; background: var(--ls-papier); }
/* Vorlesen oben rechts, links neben dem Ton-Knopf der Seite (ls-leiste nur-ton): gleiche Höhe, 2,4 rem Luft. */
.vorlesen { position: absolute; top: 1.3rem; right: calc(var(--ls-seite-rand) + var(--ls-seite-knopf) + 2.4rem); }
.zum-inhalt { position: absolute; top: 1.3rem; left: 9.1rem; z-index: 1; }
/* Langer Text darf scrollen (Christian 2026-11-15: „Text kann scrollbar sein“). */
.textfeld { display: flex; flex-direction: column; justify-content: safe center; min-height: 0;
  overflow-y: auto; overscroll-behavior: contain; touch-action: pan-y; scrollbar-width: thin;
  scrollbar-color: var(--ls-naht) transparent; }
.seitentitel { margin: 0 0 4.4rem; font-size: 7.2rem; font-weight: 750; line-height: 1.05; letter-spacing: -0.035em; color: var(--ls-tinte); }
.seitentitel[hidden] { display: none; }
.text { margin: 0; font-size: 4.5rem; line-height: 1.4; max-width: 30ch; text-wrap: pretty; hyphens: manual; }
.text p { margin: 0; }
.text p + p { margin-top: .75em; }
.text.titel { font-family: var(--ls-schrift-oberflaeche); font-feature-settings: var(--ls-schrift-merkmale);
  font-size: 8.4rem; line-height: 1.04; font-weight: 750; letter-spacing: -0.035em; }

/* Sachbuch (geschichten.md §2a, §4): mehr Text je Seite – Absätze, etwas kleiner, Text oben beginnend. */
:host(.buch-modus) .textfeld { justify-content: flex-start; }
:host(.buch-modus) .seitentitel { font-size: 5.4rem; margin-bottom: 3.2rem; }
:host(.buch-modus) .text { font-size: 3.8rem; line-height: 1.5; max-width: 36ch; }

/* Inhaltsverzeichnis: Titel, Wahl Vorlesen/Selbst lesen, Weiterlesen; darunter die Kapitel als Karten mit Foto. */
.inhalt { position: absolute; inset: 0; overflow-y: auto; overscroll-behavior: contain; padding: 14rem var(--ls-seite-rand) 6rem;
  scrollbar-width: thin; scrollbar-color: var(--kulisse-tief, var(--ls-tinte-weich)) transparent; }
.inhalt .kopf { display: flex; flex-wrap: wrap; align-items: center; gap: 2.4rem 3.2rem; margin-bottom: 3.6rem;
  padding: 3.6rem 4.4rem; background: var(--ls-papier); border-radius: var(--ls-radius-plakat); }
.buchtitel { margin: 0 auto 0 0; font-family: var(--ls-schrift-oberflaeche); font-feature-settings: var(--ls-schrift-merkmale);
  font-size: 7.2rem; line-height: 1.05; font-weight: 750; letter-spacing: -0.035em; color: var(--ls-tinte); min-width: 0; }
.wahl { display: flex; flex-wrap: wrap; gap: 1.6rem; }
.karten { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 34rem), 1fr)); gap: 3.6rem 3.2rem; }
.kapitelkarte { position: relative; display: grid; grid-template-rows: auto auto auto; text-align: left; padding: 0;
  font: inherit; color: var(--ls-tinte); background: var(--ls-papier); border: var(--ls-kontur) solid var(--ls-tinte);
  border-radius: var(--ls-radius-teil); overflow: hidden; cursor: pointer; touch-action: manipulation;
  -webkit-tap-highlight-color: transparent; box-shadow: 0 1rem 0 var(--kulisse-tief, var(--ls-tinte-weich));
  transition: transform .15s ease, box-shadow .15s ease; }
.kapitelkarte:active { transform: translateY(.5rem); box-shadow: 0 .5rem 0 var(--kulisse-tief, var(--ls-tinte-weich)); }
.kapitelkarte:focus-visible { outline: .8rem solid var(--ls-sonne); outline-offset: .4rem; }
.karte-bild { display: block; aspect-ratio: 4 / 3; background: var(--kulisse-grund, var(--ls-nebel));
  border-bottom: var(--ls-kontur) solid var(--ls-tinte); }
.karte-bild img { width: 100%; height: 100%; object-fit: cover; display: block; }
.karte-nr { padding: 2rem 2.4rem 0; font-size: 2.6rem; color: var(--ls-tinte-weich); }
.karte-titel { padding: .4rem 2.4rem 2.4rem; font-family: var(--ls-schrift-oberflaeche); font-feature-settings: var(--ls-schrift-merkmale);
  font-size: 3.4rem; line-height: 1.15; font-weight: 700; letter-spacing: -0.01em; }
.haken { position: absolute; top: 1.6rem; right: 1.6rem; width: 6rem; height: 6rem; border-radius: 50%; display: none;
  place-items: center; font-size: 3.6rem; font-weight: 700; color: var(--ls-tinte); background: var(--ls-sonne);
  border: var(--ls-kontur) solid var(--ls-tinte); }
.kapitelkarte.gelesen .haken { display: grid; }
.knoepfe { display: flex; align-items: center; gap: 2rem; min-height: 11rem; }
.knoepfe .rechts { display: grid; justify-items: end; align-items: center; min-width: 11rem; }
.rechts > * { grid-area: 1 / 1; }
.weiter { transition: opacity .35s ease; }
.weiter.wartet { opacity: 0; pointer-events: none; }
.weiter[hidden], .fertig[hidden], .zurueck[hidden], .naechstes[hidden], .zum-inhalt[hidden], .weiterlesen[hidden],
.blatt[hidden], .inhalt[hidden], .wahl[hidden] { display: none; }
.zurueck.unsichtbar { visibility: hidden; }

/* Fortschritt: Punkte ohne Zahl in der Mitte; die aufgeschlagene Seite ist ein Sonnenpunkt mit Tinte-Kern. */
/* Viele Seiten auf schmalem Platz: die Punkte und ihre Abstände werden kleiner, nie breiter als die Reihe. */
.punkte { flex: 1; display: flex; gap: clamp(0.4rem, 1.4cqw, 1.6rem); align-items: center; justify-content: safe center; min-width: 0; height: 4rem;
  padding: 0 1.2rem; overflow: hidden; }
.punkte i { display: block; flex: 0 1 1.6rem; min-width: 0.7rem; aspect-ratio: 1; border-radius: 50%; background: var(--ls-naht);
  transition: transform .3s ease, background-color .3s ease, box-shadow .3s ease; }
.punkte i.jetzt { flex: none; width: 1.6rem; background: var(--ls-tinte); box-shadow: 0 0 0 0.7rem var(--ls-sonne); margin: 0 0.8rem; }
.vorlesen.angehalten { opacity: .55; }
.startwahl { display: flex; flex-direction: column; align-items: flex-start; gap: 2.4rem; }
.startwahl[hidden] { display: none; }
/* Vor der Startwahl: keine Punkte, kein Weiter – die zwei Wege sind die einzigen Knöpfe auf der Fläche. */
.lese.waehlt .punkte, .lese.waehlt .knoepfe, .lese.waehlt .vorlesen { display: none; }
.fehler { font-size: 4rem; color: var(--ls-tinte-weich); }

/* Schmaleres Querformat (iPad quer): etwas kleinerer Text. */
@container buch (aspect-ratio < 17 / 10) {
  .lese { padding-left: 7.2rem; }
  .text { font-size: 4.2rem; }
  .text.titel { font-size: 7.2rem; }
}
/* Hochformat und fast quadratisch: Bild oben, Text und Knöpfe darunter. */
@container buch (aspect-ratio < 4 / 3) {
  .blatt { grid-template-columns: minmax(0, 1fr); grid-template-rows: 42% minmax(0, 1fr); }
  .lese { padding: 13rem 4.8rem 3.2rem; }
  .text { font-size: 3.8rem; max-width: none; }
  :host(.buch-modus) .text { font-size: 3.6rem; max-width: none; }
}
/* Schmal (Telefon hoch): weniger Rand, damit Startknöpfe und Fertig hineinpassen. */
@container buch (max-width: 560px) {
  .inhalt { padding: 12rem 2rem 4rem; }
  .inhalt .kopf { padding: 2.4rem; }
  .buchtitel { font-size: 4.6rem; }
  .lese { padding: 12rem 2.4rem 2rem; }
  .knoepfe { gap: 1rem; flex-wrap: wrap; row-gap: 1.6rem; }
}
@media (prefers-reduced-motion: reduce) { * { transition: none !important; animation: none !important; } }
`;


/**
 * @typedef {{ text: string, sprich?: string, bild?: string, szene?: any[], frage?: boolean }} Seite
 * @typedef {{ titel: string, seiten: Seite[] }} Kapitel
 * @typedef {{ id: string, titel: string, art: string, klasse: number, kulisse?: string, seiten?: Seite[], kapitel?: Kapitel[] }} Geschichte
 * @typedef {{ kapitel: number, seite: number, fertig: number[] }} BuchStand
 */

/**
 * Teilt einen Absatz in Sätze: nach . ! ? … (auch mit schließendem Anführungszeichen), wenn danach ein Großbuchstabe
 * oder ein öffnendes Anführungszeichen folgt. „z. B. die …“ bleibt zusammen (danach klein).
 * @param {string} absatz
 * @returns {string[]}
 */
export function saetze(absatz) {
  return absatz.split(/(?<=[.!?…][“”"»«)]?)\s+(?=[„"»«(A-ZÄÖÜ])/u).map((t) => t.trim()).filter(Boolean);
}

const weniger = () => {
  try { return matchMedia("(prefers-reduced-motion: reduce)").matches; } catch { return false; }
};

export class LsGeschichte extends HTMLElement {
  static observedAttributes = ["src"];

  constructor() {
    super();
    const w = this.attachShadow({ mode: "open" });
    w.innerHTML = `<style>${GRUND_CSS}${CSS}</style>
      <div class="buch"><div class="inhalt" hidden>
        <div class="kopf">
          <h2 class="buchtitel"></h2>
          <div class="wahl" role="group" aria-label="Wie lesen?">
            <ls-knopf class="wahl-vorlesen" symbol="vorlesen.svg" wort="Vorlesen" groesse="klein" stumm></ls-knopf>
            <ls-knopf class="wahl-selbst" symbol="buch.svg" wort="Selbst lesen" groesse="klein" stumm></ls-knopf>
          </div>
          <ls-knopf class="weiterlesen" art="haupt" symbol="buch.svg" wort="Weiterlesen" stumm hidden></ls-knopf>
        </div>
        <div class="karten"></div>
      </div><div class="blatt">
        <div class="rahmen" part="bild"><div class="figuren"></div><span class="erzeugt" hidden>Bild erzeugt</span></div>
        <div class="lese">
          <ls-knopf class="zum-inhalt" symbol="inhalt.svg" name="Inhalt" groesse="seite" stumm hidden></ls-knopf>
          <ls-knopf class="vorlesen" symbol="vorlesen.svg" wort="Vorlesen" name="Vorlesen" groesse="seite" stumm></ls-knopf>
          <div class="textfeld"><h2 class="seitentitel ui" hidden></h2><div class="text" aria-live="polite"></div></div>
          <div class="startwahl" hidden>
            <ls-knopf class="waehle-vorlesen" art="haupt" symbol="vorlesen.svg" wort="Vorlesen" stumm></ls-knopf>
            <ls-knopf class="waehle-selbst" symbol="buch.svg" wort="Selbst lesen" stumm></ls-knopf>
          </div>
          <div class="knoepfe">
            <ls-knopf class="zurueck" symbol="zurueck.svg" name="Zurück" groesse="seite" stumm></ls-knopf>
            <div class="punkte" aria-hidden="true"></div>
            <div class="rechts">
              <ls-knopf class="weiter" art="haupt" symbol="weiter.svg" wort="Weiter" hinten groesse="seite" stumm></ls-knopf>
              <ls-knopf class="fertig" art="haupt" symbol="fertig.svg" wort="Fertig" groesse="seite" stumm hidden></ls-knopf>
              <ls-knopf class="naechstes" art="haupt" symbol="buch.svg" wort="Weiter" groesse="seite" stumm hidden></ls-knopf>
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
    this.weiterEl = q(".weiter");
    this.seitentitelEl = q(".seitentitel");
    this.fertigEl = q(".fertig");
    this.punkteEl = q(".punkte");
    this.startwahlEl = q(".startwahl");
    this.inhaltEl = q(".inhalt");
    this.blattEl = q(".blatt");
    this.kartenEl = q(".karten");
    this.weiterlesenEl = q(".weiterlesen");
    this.naechstesEl = q(".naechstes");
    this.zumInhaltEl = q(".zum-inhalt");
    this.wahlEl = q(".wahl");
    /** Sachbuch: aufgeschlagenes Kapitel (-1 = Inhaltsverzeichnis); ohne Kapitel immer -1. */
    this.kapitel = -1;
    /** @type {Seite[]} die Seiten, die gerade gelesen werden (Geschichte oder Kapitel) */
    this.liste = [];
    /** @type {BuchStand} Lesestand des Sachbuchs (setzeStand von der Seite, Ereignis „stand“ zurück) */
    this.stand = { kapitel: 0, seite: 0, fertig: [] };
    this.hatStand = false;
    /** @type {{ id: string, name: string, grund: string, tief: string, svg: string } | null} */
    this.kulisse = null;
    /** @type {"vorlesen" | "selbst" | null} null = noch nicht gewählt */
    this.modus = null;
    /** Vorlesemodus angehalten (Tipp des Kindes); bleibt beim Blättern, bis das Kind „Weiterlesen“ tippt. */
    this.angehalten = false;
    /** Wie oft eine Seite vorgelesen wurde (Prüfschnittstelle). */
    this.gelesen = 0;
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
    this.naechstesEl.addEventListener("click", () => this.oeffne(this.kapitel + 1));
    this.zumInhaltEl.addEventListener("click", () => this.zeigeInhalt());
    this.weiterlesenEl.addEventListener("click", () => this.oeffne(this.stand.kapitel, this.stand.seite));
    q(".wahl-vorlesen").addEventListener("click", () => this.setzeModus("vorlesen"));
    q(".wahl-selbst").addEventListener("click", () => this.setzeModus("selbst"));
    /** @type {Element | null} */
    this.leiste = null;
    this.beiTon = (/** @type {Event} */ e) => {
      const an = /** @type {CustomEvent} */ (e).detail?.an !== false;
      if (this.istBuch) {
        // Sachbuch: Ton aus → Selbst lesen, die Wahl verschwindet; Ton an → die Wahl ist wieder da
        this.wahlEl.hidden = !an;
        if (!an) { clearTimeout(this.autoTimer); this.setzeModus("selbst"); }
        return;
      }
      if (an || this.modus === "selbst") return;
      clearTimeout(this.autoTimer);
      this.setzeAngehalten(false);
      if (this.modus === null) { this.modus = "selbst"; this.zeigeWahl(false); this.zeigeText(); }
      else this.modus = "selbst";
    };
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
  get seiten() { return this.liste.length; }
  get kapitelZahl() { return Array.isArray(this.daten?.kapitel) ? this.daten.kapitel.length : 0; }
  get istBuch() { return this.kapitelZahl > 0; }

  connectedCallback() {
    window.addEventListener("keydown", this.beiTaste);
    // Ton aus in der Leiste: nichts blättert mehr stumm von selbst – es gilt „Selbst lesen“.
    this.leiste = document.querySelector("ls-leiste");
    this.leiste?.addEventListener("ton", this.beiTon);
    const el = this;
    if (testbetrieb()) {
      /** @type {any} */ (window).lsGeschichte = {
        get seite() { return el.seite; },
        get seiten() { return el.seiten; },
        get weiterBereit() { return el.weiterBereit; },
        get modus() { return el.modus; },
        get angehalten() { return el.angehalten; },
        get gelesen() { return el.gelesen; },
        get frageSeite() { return el.liste.findIndex((s) => s.frage === true); },
        get kapitel() { return el.kapitel; },
        get kapitelZahl() { return el.kapitelZahl; },
        get stand() { return el.stand; },
        oeffne: (/** @type {number} */ k, /** @type {number} */ s = 0) => el.oeffne(k, s),
        inhalt: () => el.zeigeInhalt(),
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
    this.leiste?.removeEventListener("ton", this.beiTon);
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
      const buch = Array.isArray(g?.kapitel) && g.kapitel.length && g.kapitel.every((k) => Array.isArray(k?.seiten) && k.seiten.length);
      if (!g || (!buch && (!Array.isArray(g.seiten) || !g.seiten.length))) throw new Error("keine Seiten");
      this.basis = url;
      await Promise.all([this.ladeBausteine(g), this.ladeKulisse(g)]);
      this.daten = g;
      if (buch) {
        // Sachbuch: Inhaltsverzeichnis; bei Ton an ist „Vorlesen“ vorgewählt (Vorlesebuch, Christian 2026-11-15)
        this.modus = (await this.tonAn()) ? "vorlesen" : "selbst";
        this.wahlEl.hidden = this.modus === "selbst";
        this.classList.add("buch-modus");
        this.zeigeInhalt();
      } else {
        this.liste = /** @type {Seite[]} */ (g.seiten);
        this.punkteEl.replaceChildren(...this.liste.map(() => document.createElement("i")));
        this.modus = (await this.tonAn()) ? null : "selbst";
        this.zeigeWahl(this.modus === null);
        this.zeige(0, 0);
      }
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
    const alle = Array.isArray(g.kapitel) ? g.kapitel.flatMap((k) => k.seiten ?? []) : (g.seiten ?? []);
    const szenen = alle.flatMap((s) => (Array.isArray(s.szene) ? s.szene : []));
    if (!szenen.length) return;
    try { await import("./perlenstab.js"); } catch { /* ohne Baustein bleiben die Perlen weg */ }
    if (szenen.some((b) => b && typeof b.objekt === "string"))
      try { await import("../objekte/objekt.js"); } catch { /* ohne Baustein bleiben die Dinge weg */ }
    if (szenen.some((b) => b && b.figur))
      try { this.R = await import("../runde/runde.js"); } catch { /* ohne Runde bleiben die Kinder weg */ }
  }

  /**
   * Kulisse der Geschichte (rahmen/kulissen/kulissen.json): setzt data-kulisse und --kulisse-grund/-tief am Host.
   * `this.kulisse` ist danach { id, name, grund, tief, svg } oder null (dann bleibt der Nebel).
   * @param {Geschichte} g
   */
  async ladeKulisse(g) {
    this.kulisse = null;
    if (typeof g.kulisse !== "string") return;
    try {
      const liste = new URL("./kulissen/kulissen.json", import.meta.url);
      const r = await fetch(liste);
      const k = (await r.json()).kulissen.find((/** @type {any} */ x) => x.id === g.kulisse);
      if (!k) throw new Error(`unbekannt: ${g.kulisse}`);
      const svg = new URL(`./kulissen/${k.id}.svg`, import.meta.url).href;
      this.kulisse = { ...k, svg };
      this.dataset.kulisse = k.id;
      this.style.setProperty("--kulisse-grund", k.grund);
      this.style.setProperty("--kulisse-tief", k.tief);
      // Hinter Szenen ohne Foto steht die Kulisse in der Bildhälfte (Designsprache §5.5).
      this.style.setProperty("--kulisse-bild", `url("${svg}")`);
    } catch (e) {
      protokoll(`ls-geschichte: Kulisse ${g.kulisse} nicht geladen (${e})`);
    }
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
    if (!g || i < 0 || i >= this.liste.length) return;
    const s = this.liste[i];
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

    // Text (vor der Startwahl auf Seite 1: der Titel)
    const titelSeite = this.modus === null && i === 0 && !this.istBuch;
    this.setzeText(titelSeite ? g.titel : s.text);
    this.textEl.classList.toggle("titel", titelSeite);
    this.zeigeSeitentitel(!titelSeite);
    /** @type {HTMLElement} */ (this.textEl.parentElement).scrollTop = 0;
    if (alt) this.blende(this.textEl, 0, 1);

    // Knöpfe und Punkte
    const letzte = i === this.liste.length - 1;
    const letztesKapitel = !this.istBuch || this.kapitel === this.kapitelZahl - 1;
    this.zurueckEl.classList.toggle("unsichtbar", i === 0);
    this.weiterEl.hidden = letzte;
    this.fertigEl.hidden = !(letzte && letztesKapitel);
    this.naechstesEl.hidden = !(letzte && !letztesKapitel);
    if (!this.naechstesEl.hidden) this.naechstesEl.setAttribute("wort", `Kapitel ${this.kapitel + 2}`);
    this.zumInhaltEl.hidden = !this.istBuch;
    if (this.istBuch) this.merkeStand(i, letzte);
    [...this.punkteEl.children].forEach((p, k) => {
      p.classList.toggle("jetzt", k === i);
      p.classList.toggle("gelesen", k < i);
    });
    this.weiterBereit = !s.frage;
    this.weiterEl.classList.toggle("wartet", !!s.frage);
    const stumm = this.modus === "vorlesen" && this.angehalten;   // angehalten: blättern liest nicht
    if (this.modus === null) { /* Startwahl: noch nichts lesen */ }
    else if (!s.frage) { if (!stumm) this.liesUndBlaettere(); }
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
      if (stumm) frei(); else this.lies().then(frei, frei);
    }
  }

  /**
   * Liest die aufgeschlagene Seite vor (bei Ton an).
   * @returns {Promise<string>}
   */
  async lies() {
    const s = this.liste[this._seite];
    if (!s) return "still";
    const meine = this.nummer;
    if (!(await this.tonAn()) || meine !== this.nummer) return "still";
    if (this.modus === "vorlesen" && this.angehalten) return "abgebrochen";
    const text = typeof s.sprich === "string" && s.sprich ? s.sprich : s.text;
    this.gelesen += 1;
    return sprich(text);
  }

  /**
   * Startwahl: Vorlesen (blättert von selbst) oder Selbst lesen.
   * @param {"vorlesen" | "selbst"} modus
   */
  waehle(modus) {
    if (this.istBuch) return void this.setzeModus(modus);
    if (!this.daten || this.modus !== null) return;
    this.modus = modus === "vorlesen" ? "vorlesen" : "selbst";
    this.zeigeWahl(false);
    this.setzeAngehalten(false);
    this.zeigeText();
    this.liesUndBlaettere();
  }

  /**
   * Text der Seite: Absätze (Leerzeile im Text) als eigene <p>.
   * @param {string} text
   */
  setzeText(text) {
    const absaetze = String(text ?? "").split(/\n\s*\n/).map((t) => t.trim()).filter(Boolean);
    // Kurzgeschichte: ein Satz je Zeile (Designsprache); Sachbuch: Absätze, wie geschrieben.
    const zeilen = this.istBuch ? absaetze : absaetze.flatMap(saetze);
    this.textEl.replaceChildren(...zeilen.map((t) => { const p = document.createElement("p"); p.textContent = t; return p; }));
  }

  /**
   * Titel über dem Text: bei der Kurzgeschichte ihr Titel, im Sachbuch der Titel des Kapitels.
   * @param {boolean} an
   */
  zeigeSeitentitel(an) {
    const titel = this.istBuch ? this.daten?.kapitel?.[this.kapitel]?.titel : this.daten?.titel;
    this.seitentitelEl.textContent = titel ?? "";
    this.seitentitelEl.hidden = !an || !titel;
  }

  /** Sachbuch: Vorlesen oder Selbst lesen (im Inhaltsverzeichnis umschaltbar). @param {"vorlesen" | "selbst"} modus */
  setzeModus(modus) {
    this.modus = modus === "vorlesen" ? "vorlesen" : "selbst";
    this.setzeAngehalten(false);
    for (const [k, m] of [[".wahl-vorlesen", "vorlesen"], [".wahl-selbst", "selbst"]]) {
      const b = /** @type {HTMLElement} */ (this.wahlEl.querySelector(k));
      b.setAttribute("aria-pressed", String(this.modus === m));
      if (this.modus === m) b.setAttribute("art", "haupt"); else b.removeAttribute("art");
    }
  }

  /**
   * Lesestand von außen (geschichte.html, aus dem Lernstand). @param {BuchStand | null} st
   */
  setzeStand(st) {
    if (!st) return;
    const k = Math.min(Math.max(0, st.kapitel | 0), Math.max(0, this.kapitelZahl - 1));
    const n = this.daten?.kapitel?.[k]?.seiten.length ?? 1;
    // Kommt der Stand erst, wenn schon ein Kapitel offen ist: das offene Kapitel bleibt, fertige Kapitel werden vereinigt.
    const fertig = [...new Set([...this.stand.fertig, ...(st.fertig ?? [])])].sort((a, b) => a - b);
    this.stand = this.kapitel >= 0 ? { ...this.stand, fertig }
      : { kapitel: k, seite: Math.min(Math.max(0, st.seite | 0), n - 1), fertig };
    this.hatStand = true;
    if (this.kapitel < 0) this.zeigeInhalt();
  }

  /** Merkt den Stand und meldet ihn (Ereignis „stand“). @param {number} seite @param {boolean} letzte */
  merkeStand(seite, letzte) {
    const fertig = new Set(this.stand.fertig);
    if (letzte) fertig.add(this.kapitel);
    this.stand = { kapitel: this.kapitel, seite, fertig: [...fertig].sort((a, b) => a - b) };
    this.hatStand = true;
    this.dispatchEvent(new CustomEvent("stand", { bubbles: true, composed: true, detail: { ...this.stand, kapitelZahl: this.kapitelZahl } }));
  }

  /** Sachbuch: Inhaltsverzeichnis mit Kapitelkarten. */
  zeigeInhalt() {
    const g = this.daten;
    if (!g?.kapitel) return;
    clearTimeout(this.autoTimer);
    clearTimeout(this.ruheTimer);
    stille();
    this.nummer += 1;
    this.kapitel = -1;
    this.liste = [];
    this._seite = -1;
    this.setzeModus(this.modus ?? "selbst");
    /** @type {HTMLElement} */ (this.inhaltEl.querySelector(".buchtitel")).textContent = g.titel;
    const weiter = this.hatStand && this.stand.fertig.length < this.kapitelZahl && (this.stand.kapitel > 0 || this.stand.seite > 0);
    this.weiterlesenEl.hidden = !weiter;
    if (weiter) this.weiterlesenEl.setAttribute("wort", `Weiterlesen: Kapitel ${this.stand.kapitel + 1}`);
    this.kartenEl.replaceChildren(...g.kapitel.map((k, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "kapitelkarte";
      b.classList.toggle("gelesen", this.stand.fertig.includes(i));
      const bild = k.seiten[0]?.bild;
      b.innerHTML = `<span class="karte-bild">${bild ? `<img alt="" src="${new URL(bild, this.basis).href}">` : ""}</span>
        <span class="karte-nr">Kapitel ${i + 1}</span><span class="karte-titel"></span><span class="haken" aria-hidden="true">✓</span>`;
      /** @type {HTMLElement} */ (b.querySelector(".karte-titel")).textContent = k.titel;
      b.setAttribute("aria-label", `Kapitel ${i + 1}: ${k.titel}${this.stand.fertig.includes(i) ? ", gelesen" : ""}`);
      b.addEventListener("click", () => this.oeffne(i));
      return b;
    }));
    this.inhaltEl.hidden = false;
    this.blattEl.hidden = true;
    this.erzeugtEl.hidden = true;
  }

  /**
   * Sachbuch: schlägt ein Kapitel auf.
   * @param {number} k Kapitel (ab 0)
   * @param {number} [seite]
   */
  oeffne(k, seite = 0) {
    const g = this.daten;
    if (!g?.kapitel || k < 0 || k >= g.kapitel.length) return;
    this.kapitel = k;
    this.liste = g.kapitel[k].seiten;
    this.punkteEl.replaceChildren(...this.liste.map(() => document.createElement("i")));
    this.inhaltEl.hidden = true;
    this.blattEl.hidden = false;
    this.setzeAngehalten(false);
    this.zeige(Math.min(Math.max(0, seite), this.liste.length - 1), 0);
  }

  /** Startwahl zeigen oder verbergen (mit ihr: keine Punkte, kein Weiter). @param {boolean} an */
  zeigeWahl(an) {
    this.startwahlEl.hidden = !an;
    this.startwahlEl.parentElement?.closest(".lese")?.classList.toggle("waehlt", an);
  }

  /** Nach der Startwahl: statt des Titels der Text der Seite. */
  zeigeText() {
    const s = this.liste[this._seite];
    if (!s) return;
    this.setzeText(s.text);
    this.textEl.classList.remove("titel");
    this.zeigeSeitentitel(true);
    this.blende(this.textEl, 0, 1);
  }

  /** Hält den Vorlesemodus an bzw. liest weiter (Tipp des Kindes). */
  halte() {
    if (this.modus !== "vorlesen") return;
    this.setzeAngehalten(!this.angehalten);
    clearTimeout(this.autoTimer);
    if (this.angehalten) stille();
    else this.liesUndBlaettere();
  }

  /**
   * Angehalten ja/nein – mit sichtbarem und vorlesbarem Zustand des Knopfs („Weiterlesen“, aria-pressed).
   * @param {boolean} an
   */
  setzeAngehalten(an) {
    this.angehalten = an;
    this.vorlesenEl.classList.toggle("angehalten", an);
    this.vorlesenEl.setAttribute("name", an ? "Weiterlesen" : "Vorlesen");
    this.vorlesenEl.setAttribute("wort", an ? "Weiterlesen" : "Vorlesen");
    if (this.modus === "vorlesen") this.vorlesenEl.setAttribute("aria-pressed", String(an));
    else this.vorlesenEl.removeAttribute("aria-pressed");
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
    const s = this.liste[this._seite];
    // Abgebrochen, ohne dass das Kind geblättert hat (z. B. Systemstimme unterbrochen): sichtbar anhalten statt hängen.
    if (ergebnis === "abgebrochen") return void this.setzeAngehalten(true);
    if (!s || s.frage || this._seite >= this.liste.length - 1) return;   // nie über das Kapitelende hinaus
    const warte = ergebnis === "still" ? Math.max(LESEZEIT_MIN_MS, s.text.length * LESEZEIT_MS) : PAUSE_MS;
    clearTimeout(this.autoTimer);
    this.autoTimer = setTimeout(() => {
      if (meine !== this.nummer || this.angehalten || this.modus !== "vorlesen") return;
      this.weiter();
    }, warte);
  }

  weiter() {
    if (!this.daten || !this.weiterBereit || (this.istBuch && this.kapitel < 0)) return;
    if (this.modus === null) { this.modus = "selbst"; this.zeigeWahl(false); this.zeigeText(); }
    if (this._seite >= this.liste.length - 1) return;
    this.zeige(this._seite + 1, 1);
  }

  zurueck() {
    if (!this.daten || this._seite <= 0 || (this.istBuch && this.kapitel < 0)) return;
    this.zeige(this._seite - 1, -1);
  }

  beende() {
    if (!this.daten || this._seite !== this.liste.length - 1) return;
    if (this.istBuch && this.kapitel !== this.kapitelZahl - 1) return;
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
