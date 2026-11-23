// M04 Blitzblick (Idee: docs/spiele/mathe/m04-blitzblick.md). Kofi hebt kurz den Deckel seines Glases: Glühwürmchen
// leuchten als Zehnerfeld (zwei Reihen zu fünf) auf, dann schwirren sie durcheinander. Das Kind tippt auf Kofis Perlenschnur
// die Perle, bis zu der geschoben wird (oder wischt bis dorthin); die Perlen rutschen zu Kofi, die Glühwürmchen setzen sich
// Fünfer für Fünfer auf je eine Perle, die Perlen glühen in ihrer Montessori-Farbe, und Kofi hängt die Kette an die
// Lichterschnur. Passt es nicht, sucht ein Glühwürmchen eine Perle, oder eine Perle bleibt dunkel.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   BÜHNE      Zimmer, Kofi, Glas, Schnur, Lichter, Ketten
//   AUFGABE    eine Aufgabe darstellen, prüfen (die Schnur urteilt), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): Kofi macht es vor, das Kind tippt die vierte Perle
//   RAHMEN     aus der Vorlage; die Lernsteuerung bestimmt die Länge der Runde
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=), dazu im
// Testbetrieb ?bis=<n> (als ginge das Thema bis n: ?bis=20 spielt mit zwei Schnüren und Fertig auf der Tastatur)
// und ?menge=<n> (jede Aufgabe zeigt n Glühwürmchen).

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/gekonnt.js";
import "../../rahmen/knopf.js";
import "../../rahmen/tastatur.js";
import * as Runde from "../../runde/runde.js";
import { LERNFARBE } from "../../rahmen/stil.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { einfuehrungsLauf } from "../../rahmen/einfuehrung-lauf.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { zimmerSvg } from "./zimmer.js";
import { mengeAus, schnuereFuer, felderFuer, mulde, gruppen, wirkung, kandidaten, tippeZiffer, naechsteTaste, SCHNUR, MAX } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const gekonntEl = $("gekonnt");
const welt = $("welt");
const matteEl = $("matte");
const glas = $("glas");
const felderEl = $("felder");
const schnuereEl = $("schnuere");
const eingabeEl = $("eingabe");
const schild = $("schild");
const tastatur = $("tastatur");
const fertigKnopf = $("fertig");
const kettenEl = $("lichterschnur");
const figurenEl = $("figuren");
const kofiEl = $("kofi");
const kofiKoerper = $("kofi-koerper");

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "menge", zahlen: [1, MAX], stufen: ["material", "vorstellung", "kopf"] }];

/** So lange leuchten die Lichter, wenn der Deckel nur kurz aufgeht (Idee §5; einstellbar, nie als Zeitdruck erzählt). */
const ZEIGEN_MS = { vorstellung: 1500, kopf: 1000 };
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Regeln §1: etwa 2,5 s, höchstens 3 s). */
const FOLGE_MAX_MS = 2700;
const NACH_WIRKUNG_MS = 150;
/** Der Wechsel zur Tastatur (Schnur in Kofis Hand, Tastatur klappt auf) dauert so lange; ein Tipp kürzt ab. */
const WECHSEL_MS = 1000;
/** Die Perlen rutschen so lange (0,3 s), dann fliegen die Lichter los. */
const RUTSCH_MS = 320;
/** So lange wartet die Pause längstens auf die letzten Sätze. */
const SATZ_WARTE_MS = 9000;
/** Plätze für Ketten an der Lichterschnur; danach ersetzt eine neue die älteste. */
const KETTEN_PLAETZE = 7;
/** So viele Ketten machen das Zimmer ganz hell. */
const KETTEN_HELL = 8;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Mengen auf einen Blick", aufgaben: ["menge:4", "menge:3", "menge:5", "menge:2"] };

/** Sätze aus Daten (je Zahl ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/**
 * Alle Sätze des Spiels sprechen nacheinander: ein neuer Satz beginnt erst, wenn der vorige zu Ende ist, damit keiner
 * abgeschnitten wird (spielbau.md §8). Ein Tipp des Kindes darf einen Satz abbrechen, das Spiel nie.
 * @type {Promise<any>}
 */
let sprechSchlange = Promise.resolve();
/** Zählt die Tipps des Kindes: ein Satz, der noch nicht begonnen hat und verwerfbar ist, fällt nach einem Tipp weg. */
let tippZaehler = 0;
document.addEventListener("pointerdown", () => { tippZaehler++; }, true);
/** Ruhe zwischen zwei Sätzen (Christian, 2026-11-16: ohne Abstand wirkte die Stimme gehetzt). */
const SATZ_PAUSE_MS = 600;
let satzEnde = -Infinity;
/** @param {() => Promise<any>} sag @param {boolean} [verwerfbar] @returns {Promise<any>} */
function spricht(sag, verwerfbar = false) {
  const tipps = tippZaehler;
  const p = sprechSchlange.catch(() => undefined)
    .then(() => new Promise((ok) => setTimeout(ok, Math.max(0, SATZ_PAUSE_MS - (performance.now() - satzEnde)))))
    .then(() => (verwerfbar && tipps !== tippZaehler ? "still" : sag()))
    .then((e) => {
      if (e !== "still") satzEnde = performance.now();
      return e;
    });
  sprechSchlange = p;
  return p;
}
/** @param {string | undefined} text @param {{ zeigen?: boolean, verwerfbar?: boolean }} [o] */
const sagt = (text, { zeigen = false, verwerfbar = false } = {}) => (text ? spricht(() => blase.sage(text, { zeigen }), verwerfbar) : Promise.resolve("still"));

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). Aufgabe und Rundenanfang: kein Satz. */
const erzaehler = {
  /** Nach Fehlversuch oder Hilfe, wenn es passt. @param {number} n */
  richtig: (n) => sagt(TEXTE?.richtig?.[n], { verwerfbar: true }),
  /** So viele Glühwürmchen haben keine Perle. @param {number} k */
  zuWenig: (k) => sagt(TEXTE?.zuWenig?.[k], { verwerfbar: true }),
  /** So viele Perlen bleiben dunkel. @param {number} k */
  zuViel: (k) => sagt(TEXTE?.zuViel?.[k], { verwerfbar: true }),
  /** Nach einem Fehlversuch ein klarer Auftrag (Christian, 2026-11-16); fällt nach einem Tipp weg. */
  nochmal: () => spricht(() => blase.sage("Versuch es noch einmal."), true),
  /** Hilfe 1: Kofi zeigt die Lichter noch einmal. */
  probe: () => spricht(() => blase.sage("Kofi öffnet das Glas noch einmal.", { zeigen: true })),
  /** Hilfe 2: was die Lichter im Feld zeigen; das Kind tippt selbst. @param {number} n */
  loesung: (n) => sagt(TEXTE?.hilfe2?.[n], { zeigen: true }),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/**
 * Die Sätze der Einführung (docs/spielbau.md §8, Christian 2026-11-16: in Ruhe, als kleine Geschichte). Jeder steht als
 * feste Zeichenkette in blase.sage (für `npm run audio`); jeder Schritt wartet, bis der Satz zu Ende ist.
 */
const einleitung = {
  glas: (/** @type {any} */ o) => spricht(() => blase.sage("Kofi hat Glühwürmchen in seinem Glas.", o)),
  kette: (/** @type {any} */ o) => spricht(() => blase.sage("Er bastelt daraus eine Leuchtkette.", o)),
  deckel: (/** @type {any} */ o) => spricht(() => blase.sage("Gleich hebt er kurz den Deckel.", o)),
  hinschauen: (/** @type {any} */ o) => spricht(() => blase.sage("Schau genau hin.", o)),
  kofiTippt: (/** @type {any} */ o) => spricht(() => blase.sage("Kofi tippt auf die dritte Perle.", o)),
  rutschen: (/** @type {any} */ o) => spricht(() => blase.sage("Drei Perlen rutschen zu ihm.", o)),
  setzen: (/** @type {any} */ o) => spricht(() => blase.sage("Auf jede Perle setzt sich ein Glühwürmchen.", o)),
  jetztDu: (/** @type {any} */ o) => spricht(() => blase.sage("Jetzt du. Tippe auf diese Perle.", o)),
  fehlt: (/** @type {any} */ o) => spricht(() => blase.sage("Fehlt eine Perle, sucht ein Glühwürmchen.", o)),
  nochmal: (/** @type {any} */ o) => spricht(() => blase.sage("Dann probierst du es einfach noch einmal.", o)),
  andere: (/** @type {any} */ o) => spricht(() => blase.sage("Tippe einfach auf eine andere Perle.", o)),
  lernen: (/** @type {any} */ o) => spricht(() => blase.sage("So siehst du Mengen auf einen Blick.", o)),
  los: (/** @type {any} */ o) => spricht(() => blase.sage("Jetzt geht es los.", o)),
  // Wechsel zur Tastatur (Stufe kopf), beim ersten Mal je Start: nur das Neue, mit einem Beispiel zum Mittippen.
  haelt: (/** @type {any} */ o) => spricht(() => blase.sage("Kofi hält jetzt die Schnur.", o)),
  tippstZahl: (/** @type {any} */ o) => spricht(() => blase.sage("Du tippst die Zahl.", o)),
  tippeDrei: (/** @type {any} */ o) => spricht(() => blase.sage("Tippe die Drei.", o)),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Kofi hebt kurz den Deckel seines Glases: Glühwürmchen leuchten wie Plättchen im Zehnerfeld auf, dann schwirren sie
    durcheinander. Ihr Kind tippt auf Kofis Perlenschnur die Perle, bis zu der geschoben wird. Die Schnur hat denselben Fünferbruch wie das Feld,
    so sieht man „eine volle Reihe und noch zwei“, ohne zu zählen. Jedes Glühwürmchen setzt sich auf eine Perle: Fehlt eine, sucht eines; ist eine
    zu viel, bleibt sie dunkel.</p>
    <p>Welche Mengen dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

// --- Klänge (Web Audio, leise; Ton aus gilt) ---------------------------------------------------------
/** @type {AudioContext | null} */
let audio = null;
/** @returns {AudioContext | null} */
function kontext() {
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    return audio;
  } catch {
    return null;
  }
}
/** @param {number} hz @param {{ dauer?: number, typ?: OscillatorType, laut?: number, gleiten?: number, spaeter?: number }} [o] */
function ton(hz, { dauer = 0.13, typ = "triangle", laut = 0.07, gleiten = 0, spaeter = 0 } = {}) {
  if (!leiste.ton) return;
  const a = kontext();
  if (!a) return;
  try {
    const t = a.currentTime + spaeter;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = typ;
    o.frequency.setValueAtTime(hz, t);
    if (gleiten) o.frequency.exponentialRampToValueAtTime(hz * gleiten, t + dauer);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(laut, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dauer + 0.03);
  } catch {
    // ohne Web Audio: still
  }
}
const klang = {
  /** Deckel: weiches Plopp. */
  plopp: () => ton(740, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }),
  /** Perlen rasten ein. */
  klick: () => ton(1040, { dauer: 0.045, typ: "sine", laut: 0.04 }),
  /** Die Lichter schwirren los. */
  schwirr: () => ton(420, { dauer: 0.5, typ: "sine", laut: 0.035, gleiten: 2.4 }),
  /** Die Glühwürmchen landen (tiefes Summ). */
  summ: () => {
    ton(150, { dauer: 0.34, typ: "triangle", laut: 0.09 });
    ton(225, { dauer: 0.3, typ: "sine", laut: 0.04 });
  },
  /** Daneben: weiches Boing. */
  boing: () => ton(196, { dauer: 0.38, typ: "sine", laut: 0.06, gleiten: 1.5 }),
  /** Die Kette hängt. */
  kling: () => {
    ton(660, { dauer: 0.16, typ: "sine", laut: 0.06 });
    ton(990, { dauer: 0.24, typ: "sine", laut: 0.05, spaeter: 0.12 });
  },
};

