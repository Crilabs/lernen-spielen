// <ls-gekonnt spiel="zahlenpost"></ls-gekonnt>
// Bildschirm „Gekonnt“ (Christian, 2026-11-16): Hat die Lernsteuerung in einer Runde ein Thema als gekonnt verbucht
// (runde().ende() → gekonnt), zeigt das Spiel statt der Pause diese Ebene. Die Figur des Spiels freut sich mit dem
// Kind, die Stimme sagt, was es jetzt kann und wo es das Thema findet.
//
// Die freudigste und strahlendste Ansicht der App (Christian, 2026-11-16: „Hier darf gefeiert werden. Das ist die
// eigentliche Motivation – ich kann etwas.“). Sie ist eine eigene Welt (Schicht 3, Verläufe erlaubt): ein Sonnenhimmel
// mit Strahlen, die sich langsam um die Figur drehen, eine bunte Wimpelkette, einmal Konfetti in den Farben der Perlen
// und Fächer, eine kurze helle Fanfare. Die ganze Runde feiert: die Figur des Spiels groß im Licht, die anderen drei
// Kinder kleiner daneben, alle jubeln. Rechts der Satz als Bild: der Name des Themas groß in Tinte, darunter
// „kannst du!“. Keine Zahl, kein Stern zum Sammeln, kein Zähler (N5, N8). Unten drei gleich gestaltete Papierknöpfe:
// Weiter, Alle Spiele, Was ich schon kann – keiner hervorgehoben, Aufhören ist gleichwertig (N6); nichts geht von selbst.
//
// zeige({ thema: { name, sprich }, figur }) → Promise<"weiter">; Alle Spiele und Was ich schon kann sind Links
// (linkKlick in lernspiel.js speichert vorher). Gesprochen wird nur bei Ton an:
//   „<sprich> kannst du.“ (kern/saetze.js, aufgenommen für jedes Thema) – „<Figur> freut sich mit dir.“ –
//   „Du findest das Thema jetzt bei: Was ich schon kann.“
// Bei prefers-reduced-motion steht alles still (B3), Strahlen, Wimpel und Konfetti bleiben als Bild.

import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { sprich } from "../kern/stimme.js";
import { gekonntSatz } from "../kern/saetze.js";
import { GRUND_CSS, MASSE, definiere } from "./stil.js";
import { findeSpiel } from "./knopf.js";
import * as Runde from "../runde/runde.js";

const SYMBOLE = new URL("../symbole/", import.meta.url).href;
const HAUS_HREF = new URL("../index.html", import.meta.url).href;
const REGAL_HREF = new URL("../regal.html", import.meta.url).href;
/** Abstand der Knöpfe vom unteren Rand (rem), wie in der Pause. */
const UNTEN = 6;

/** Wie die Figur jubelt (Timo im Rollstuhl mit Tricks wie im Rollstuhlsport, figuren.md). */
/** @type {Record<string, string[]>} */
const JUBEL = { timo: ["wheelie-freihaendig", "pirouette"] };
const JUBEL_VORGABE = ["huepfen", "huepfen"];

/** Der Satz zur Figur; jede Fassung steht als feste Zeichenkette in sprich() (für `npm run audio`). */
const FREUT_SICH = {
  ela: () => sprich("Ela freut sich mit dir."),
  kofi: () => sprich("Kofi freut sich mit dir."),
  lena: () => sprich("Lena freut sich mit dir."),
  timo: () => sprich("Timo freut sich mit dir."),
};

/** Farben der Feier: Perlen und Fächer der Farbwelt (grundsaetze-bilder 6.2), hier nur als Schmuck der Welt. */
const FEST = ["#E5484D", "#3FA34D", "#F4A3C0", "#F7D038", "#6CB8F0", "#9B5DE5", "#D9A520", "#F06BB0", "#3DB98F", "#4C9BD1", "#F08A4B", "#8C6FE0"];
/** Die Kinder der Runde (figuren.md); die Figur des Spiels steht groß, die anderen feiern daneben mit. */
const RUNDE = ["ela", "kofi", "lena", "timo"];