// =====================================================================================================
// BÜHNE
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
/** @param {number} a @param {number} b */
const zufall = (a, b) => a + Math.random() * (b - a);

/** Laufende Wirkungen und Wartezeiten; Tippen und die nächste Aufgabe springen ans Ende. @type {(() => void)[]} */
let laufend = [];
function ueberspringeAlles() {
  while (laufend.length) {
    const l = laufend;
    laufend = [];
    for (const f of l) f();
  }
  kofi.halt();
}

/** Wartet ms oder bis zum Überspringen. @param {number} ms */
const warte = (ms) => new Promise((ok) => {
  const fertig = () => {
    clearTimeout(uhr);
    ok(undefined);
  };
  const uhr = setTimeout(fertig, ms);
  laufend.push(fertig);
});

/**
 * Eine Web-Animation, die beim Überspringen ans Ende springt (die Endlage bleibt stehen, fill forwards).
 * @param {Element} el @param {Keyframe[]} keyframes @param {KeyframeAnimationOptions} opt
 */
function anim(el, keyframes, opt) {
  if (typeof el.animate !== "function" || wenigBewegung()) return Promise.resolve();
  const a = el.animate(keyframes, { fill: "forwards", ...opt });
  laufend.push(() => {
    try {
      a.finish();
    } catch {
      // schon fertig
    }
  });
  return a.finished.then(() => undefined, () => undefined);
}

/** Tasten, die eine Folge oder Szene abkürzen (wie ein Tipp). */
const KUERZT = new Set(["Enter", " ", "Escape"]);
/**
 * Ruft fn beim nächsten Tipp irgendwo auf der Seite oder bei Enter, Leertaste, Escape (Regeln §1: der nächste Tipp
 * überspringt Folge und Szene). @param {() => void} fn @returns {() => void} abmelden
 */
function beimTippen(fn) {
  const hoer = (/** @type {Event} */ e) => {
    if (e instanceof KeyboardEvent && !KUERZT.has(e.key)) return;
    fn();
  };
  document.addEventListener("pointerdown", hoer, true);
  document.addEventListener("keydown", hoer, true);
  return () => {
    document.removeEventListener("pointerdown", hoer, true);
    document.removeEventListener("keydown", hoer, true);
  };
}

// --- Zimmer und Kofi ---------------------------------------------------------------------------------
welt.insertAdjacentHTML("afterbegin", zimmerSvg());
kofiKoerper.innerHTML = Runde.zeichne("kofi", { haltung: "stehen", blick: "rechts" });
const kofi = Runde.steuere(kofiKoerper.querySelector("svg"), { tempo: 0.85 });

/** Wie viele Ketten hängen; das Zimmer wird mit jeder heller. */
let kettenZaehler = 0;
function setzeHell() {
  document.documentElement.style.setProperty("--hell", String(Math.min(1, kettenZaehler / KETTEN_HELL)));
}
/** Neue Runde: das Zimmer ist wieder Abend, die Lichterschnur leer, das Fenster zu. */
function leereZimmer() {
  kettenEl.querySelectorAll(".kette").forEach((k) => k.remove());
  kettenZaehler = 0;
  setzeHell();
  for (const id of ["fluegel-links", "fluegel-rechts"]) welt.querySelector(`#${id}`)?.classList.remove("fluegel-offen");
}

// --- Glas, Lichter, Schnur ---------------------------------------------------------------------------

/**
 * Die Szene der aktuellen Aufgabe: Glas mit den Lichtern in den Mulden, Schnur(en) mit den Perlen.
 * @type {{ n: number, nr: number, zellen: HTMLElement[], lichter: HTMLElement[], perlen: HTMLButtonElement[], gewaehlt: number }}
 */
const szene = { n: 0, nr: 0, zellen: [], lichter: [], perlen: [], gewaehlt: 0 };
/** Nummer der Wirkung; wer nach einem await eine andere Nummer sieht, legt nichts mehr hin. */
let wirkungNr = 0;
/** Zeigt die Tastatur zweistellige Zahlen (Thema bis 20)? Sonst schickt jede Taste die Antwort sofort. */
let grossTastatur = false;

/** Montessori-Farbe des Stäbchens mit m Perlen auf der Schnur s (bis 10 auf der ersten, der Rest auf der zweiten). @param {number} m @param {number} s */
function farbeFuer(m, s) {
  const c = s === 0 ? Math.min(m, SCHNUR) : m - SCHNUR;
  return LERNFARBE.perle[/** @type {keyof typeof LERNFARBE.perle} */ (Math.max(1, Math.min(10, c)))];
}

/** So weit rückt das Glas in der Stufe kopf an den linken Rand, damit rechts die Tastatur Platz hat (CSS: --versatz). */
function setzeVersatz() {
  const m = getComputedStyle(matteEl);
  const innen = matteEl.clientWidth - parseFloat(m.paddingLeft) - parseFloat(m.paddingRight);
  const frei = (innen - glas.offsetWidth) / 2;
  if (frei > 0) matteEl.style.setProperty("--versatz", `${frei}px`);
}
window.addEventListener("resize", setzeVersatz);

/** Räumt alle fliegenden Teile weg und zeigt die Lichter wieder im Glas. */
function raeumeFluege() {
  figurenEl.replaceChildren();
  for (const l of szene.lichter) l.style.visibility = "";
}

/**
 * Baut Glas und Schnur(en) für n: die Lichter sitzen in den Mulden, die Perlen liegen unten (alle dunkel, keine geschoben).
 * @param {number} n @param {string} stufe
 */
function baueSzene(n, stufe) {
  wirkungNr++;
  szene.nr++;
  ueberspringeAlles();
  figurenEl.replaceChildren();
  const felder = felderFuer(n);
  const schnuere = grossTastatur && stufe === "kopf" ? 2 : schnuereFuer(n);
  matteEl.classList.toggle("zwanzig", felder > 1 || schnuere > 1);
  felderEl.replaceChildren(...Array.from({ length: felder }, () => {
    const f = document.createElement("div");
    f.className = "feld";
    for (let i = 0; i < SCHNUR; i++) {
      const z = document.createElement("div");
      z.className = "mulde";
      f.append(z);
    }
    return f;
  }));
  szene.n = n;
  szene.zellen = /** @type {HTMLElement[]} */ ([...felderEl.querySelectorAll(".mulde")]);
  szene.lichter = Array.from({ length: n }, (_, i) => {
    const l = document.createElement("span");
    l.className = "licht";
    szene.zellen[mulde(i).feld * SCHNUR + mulde(i).reihe * 5 + mulde(i).spalte].append(l);
    return l;
  });
  schnuereEl.replaceChildren(...Array.from({ length: schnuere }, (_, s) => {
    const sn = document.createElement("div");
    sn.className = "schnur";
    for (let p = 0; p < SCHNUR; p++) {
      if (p === 5) {
        const lu = document.createElement("span");
        lu.className = "luecke";
        sn.append(lu);
      }
      const b = document.createElement("button");
      b.type = "button";
      b.className = "perle";
      b.tabIndex = 0; // WebKit (Safari, macOS-Vorgabe) erreicht Knöpfe nur mit tabindex
      b.id = `perle-${s * SCHNUR + p}`;
      b.setAttribute("aria-label", `Perle ${s * SCHNUR + p + 1}`);
      // Die Marke nach der fünften Perle sitzt an der sechsten und rutscht mit ihr.
      if (p === 5) b.insertAdjacentHTML("afterbegin", '<span class="marke" aria-hidden="true"></span>');
      sn.append(b);
    }
    return sn;
  }));
  szene.perlen = /** @type {HTMLButtonElement[]} */ ([...schnuereEl.querySelectorAll(".perle")]);
  szene.gewaehlt = 0;
  setzeVersatz();
  // Das Glas ist zu, die Lichter stehen als Zehnerfeld (die Aufgabe zeigt sie gleich).
  glas.dataset.deckel = "zu";
}

/**
 * Perlen schieben und färben: die ersten k rutschen zu Kofi, die ersten `hell` leuchten in der Farbe ihres Stäbchens, ab
 * `dunkelAb` (bis k) bleiben sie dunkel (zu viele).
 * @param {{ k: number, hell?: number, dunkelAb?: number }} o
 */
function setzePerlen({ k, hell = 0, dunkelAb = Infinity }) {
  const gesamt = hell || k;
  szene.gewaehlt = k;
  szene.perlen.forEach((b, i) => {
    b.classList.toggle("geschoben", i < k);
    b.classList.toggle("leuchtet", i < hell);
    b.classList.toggle("dunkel", i >= dunkelAb && i < k);
    b.style.setProperty("--farbe", farbeFuer(gesamt, Math.floor(i / SCHNUR)));
  });
}

/** Das Lichtes i steht im Glas an seiner Mulde: leuchtend (an) oder dunkler und schwirrend. @param {"an" | "schwirrt"} modus */
function lichterHeim(modus) {
  for (const l of szene.lichter) {
    l.getAnimations().forEach((a) => a.cancel());
    l.style.visibility = "";
    l.style.translate = "";
    l.classList.toggle("schwirrt", modus === "schwirrt");
  }
  if (modus === "schwirrt") schwirren();
}

/** Die Lichter schwirren im Glas durcheinander (auf der Stelle, wenn Bewegung reduziert ist). */
function schwirren() {
  const gr = glas.getBoundingClientRect();
  const rem = remPx();
  const rand = 3.4 * rem;
  for (const l of szene.lichter) {
    const zr = /** @type {HTMLElement} */ (l.parentElement).getBoundingClientRect();
    const cx = zr.left + zr.width / 2;
    const cy = zr.top + zr.height / 2;
    const punkt = () => `${gr.left + rand + Math.random() * (gr.width - 2 * rand) - cx}px ${gr.top + rand + Math.random() * (gr.height - 2 * rand) - cy}px`;
    const stufen = [punkt(), punkt(), punkt(), punkt()];
    if (wenigBewegung() || typeof l.animate !== "function") {
      l.style.translate = stufen[0];
      continue;
    }
    const dauer = zufall(2600, 4200);
    l.animate([{ translate: "0px 0px" }, ...stufen.map((t) => ({ translate: t })), { translate: "0px 0px" }], { duration: dauer, iterations: Infinity, delay: -Math.random() * dauer, easing: "ease-in-out" });
  }
}

/** Die Lichter leuchten im Zehnerfeld (aus dem Schwirren zurück an ihre Mulden). */
function lichterAn() {
  for (const l of szene.lichter) {
    const aktuell = getComputedStyle(l).translate;
    l.getAnimations().forEach((a) => a.cancel());
    l.style.visibility = "";
    l.style.translate = "";
    l.classList.remove("schwirrt");
    if (aktuell && aktuell !== "none" && aktuell !== "0px" && aktuell !== "0px 0px" && typeof l.animate === "function" && !wenigBewegung()) {
      l.animate([{ translate: aktuell }, { translate: "0px 0px" }], { duration: 260, easing: "ease-out" });
    }
  }
}

/** Deckel auf: Plopp, die Lichter leuchten (Kofi hebt ihn). */
function deckelAuf() {
  glas.dataset.deckel = "offen";
  klang.plopp();
  lichterAn();
  kofi.haltung("zeigen", { ms: 250 });
}
/** Deckel zu: Plopp, die Lichter schwirren. */
function deckelZu() {
  glas.dataset.deckel = "zu";
  klang.plopp();
  lichterHeim("schwirrt");
  klang.schwirr();
  kofi.haltung("stehen", { ms: 300 });
}

/**
 * Kofi hebt kurz den Deckel (ms), dann schwirren die Lichter. Hat das Kind schon getippt oder die Szene wechselt, endet es still.
 * @param {number} ms
 */
async function zeigeKurz(ms) {
  const nr = szene.nr;
  const wNr = wirkungNr;
  deckelAuf();
  await new Promise((ok) => setTimeout(ok, ms));
  if (nr !== szene.nr || wNr !== wirkungNr) return;
  deckelZu();
}

/** Mitte eines Elements auf dem Bildschirm. @param {Element} el */
function mitte(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left + r.width / 2, y: r.top + r.height / 2, b: r.width, h: r.height };
}

/** Ein leuchtendes Teil in der Flugschicht (Klon eines Lichts oder einer Perle), mittig auf (x, y). @param {string} klasse @param {number} d @param {{ x: number, y: number }} p */
function flugteil(klasse, d, p) {
  const el = document.createElement("span");
  el.className = `flug ${klasse}`;
  el.style.width = el.style.height = `${d}px`;
  el.style.transform = `translate(${p.x - d / 2}px, ${p.y - d / 2}px)`;
  figurenEl.append(el);
  return el;
}
/** @param {{ x: number, y: number }} p @param {number} d @param {number} s */
const lage = (p, d, s = 1) => `translate(${p.x - d / 2}px, ${p.y - d / 2}px) scale(${s})`;

/**
 * Ein Glühwürmchen fliegt im Bogen von seinem Platz zu einem Ziel (und wird dort ein Teil der Perle).
 * @param {HTMLElement} licht @param {{ x: number, y: number }} ziel @param {{ delay?: number, ms?: number, bogen?: number, klein?: number, verstecke?: boolean }} [o]
 */
async function fliege(licht, ziel, { delay = 0, ms = 950, bogen = 9, klein = 0.62, verstecke = true } = {}) {
  const von = mitte(licht);
  const d = von.b;
  const klon = flugteil("licht", d, von);
  if (verstecke) licht.style.visibility = "hidden";
  const rem = remPx();
  const w = { x: (von.x + ziel.x) / 2 + zufall(-7, 7) * rem, y: Math.min(von.y, ziel.y) - zufall(bogen * 0.5, bogen) * rem };
  await anim(klon, [{ transform: lage(von, d, 1) }, { transform: lage(w, d, 1.15), offset: 0.45 }, { transform: lage(ziel, d, klein) }], { duration: ms, delay, easing: "cubic-bezier(0.4, 0, 0.3, 1)", fill: "both" });
  klon.remove();
}

/**
 * Die ersten m Lichter setzen sich Fünfer für Fünfer auf je eine Perle; die Perle leuchtet, wenn ihr Licht ankommt.
 * @param {number} m @param {number} nr
 */
async function landen(m, nr) {
  let i = 0;
  const gruppenFluege = gruppen(m).map((g, gi) => {
    const fluege = [];
    for (let j = 0; j < g; j++, i++) {
      const idx = i;
      const perle = szene.perlen[idx];
      fluege.push(fliege(szene.lichter[idx], mitte(perle), { delay: gi * 260 + j * 40 }).then(() => {
        if (nr === wirkungNr) perle.classList.add("leuchtet");
      }));
    }
    // Das Summ beim Landen jeder Gruppe.
    return Promise.all(fluege).then(() => {
      if (nr === wirkungNr) klang.summ();
    });
  });
  if (m > 0) klang.schwirr();
  await Promise.all(gruppenFluege);
}

/**
 * Die übrigen Lichter kreisen ratlos um eine Perle und fliegen dann heim ins Glas.
 * @param {HTMLElement[]} lichter @param {HTMLElement} perle @param {number} nr
 */
async function kreisen(lichter, perle, nr) {
  const z = mitte(perle);
  const rem = remPx();
  const R = 5.2 * rem;
  const flug = lichter.map((l, j) => {
    const von = mitte(l);
    const d = von.b;
    const klon = flugteil("licht", d, von);
    l.style.visibility = "hidden";
    const a0 = (j / lichter.length) * Math.PI * 2 - Math.PI / 2;
    const auf = (/** @type {number} */ t) => ({ x: z.x + R * Math.cos(a0 + t), y: z.y + R * Math.sin(a0 + t) * 0.7 });
    const kf = [{ transform: lage(von, d), offset: 0 }, { transform: lage(auf(0), d, 1.1), offset: 0.22 }];
    for (let s = 1; s <= 16; s++) kf.push({ transform: lage(auf((s / 16) * Math.PI * 3), d, 1.1), offset: 0.22 + (0.5 * s) / 16 });
    kf.push({ transform: lage(von, d), offset: 1 });
    return anim(klon, kf, { duration: 1700, delay: j * 60, easing: "linear", fill: "both" }).then(() => {
      klon.remove();
      if (nr === wirkungNr) l.style.visibility = "";
    });
  });
  await Promise.all(flug);
}

/**
 * Die gelandeten Lichter fliegen von ihren Perlen heim ins Glas (nach einem Fehlversuch mit zu vielen Perlen).
 * @param {number} m @param {number} nr
 */
async function fliegeHeim(m, nr) {
  const fluege = [];
  for (let i = 0; i < m; i++) {
    const l = szene.lichter[i];
    const von = mitte(szene.perlen[i]);
    const ziel = mitte(/** @type {Element} */ (l.parentElement));
    const klon = flugteil("licht", mitte(l).b || 40, von);
    const d = parseFloat(klon.style.width);
    fluege.push(anim(klon, [{ transform: lage(von, d, 0.62) }, { transform: lage(ziel, d, 1) }], { duration: 600, delay: i * 30, easing: "ease-in-out", fill: "both" }).then(() => {
      klon.remove();
      if (nr === wirkungNr) l.style.visibility = "";
    }));
  }
  await Promise.all(fluege);
}

// --- Ketten an der Lichterschnur ---------------------------------------------------------------------
/** Wie tief die Kette durchhängt (rem). */
const SAG = 5.4;

/**
 * Die Kette der Aufgabe (n Perlen) hängt an der Lichterschnur: sie fliegt von den leuchtenden Perlen an einen Platz und
 * schaukelt nach. Die Perlen auf der Schnur sind danach wieder dunkel und liegen unten.
 * @param {number} n @param {"ruhig" | "wurf" | "sprung"} art @param {number} nr
 */