/** Strahlen um die Sonne: 16 Keile, abwechselnd hell und heller. */
const STRAHLEN = Array.from({ length: 16 }, (_, i) => {
  const w = (Math.PI * 2) / 16;
  const a0 = i * w - w * 0.32;
  const a1 = i * w + w * 0.32;
  const r = 140;
  const p = (/** @type {number} */ a) => `${(100 + Math.cos(a) * r).toFixed(1)},${(100 + Math.sin(a) * r).toFixed(1)}`;
  return `<polygon points="100,100 ${p(a0)} ${p(a1)}" fill="#FFFFFF" fill-opacity="${i % 2 ? 0.32 : 0.55}"/>`;
}).join("");

/** Wimpelkette quer über den Himmel (Durchhang als Bogen). */
const WIMPEL = (() => {
  const n = 15;
  let aus = `<path d="M-10 18 Q 960 120 1930 18" fill="none" stroke="#3B2A6B" stroke-width="3"/>`;
  for (let i = 0; i < n; i++) {
    const t = (i + 0.5) / n;
    const x = -10 + t * 1940;
    const y = (1 - t) * (1 - t) * 18 + 2 * (1 - t) * t * 120 + t * t * 18;
    aus += `<polygon points="${(x - 34).toFixed(0)},${(y + 1).toFixed(0)} ${(x + 34).toFixed(0)},${(y + 1).toFixed(0)} ${x.toFixed(0)},${(y + 78).toFixed(0)}" fill="${FEST[(i * 5) % FEST.length]}" stroke="#3B2A6B" stroke-width="3" stroke-linejoin="round"/>`;
  }
  return aus;
})();