async function haengeKette(n, art, nr) {
  const slot = kettenZaehler % KETTEN_PLAETZE;
  kettenZaehler++;
  kettenEl.querySelector(`.kette[data-slot="${slot}"]`)?.remove();
  const breite = Math.min(6 + n * 1.3, 17);
  const d = Math.min(1.5, (breite / (n + 1)) * 0.95);
  const kette = document.createElement("div");
  kette.className = "kette verborgen";
  kette.dataset.slot = String(slot);
  kette.style.left = `calc(16rem + (100% - 20rem) * ${(slot + 0.5) / KETTEN_PLAETZE})`;
  kette.style.setProperty("--d", `${d}rem`);
  kette.innerHTML = `<svg class="draht" viewBox="${-breite / 2} 0 ${breite} ${SAG}" width="${breite}rem" height="${SAG}rem" style="position:absolute;left:${-breite / 2}rem;top:0;overflow:visible"><path d="M${-breite / 2} 0 Q0 ${SAG * 2} ${breite / 2} 0" fill="none" stroke="${LERNFARBE.draht}" stroke-width="0.35"/></svg>`;
  for (let i = 0; i < n; i++) {
    const t = (i + 1) / (n + 1);
    const b = document.createElement("span");
    b.className = "kb";
    b.style.left = `${(t - 0.5) * breite}rem`;
    b.style.top = `${4 * t * (1 - t) * SAG}rem`;
    b.style.setProperty("--farbe", farbeFuer(n, Math.floor(i / SCHNUR)));
    kette.append(b);
  }
  kettenEl.append(kette);
  const rem = remPx();
  const hoch = art === "wurf" ? 15 : 8;
  const ms = art === "wurf" ? 620 : 780;
  const fluege = szene.perlen.slice(0, n).map((perle, i) => {
    const von = mitte(perle);
    const ziel = mitte(/** @type {Element} */ (kette.children[i + 1]));
    const farbe = farbeFuer(n, Math.floor(i / SCHNUR));
    const klon = flugteil("kb", von.b, von);
    klon.style.setProperty("--farbe", farbe);
    klon.style.margin = "0";
    const w = { x: (von.x + ziel.x) / 2, y: Math.min(von.y, ziel.y) - hoch * rem };
    const s = (d * rem) / von.b;
    return anim(klon, [{ transform: lage(von, von.b, 1) }, { transform: lage(w, von.b, 0.7), offset: 0.5 }, { transform: lage(ziel, von.b, s) }], { duration: ms, delay: i * 14, easing: "cubic-bezier(0.35, 0, 0.3, 1)", fill: "both" }).then(() => klon.remove());
  });
  // Auf der Schnur ist die Kette weg: die Perlen gleiten dunkel zurück.
  setzePerlen({ k: 0 });
  await Promise.all(fluege);
  if (nr !== wirkungNr) {
    kette.classList.remove("verborgen");
    setzeHell();
    return;
  }
  kette.classList.remove("verborgen");
  klang.kling();
  setzeHell();
  const grad = art === "wurf" ? 9 : 3.5;
  anim(kette, [{ transform: "rotate(0)" }, { transform: `rotate(${grad}deg)` }, { transform: `rotate(${-grad * 0.7}deg)` }, { transform: `rotate(${grad * 0.4}deg)` }, { transform: "rotate(0)" }], { duration: art === "wurf" ? 1500 : 1000, easing: "ease-in-out" });
}

/** Kleine Freude, nie zweimal gleich: ruhig (häufig), im Bogen geworfen, selten ein Sprung, bei dem alle Ketten glühen (Idee §7). @param {string | null} vorige */
function naechsteFreude(vorige) {
  for (;;) {
    const r = Math.random();
    const art = r < 0.55 ? "ruhig" : r < 0.9 ? "wurf" : "sprung";
    if (art !== vorige) return art;
  }
}
let vorigeFreude = /** @type {string | null} */ (null);
let seitWitz = 0;

/** @param {string} art */
function freue(art) {
  if (art === "ruhig") kofi.bewegung("nicken");
  else if (art === "wurf") kofi.bewegung("huepfen");
  else {
    kofi.bewegung("freudentanz");
    // Alle Ketten glühen einmal mit.
    kettenEl.querySelectorAll(".kette").forEach((k) => anim(k, [{ filter: "brightness(1)" }, { filter: "brightness(1.5) saturate(1.3)" }, { filter: "brightness(1)" }], { duration: 900, fill: "none" }));
  }
}

/** Ein Glühwürmchen landet auf Kofis Nase, er schielt; dann fliegt es zum Fenster (Witz, nie bei daneben). @param {number} nr */
async function witzNase(nr) {
  const von = mitte(glas);
  const d = remPx() * 3.4;
  const kb = kofiEl.getBoundingClientRect();
  const nase = { x: kb.left + kb.width * 0.5, y: kb.top + kb.height * 0.2 };
  const klon = flugteil("licht", d, von);
  await anim(klon, [{ transform: lage(von, d) }, { transform: lage({ x: (von.x + nase.x) / 2, y: nase.y - 8 * remPx() }, d, 1.2), offset: 0.5 }, { transform: lage(nase, d, 0.8) }], { duration: 800, easing: "ease-in-out", fill: "both" });
  if (nr === wirkungNr) {
    kofi.bewegung("doppelblick");
    await warte(900);
  }
  const fenster = mitte(welt.querySelector("#fluegel-links") ?? glas);
  await anim(klon, [{ transform: lage(nase, d, 0.8), opacity: 1 }, { transform: lage(fenster, d, 0.4), opacity: 0 }], { duration: 700, easing: "ease-in", fill: "both" });
  klon.remove();
}

// --- Wirkungen -----------------------------------------------------------------------------------------

/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();

/** Beginnt eine neue Wirkung: die alte endet sofort. */
function neueWirkung() {
  wirkungNr++;
  ueberspringeAlles();
  return wirkungNr;
}

/**
 * Wirkung einer richtigen Antwort (etwa 2,5 s): die Perlen rutschen zu Kofi, die Glühwürmchen setzen sich Fünfer für Fünfer
 * auf je eine Perle, die Perlen glühen, Kofi hängt die Kette an die Lichterschnur.
 * @param {number} n @param {{ satz?: boolean, freude?: boolean }} [o]
 */
async function wirkungRichtig(n, { satz = false, freude = true } = {}) {
  const nr = neueWirkung();
  const art = freude ? naechsteFreude(vorigeFreude) : "ruhig";
  if (freude) vorigeFreude = art;
  let witz = false;
  if (freude && !satz) {
    seitWitz++;
    if (seitWitz >= 5) {
      witz = true;
      seitWitz = 0;
    }
  }
  setzePerlen({ k: n });
  klang.klick();
  await warte(RUTSCH_MS);
  if (nr !== wirkungNr) return;
  await landen(n, nr);
  if (nr !== wirkungNr) return;
  setzePerlen({ k: n, hell: n });
  if (satz) erzaehler.richtig(n);
  await warte(200);
  if (nr !== wirkungNr) return;
  if (freude) freue(art);
  const kette = haengeKette(n, /** @type {any} */ (art), nr);
  if (witz) witzNase(nr).catch(() => undefined);
  await kette;
}

/**
 * Wirkung einer Menge, die nicht passt: Die Perlen rutschen bis zur getippten Perle, so viele Glühwürmchen landen, wie es
 * Perlen und Lichter gibt. Fehlt eine Perle, kreist ein Glühwürmchen ratlos um das Schnurende; bleibt eine zu viel, bleibt
 * sie dunkel. Kofi schaut hin. Nichts wird zurückgesetzt, die Aufgabe bleibt.
 * @param {number} k die getippte Perle @param {number} n die gezeigte Menge @param {{ weg: boolean }} abbruch @param {boolean} [stumm]
 */
async function wirkungDaneben(k, n, abbruch, stumm = false) {
  const nr = neueWirkung();
  const w = wirkung(k, n);
  const gueltig = () => nr === wirkungNr && !abbruch.weg;
  setzePerlen({ k });
  klang.klick();
  await warte(RUTSCH_MS);
  if (!gueltig()) return;
  await landen(w.landen, nr);
  if (!gueltig()) return;
  setzePerlen({ k, hell: w.landen, dunkelAb: w.dunkel > 0 ? n : Infinity });
  if (w.ohnePerle > 0) {
    // Zu wenig Perlen: die übrigen Lichter kreisen um die nächste Perle (das Schnurende).
    kofi.haltung("fragen", { ms: 260 });
    klang.boing();
    const kreis = kreisen(szene.lichter.slice(w.landen), szene.perlen[Math.min(k, szene.perlen.length - 1)], nr);
    if (!stumm) {
      erzaehler.zuWenig(w.ohnePerle);
      erzaehler.nochmal();
    }
    await kreis;
  } else {
    // Zu viele Perlen: die letzten bleiben dunkel, Kofi schaut erst die Lichter, dann die dunkle Perle an.
    kofi.haltung("staunen", { ms: 260 });
    klang.boing();
    if (!stumm) {
      erzaehler.zuViel(w.dunkel);
      erzaehler.nochmal();
    }
    await warte(1300);
    if (!gueltig()) return;
    await fliegeHeim(w.landen, nr);
  }
  if (!gueltig()) return;
  setzePerlen({ k });
  lichterHeim(glas.dataset.deckel === "offen" ? "an" : "schwirrt");
  kofi.haltung("stehen", { ms: 300 });
}

/**
 * Rundenende (Idee §7): Kofi öffnet das Fenster, die Glühwürmchen fliegen hinaus, die Ketten glühen weiter, das Zimmer ist
 * hell. Ein Tipp kürzt ab.
 */
async function rundenEnde() {
  const abmelden = beimTippen(ueberspringeAlles);
  try {
    ueberspringeAlles();
    kettenZaehler = Math.max(kettenZaehler, KETTEN_HELL);
    setzeHell();
    kofi.bewegung("winken");
    for (const id of ["fluegel-links", "fluegel-rechts"]) {
      const f = welt.querySelector(`#${id}`);
      if (f) {
        f.classList.add("fluegel-offen");
        // Die Wand liegt hinter der Szene: ein Flügel schwingt nach hinten auf.
        anim(f, [{ transform: "scaleX(1)" }, { transform: "scaleX(0.18)" }], { duration: 700, easing: "ease-in-out" });
      }
    }
    klang.plopp();
    const fenster = mitte(welt.querySelector("#fluegel-rechts") ?? glas);
    const lichter = szene.lichter.filter((l) => l.isConnected);
    const flug = lichter.slice(0, 10).map((l, i) => {
      const von = mitte(l);
      const klon = flugteil("licht", von.b || 40, von);
      l.style.visibility = "hidden";
      return anim(klon, [{ transform: lage(von, von.b || 40), opacity: 1 }, { transform: lage({ x: (von.x + fenster.x) / 2, y: fenster.y - 9 * remPx() }, von.b || 40, 1.1), opacity: 1, offset: 0.5 }, { transform: lage(fenster, von.b || 40, 0.4), opacity: 0 }], { duration: 1200, delay: 250 + i * 70, easing: "ease-in-out", fill: "both" }).then(() => klon.remove());
    });
    kettenEl.querySelectorAll(".kette").forEach((k, i) => anim(k, [{ filter: "brightness(1)" }, { filter: "brightness(1.45)" }, { filter: "brightness(1.1)" }], { duration: 900, delay: 300 + i * 80, fill: "forwards" }));
    await Promise.all([...flug, warte(1500)]);
  } finally {
    abmelden();
  }
}

// =====================================================================================================
// AUFGABE
// =====================================================================================================

/** Bedienung der Perlenschnur: ein Tipp auf eine Perle oder ein Wisch bis dorthin legt fest. Setzt die Aufgabe (oder die Einführung). @type {((k: number) => void) | null} */
let beiPerle = null;
/** Wann zuletzt ein Wisch endete (ein Klick danach zählt nicht doppelt). */
let letzterWisch = -Infinity;
/** @type {{ id: number, x: number, y: number, bewegt: boolean } | null} */
let wisch = null;

/** Die Perle (1 bis Zahl der Perlen), die einem Punkt am nächsten liegt. @param {number} x @param {number} y */
function naechstePerle(x, y) {
  let beste = 0;
  let abstand = Infinity;
  szene.perlen.forEach((b, i) => {
    const r = b.getBoundingClientRect();
    // Eine Perle, die schon geschoben ist, hat sich bewegt; gezählt wird ihr Platz auf der Schnur, nicht ihre Lage.
    const cx = r.left + r.width / 2 + (b.classList.contains("geschoben") ? remPx() * 5.6 : 0);
    const dist = Math.hypot((cx - x) * 0.8, (r.top + r.height / 2 - y) * 2);
    if (dist < abstand) {
      abstand = dist;
      beste = i;
    }
  });
  return beste + 1;
}

schnuereEl.addEventListener("pointerdown", (/** @type {PointerEvent} */ e) => {
  if (!beiPerle || !(/** @type {Element} */ (e.target)).closest?.(".perle")) return;
  wisch = { id: e.pointerId, x: e.clientX, y: e.clientY, bewegt: false };
});
schnuereEl.addEventListener("pointermove", (/** @type {PointerEvent} */ e) => {
  if (!wisch || e.pointerId !== wisch.id) return;
  if (!wisch.bewegt && Math.hypot(e.clientX - wisch.x, e.clientY - wisch.y) > remPx()) {
    wisch.bewegt = true;
    // Erst beim Wischen festhalten: ein Tipp behält seine Perle als Ziel des Klicks.
    try {
      schnuereEl.setPointerCapture(e.pointerId);
    } catch {
      // ohne Zeiger: der Wisch folgt trotzdem, solange der Finger auf der Schnur bleibt
    }
  }
  // Beim Wischen rutschen die Perlen mit dem Finger mit; festgelegt wird erst beim Loslassen.
  if (wisch.bewegt) setzePerlen({ k: naechstePerle(e.clientX, wisch.y) });
});
const wischEnde = (/** @type {PointerEvent} */ e) => {
  if (!wisch || e.pointerId !== wisch.id) return;
  const w = wisch;
  wisch = null;
  if (!w.bewegt) return; // ein Tipp: der Klick legt fest
  letzterWisch = performance.now();
  if (e.type === "pointercancel") return setzePerlen({ k: szene.gewaehlt });
  beiPerle?.(naechstePerle(e.clientX, w.y));
};
schnuereEl.addEventListener("pointerup", wischEnde);
schnuereEl.addEventListener("pointercancel", wischEnde);
schnuereEl.addEventListener("click", (/** @type {MouseEvent} */ e) => {
  const b = /** @type {Element} */ (e.target).closest?.(".perle");
  if (!b || performance.now() - letzterWisch < 350) return;
  const i = szene.perlen.indexOf(/** @type {HTMLButtonElement} */ (b));
  if (i >= 0) beiPerle?.(i + 1);
});

/** Das Kind hat nur die Ziffer getippt: sie steht auf dem Schild (kopf). @param {string} text */
function setzeSchild(text) {
  schild.textContent = text;
  if (text) {
    schild.classList.remove("sinkt");
    void schild.offsetWidth;
    schild.classList.add("sinkt");
  }
}

/** Stellt die Tastatur auf die größte Menge des Themas ein: nur die Tasten, die gebraucht werden. @param {number} bis */
function stelleTastatur(bis) {
  grossTastatur = bis > SCHNUR;
  if (grossTastatur) {
    tastatur.setAttribute("tasten", "1234567890");
    tastatur.removeAttribute("zehn");
    tastatur.setAttribute("loeschen", "");
    tastatur.setAttribute("je-reihe", "6");
  } else {
    tastatur.setAttribute("tasten", "123456789".slice(0, Math.min(9, bis)));
    tastatur.toggleAttribute("zehn", bis >= SCHNUR);
    tastatur.removeAttribute("loeschen");
    tastatur.setAttribute("je-reihe", "5");
  }
  fertigKnopf.hidden = !grossTastatur;
}

/** Bis zu welcher Menge das Thema der Runde geht (bestimmt die Tasten der Stufe kopf). */
let themaBis = SCHNUR;