const CSS = `
:host { position: fixed; inset: 0; z-index: 100; display: block; overflow: hidden;
  background: radial-gradient(circle at 28% 44%, #FFF8DC 0, #FFE58A 38%, #FFD45A 72%, #F9C23C 110%); }
:host(:not([offen])) { display: none; }
.wimpel { position: absolute; left: 0; top: 0; width: 100%; height: 14rem; z-index: 2; }
.feld { position: absolute; top: 0; bottom: 0; left: max(0rem, calc((100vw - 192rem) / 2)); width: min(100vw, 192rem); }

/* Die Sonne hinter der Figur: Strahlen, die sich langsam drehen, darin die leuchtende Scheibe. */
.strahlen { position: absolute; left: -24rem; top: -32rem; width: 150rem; height: 150rem; animation: drehen 80s linear infinite; }
.sonne { position: absolute; left: 17rem; top: 9rem; width: 68rem; height: 68rem; border-radius: 50%; background: var(--ls-sonne);
  box-shadow: 0 0 6rem 3rem rgba(255, 217, 90, 0.9), 0 0 18rem 10rem rgba(255, 233, 166, 0.8); }
@keyframes drehen { to { transform: rotate(360deg); } }

/* Alle stehen auf einem Boden (Füße und Räder bei etwa 67 rem), die anderen Kinder etwas kleiner. */
.mit { position: absolute; top: 36rem; width: 32rem; height: 38rem; }
.mit svg, .figur svg { width: 100%; height: 100%; display: block; overflow: visible; }
.mit.m1 { left: -3rem; }
.mit.m2 { left: 70rem; }
.mit.m3 { left: 90rem; top: 40rem; width: 28rem; height: 34rem; }
.figur { position: absolute; left: 21rem; top: 12rem; width: 60rem; height: 66rem; }
.boden { position: absolute; left: 26rem; top: 65rem; width: 50rem; height: 3.6rem; border-radius: 50%; background: rgba(59, 42, 107, 0.16); }

.satz { position: absolute; left: 112rem; right: 6rem; top: 18rem; margin: 0; color: var(--ls-tinte); }
.thema { display: block; font: 800 9.2rem/1.04 var(--ls-schrift-oberflaeche, "Andika"), sans-serif; letter-spacing: -0.015em;
  text-wrap: balance; overflow-wrap: anywhere; }
.kannst { display: inline-block; margin-top: 2.6rem; padding: 0.6rem 3.2rem 1.2rem; border-radius: 99rem; background: var(--ls-tinte);
  color: var(--ls-sonne); font: 800 7.2rem/1 var(--ls-schrift-oberflaeche, "Andika"), sans-serif; transform: rotate(-3deg); transform-origin: 0 50%; }

.konfetti { position: absolute; inset: 0; pointer-events: none; }
.konfetti i { position: absolute; top: -4rem; display: block; width: 1.6rem; height: 2.6rem; border-radius: 0.3rem; }
.konfetti i.rund { width: 1.8rem; height: 1.8rem; border-radius: 50%; }

.aktionen { position: absolute; left: 0; right: 0; bottom: calc(${UNTEN}rem + env(safe-area-inset-bottom, 0rem));
  display: flex; justify-content: center; align-items: center; gap: 6rem; flex-wrap: wrap; row-gap: ${MASSE.rand}rem; }
.aktionen:focus { outline: none; }
a.knopf { --ls-knopf: ${MASSE.pilleGross}rem; }

@media (max-aspect-ratio: 3/2) {
  .strahlen { left: -34rem; }
  .sonne { left: 7rem; width: 60rem; height: 60rem; }
  .figur { left: 10rem; width: 54rem; height: 60rem; }
  .feld > :not(.aktionen):not(.satz) { translate: 0 -6rem; }
  .boden { left: 14rem; top: 60rem; }
  .mit.m1 { left: -8rem; }
  .mit.m2 { left: 56rem; }
  .mit.m3 { left: 74rem; }
  .satz { left: 92rem; right: 4rem; top: 18rem; }
  .thema { font-size: 7.6rem; }
  .kannst { font-size: 6rem; }
  .aktionen { gap: 3.2rem; }
}
@media (prefers-reduced-motion: reduce) { .strahlen { animation: none; } .konfetti { display: none; } }
`;

/**
 * Kurze helle Fanfare (Web Audio, leise, etwa 1 s), nur bei Ton an: ein aufsteigender Dur-Dreiklang und ein Schluss.
 * @param {HTMLElement} host
 */
async function fanfare(host) {
  try {
    await ladeEinstellungen();
  } catch {
    // Ton gilt als an
  }
  const spiel = findeSpiel(host);
  if (spiel && einstellung(`ton.${spiel}`, true) === false) return;
  try {
    const a = new AudioContext();
    const t0 = a.currentTime + 0.05;
    [[523.25, 0], [659.25, 0.13], [783.99, 0.26], [1046.5, 0.42]].forEach(([hz, t], i) => {
      const o = a.createOscillator();
      const g = a.createGain();
      o.type = "triangle";
      o.frequency.value = hz;
      const d = i === 3 ? 0.7 : 0.18;
      g.gain.setValueAtTime(0.0001, t0 + t);
      g.gain.exponentialRampToValueAtTime(0.09, t0 + t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + t + d);
      o.connect(g).connect(a.destination);
      o.start(t0 + t);
      o.stop(t0 + t + d + 0.05);
    });
    setTimeout(() => a.close().catch(() => {}), 2000);
  } catch {
    // ohne Web Audio: still
  }
}

/** @param {string} href @param {string} symbol @param {string} wort @param {string} klasse */
const link = (href, symbol, wort, klasse) =>
  `<a class="knopf ${klasse}" href="${href}" tabindex="0" aria-label="${wort}" draggable="false"><span class="form neben pille"><span class="zeichen"><img alt="" draggable="false" src="${SYMBOLE}${symbol}"></span><span class="wort">${wort}</span></span></a>`;