/**
 * @param {{ ziel: { key: string, thema?: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const ziel = mengeAus(aufgabe.ziel.key);
  if (!ziel) throw new Error(`Blitzblick: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  const { n } = ziel;
  const stufe = aufgabe.stufe ?? "material";
  const kopf = stufe === "kopf";
  if (kopf) stelleTastatur(Math.max(themaBis, n));
  baueSzene(n, stufe);

  let eingabe = "";
  let fertig = false;
  let loesungGezeigt = false;
  let hilfeGezeigt = false;
  let versuche = 0;
  /** Perlen oder Zahlen, die bei dieser Aufgabe schon getippt wurden und nicht passten (nur für die Züge des Prüfstands). */
  const versucht = new Set();
  /** Das Bild eines Fehlversuchs (kreisende Lichter, dunkle Perle); das nächste Tippen räumt es weg. @type {(() => void) | null} */
  let fehlerBild = null;

  /** Das Glas zeigt die Lichter: material bleibt offen, vorstellung und kopf nur kurz (Idee §5). */
  const zeigeAnfang = () => {
    if (stufe === "material") {
      glas.dataset.deckel = "offen";
      lichterHeim("an");
    } else {
      glas.dataset.deckel = "zu";
      lichterHeim("schwirrt");
      zeigeKurz(ZEIGEN_MS[/** @type {"vorstellung" | "kopf"} */ (stufe)] ?? ZEIGEN_MS.vorstellung);
    }
  };
  zeigeAnfang();

  const perleMarkieren = (/** @type {number | null} */ k) => {
    szene.perlen.forEach((b, i) => b.classList.toggle("markiert", k !== null && i === k - 1));
  };
  /** Die nächste Taste zur Lösung (Hilfe 2). */
  const naechste = () => (grossTastatur ? naechsteTaste(eingabe, n) : String(n));
  const markiereNaechste = () => {
    const t = naechste();
    tastatur.markiere(t === "fertig" ? null : t);
    fertigKnopf.classList.toggle("markiert", t === "fertig");
  };
  const ohneMarkierung = () => {
    perleMarkieren(null);
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  };
  const raeumeFehlerBild = () => {
    fehlerBild?.();
    fehlerBild = null;
  };

  /** Die Antwort steht fest (G5: erst festlegen, dann sehen). @param {number} k */
  const legeFest = (k) => {
    if (fertig || E.laeuft) return;
    raeumeFehlerBild();
    szene.nr++; // das kurze Zeigen endet, falls es noch läuft
    if (k === n) {
      fertig = true;
      abmelden();
      ohneMarkierung();
      // Gemeldet wird sofort (die Zeit der Aufgabe endet mit dem Tipp); die Wirkung läuft in der Zeit der Folge.
      melde.geloest(aufgabe.ziel.key);
      wirkungFertig = wirkungRichtig(n, { satz: versuche > 0 || hilfeGezeigt });
      return;
    }
    versuche++;
    melde.passtNicht();
    versucht.add(k);
    ohneMarkierung();
    const abbruch = { weg: false };
    const lauf = wirkungDaneben(k, n, abbruch);
    fehlerBild = () => {
      abbruch.weg = true;
      wirkungNr++;
      ueberspringeAlles();
      raeumeFluege();
      lichterHeim(glas.dataset.deckel === "offen" ? "an" : "schwirrt");
      kofi.haltung("stehen", { ms: 200 });
    };
    // Die Perlen bleiben, wo das Kind sie hingeschoben hat; ein neuer Tipp schiebt nach oder zurück (nichts wird zurückgesetzt).
    if (loesungGezeigt) lauf.then(() => (kopf ? markiereNaechste() : perleMarkieren(n)));
  };

  // Die Bedienung der Schnur; nach der Anleitung (Einführung mitten in der Aufgabe) bindet sie sich neu.
  const bindePerlen = () => {
    beiPerle = kopf ? null : (k) => legeFest(k);
  };
  bindePerlen();

  /** @param {string} taste */
  const beiTaste = (taste) => {
    if (fertig || E.laeuft) return;
    raeumeFehlerBild();
    if (!grossTastatur) {
      if (!/^\d+$/.test(taste)) return;
      eingabe = taste;
      setzeSchild(taste);
      legeFest(Number(taste));
      return;
    }
    eingabe = tippeZiffer(eingabe, taste);
    setzeSchild(eingabe);
    if (loesungGezeigt) markiereNaechste();
  };
  const pruefe = () => {
    if (fertig || E.laeuft || !eingabe) return;
    const k = Number(eingabe);
    eingabe = "";
    if (k < 1 || k > MAX) return setzeSchild("");
    legeFest(k);
  };
  const tasteEreignis = (/** @type {any} */ e) => beiTaste(e.detail.zeichen);
  tastatur.addEventListener("taste", tasteEreignis);
  fertigKnopf.addEventListener("click", pruefe);
  const abmelden = () => {
    tastatur.removeEventListener("taste", tasteEreignis);
    fertigKnopf.removeEventListener("click", pruefe);
    beiPerle = null;
  };
  aufraeumen = () => {
    abmelden();
    fehlerBild = null;
    ohneMarkierung();
  };
  setzeSchild("");

  return {
    // Prüfstand: Perlen (oder Tasten), die ein ratendes Kind am ehesten tippt: die Menge selbst und ihre Nachbarn; was
    // eben als „passt nicht“ gezeigt wurde, tippt es nicht noch einmal.
    zuege() {
      if (fertig) return [];
      const ks = kandidaten(n, kopf ? (grossTastatur ? MAX : Math.min(themaBis, SCHNUR)) : szene.perlen.length).filter((k) => !versucht.has(k));
      if (!kopf) return ks.map(perlenZug).filter(Boolean);
      const start = fehlerBild ? "" : eingabe;
      return [...new Set(ks.map((k) => (grossTastatur ? naechsteTaste(start, k) : String(k))))].map(tastenZug).filter(Boolean);
    },
    richtigerZug() {
      if (fertig) return null;
      return kopf ? tastenZug(fehlerBild ? (grossTastatur ? naechsteTaste("", n) : String(n)) : naechste()) : perlenZug(n);
    },
    /** Nach der Einführung über „Anleitung“: die Aufgabe steht wieder da, die Hilfe steht wieder. */
    async zeigeWieder() {
      baueSzene(n, stufe);
      zeigeAnfang();
      if (!fertig) bindePerlen();
      if (hilfeGezeigt || loesungGezeigt) this.hilfe(loesungGezeigt ? 2 : 1);
    },
    /** @param {1 | 2} hilfeStufe */
    hilfe(hilfeStufe) {
      if (fertig) return;
      raeumeFehlerBild();
      hilfeGezeigt = true;
      if (hilfeStufe === 1) {
        // Probe: Kofi öffnet das Glas noch einmal, die Lichter leuchten im Zehnerfeld und bleiben, bis das Kind tippt.
        szene.nr++;
        deckelAuf();
        return erzaehler.probe();
      }
      // Lösung: die Lichter bleiben, die Perle (die Taste) im Sonnenring; das Kind tippt selbst (L12).
      szene.nr++;
      if (glas.dataset.deckel !== "offen") deckelAuf();
      loesungGezeigt = true;
      if (kopf) markiereNaechste();
      else perleMarkieren(n);
      return erzaehler.loesung(n);
    },
  };
}

/** Selektor einer Perle (k ab 1). @param {number} k */
const perlenZug = (k) => {
  const b = szene.perlen[k - 1];
  return b ? { art: "tippen", von: selektor(b) } : null;
};
/** Selektor einer Taste („fertig“ ist der Knopf daneben). @param {string} t */
const tastenZug = (t) => {
  if (t === "fertig") return { art: "tippen", von: "#fertig" };
  const knopf = [...(tastatur.shadowRoot?.querySelectorAll("button[data-z]") ?? [])].find((k) => /** @type {HTMLElement} */ (k).dataset.z === t);
  return knopf ? { art: "tippen", von: selektor(knopf) } : null;
};

/** Räumt die Bedienung der letzten Aufgabe ab (Zimmer und Ketten bleiben). @type {() => void} */
let aufraeumen = () => {};
function raeumeAuf() {
  ueberspringeAlles();
  aufraeumen();
  aufraeumen = () => {};
}

// =====================================================================================================
// STUFENWECHSEL (Regeln §8: kein Wechsel ohne Bild)
// =====================================================================================================

/** Die Stufe, die auf dem Bildschirm steht (null vor der ersten Aufgabe). @type {string | null} */
let bildStufe = null;
/** Die Mini-Einführung der Tastatur lief schon (je Start einmal). */
let tastaturErklaert = false;

/** Zeigt oder versteckt die Tastatur sichtbar: sie klappt auf, das Glas rückt zur Seite, Kofi hält die Schnur. @param {boolean} zuKopf */
async function wechsleAnsicht(zuKopf) {
  if (zuKopf) {
    matteEl.dataset.stufe = "kopf";
    await anim(eingabeEl, [{ transform: "scale(0.2)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(0.3, 1.4, 0.5, 1)", fill: "none" });
  } else {
    await anim(eingabeEl, [{ transform: "none", opacity: 1 }, { transform: "scale(0.2)", opacity: 0 }], { duration: 320, easing: "ease-in", fill: "none" });
    matteEl.dataset.stufe = "material";
  }
  await warte(WECHSEL_MS - 400);
}

/**
 * Vor einer Aufgabe: Wechselt die Stufe, geschieht es sichtbar in einer kurzen Szene; zu kopf beim ersten Mal je Start mit einer
 * Mini-Einführung zum Mitmachen (nur für das Neue). Ein Tipp irgendwo kürzt ab.
 * @param {string} stufe @param {{ beginneZeit(): void } | null} [r]
 */
async function bereiteBild(stufe, r = null) {
  stand.phase = "folge";
  ueberspringeAlles();
  const kopfJetzt = bildStufe === "kopf";
  const kopfNeu = stufe === "kopf";
  if (bildStufe === null) {
    matteEl.dataset.stufe = kopfNeu ? "kopf" : "material";
    if (kopfNeu) stelleTastatur(themaBis);
  } else if (kopfJetzt !== kopfNeu) {
    const abmelden = beimTippen(ueberspringeAlles);
    try {
      if (kopfNeu) stelleTastatur(themaBis);
      await wechsleAnsicht(kopfNeu);
    } finally {
      abmelden();
    }
    if (kopfNeu && !tastaturErklaert) {
      tastaturErklaert = true;
      await miniEinfuehrungTastatur();
      r?.beginneZeit();
    }
  }
  bildStufe = stufe;
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// In Ruhe, als kleine Geschichte (Christian, 2026-11-16): Kofi hat Glühwürmchen im Glas und bastelt eine Leuchtkette; er hebt
// kurz den Deckel (drei leuchten), tippt auf die dritte Perle und die Wirkung läuft. Dann leuchten vier: die vierte Perle liegt
// im Sonnenring, das Kind tippt selbst. Danach: was bei einer anderen Antwort passiert (Kofi tippt die dritte, ein Glühwürmchen
// sucht), wie man es noch einmal versucht, was man lernt. Weiter geht es bei den Tipps nur mit dem Tipp des Kindes.
// Die Hilfe sagt den Schritt noch einmal. Nicht gebucht.

/** Wartet, bis das Kind die Perle k antippt (andere Perlen wackeln nur). @param {number} k */
function kindTipptPerle(k) {
  return new Promise((ok) => {
    beiPerle = (gewaehlt) => {
      if (gewaehlt !== k) {
        setzePerlen({ k: 0 });
        szene.perlen[k - 1]?.animate?.([{ transform: "translateX(0)" }, { transform: "translateX(-0.8rem)" }, { transform: "translateX(0.8rem)" }, { transform: "translateX(0)" }], { duration: 300 });
        return;
      }
      beiPerle = null;
      ok(undefined);
    };
  });
}

/** Wartet, bis das Kind die Taste t antippt. @param {string} t */
function kindTipptTaste(t) {
  return new Promise((ok) => {
    const getippt = (/** @type {any} */ e) => {
      if (e.detail.zeichen !== t) return;
      tastatur.removeEventListener("taste", getippt);
      ok(undefined);
    };
    tastatur.addEventListener("taste", getippt);
  });
}

/**
 * Spielt die Einführung (rahmen/einfuehrung-lauf.js: Sätze, Lesezeit ohne Ton, Hilfe, Prüfstand). Mit `r` gilt sie danach
 * als gesehen, und die Rundenzeit beginnt.
 * @param {{ einfuehrungGesehen(): void, beginneZeit(): void }} [r]
 */
function einfuehrung(r) {
  const e = einleitung;
  const satz = E.satz;
  return E.spiele(async () => {
    try {
      ueberspringeAlles();
      matteEl.dataset.stufe = "material";
      bildStufe = "material";
      setzeSchild("");
      // Die Geschichte: Glas mit drei Lichtern, Deckel zu.
      baueSzene(3, "material");
      lichterHeim("schwirrt");
      await satz(e.glas);
      await satz(e.kette);
      await satz(e.deckel);
      await satz(e.hinschauen);
      deckelAuf();
      await new Promise((ok) => setTimeout(ok, ZEIGEN_MS.vorstellung));
      deckelZu();
      await warte(300);
      // Kofi tippt auf die dritte Perle; die Wirkung läuft, die Sätze dazu.
      szene.perlen[2].classList.add("antippen");
      await satz(e.kofiTippt);
      szene.perlen[2].classList.remove("antippen");
      const wirkungDrei = wirkungRichtig(3, { freude: false });
      await satz(e.rutschen);
      await satz(e.setzen);
      await wirkungDrei;
      // Jetzt das Kind: vier Lichter leuchten, die vierte Perle liegt im Sonnenring.
      baueSzene(4, "material");
      glas.dataset.deckel = "offen";
      lichterHeim("an");
      szene.perlen[3].classList.add("markiert");
      const tipp = kindTipptPerle(4);
      const getippt = E.kind({ art: "tippen", von: "#perle-3" }, tipp);
      E.hilfe(() => satz(e.jetztDu), { bis: tipp });
      await satz(e.jetztDu);
      await getippt;
      szene.perlen[3].classList.remove("markiert");
      await wirkungRichtig(4, { freude: false });
      // Was bei einer anderen Antwort passiert: Kofi tippt die dritte, ein Glühwürmchen sucht.
      baueSzene(4, "material");
      glas.dataset.deckel = "offen";
      lichterHeim("an");
      const zeigeDaneben = wirkungDaneben(3, 4, { weg: false }, true);
      await satz(e.fehlt);
      await zeigeDaneben;
      await satz(e.nochmal);
      await satz(e.andere);
      await satz(e.lernen);
      // Übergang zur ersten Aufgabe (Christian, 2026-11-16).
      await satz(e.los);
    } finally {
      ueberspringeAlles();
      beiPerle = null;
      szene.perlen.forEach((b) => b.classList.remove("markiert", "antippen"));
    }
  }, r);
}

/** Mini-Einführung der Tastatur (Stufe kopf), beim ersten Mal je Start: Kofi hält die Schnur, das Kind tippt die Drei. */
function miniEinfuehrungTastatur() {
  const e = einleitung;
  const satz = E.satz;
  return E.spiele(async () => {
    try {
      ueberspringeAlles();
      baueSzene(3, "kopf");
      lichterHeim("schwirrt");
      await satz(e.haelt);
      await satz(e.tippstZahl);
      deckelAuf();
      await new Promise((ok) => setTimeout(ok, ZEIGEN_MS.kopf + 300));
      deckelZu();
      tastatur.markiere("3");
      const tipp = kindTipptTaste("3");
      const getippt = E.kind(tastenZug("3"), tipp);
      E.hilfe(() => satz(e.tippeDrei), { bis: tipp });
      await satz(e.tippeDrei);
      await getippt;
      tastatur.markiere(null);
      setzeSchild("3");
      await wirkungRichtig(3, { freude: false });
      setzeSchild("");
      await satz(e.los);
    } finally {
      ueberspringeAlles();
      tastatur.markiere(null);
    }
  });
}

// =====================================================================================================
// RAHMEN (aus der Vorlage)
// =====================================================================================================

const params = new URLSearchParams(location.search);
const wunsch = einmal(params.get("thema")); // ?thema= gilt nur für die erste Runde der Seite
// ?stufe=<id> nur im Testbetrieb: jede Aufgabe auf dieser Lernstufe; die Runde ist dann eine Vorschau (schreibt nicht).
const PRUEF_STUFE = testbetrieb() ? params.get("stufe") || null : null;
/** ?bis=<n> nur im Testbetrieb: das Spiel tut, als ginge das Thema bis n (z. B. ?bis=20: zwei Schnüre, Tastatur mit Fertig). */
const PRUEF_BIS = testbetrieb() && params.has("bis") ? Number(params.get("bis")) : null;
/** ?menge=<n> nur im Testbetrieb: jede Aufgabe zeigt n Glühwürmchen (Sichtprüfung der Zwanzigerfelder). */
const PRUEF_MENGE = testbetrieb() && params.has("menge") ? Number(params.get("menge")) : null;
/** @param {any} a */
const aufStufe = (a) => {
  if (a && PRUEF_MENGE && mengeAus(`menge:${PRUEF_MENGE}`)) a = { ...a, ziel: { ...a.ziel, key: `menge:${PRUEF_MENGE}` } };
  return a && PRUEF_STUFE ? { ...a, stufe: PRUEF_STUFE } : a;
};

/** @type {{ plan: any, spiele: any } | null} */
let ctx = null;
async function ladeCtx() {
  if (ctx) return ctx;
  const [plan, spiele] = await Promise.all(["lernplan.json", "spiele.json"].map((f) => fetch(new URL(`../../${f}`, import.meta.url)).then((r) => r.json())));
  ctx = { plan, spiele };
  return ctx;
}
/** Steht das Spiel in spiele.json? Sonst (ein Spiel vor dem Eintrag) läuft es als Vorschau. */
const eingetragen = (/** @type {{ spiele: any }} */ c) => c.spiele.spiele.some((/** @type {any} */ s) => s.id === SPIEL_ID);

// --- Prüfstand (rahmen/pruefen.js, nur im Testbetrieb ?pruefen) ------------------------------------
// In der Einführung ist der richtige Zug die Perle (die Taste) im Sonnenring (das Kind tippt selbst), sonst wie in der Vorlage.
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
/** @type {{ zuege: () => any[], richtigerZug: () => any, zeigeWieder: () => Promise<void> } | null} */
let offeneAufgabe = null;
const ORTE = { hilfe: "#hilfe >>> ls-knopf", haus: "#leiste >>> a.haus", weiter: "#pause >>> ls-knopf.weiter" };
/** Wo Weiter liegt: in der Pause oder auf dem Bildschirm „Gekonnt“. */
let weiterOrt = ORTE.weiter;
const weiterZug = () => ({ art: "tippen", von: weiterOrt });
/** Die Einführung: Sätze, Hilfe und Zug für den Prüfstand (rahmen/einfuehrung-lauf.js). */
const E = einfuehrungsLauf({ ton: () => leiste.ton, text: () => blase.text, stand });
// Ohne Ton kürzt nur ein Tipp des Kindes die Lesezeit ab, nie die Einstellung (spielbau.md §8). Hilfe, Pause und
// Leiste nicht – die Hilfe sagt den Schritt noch einmal.
E.verbindeTippen(document, { ausser: [hilfe, pause, leiste] });
const einfuehrungsZug = () => E.zug;
meldePruefSchnittstelle({
  zustand: () => ({ ...stand }),
  zuege: () => (stand.phase === "aufgabe" ? offeneAufgabe?.zuege() ?? [] : stand.phase === "pause" ? [weiterZug()] : stand.phase === "einfuehrung" ? [einfuehrungsZug()].filter(Boolean) : []),
  richtigerZug: () => (stand.phase === "aufgabe" ? offeneAufgabe?.richtigerZug() ?? null : stand.phase === "pause" ? weiterZug() : stand.phase === "einfuehrung" ? einfuehrungsZug() : null),
  orte: ORTE,
});

// --- Hilfe-Leiter (grundsaetze.md L12, bedienung.md 6) ---------------------------------------------
/** @type {(() => void) | null} */
let hilfeTippen = null;
// In der Einführung sagt die Hilfe den Schritt noch einmal (sonst hörte das Kind nur den Namen „Hilfe“).
hilfe.addEventListener("hilfe", () => { if (!E.hilfeGedrueckt()) hilfeTippen?.(); });

/**
 * Spielt eine Aufgabe bis zur Lösung.
 * @param {any} aufgabe
 * @returns {Promise<{ key: string, versuche: number, hilfe: number, ms: number }>}
 */
function spieleAufgabe(aufgabe) {
  return new Promise((fertig, fehler) => {
    const start = Date.now();
    let versuche = 0;
    let stufe = 0;
    Object.assign(stand, { phase: "aufgabe", aufgabe: aufgabe?.ziel?.key ?? null, nr: stand.nr + 1, versuche, hilfeStufe: stufe, lernstufe: aufgabe?.stufe ?? null });
    /** @type {ReturnType<typeof stelleAufgabe>} */
    let a;
    try {
      a = stelleAufgabe(aufgabe, {
        passtNicht() {
          versuche++;
          stand.versuche = versuche;
          if (versuche === 2 && stufe === 0) hilfe.leuchte();
        },
        geloest(key) {
          hilfeTippen = null;
          offeneAufgabe = null;
          stand.phase = "folge";
          fertig({ key, versuche, hilfe: stufe, ms: Date.now() - start });
        },
      });
    } catch (e) {
      hilfeTippen = null;
      fehler(e);
      return;
    }
    offeneAufgabe = a;
    hilfeTippen = () => {
      stufe = Math.min(2, stufe + 1);
      stand.hilfeStufe = stufe;
      a.hilfe(/** @type {1 | 2} */ (stufe));
    };
  });
}

// --- Folge nach einer Lösung (bedienung.md 7.1, B6) ----------------------------------------------
// Kein Weiter-Knopf: die Folge wartet, bis die Wirkung fertig ist (höchstens FOLGE_MAX_MS), dann NACH_WIRKUNG_MS;
// ein Tipp irgendwo (oder Enter) überspringt beides, dann kommt die nächste Aufgabe.
function warteFolge() {
  return new Promise((ok) => {
    let vorbei = false;
    const fertig = () => {
      if (vorbei) return;
      vorbei = true;
      clearTimeout(uhr);
      abmelden();
      ok(undefined);
    };
    const uhr = setTimeout(fertig, FOLGE_MAX_MS + NACH_WIRKUNG_MS);
    const abmelden = beimTippen(() => {
      ueberspringeAlles();
      fertig();
    });
    wirkungFertig.catch(() => undefined).then(() => new Promise((w) => setTimeout(w, NACH_WIRKUNG_MS))).then(fertig);
  });
}

// --- Pause am Rundenende (bedienung.md 7.1) --------------------------------------------------------
// Christian, 2026-11-16: Das Kind entscheidet, sonst nichts – nur „Weiter“ und „Alle Spiele“. Der Satz der Spielzeit bleibt.
/** @param {{ zeit?: { schluss: boolean, satz: string | null } }} [optionen] */
async function zeigePause({ zeit = { schluss: false, satz: null } } = {}) {
  if (zeit.satz && leiste.ton) sage(zeit.satz);
  stand.phase = "pause";
  weiterOrt = ORTE.weiter;
  await pause.zeige({ ...zeit, echteDinge: null }); // „Alle Spiele“ navigiert selbst (speichert vorher), „Weiter“ löst auf
  stand.phase = "laden";
}

/**
 * Ein Thema ist gekonnt (Christian, 2026-11-16): statt der Pause der Bildschirm „Gekonnt“, Kofi feiert mit dem Kind.
 * @param {{ name: string, sprich?: string }} thema
 */
async function zeigeGekonnt(thema) {
  stand.phase = "pause"; // für den Prüfstand wie die Pause: der nächste Zug ist Weiter
  weiterOrt = "#gekonnt >>> ls-knopf.weiter";
  await gekonntEl.zeige({ thema, figur: "kofi" });
  weiterOrt = ORTE.weiter;
  stand.phase = "laden";
}

// --- Elternansicht (?eltern): beschreibend, kein Vergleich -----------------------------------------
async function elternansicht() {
  const e = document.createElement("section");
  e.className = "eltern auswahl";
  const eintrag = (await ladeCtx().catch(() => null))?.spiele.spiele.find((/** @type {any} */ s) => s.id === SPIEL_ID);
  const beschreibung = typeof eintrag?.beschreibung === "string" ? eintrag.beschreibung.trim() : "";
  e.innerHTML = `<h1>${esc(leiste.getAttribute("titel"))}</h1>${beschreibung ? `<p class="beschreibung">${esc(beschreibung)}</p>` : ""}<div class="eigenes"></div>
    <p><a href="../../eltern.html">Themen im Elternbereich</a> · <a href="${esc(location.pathname.split("/").pop())}">Zum Spiel</a></p>`;
  fuelleEltern(/** @type {HTMLElement} */ (e.querySelector(".eigenes")));
  document.body.append(e);
}

// --- Runde: Lernsteuerung oder (nur Vorschau) die festen Aufgaben ----------------------------------

/** @param {boolean} vorschau */
async function starteRunde(vorschau) {
  const c = await ladeCtx();
  const mitSpiel = eingetragen(c) ? c : { plan: c.plan, spiele: { ...c.spiele, spiele: [...c.spiele.spiele, { id: SPIEL_ID, arten: ARTEN }] } };
  // Keine feste Rundenlänge: die Lernsteuerung beendet die Runde (gekonnt, Zeit; G14).
  const r = await runde(SPIEL_ID, { wunsch: wunsch(), ctx: mitSpiel, nurAnsehen: vorschau });
  const plan = r.thema ? c.plan.themen.find((/** @type {any} */ t) => t.id === r.thema?.id) : null;
  return {
    thema: r.thema?.name ?? "",
    /** Bis zu welcher Menge das Thema der Runde geht (bestimmt die Tasten). */
    bis: plan?.aufgaben?.bis ?? null,
    themaId: plan?.id ?? null,
    sprich: plan?.sprich ?? null,
    echteDinge: plan ? { thema: plan.id, fach: plan.strang, titel: plan.name, text: plan.eltern ?? "" } : null,
    einfuehrungGesehen: () => r.einfuehrungGesehen(),
    beginneZeit: () => r.beginneZeit(),
    naechste: () => r.naechste(),
    melde: (/** @type {string} */ key, /** @type {any} */ e) => r.melde(key, e),
    ende: () => r.ende(),
  };
}

/** Feste Aufgaben ohne Lernsteuerung, nur in der Vorschau. */
function vorschauRunde() {
  const keys = [...VORSCHAU.aufgaben];
  return {
    thema: VORSCHAU.thema,
    bis: null,
    themaId: null,
    sprich: null,
    echteDinge: { titel: VORSCHAU.thema },
    einfuehrungGesehen() {},
    beginneZeit() {},
    naechste() {
      const key = keys.shift();
      return key ? { ziel: { key }, auch: [], stufe: "material" } : null;
    },
    melde() { return null; },
    async ende() { return { hinweisSpiel: null }; },
  };
}

/** Name eines Themas des Lernplans (für die Leiste). @param {string | undefined} id */
const themaName = (id) => (id ? ctx?.plan?.themen?.find((/** @type {any} */ t) => t.id === id)?.name ?? null : null);

/** Die Einführung lief schon (sie kommt bei jedem Start einmal, danach über „Anleitung“). */
let einfuehrungGespielt = false;
let letztesThema = /** @type {string | null} */ (null);

// „Anleitung“: die Einführung im Spielbild jederzeit wieder (während einer Aufgabe); danach steht die Aufgabe wieder da.
$("anleitung")?.addEventListener("click", async () => {
  if (stand.phase !== "aufgabe" || E.laeuft) return;
  const merke = { aufgabe: offeneAufgabe, stufe: bildStufe ?? "material" };
  await einfuehrung();
  bildStufe = merke.stufe;
  matteEl.dataset.stufe = merke.stufe === "kopf" ? "kopf" : "material";
  await merke.aufgabe?.zeigeWieder();
  stand.phase = "aufgabe";
});

/** @param {boolean} vorschau */
async function spieleRunde(vorschau) {
  /** @type {any} */
  let r;
  try {
    r = await starteRunde(vorschau);
  } catch (e) {
    protokoll(`${SPIEL_ID}: Runde starten: ${/** @type {any} */ (e)?.message ?? e}`);
    if (!vorschau) {
      stand.phase = "fehler";
      return erzaehler.gehtNicht();
    }
    r = vorschauRunde();
  }

  // Die Rundenzeit beginnt nach der Einführung (E.spiele ruft r.beginneZeit(), G14); in den letzten 30 s gibt die
  // Lernsteuerung keine neue Aufgabe mehr.
  const naechste = () => aufStufe(r.naechste());
  let aufgabe = naechste();
  if (!aufgabe && vorschau) {
    r = vorschauRunde();
    aufgabe = naechste();
  }
  leiste.setAttribute("thema", r.thema);
  themaBis = Math.min(MAX, PRUEF_BIS ?? r.bis ?? SCHNUR);
  leereZimmer();

  // Das Spiel beginnt mit der Einführung im echten Spielbild (bei jedem Start; in der Vorschau nur mit ?einfuehrung).
  if (!einfuehrungGespielt && mengeAus(aufgabe?.ziel?.key) && (!vorschau || params.has("einfuehrung"))) {
    einfuehrungGespielt = true;
    await einfuehrung(r);
  } else if (mengeAus(aufgabe?.ziel?.key)) {
    // Später: hat sich das Thema geändert, sagt die Stimme es (ein Satz, Christian 2026-11-16).
    if (r.themaId && letztesThema && r.themaId !== letztesThema && r.sprich) await E.satz((o) => spricht(() => blase.sage(r.sprich, o)));
  }
  if (r.themaId) letztesThema = r.themaId;
  $("anleitung")?.removeAttribute("hidden");

  while (aufgabe) {
    raeumeAuf();
    if (mengeAus(aufgabe.ziel.key)) {
      leiste.setAttribute("thema", themaName(aufgabe.ziel.thema) ?? r.thema);
      await bereiteBild(aufgabe.stufe ?? "material", r);
    }
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    r.melde(e.key, ergebnis);
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis })); // für die Browser-Prüfung
    await warteFolge();
    aufgabe = naechste();
  }

  raeumeAuf();
  // Die Wirkung der letzten Lösung läuft zu Ende, dann spricht die Pause erst, wenn der letzte Satz zu Ende ist (kein Satz
  // wird abgeschnitten); steht die Stimme länger still als ein Satz dauert, geht es weiter.
  await wirkungFertig.catch(() => undefined);
  await rundenEnde().catch(() => undefined);
  await Promise.race([sprechSchlange, new Promise((ok) => setTimeout(ok, SATZ_WARTE_MS))]);
  const { gekonnt } = await r.ende();
  const zeit = vorschau ? undefined : await amRundenende();
  if (gekonnt) {
    await zeigeGekonnt(gekonnt);
    if (zeit?.schluss) await zeigePause({ zeit });
  } else {
    await zeigePause({ zeit });
  }
  return spieleRunde(vorschau);
}