export class LsGekonnt extends HTMLElement {
  static observedAttributes = ["spiel"];

  constructor() {
    super();
    const wurzel = this.attachShadow({ mode: "open" });
    wurzel.innerHTML = `<style>${GRUND_CSS}${CSS}</style>
      <svg class="wimpel" viewBox="0 0 1920 140" preserveAspectRatio="none" aria-hidden="true">${WIMPEL}</svg>
      <div class="feld">
        <svg class="strahlen" viewBox="0 0 200 200" aria-hidden="true">${STRAHLEN}</svg>
        <div class="sonne" aria-hidden="true"></div>
        <div class="mit m1" aria-hidden="true"></div>
        <div class="mit m2" aria-hidden="true"></div>
        <div class="mit m3" aria-hidden="true"></div>
        <div class="boden" aria-hidden="true"></div>
        <div class="figur" aria-hidden="true"></div>
        <p class="satz" role="status"><span class="thema"></span><span class="kannst">kannst du!</span></p>
        <div class="aktionen" tabindex="-1">
          <ls-knopf class="weiter" symbol="zurueck.svg" name="Weiter" wort="Weiter" groesse="gross" gespiegelt></ls-knopf>
          ${link(HAUS_HREF, "haus.svg", "Alle Spiele", "alle")}
          ${link(REGAL_HREF, "koennen.svg", "Was ich schon kann", "koennen")}
        </div>
      </div>
      <div class="konfetti" aria-hidden="true"></div>`;
    this.sonne = /** @type {HTMLElement} */ (wurzel.querySelector(".sonne"));
    this.konfetti = /** @type {HTMLElement} */ (wurzel.querySelector(".konfetti"));
    this.mit = /** @type {HTMLElement[]} */ ([...wurzel.querySelectorAll(".mit")]);
    this.figurFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".figur"));
    this.themaFeld = /** @type {HTMLElement} */ (wurzel.querySelector(".thema"));
    this.aktionen = /** @type {HTMLElement} */ (wurzel.querySelector(".aktionen"));
    this.weiter = /** @type {HTMLElement} */ (wurzel.querySelector("ls-knopf.weiter"));
    /** @type {((w: "weiter") => void) | null} */
    this._loese = null;
    /** @type {Promise<"weiter"> | null} */
    this._offen = null;
    this._nr = 0;
    this.weiter.addEventListener("click", () => this.beende());
  }

  connectedCallback() {
    this.attributeChangedCallback();
  }

  attributeChangedCallback() {
    const spiel = this.getAttribute("spiel");
    if (spiel) this.weiter.setAttribute("spiel", spiel);
  }

  /**
   * @param {{ thema: { name: string, sprich?: string }, figur?: string }} o
   * @returns {Promise<"weiter">}
   */
  zeige({ thema, figur = "timo" }) {
    if (this._offen) return this._offen;
    const nr = ++this._nr;
    this.themaFeld.textContent = thema.name;
    this.figurFeld.innerHTML = Runde.zeichne(figur, { haltung: "freuen-gross", ansicht: "dreiviertel" });
    const andere = RUNDE.filter((k) => k !== figur);
    this.mit.forEach((feld, i) => { feld.innerHTML = andere[i] ? Runde.zeichne(andere[i], { haltung: "freuen-gross", ansicht: "dreiviertel" }) : ""; });
    this._offen = new Promise((ok) => { this._loese = ok; });
    this.setAttribute("offen", "");
    this.aktionen.focus({ preventScroll: true });
    this.bewege(figur, nr);
    this.spricht(thema, figur, nr);
    return this._offen;
  }

  /** Die Sonne geht auf, Konfetti fällt einmal, die Figur jubelt, die anderen hüpfen mit (bei weniger Bewegung: still). */
  async bewege(/** @type {string} */ figur, /** @type {number} */ nr) {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    this.sonne.animate?.([{ transform: "scale(0.3)", opacity: 0 }, { transform: "scale(1.08)", opacity: 1, offset: 0.7 }, { transform: "scale(1)", opacity: 1 }], { duration: 900, easing: "ease-out" });
    this.streueKonfetti();
    fanfare(this);
    const svg = this.figurFeld.querySelector("svg");
    const mit = this.mit.map((f) => f.querySelector("svg")).filter(Boolean);
    await new Promise((ok) => setTimeout(ok, 400));
    // Die anderen feiern versetzt mit (je zweimal hüpfen), unabhängig von der großen Figur.
    mit.forEach((m, i) => {
      const st = Runde.steuere(/** @type {SVGSVGElement} */ (m), { tempo: 0.8 });
      const kind = RUNDE.filter((k) => k !== figur)[i];
      const folge = JUBEL[kind] ?? JUBEL_VORGABE;
      (async () => {
        await new Promise((ok) => setTimeout(ok, 250 + i * 330));
        for (const b of folge) {
          if (nr !== this._nr) return;
          try { await st.bewegung(b); } catch { return; }
        }
      })();
    });
    if (!svg) return;
    const s = Runde.steuere(svg, { tempo: 0.8 });
    for (const b of [...(JUBEL[figur] ?? JUBEL_VORGABE), (JUBEL[figur] ?? JUBEL_VORGABE)[0]]) {
      if (nr !== this._nr || !this._offen) return;
      try {
        await s.bewegung(b);
      } catch {
        return; // Bewegung fehlt für diese Figur: sie steht einfach fröhlich da
      }
    }
  }

  /** Einmal Konfetti: etwa 90 Schnipsel fallen in 3–5 s durchs Bild und bleiben nicht liegen. */
  streueKonfetti() {
    this.konfetti.replaceChildren();
    for (let i = 0; i < 90; i++) {
      const el = document.createElement("i");
      if (i % 3 === 0) el.className = "rund";
      el.style.left = `${(Math.random() * 100).toFixed(1)}%`;
      el.style.background = FEST[i % FEST.length];
      this.konfetti.append(el);
      const dauer = 3000 + Math.random() * 2200;
      const dx = (Math.random() - 0.5) * 24;
      const dreh = (Math.random() - 0.5) * 1440;
      el.animate?.([
        { transform: "translate(0, 0) rotate(0deg)", opacity: 1 },
        { transform: `translate(${dx}rem, 70rem) rotate(${dreh * 0.6}deg)`, opacity: 1, offset: 0.7 },
        { transform: `translate(${dx * 1.4}rem, 118rem) rotate(${dreh}deg)`, opacity: 0 },
      ], { duration: dauer, delay: Math.random() * 900, easing: "cubic-bezier(0.25, 0.4, 0.5, 1)", fill: "both" });
    }
  }

  /** Spricht die drei Sätze nacheinander (die Stimme lässt dazwischen Ruhe), nur bei Ton an. */
  async spricht(/** @type {{ name: string, sprich?: string }} */ thema, /** @type {string} */ figur, /** @type {number} */ nr) {
    try {
      await ladeEinstellungen();
    } catch {
      // Ton gilt als an
    }
    const spiel = findeSpiel(this);
    if (spiel && einstellung(`ton.${spiel}`, true) === false) return;
    if (nr !== this._nr) return;
    sprich(gekonntSatz(thema.sprich || thema.name));
    FREUT_SICH[/** @type {keyof typeof FREUT_SICH} */ (figur)]?.();
    sprich("Du findest das Thema jetzt bei: Was ich schon kann.");
  }

  beende() {
    const loese = this._loese;
    if (!loese) return;
    this._loese = null;
    this._offen = null;
    this._nr++;
    this.removeAttribute("offen");
    loese("weiter");
  }
}

definiere("ls-gekonnt", LsGekonnt);