// --- Start ---------------------------------------------------------------------------------------
async function start() {
  await leiste.bereit(); // Ton-Einstellung geladen
  if (params.has("eltern")) return elternansicht();
  const c = await ladeCtx().catch(() => null);
  const nichtEingetragen = c !== null && !eingetragen(c);
  if (nichtEingetragen) protokoll(`${SPIEL_ID}: nicht in spiele.json – Vorschau, schreibt nicht`);
  const vorschau = ["pause", "hinweis", "eltern", "einfuehrung", "gekonnt"].some((p) => params.has(p)) || PRUEF_STUFE !== null || !c || nichtEingetragen;
  stand.vorschau = vorschau;
  if (!(await starteSpielzeit({ zaehlen: !vorschau }))) return;
  await new Promise((ok) => requestAnimationFrame(() => ok(undefined)));
  baueSzene(4, "material");
  lichterHeim("schwirrt");
  // ?gekonnt: der Bildschirm „Gekonnt“ mit einem Beispielthema (Vorschau)
  if (params.has("gekonnt")) await zeigeGekonnt({ name: "Mengen bis 5 auf einen Blick", sprich: "Mengen auf einen Blick" });
  if (params.has("pause") || params.has("hinweis")) await zeigePause();
  await spieleRunde(vorschau);
}

start().catch((e) => {
  protokoll(`${SPIEL_ID}: ${/** @type {any} */ (e)?.message ?? e}`);
  stand.phase = "fehler";
  erzaehler.gehtNicht();
});
