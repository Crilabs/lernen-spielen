// M08 Stellentafel (Idee: docs/spiele/mathe/m08-stellentafel.md, Wanderung Christian 2026-11-16). Auf der Matte steht
// eine Aufgabe wie 10 + 8 oder 18 − 10 aus Zifferntäfelchen (Rand in der Farbe der Stelle), unter jeder Zahl ihr
// Material. Das Kind tippt das Ergebnis in zwei Plätze, Zehner und Einer, und bestätigt mit dem Haken. Dann wandern
// die Ziffern der Aufgabe und ihr Material in die Stellentafel: die 1 der 10 zu den Zehnern, die 8 zu den Einern, die
// 0 bleibt zurück – „vor die 8 kommt die 1“, ohne zu rechnen. Passt eine Stelle nicht, bleibt ihre Ziffer neben dem
// Platz schweben. Timo steht daneben, nimmt bei Minus das Weggenommene mit und freut sich.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   AUFGABE    Timo, Matte, Plätze; eine Aufgabe darstellen, prüfen (die Wanderung urteilt), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): eine kleine Geschichte, das Kind tippt das Beispiel selbst
//   RAHMEN     aus der Vorlage; die Lernsteuerung bestimmt die Länge der Runde (kein AUFGABEN_JE_RUNDE)
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=).

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/knopf.js";
import "../../rahmen/tastatur.js";
import "../../rahmen/perlenstab.js";
import * as Runde from "../../runde/runde.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { einfuehrungsLauf } from "../../rahmen/einfuehrung-lauf.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { aufgabeAus, anzeige, kandidaten, danebenSatz, probeVon, perlenTon, perleHell, naechsteFreude, witz, bildWechsel, leereStellen, tippeStelle, waehleStelle, loescheStelle, zahlAusStellen, falscheStellen, naechsterStellenZug, zuegeZu, aufgabenTaefelchen, vorFertig } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const aufgabeFeld = $("aufgabe");
const tastatur = $("tastatur");
const fertigKnopf = $("fertig");
const hof = $("hof");
const feldE = $("feld-e");
const realZ = $("real-z");
const realE = $("real-e");
const figuren = $("figuren");
const timoEl = $("timo");
const timoKoerper = $("timo-koerper");
const schatten = $("schatten");
const schoss = $("schoss");

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "rechnen", max: 20, zehner: true, stufen: ["kopf"] }];

/** Die Folge einer Lösung steht nach der Wirkung noch so lange, dann kommt die nächste Aufgabe (Tippen überspringt). */
const NACH_WIRKUNG_MS = 80;
/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Regeln §1: etwa 2,5 s, höchstens 3 s). */
const FOLGE_MAX_MS = 2900;
/** Der Satz zu einem Wechsel steht mindestens so lange, auch ohne Ton. */
const WECHSEL_SATZ_MS = 1300;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Zehn und noch was", aufgaben: ["plus:4+10", "plus:7+10", "minus:13-10", "minus:16-6"] };

/** Sätze aus Daten (je Aufgabe und Zahl ausgeschrieben, texte.json). */
const TEXTE = await fetch(new URL("texte.json", import.meta.url)).then((r) => r.json()).catch(() => null);

/** Der zuletzt begonnene Satz nach einer Lösung; vor dem nächsten Satz des Spiels wartet es darauf. @type {Promise<any>} */
let letzterSatz = Promise.resolve();

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Die Aufgabe nur zum Noch-mal-hören (wird nicht von selbst gesprochen). @param {any} a */
  aufgabe: (a) => (TEXTE?.aufgabe?.[a.key] ? blase.sage(TEXTE.aufgabe[a.key], { sprechen: false }) : Promise.resolve("still")),
  /** „10 plus 4 ist 14.“ (nach Fehlversuch oder Hilfe). @param {any} a */
  gleichung: (a) => (TEXTE?.gleichung?.[a.key] ? blase.sage(TEXTE.gleichung[a.key]) : Promise.resolve("still")),
  /** Was an der getippten Zahl nicht passt. @param {number} w @param {number} antwort */
  daneben: (w, antwort) => {
    const s = danebenSatz(w, antwort);
    const text = TEXTE?.daneben?.[s.art]?.[s.n];
    return text ? blase.sage(text) : Promise.resolve("still");
  },
  /** Hilfe 1, die Probe. @param {any} a */
  probe: (a) => {
    const p = probeVon(a);
    const text = a.op === "plus" ? TEXTE?.hilfe1?.plus?.[a.e] : TEXTE?.hilfe1?.[p.satz];
    return text ? blase.sage(text, { zeigen: true }) : Promise.resolve("still");
  },
  /** Hilfe 2, die Lösung (das Kind tippt selbst). @param {any} a */
  loesung: (a) => {
    const text = a.op === "plus" ? TEXTE?.hilfe2?.legt?.[a.c] : TEXTE?.hilfe2?.bleibt?.[a.antwort];
    return text ? blase.sage(text, { zeigen: true }) : Promise.resolve("still");
  },
  /** Die Rechenart wechselt (Regeln §8). @param {"wegnehmen" | "dazulegen"} art */
  wechsel: (art) => (art === "wegnehmen" ? blase.sage("Jetzt nimmt Timo etwas weg.") : blase.sage("Jetzt legt Timo etwas dazu.")),
  /** Richtig bei Plus: „Zehn und acht. Achtzehn.“ – man hört die Acht in der Achtzehn (Christian, 2026-11-16). @param {any} a */
  richtig: (a) => (TEXTE?.richtig?.[a.key] ? blase.sage(TEXTE.richtig[a.key]) : Promise.resolve("still")),
  /** Nach einem Fehlversuch ein klarer Auftrag (Christian, 2026-11-16, wie M06). */
  nochmal: () => blase.sage("Versuch es noch einmal."),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/** Zählt die Tipps des Kindes: Ein Satz nach einer Wirkung fällt weg, wenn das Kind inzwischen getippt hat. */
let tippZaehler = 0;
document.addEventListener("pointerdown", () => { tippZaehler++; }, true);

/**
 * Die Sätze der Einführung (docs/spielbau.md §8, Review Christian 2026-11-16: in Ruhe, als kleine Geschichte; Zehner
 * und Einer werden genannt, nicht abgekürzt). Jeder steht als feste Zeichenkette in blase.sage (für `npm run audio`).
 */
const einleitung = {
  raeumt: (/** @type {any} */ o) => blase.sage("Timo räumt heute das Perlenmaterial ein.", o),
  perlen: (/** @type {any} */ o) => blase.sage("Unter jeder Zahl liegen ihre Perlen.", o),
  zehner: (/** @type {any} */ o) => blase.sage("Die Zehnerstangen kommen in dieses Feld.", o),
  einer: (/** @type {any} */ o) => blase.sage("Die kleinen Stäbchen kommen zu den Einern.", o),
  aufgabe: (/** @type {any} */ o) => blase.sage("Oben steht eine Aufgabe.", o),
  platzZ: (/** @type {any} */ o) => blase.sage("Die Zehner tippst du hier.", o),
  platzE: (/** @type {any} */ o) => blase.sage("Die Einer tippst du hier.", o),
  beispielPlus: (/** @type {any} */ o) => blase.sage("Zum Beispiel zehn plus drei.", o),
  beispielMinus: (/** @type {any} */ o) => blase.sage("Zum Beispiel dreizehn minus zehn.", o),
  tippeDreizehn: (/** @type {any} */ o) => blase.sage("Tippe die Eins und die Drei.", o),
  tippeDrei: (/** @type {any} */ o) => blase.sage("Tippe die Drei.", o),
  haken: (/** @type {any} */ o) => blase.sage("Dann tippe auf den Knopf mit dem Haken.", o),
  nimmt: (/** @type {any} */ o) => blase.sage("Timo nimmt die Stange mit.", o),
  andere: (/** @type {any} */ o) => blase.sage("Passt eine Zahl nicht, siehst du es.", o),
  nochmal: (/** @type {any} */ o) => blase.sage("Dann probierst du es einfach noch einmal.", o),
  vertippt: (/** @type {any} */ o) => blase.sage("Vertippt? Tippe auf den Knopf neben der Null.", o),
  lernen: (/** @type {any} */ o) => blase.sage("So lernst du Zehner und Einer.", o),
  los: (/** @type {any} */ o) => blase.sage("Jetzt geht es los.", o),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Auf der Matte steht eine Aufgabe wie 10 + 8 aus Zifferntäfelchen, unter jeder Zahl ihr
    Montessori-Perlenmaterial (goldene Zehnerstange, farbiges Stäbchen für die Einer). Ihr Kind tippt das Ergebnis
    getrennt nach Zehnern und Einern. Dann wandern die Ziffern und die Perlen in die Stellentafel: die 1 der 10 zu den
    Zehnern, die 8 zu den Einern. So wird sichtbar, dass man 10 + 8 nicht ausrechnen muss – vor die 8 kommt einfach die
    1. Passt eine Stelle nicht, sieht man genau, welche.</p>
    <p>Welche Aufgaben dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Pause (K1, K8): eine Zahl aus Bündel und einzelnen Stiften, dazu das Angebot zum Mitmachen (Idee §6).
 * @param {HTMLElement} feld @param {boolean} ton
 */
function fuelleSachmoment(feld, ton) {
  feld.replaceChildren();
  const stifte = document.createElement("div");
  stifte.className = "stifte";
  for (const [w, zahl, stelle] of [[10, "10", "z"], [4, "4", "e"]]) {
    const stab = document.createElement("ls-perlenstab");
    stab.setAttribute("wert", String(w));
    const k = document.createElement("ls-stellenwertkarte");
    k.setAttribute("zahl", zahl);
    k.setAttribute("stelle", stelle);
    k.style.setProperty("--karte-hoehe", "8rem");
    stifte.append(stab, k);
  }
  const satz = document.createElement("p");
  satz.textContent = "Leg eine Zahl mit Bündeln und einzelnen Stiften.";
  feld.append(stifte, satz);
  if (ton) sprich("Leg eine Zahl mit Bündeln und einzelnen Stiften.");
}

// --- Klänge (Web Audio, leise; Ton aus gilt) ---------------------------------------------------------
/** @type {AudioContext | null} */
let audio = null;
/** @param {number} hz @param {{ dauer?: number, typ?: OscillatorType, laut?: number, gleiten?: number, spaeter?: number }} [o] */
function ton(hz, { dauer = 0.13, typ = "triangle", laut = 0.07, gleiten = 0, spaeter = 0 } = {}) {
  if (!leiste.ton || lauf?.skip) return;
  try {
    audio ??= new AudioContext();
    if (audio.state === "suspended") audio.resume().catch(() => {});
    const t = audio.currentTime + spaeter;
    const o = audio.createOscillator();
    const g = audio.createGain();
    o.type = typ;
    o.frequency.setValueAtTime(hz, t);
    if (gleiten) o.frequency.exponentialRampToValueAtTime(hz * gleiten, t + dauer);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(laut, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dauer);
    o.connect(g).connect(audio.destination);
    o.start(t);
    o.stop(t + dauer + 0.03);
  } catch {
    // ohne Web Audio: still
  }
}
const klang = {
  /** Weiches, dumpfes Klack der Stange. */
  klack: () => ton(170, { dauer: 0.16, typ: "sine", laut: 0.14, gleiten: 0.6 }),
  /** Perle i: eine Stufe höher als die vorige; ab der fünften klingt ein heller Oberton mit. @param {number} i */
  perle: (i) => {
    ton(perlenTon(i));
    if (perleHell(i)) ton(perlenTon(i) * 2, { spaeter: 0.02, laut: 0.03, dauer: 0.09 });
  },
  /** Eine Perle wird genommen: ein tieferer, abwärts gleitender Ton. @param {number} i */
  perleWeg: (i) => ton(perlenTon(i) * 0.5, { dauer: 0.1, typ: "sine", laut: 0.06, gleiten: 0.8 }),
  /** @param {number} [f] Tonhöhe relativ (Zehner tiefer) */
  plopp: (f = 1) => ton(740 * f, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }),
  boing: () => ton(196, { dauer: 0.38, typ: "sine", laut: 0.06, gleiten: 1.5 }),
};

// =====================================================================================================
// AUFGABE
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;
const mitte = (/** @type {DOMRect} */ r) => ({ x: r.left + r.width / 2, y: r.top + r.height / 2 });

// --- Läufe: jede Wirkung läuft in einem Lauf; Tippen und die nächste Aufgabe springen ans Ende ---------------
/** @typedef {{ skip: boolean, anims: Set<Animation>, uhren: Set<() => void> }} Lauf */
/** @type {Lauf | null} */
let lauf = null;

/** Beginnt einen neuen Lauf (der alte springt ans Ende). @returns {Lauf} */
function neuerLauf() {
  ueberspringeAlles();
  lauf = { skip: wenigBewegung(), anims: new Set(), uhren: new Set() };
  return lauf;
}
/** Alles, was läuft, ist sofort im Endzustand; was danach kommt, ebenso. */
function ueberspringeAlles() {
  if (!lauf) return;
  lauf.skip = true;
  for (const a of [...lauf.anims]) {
    try { a.finish(); } catch { /* schon fertig */ }
  }
  for (const f of [...lauf.uhren]) f();
}
/** @param {number} ms */
function warte(ms) {
  const l = lauf;
  return new Promise((ok) => {
    if (!l || l.skip) return ok(undefined);
    const fertig = () => { clearTimeout(t); l.uhren.delete(fertig); ok(undefined); };
    const t = setTimeout(fertig, ms);
    l.uhren.add(fertig);
  });
}
/**
 * Spielt eine Animation, setzt danach den Endzustand als Stil und räumt sie ab.
 * @param {HTMLElement} el @param {Keyframe[]} frames @param {number} ms @param {Partial<CSSStyleDeclaration>} [ende] Stil danach
 * @param {{ easing?: string, verzoegerung?: number }} [o]
 */
async function bewege(el, frames, ms, ende = {}, { easing = "ease-in-out", verzoegerung = 0 } = {}) {
  const l = lauf;
  if (!l || l.skip || typeof el.animate !== "function") {
    Object.assign(el.style, ende);
    return;
  }
  const a = el.animate(frames, { duration: ms, easing, delay: verzoegerung, fill: "forwards" });
  l.anims.add(a);
  await a.finished.catch(() => undefined);
  l.anims.delete(a);
  Object.assign(el.style, ende);
  a.cancel();
}

/** Tasten, die eine Folge oder Szene abkürzen (wie ein Tipp). */
const KUERZT = new Set(["Enter", " ", "Escape"]);
/**
 * Ruft fn beim nächsten Tipp irgendwo auf der Seite oder bei Enter, Leertaste, Escape (Regeln §1).
 * @param {() => void} fn @returns {() => void} abmelden
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

// --- Timo ---------------------------------------------------------------------------------------------
/** Fußpunkt im Feld der Figur (spiele/runde: viewBox 320 × 280, Fuß bei 160, 254). */
const FUSS = 254 / 280;
timoKoerper.innerHTML = Runde.zeichne("timo", { haltung: "tragen", blick: "rechts" });
const timo = Runde.steuere(timoKoerper.querySelector("svg"));
/** Wo Timo gerade steht (Mitte, px) und auf welcher Höhe der Boden ist. */
let timoX = 0;
const bodenY = () => hof.getBoundingClientRect().bottom - 2.6 * remPx();
const timoTransform = (/** @type {number} */ x) => `translate(${(x - timoEl.offsetWidth / 2).toFixed(1)}px, ${(bodenY() - timoEl.offsetHeight * FUSS).toFixed(1)}px)`;
const schattenTransform = (/** @type {number} */ x) => `translate(${x.toFixed(1)}px, ${bodenY().toFixed(1)}px)`;
/** Timos Platz: mitten in der linken Spalte neben der Matte (die Plätze unten in der Tafel bleiben frei). */
const startX = () => hof.getBoundingClientRect().left - 2.4 * remPx() - (matchMedia("(max-aspect-ratio: 3/2)").matches ? 10 : 12) * remPx();

/** Timo steht auf x, ohne Bewegung. @param {number} x */
function stelleTimo(x) {
  timoX = x;
  timoEl.getAnimations().forEach((a) => a.cancel());
  schatten.getAnimations().forEach((a) => a.cancel());
  timoEl.style.transform = timoTransform(x);
  schatten.style.transform = schattenTransform(x);
}
/** Timo rollt nach x (ein leichtes Wippen im Körper). @param {number} x @param {number} [ms] */
async function rolle(x, ms = 380) {
  const von = timoX;
  timoX = x;
  if (Math.abs(x - von) < 2) return;
  const wippen = bewege(timoKoerper, [{ transform: "rotate(0deg)" }, { transform: "rotate(-1.8deg)", offset: 0.25 }, { transform: "rotate(0.6deg)", offset: 0.75 }, { transform: "rotate(0deg)" }], ms, {}, { easing: "ease-in-out" });
  await Promise.all([
    bewege(timoEl, [{ transform: timoTransform(von) }, { transform: timoTransform(x) }], ms, { transform: timoTransform(x) }, { easing: "cubic-bezier(.45,.05,.3,1)" }),
    bewege(schatten, [{ transform: schattenTransform(von) }, { transform: schattenTransform(x) }], ms, { transform: schattenTransform(x) }, { easing: "cubic-bezier(.45,.05,.3,1)" }),
    wippen,
  ]);
}

// --- Die Matte: Aufgabe aus Täfelchen, Material darunter, Plätze in der Stellentafel ---------------------------
// Die Oberfläche ist das Spiel (Christian, 2026-11-16): Alles auf der Matte ist Material. Die Ziffern der Aufgabe sind
// Täfelchen mit dem Rand ihrer Stelle, unter jeder Zahl liegt ihr Material; die Plätze unten nehmen die getippten
// Täfelchen auf. Beim Haken wandern Ziffern (als Kopie, die Aufgabe bleibt lesbar) und Material in die Tafel.
const platzEl = { z: $("platz-z"), e: $("platz-e") };
const realEl = { z: realZ, e: realE };
/** Ebene für fliegende Täfelchen, über der Matte. */
const fluege = document.createElement("div");
Object.assign(fluege.style, { position: "fixed", inset: "0", zIndex: "8", pointerEvents: "none", overflow: "hidden" });
document.body.append(fluege);

/** Was gerade auf der Matte liegt. lage: leer, start (Aufgabe steht), probe (Hilfe 1: Material in der Tafel), fertig. */
const B = {
  /** @type {any} */ a: null,
  lage: "leer",
  /** @type {{ el: HTMLElement, info: any }[]} */ ziffern: [],
  /** @type {{ el: HTMLElement, info: any, heim: HTMLElement }[]} */ stoff: [],
  /** @type {import("./logik.js").Stellen} */ s: leereStellen(),
  /** Schwebende Ziffern eines Fehlversuchs. @type {HTMLElement[]} */ flieger: [],
};

/** @param {string} tag @param {Record<string, string>} [attr] */
function neu(tag, attr = {}) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attr)) el.setAttribute(k, v);
  return el;
}
/** Ein Zifferntäfelchen mit dem Rand seiner Stelle. @param {string} ziffer @param {"z" | "e"} stelle */
function taefelchen(ziffer, stelle) {
  const el = neu("div", { class: "taefelchen", "data-stelle": stelle });
  el.textContent = ziffer;
  return el;
}

/**
 * Die Plätze zeigen den Stand s: getippte Täfelchen; der Sonnenring liegt auf dem aktiven Platz (oder auf `ringAuf`,
 * z. B. wenn die Hilfe einen anderen Platz zeigt; null = kein Ring).
 * @param {import("./logik.js").Stellen} s @param {{ ring?: boolean, ringAuf?: "z" | "e" | null }} [o]
 */
function zeigeStellen(s, { ring = true, ringAuf } = {}) {
  const auf = ringAuf === undefined ? s.aktiv : ringAuf;
  for (const k of /** @type {("z" | "e")[]} */ (["z", "e"])) {
    const p = platzEl[k];
    const hat = p.firstElementChild?.textContent ?? "";
    if (hat !== s[k]) p.replaceChildren(...(s[k] ? [taefelchen(s[k], k)] : []));
    p.classList.toggle("markiert", ring && auf === k);
    p.setAttribute("aria-label", `${k === "z" ? "Zehner" : "Einer"}${s[k] ? `: ${s[k]}` : ""}`);
  }
}

/**
 * Zählt jedes Wegräumen des Bildes (holeZurueck, leereMatte): Eine Wirkung, die noch fliegt, merkt daran, dass ihr Bild
 * inzwischen weg ist, und legt nichts mehr hin (sonst blieben schwebende Ziffern stehen, Abschlussprüfung).
 */
let bildNr = 0;

/** Die Matte ist leer, Timo steht an seinem Platz, nichts liegt auf seinem Schoß. */
function leereMatte() {
  bildNr++;
  aufgabeFeld.replaceChildren();
  realZ.replaceChildren();
  realE.replaceChildren();
  schoss.replaceChildren();
  for (const f of B.flieger) f.remove();
  for (const k of /** @type {("z" | "e")[]} */ (["z", "e"])) platzEl[k].classList.remove("passt-nicht");
  Object.assign(B, { a: null, lage: "leer", ziffern: [], stoff: [], s: leereStellen(), flieger: [] });
  zeigeStellen(B.s, { ring: false });
  timo.haltung("tragen", { ms: 0 });
}

/** Legt die Aufgabe auf die Matte: Zahlen aus Täfelchen, unter jeder Zahl ihr Material. @param {any} a */
function legeAufgabe(a) {
  leereMatte();
  B.a = a;
  B.lage = "start";
  stelleTimo(startX());
  const t = aufgabenTaefelchen(a);
  /** @type {any[]} */
  const gruppen = [];
  /** @type {any} */
  let g = null;
  for (const x of t.taefelchen) {
    if (x.art === "zeichen") {
      gruppen.push({ zeichen: x.zeichen });
      g = null;
    } else {
      if (!g) gruppen.push((g = { ziffern: [] }));
      g.ziffern.push(x);
    }
  }
  let zahlNr = 0;
  for (const gr of gruppen) {
    if (gr.zeichen) {
      const el = neu("div", { class: "zeichen", "aria-hidden": "true" });
      el.textContent = gr.zeichen;
      aufgabeFeld.append(el);
      continue;
    }
    const zahl = neu("div", { class: "zahl" });
    const zif = neu("div", { class: "ziffern" });
    const stoff = neu("div", { class: "stoff" });
    for (const x of gr.ziffern) {
      const el = taefelchen(x.ziffer, x.stelle);
      zif.append(el);
      B.ziffern.push({ el, info: x });
    }
    for (const m of t.material.filter((/** @type {any} */ m) => m.unter === zahlNr)) {
      const el = neu("ls-perlenstab", { wert: String(m.wert), ausrichtung: "waagrecht" });
      stoff.append(el);
      B.stoff.push({ el, info: m, heim: stoff });
    }
    zahl.append(zif, stoff);
    aufgabeFeld.append(zahl);
    zahlNr++;
  }
  aufgabeFeld.setAttribute("aria-label", anzeige(a));
  aufgabeFeld.classList.remove("still");
}

/**
 * Ein Teil zieht um (FLIP): es kommt in `ziel` und gleitet im Bogen von seinem alten Platz dorthin.
 * @param {HTMLElement} el @param {HTMLElement} ziel @param {{ ms?: number, verzoegerung?: number }} [o]
 */
async function ziehtUm(el, ziel, { ms = 900, verzoegerung = 0 } = {}) {
  if (el.parentElement === ziel) return;
  const vor = el.getBoundingClientRect();
  ziel.append(el);
  const nach = el.getBoundingClientRect();
  const dx = vor.left - nach.left;
  const dy = vor.top - nach.top;
  const rem = remPx();
  await bewege(el, [
    { transform: `translate(${dx}px, ${dy}px)` },
    { transform: `translate(${dx * 0.45}px, ${dy * 0.45 - 4 * rem}px)`, offset: 0.5 },
    { transform: "translate(0, 0)" },
  ], ms, { transform: "" }, { easing: "ease-in-out", verzoegerung });
}

/**
 * Eine Kopie eines Täfelchens fliegt im Bogen von `von` zum Rechteck `ziel` (Mitte) und bleibt dort mit `versatz`
 * stehen (für einen Fehlversuch) oder verschwindet (dann liegt dort schon das getippte Täfelchen).
 * @param {HTMLElement} von @param {DOMRect} ziel @param {{ ms?: number, verzoegerung?: number, versatz?: [number, number], ziffer?: string, stelle?: "z" | "e" }} [o]
 * @returns {Promise<HTMLElement | null>} die schwebende Kopie (nur mit versatz)
 */
async function fliegeZiffer(von, ziel, { ms = 800, verzoegerung = 0, versatz, ziffer, stelle } = {}) {
  const r = von.getBoundingClientRect();
  const el = /** @type {HTMLElement} */ (ziffer ? taefelchen(ziffer, stelle ?? "e") : von.cloneNode(true));
  el.classList.remove("verblasst");
  el.classList.add("flug");
  Object.assign(el.style, { width: `${r.width - 0.4 * remPx()}px`, height: `${r.height - 0.4 * remPx()}px`, boxSizing: "border-box" });
  fluege.append(el);
  const x0 = r.left;
  const y0 = r.top;
  const [vx, vy] = versatz ?? [0, 0];
  const x1 = ziel.left + ziel.width / 2 - r.width / 2 + vx;
  const y1 = ziel.top + ziel.height / 2 - r.height / 2 + vy;
  const rem = remPx();
  const ende = { transform: `translate(${x1}px, ${y1}px)${versatz ? " rotate(6deg)" : ""}` };
  el.style.transform = `translate(${x0}px, ${y0}px)`;
  await bewege(el, [
    { transform: `translate(${x0}px, ${y0}px) scale(1)` },
    { transform: `translate(${x0 + (x1 - x0) * 0.4}px, ${Math.min(y0, y1) - 5 * rem}px) scale(1.08) rotate(-5deg)`, offset: 0.45 },
    ende,
  ], ms, ende, { easing: "cubic-bezier(.45,.05,.35,1)", verzoegerung });
  if (versatz) return el;
  el.remove();
  return null;
}

/** Ein Täfelchen auf einem Platz rastet ein (kurzes Überschwingen). @param {"z" | "e"} k */
function rastetEin(k) {
  const t = /** @type {HTMLElement | null} */ (platzEl[k].firstElementChild);
  klang.plopp(k === "z" ? 0.75 : 1);
  if (t) bewege(t, [{ transform: "scale(1)" }, { transform: "scale(1.12)", offset: 0.4 }, { transform: "scale(1)" }], 220);
}

/** Ein Platz wackelt (seine Ziffer passt nicht, oder er ist leer). @param {"z" | "e"} k @param {{ passtNicht?: boolean }} [o] */
function wackelt(k, { passtNicht = true } = {}) {
  if (passtNicht) platzEl[k].classList.add("passt-nicht");
  bewege(platzEl[k], [{ transform: "rotate(0deg)" }, { transform: "rotate(-5deg)", offset: 0.25 }, { transform: "rotate(4deg)", offset: 0.55 }, { transform: "rotate(-2deg)", offset: 0.8 }, { transform: "rotate(0deg)" }], 460);
}

/** Ein Täfelchen rutscht von seinem Platz nach oben weg und verschwindet (die 0 im Zehner beim Haken). @param {Element | null} el */
function rutschtWeg(el) {
  if (!el) return;
  const r = el.getBoundingClientRect();
  const k = /** @type {HTMLElement} */ (el.cloneNode(true));
  k.classList.add("flug");
  Object.assign(k.style, { width: `${r.width}px`, height: `${r.height}px`, boxSizing: "border-box", transform: `translate(${r.left}px, ${r.top}px)` });
  fluege.append(k);
  bewege(k, [{ transform: `translate(${r.left}px, ${r.top}px)`, opacity: 1 }, { transform: `translate(${r.left}px, ${r.top - 4 * remPx()}px)`, opacity: 0 }], 320, { opacity: "0" }, { easing: "ease-in" }).then(() => k.remove());
}

/** Das getippte Täfelchen kommt aus dem Ziffernkasten geflogen. @param {string} ziffer @param {"z" | "e"} k */
function ausDemKasten(ziffer, k) {
  const t = /** @type {HTMLElement | null} */ (platzEl[k].firstElementChild);
  const taste = tastatur.shadowRoot?.querySelector(`button[data-z="${ziffer}"]`);
  if (!t || !taste) return;
  const a = taste.getBoundingClientRect();
  const b = t.getBoundingClientRect();
  bewege(t, [{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px) scale(0.7)` }, { transform: "translate(0, 0) scale(1)" }], 220, { transform: "" }, { easing: "ease-out" });
}

/** Das Material, das in die Tafel wandert, liegt still in seiner Spalte (Hilfe 1, die Probe); was geht, hat den Sonnenring. */
function zeigeProbe() {
  if (B.lage !== "start") return;
  B.lage = "probe";
  for (const m of B.stoff) {
    if (m.info.rolle === "wandert") ziehtUm(m.el, realEl[/** @type {"z" | "e"} */ (m.info.stelle)], { ms: 500 });
    else m.el.classList.add("markiert");
  }
}

/** Nach einem Fehlversuch: schwebende Ziffern weg, Material zurück unter die Aufgabe, Plätze ruhig. */
function holeZurueck() {
  bildNr++;
  for (const f of B.flieger) f.remove();
  B.flieger = [];
  for (const k of /** @type {("z" | "e")[]} */ (["z", "e"])) platzEl[k].classList.remove("passt-nicht");
  if (B.lage === "start") for (const m of B.stoff) ziehtUm(m.el, m.heim, { ms: 300 });
  timo.haltung("tragen", { ms: 160 });
}

// --- Wirkungen -----------------------------------------------------------------------------------------
/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();
let vorigeFreude = /** @type {string | null} */ (null);
let seitWitz = 0;

/** Ein Teil fliegt zu Timo auf den Schoß und liegt dann dort (Minus: er nimmt es mit). @param {HTMLElement} el */
async function zuTimo(el) {
  const ziel = schoss.getBoundingClientRect();
  const r = el.getBoundingClientRect();
  const dx = ziel.left + 3 * remPx() - r.left;
  const dy = ziel.top - r.top;
  const rem = remPx();
  await bewege(el, [
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
    { transform: `translate(${dx * 0.55}px, ${dy * 0.55 - 5 * rem}px) scale(0.75)`, offset: 0.55, opacity: 1 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.5)`, opacity: 0 },
  ], 520, { visibility: "hidden", transform: "" }, { easing: "ease-in" });
}

/**
 * Minus: was weggeht (Stange oder Stäbchen und die Ziffern dazu), fliegt zu Timo auf den Schoß; bei c − e kommt unter
 * der Einerziffer eine 0 zum Vorschein. Danach rollt Timo ein Stück weg. @param {any} a
 */
async function gehtZuTimo(a) {
  const geht = B.stoff.filter((m) => m.info.rolle === "geht");
  const zif = B.ziffern.filter((z) => z.info.rolle === "geht");
  await Promise.all([
    ...geht.map((m) => zuTimo(m.el)),
    ...zif.map((z) => fliegeZiffer(z.el, schoss.getBoundingClientRect(), { ms: 520 })),
  ]);
  for (const m of geht) schoss.append(neu("ls-perlenstab", { wert: String(m.info.wert) }));
  klang.klack();
  for (const z of zif) {
    if (aufgabenTaefelchen(a).nullDarunter && z.info.stelle === "e") {
      // Die 0 darunter kommt zum Vorschein; sie wandert gleich auf den Einer-Platz.
      z.el.textContent = "0";
      z.info = { ...z.info, ziffer: "0", rolle: "wandert" };
      bewege(z.el, [{ transform: "scale(0.85)", opacity: 0.4 }, { transform: "scale(1)", opacity: 1 }], 220);
    } else z.el.classList.add("verblasst");
  }
  await rolle(startX() - 9 * remPx(), 320);
}

/** Timo freut sich (zufällig, nie zweimal gleich) oder macht einen Witz. @param {any} a @returns {{ fertig: Promise<any>, art: string | null }} */
function freue(a) {
  const w = witz(a, ++seitWitz);
  const bewegung = w ?? naechsteFreude(vorigeFreude);
  if (w) seitWitz = 0;
  else vorigeFreude = bewegung;
  timoEl.dataset.freude = bewegung;
  if (w === "winken") {
    timo.haltung("winken", { ms: 160 });
    const fertig = warte(700).then(() => timo.haltung("tragen", { ms: 200 }));
    return { fertig, art: w };
  }
  if (w === "perle") return { fertig: rolltDavon(), art: w };
  const fertig = timo.bewegung(w ? "nicken" : bewegung);
  return { fertig, art: w };
}
/** Eine Perle rollt davon, Timo fängt sie mit der Hand (10 + 9). */
async function rolltDavon() {
  const rem = remPx();
  const el = document.createElement("div");
  Object.assign(el.style, { position: "absolute", left: "0", top: "0", width: `${3 * rem}px`, height: `${3 * rem}px`, borderRadius: "50%", background: "#D9A520", border: `${0.35 * rem}px solid #3B2A6B`, zIndex: "9" });
  figuren.append(el);
  const x0 = timoX + 4 * rem;
  const y0 = bodenY() - 3.5 * rem;
  const t = (/** @type {number} */ x, /** @type {number} */ w) => `translate(${x}px, ${y0}px) rotate(${w}deg)`;
  await bewege(el, [{ transform: t(x0, 0) }, { transform: t(x0 + 14 * rem, 260), offset: 0.5 }, { transform: t(x0 + 2 * rem, 0) }], 700, {}, { easing: "ease-in-out" });
  el.remove();
}

/**
 * Richtig – die Wanderung (Christian, 2026-11-16): Bei Minus geht zuerst das Weggenommene zu Timo. Dann fliegen die
 * Ziffern der Aufgabe, die zur Antwort gehören, im Bogen auf ihre Plätze und rasten auf den getippten Täfelchen ein;
 * das Material wandert mit in seine Spalte; bei Plus verblasst die 0 der 10. Timo freut sich. Bei Plus sagt die
 * Stimme „Zehn und acht. Achtzehn.“, bei Minus nach Fehlversuch oder Hilfe die Gleichung. Bleibendes Bild: oben die
 * Aufgabe, unten Zehner und Einer mit Material.
 * @param {any} a @param {{ satz?: boolean, freude?: boolean }} [o]
 */
async function wirkungRichtig(a, { satz = false, freude = true } = {}) {
  B.lage = "fertig";
  zeigeStellen(B.s, { ring: false });
  timo.haltung("tragen", { ms: 120 });
  if (a.op === "minus") await gehtZuTimo(a);
  const wandern = B.ziffern.filter((z) => z.info.rolle === "wandert");
  /** @type {Promise<any> | null} */
  let gefreut = null;
  const ziffern = wandern.map((z, i) => {
    const k = /** @type {"z" | "e"} */ (z.info.stelle);
    return fliegeZiffer(z.el, platzEl[k].getBoundingClientRect(), { verzoegerung: i * 150 }).then(() => rastetEin(k));
  });
  const stoff = B.stoff.filter((m) => m.info.rolle === "wandert").map((m, i) => ziehtUm(m.el, realEl[/** @type {"z" | "e"} */ (m.info.stelle)], { verzoegerung: i * 150 }).then(() => klang.klack()));
  if (a.op === "plus") B.ziffern.filter((z) => z.info.rolle === "bleibt").forEach((z) => z.el.classList.add("verblasst"));
  const freudeZeit = (async () => {
    await warte(850);
    if (freude) gefreut = freue(a).fertig;
  })();
  await Promise.all([...ziffern, ...stoff, freudeZeit]);
  if (a.op === "plus") letzterSatz = erzaehler.richtig(a).catch(() => undefined);
  else if (satz) letzterSatz = erzaehler.gleichung(a).catch(() => undefined);
  await (gefreut ?? Promise.resolve());
}

/**
 * Daneben: Was passt, wandert und rastet ein; die Ziffer einer Stelle, die nicht passt, fliegt bis an ihren Platz und
 * bleibt schwebend neben der getippten Ziffer stehen, der Platz wackelt; ihr Material bleibt oben. Timo staunt.
 * Danach der Satz nach Spalte und der Auftrag. Nichts setzt zurück (N7); der nächste Tipp holt alles zurück.
 * @param {any} a @param {import("./logik.js").Stellen} s
 */
async function wirkungDaneben(a, s) {
  const falsch = falscheStellen(s, a.antwort);
  const w = zahlAusStellen(s) ?? 0;
  timo.haltung("staunen", { ms: 200 });
  zeigeStellen(s, { ring: false });
  const t = aufgabenTaefelchen(a);
  const nr = bildNr;
  // Die Ziffern, die zur Antwort gehören (bei c − e die 0 unter der Einerziffer).
  const ziele = B.ziffern.filter((z) => z.info.rolle === "wandert").map((z) => ({ von: z.el, stelle: /** @type {"z" | "e"} */ (z.info.stelle), ziffer: undefined }));
  if (t.nullDarunter) {
    const unter = B.ziffern.find((z) => z.info.rolle === "geht" && z.info.stelle === "e");
    if (unter) ziele.push({ von: unter.el, stelle: "e", ziffer: /** @type {any} */ ("0") });
  }
  const fluegeFertig = ziele.map(async (z, i) => {
    const passt = !falsch.includes(z.stelle);
    const ziel = platzEl[z.stelle].getBoundingClientRect();
    const kopie = await fliegeZiffer(z.von, ziel, { verzoegerung: i * 150, ziffer: z.ziffer, stelle: z.stelle, ...(passt ? {} : { versatz: [ziel.width * 0.62, -ziel.height * 0.42] }) });
    // Hat das Kind inzwischen getippt (oder kam Hilfe oder Anleitung), ist dieses Bild schon weggeräumt.
    if (nr !== bildNr) return kopie?.remove();
    if (kopie) B.flieger.push(kopie);
    if (passt) rastetEin(z.stelle);
  });
  const stoff = B.stoff.filter((m) => m.info.rolle === "wandert" && !falsch.includes(m.info.stelle)).map((m) => ziehtUm(m.el, realEl[/** @type {"z" | "e"} */ (m.info.stelle)]));
  await Promise.all([...fluegeFertig, ...stoff]);
  if (nr !== bildNr) return;
  klang.boing();
  for (const k of falsch) wackelt(k);
  const tipps = tippZaehler;
  const gesagt = await erzaehler.daneben(w, a.antwort);
  // Der Auftrag folgt nur, wenn der Satz zu Ende gesprochen ist und das Kind nicht schon wieder tippt.
  if (gesagt === "gesprochen" && tipps === tippZaehler) await erzaehler.nochmal();
}

/** Wohin die Eingaben gerade gehen (Aufgabe oder Einführung); null = nirgends. @type {{ taste: (t: string) => void, platz: (k: "z" | "e") => void, fertig: () => void } | null} */
let eingabeZiel = null;
tastatur.addEventListener("taste", (/** @type {any} */ e) => eingabeZiel?.taste(e.detail.zeichen));
fertigKnopf.addEventListener("click", () => eingabeZiel?.fertig());
platzEl.z.addEventListener("click", () => eingabeZiel?.platz("z"));
platzEl.e.addEventListener("click", () => eingabeZiel?.platz("e"));

/**
 * Sonnenring für einen Zug (Hilfe 2, Einführung): auf der Taste, dem Platz oder dem Knopf mit dem Haken.
 * @param {ReturnType<typeof naechsterStellenZug> | null} z
 */
function zeigeZug(z) {
  tastatur.markiere(z?.art === "taste" ? z.taste : null);
  fertigKnopf.classList.toggle("markiert", z?.art === "fertig");
  zeigeStellen(B.s, { ringAuf: z?.art === "platz" ? z.stelle : z?.art === "taste" ? B.s.aktiv : z ? null : B.s.aktiv });
}

/**
 * @param {{ ziel: { key: string, thema?: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const a = aufgabeAus(aufgabe.ziel.key);
  if (!a) throw new Error(`Stellentafel: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  neuerLauf();

  let fertig = false;
  let loesungGezeigt = false;
  let hilfeGezeigt = false;
  let versuche = 0;
  /** Zahlen, die bei dieser Aufgabe schon getippt wurden und nicht passten (nur für die Züge des Prüfstands). */
  const versucht = new Set();
  /** Das Bild eines Fehlversuchs steht; das nächste Tippen holt alles zurück. */
  let fehlerBild = false;

  const zeige = () => {
    legeAufgabe(a);
    erzaehler.aufgabe(a);
    zeigeStellen(B.s);
  };
  zeige();

  const markiere = () => zeigeZug(naechsterStellenZug(B.s, a.antwort));
  const ohneRing = () => {
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  };
  const raeumeFehlerBild = () => {
    if (!fehlerBild) return;
    fehlerBild = false;
    ueberspringeAlles();
    holeZurueck();
  };
  const nachEingabe = () => {
    if (loesungGezeigt) markiere();
    else zeigeStellen(B.s);
  };

  const ziel = {
    /** @param {string} t */
    taste(t) {
      if (fertig || E.laeuft) return;
      raeumeFehlerBild();
      const k = B.s.aktiv;
      B.s = t === "loeschen" ? loescheStelle(B.s) : tippeStelle(B.s, t);
      nachEingabe();
      if (t !== "loeschen") ausDemKasten(t, k);
    },
    /** @param {"z" | "e"} k */
    platz(k) {
      if (fertig || E.laeuft) return;
      raeumeFehlerBild();
      B.s = waehleStelle(B.s, k);
      nachEingabe();
    },
    fertig() {
      if (fertig || E.laeuft) return;
      // Der Haken bleibt nie ohne Reaktion: fehlen die Einer, wackelt ihr Platz und bekommt den Ring; eine 0 im
      // Zehner rutscht weg (Abschlussprüfung, ein Kind steckte sonst fest).
      const v = vorFertig(B.s);
      if (v.art === "einer-fehlt") {
        raeumeFehlerBild();
        B.s = v.s;
        nachEingabe();
        neuerLauf();
        wackelt("e", { passtNicht: false });
        return;
      }
      if (v.nullWeg) {
        rutschtWeg(platzEl.z.firstElementChild);
        B.s = v.s;
        zeigeStellen(B.s);
      }
      const zahl = zahlAusStellen(B.s);
      if (zahl === null) return;
      raeumeFehlerBild();
      if (zahl === a.antwort) {
        fertig = true;
        eingabeZiel = null;
        ohneRing();
        // Gemeldet wird sofort (die Zeit der Aufgabe endet mit Fertig); die Wirkung läuft in der Zeit der Folge.
        melde.geloest(aufgabe.ziel.key);
        neuerLauf();
        wirkungFertig = wirkungRichtig(a, { satz: versuche > 0 || hilfeGezeigt });
        return;
      }
      // Passt nicht: die Ziffern zeigen, welche Stelle nicht passt (N7, nichts setzt zurück).
      versuche++;
      melde.passtNicht();
      versucht.add(zahl);
      fehlerBild = true;
      neuerLauf();
      wirkungDaneben(a, B.s);
      if (loesungGezeigt) markiere();
    },
  };
  eingabeZiel = ziel;
  aufraeumen = () => {
    if (eingabeZiel === ziel) eingabeZiel = null;
    fehlerBild = false;
    ohneRing();
  };

  return {
    // Prüfstand: Züge zu den Zahlen, die ein ratendes Kind hier am ehesten tippt (Ergebnis, Zahlendreher, nur die
    // Einer, Nachbarn); eine Zahl, die eben nicht passte, tippt es nicht noch einmal.
    zuege() {
      if (fertig) return [];
      return zuegeZu(B.s, kandidaten(a.antwort).filter((x) => !versucht.has(x))).map(zugVon).filter(Boolean);
    },
    richtigerZug() {
      return fertig ? null : zugVon(naechsterStellenZug(B.s, a.antwort));
    },
    /** Nach der Einführung über „Anleitung“: die Aufgabe steht wieder da. */
    zeigeWieder() {
      neuerLauf();
      zeige();
      eingabeZiel = ziel;
      if (hilfeGezeigt || loesungGezeigt) this.hilfe(loesungGezeigt ? 2 : 1);
    },
    /** @param {1 | 2} hilfeStufe */
    hilfe(hilfeStufe) {
      if (fertig) return;
      raeumeFehlerBild();
      hilfeGezeigt = true;
      ueberspringeAlles();
      zeigeProbe();
      if (hilfeStufe === 1) {
        // Hat das Kind schon etwas getippt, das nicht passt, zeigt der Ring die Stelle.
        const falsch = versuche > 0 ? falscheStellen(B.s, a.antwort) : [];
        zeigeStellen(B.s, { ringAuf: falsch[0] ?? B.s.aktiv });
        return erzaehler.probe(a);
      }
      // Lösung: der nächste Zug im Sonnenring; das Kind tippt selbst (L12).
      loesungGezeigt = true;
      markiere();
      return erzaehler.loesung(a);
    },
  };
}

/** Selektor einer Taste („fertig“ ist der Knopf daneben). @param {string} t */
function tastenOrt(t) {
  if (t === "fertig") return "#fertig";
  const knopf = [...tastatur.shadowRoot.querySelectorAll("button[data-z]")].find((k) => k.dataset.z === t);
  return knopf ? selektor(knopf) : null;
}
const zug = (/** @type {string} */ t) => {
  const von = tastenOrt(t);
  return von ? { art: "tippen", von } : null;
};
/** Ein Zug der Stellen-Logik als Zug des Prüfstands. @param {ReturnType<typeof naechsterStellenZug>} z */
const zugVon = (z) => (z.art === "platz" ? { art: "tippen", von: `#platz-${z.stelle}` } : zug(z.art === "taste" ? z.taste : "fertig"));

/** Räumt die Bedienung der letzten Aufgabe ab (das Bild bleibt stehen, bis die nächste Aufgabe es holt). @type {() => void} */
let aufraeumen = () => {};
function raeumeAuf() {
  ueberspringeAlles();
  aufraeumen();
  aufraeumen = () => {};
}

/** Rechenart der Aufgabe, die zuletzt auf der Tafel stand (null vor der ersten). @type {"plus" | "minus" | null} */
let letzteArt = null;

/**
 * Vor einer Aufgabe: Wechselt die Rechenart, rollt Timo einmal über die Tafel, räumt alles auf den Schoß bzw. legt die
 * Startzahl hin, dazu höchstens ein Satz (Regeln §8, Idee §5). Sonst räumt Timo kurz auf (≤ 0,5 s). Ein Tipp kürzt ab.
 * Erst danach erscheint die Aufgabe (die Zeit läuft erst dann).
 * @param {any} a Aufgabe, die kommt
 */
async function bereiteBild(a) {
  stand.phase = "folge";
  neuerLauf();
  aufgabeFeld.classList.add("still");
  const wechsel = bildWechsel(letzteArt, a.op);
  /** @type {() => void} */
  let getippt = () => {};
  const tipp = new Promise((ok) => { getippt = () => ok(undefined); });
  const abmelden = beimTippen(() => {
    ueberspringeAlles();
    getippt();
  });
  try {
    let gesagt = Promise.resolve();
    if (wechsel) {
      await Promise.race([letzterSatz, tipp]);
      gesagt = erzaehler.wechsel(wechsel).catch(() => undefined);
    }
    const szene = (async () => {
      if (B.lage !== "leer") await raeumeBrett(!!wechsel);
    })();
    const satzZeit = wechsel ? Promise.race([Promise.all([gesagt, warte(WECHSEL_SATZ_MS)]), tipp]) : Promise.resolve();
    await Promise.all([szene, satzZeit]);
  } finally {
    abmelden();
  }
  letzteArt = a.op;
}
/** Die Matte wird leer geräumt (Timo kommt zurück an seinen Platz); bei einem Wechsel rollt er dabei einmal vor die Matte. @param {boolean} ueberDieTafel */
async function raeumeBrett(ueberDieTafel) {
  const teile = [aufgabeFeld, realZ, realE, platzEl.z, platzEl.e].flatMap((el) => [...el.children]);
  const weg = Promise.all(teile.map((el) => bewege(/** @type {HTMLElement} */ (el), [{ opacity: 1 }, { opacity: 0 }], ueberDieTafel ? 500 : 140, { opacity: "0" }, { easing: "ease-in" })));
  for (const f of B.flieger) f.remove();
  if (ueberDieTafel) {
    await rolle(startX() + 10 * remPx(), 450);
    await weg;
    await rolle(startX(), 450);
  } else {
    await Promise.all([weg, rolle(startX(), 220)]);
  }
  leereMatte();
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// Eine kleine Geschichte (Christian, 2026-11-16): die Aufgabe, ihr Material, die Köpfe Zehner und Einer, die beiden
// Plätze – je mit dem Sonnenring; dann tippt das Kind das Beispiel selbst und sieht die Wanderung. Nicht gebucht.

/**
 * Das Kind tippt die Antwort selbst, Zug für Zug im Sonnenring (Platz, Ziffer, zuletzt der Knopf mit dem Haken);
 * andere Tipps tun nichts. Ohne `bisFertig` endet es, sobald nur noch der Haken fehlt. Jeder Zug ist ein Zug der
 * Einführung (E.kind, für den Prüfstand).
 * @param {number} antwort @param {boolean} bisFertig
 */
async function kindTippt(antwort, bisFertig) {
  try {
    for (;;) {
      const z = naechsterStellenZug(B.s, antwort);
      if (z.art === "fertig" && !bisFertig) return;
      zeigeZug(z);
      await E.kind(zugVon(z), einTipp(z));
      if (z.art === "fertig") return;
    }
  } finally {
    eingabeZiel = null;
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  }
}

/** Wartet, bis das Kind den Zug z tippt; andere Tipps tun nichts. @param {ReturnType<typeof naechsterStellenZug>} z */
function einTipp(z) {
  return new Promise((ok) => {
    eingabeZiel = {
      taste(t) {
        if (z.art !== "taste" || z.taste !== t) return;
        eingabeZiel = null;
        const k = B.s.aktiv;
        B.s = t === "loeschen" ? loescheStelle(B.s) : tippeStelle(B.s, t);
        if (t !== "loeschen") {
          zeigeStellen(B.s);
          ausDemKasten(t, k);
        }
        ok(undefined);
      },
      platz(k) {
        if (z.art !== "platz" || z.stelle !== k) return;
        eingabeZiel = null;
        B.s = waehleStelle(B.s, k);
        ok(undefined);
      },
      fertig() {
        if (z.art !== "fertig") return;
        eingabeZiel = null;
        ok(undefined);
      },
    };
  });
}

/** Sonnenring auf Dingen der Einführung (Aufgabe, Material, Kopf, Platz). @type {Element[]} */
let ringAuf = [];
/** @param {(Element | null)[]} els */
function ring(els) {
  for (const el of ringAuf) el.classList.remove("markiert");
  ringAuf = /** @type {Element[]} */ (els.filter(Boolean));
  for (const el of ringAuf) el.classList.add("markiert");
}

/**
 * Die Einführung im echten Spielbild (docs/spielbau.md §8; Review Christian 2026-11-16): eine kleine Geschichte. Timo
 * räumt das Perlenmaterial ein; der Sonnenring zeigt die Köpfe Zehner und Einer und die Aufgabe. Das Beispiel (10 + 3,
 * in einer Minus-Runde 13 − 10) tippt das Kind selbst, Taste für Taste im Sonnenring, dann den Knopf mit dem Haken;
 * Timo legt bzw. nimmt. Danach: was bei einer anderen Zahl passiert, wie man korrigiert, was man lernt, und der
 * Übergang zur ersten Aufgabe. Weiter geht es bei den Tasten nur mit dem Tipp des Kindes. Die Hilfe sagt den Schritt
 * noch einmal (rahmen/einfuehrung-lauf.js: Sätze, Lesezeit ohne Ton mit eigenem Timer, Hilfe, Prüfstand). Mit `r` gilt
 * sie danach als gesehen, und die Rundenzeit beginnt. Nicht gebucht.
 * @param {"plus" | "minus"} art @param {{ einfuehrungGesehen(): void, beginneZeit(): void }} [r]
 */
function einfuehrung(art, r) {
  const e = einleitung;
  const minus = art === "minus";
  const satz = E.satz;
  return E.spiele(async () => {
    try {
      const vor = /** @type {any} */ (aufgabeAus(minus ? "minus:13-10" : "plus:3+10"));
      neuerLauf();
      // Die Matte mit der Aufgabe; sie erscheint, wenn von ihr die Rede ist.
      legeAufgabe(vor);
      aufgabeFeld.classList.add("still");
      zeigeStellen(B.s, { ring: false });
      await satz(e.raeumt);
      aufgabeFeld.classList.remove("still");
      ring([...aufgabeFeld.querySelectorAll(".ziffern")]);
      await satz(e.aufgabe);
      ring([...aufgabeFeld.querySelectorAll(".stoff")]);
      await satz(e.perlen);
      ring([document.querySelector(".kopf.z")]);
      await satz(e.zehner);
      ring([document.querySelector(".kopf.e")]);
      await satz(e.einer);
      ring([platzEl.z]);
      await satz(e.platzZ);
      ring([platzEl.e]);
      await satz(e.platzE);
      ring([]);
      // Das Beispiel: das Kind tippt selbst.
      await satz(minus ? e.beispielMinus : e.beispielPlus);
      const tippSatz = minus ? e.tippeDrei : e.tippeDreizehn;
      const ziffern = kindTippt(vor.antwort, false);
      await satz(tippSatz);
      await ziffern;
      const haken = kindTippt(vor.antwort, true);
      await satz(e.haken);
      await haken;
      neuerLauf();
      if (minus) await Promise.all([wirkungRichtig(vor, { freude: false }), satz(e.nimmt)]);
      else {
        await wirkungRichtig(vor, { freude: false });
        await letzterSatz;
      }
      // Was bei einer anderen Zahl passiert, wie man korrigiert, was man lernt.
      await satz(e.andere);
      await satz(e.nochmal);
      tastatur.markiere("loeschen");
      await satz(e.vertippt);
      tastatur.markiere(null);
      await satz(e.lernen);
      // Übergang zur ersten Aufgabe (Christian, 2026-11-16).
      await satz(e.los);
    } finally {
      ueberspringeAlles();
      eingabeZiel = null;
      ring([]);
      aufgabeFeld.classList.remove("still");
      tastatur.markiere(null);
      fertigKnopf.classList.remove("markiert");
    }
  }, r);
}

// =====================================================================================================
// RAHMEN (aus der Vorlage)
// =====================================================================================================

const params = new URLSearchParams(location.search);
const wunsch = einmal(params.get("thema")); // ?thema= gilt nur für die erste Runde der Seite
// ?stufe=<id> nur im Testbetrieb: jede Aufgabe auf dieser Lernstufe; die Runde ist dann eine Vorschau (schreibt nicht).
const PRUEF_STUFE = testbetrieb() ? params.get("stufe") || null : null;
/** @param {any} a */
const aufStufe = (a) => (a && PRUEF_STUFE ? { ...a, stufe: PRUEF_STUFE } : a);

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
// In der Einführung ist der richtige Zug die Taste im Sonnenring (das Kind tippt selbst), sonst wie in der Vorlage.
const stand = { phase: "laden", aufgabe: /** @type {string | null} */ (null), nr: 0, versuche: 0, hilfeStufe: 0, vorschau: true, lernstufe: /** @type {string | null} */ (null) };
/** @type {{ zuege: () => any[], richtigerZug: () => any, zeigeWieder: () => void } | null} */
let offeneAufgabe = null;
const ORTE = { hilfe: "#hilfe >>> ls-knopf", haus: "#leiste >>> a.haus", weiter: "#pause >>> ls-knopf.weiter" };
const WEITER = { art: "tippen", von: ORTE.weiter };
/** Die Einführung: Sätze, Hilfe und Zug für den Prüfstand (rahmen/einfuehrung-lauf.js). */
const E = einfuehrungsLauf({ ton: () => leiste.ton, text: () => blase.text, stand });
// Ohne Ton kürzt nur ein Tipp des Kindes die Lesezeit ab, nie die Einstellung (spielbau.md §8): irgendwo auf der Seite
// oder Enter/Leertaste; der Tipp tut sonst, was er immer tut. Die Hilfe nicht – sie sagt den Schritt noch einmal.
const kuerzeAb = (/** @type {Event} */ ev) => {
  if (E.laeuft && !ev.composedPath().includes(hilfe)) E.abkuerzen();
};
document.addEventListener("pointerdown", kuerzeAb, true);
document.addEventListener("keydown", (ev) => { if (ev.key === "Enter" || ev.key === " ") kuerzeAb(ev); }, true);
const einfuehrungsZug = () => E.zug;
meldePruefSchnittstelle({
  zustand: () => ({ ...stand }),
  zuege: () => (stand.phase === "aufgabe" ? offeneAufgabe?.zuege() ?? [] : stand.phase === "pause" ? [WEITER] : stand.phase === "einfuehrung" ? [einfuehrungsZug()].filter(Boolean) : []),
  richtigerZug: () => (stand.phase === "aufgabe" ? offeneAufgabe?.richtigerZug() ?? null : stand.phase === "pause" ? WEITER : stand.phase === "einfuehrung" ? einfuehrungsZug() : null),
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
/** @param {{ hinweis?: string | null, zeit?: { schluss: boolean, satz: string | null }, echteDinge?: { thema?: string, fach?: string, titel?: string, text?: string } | null }} [optionen] */
async function zeigePause({ hinweis = null, zeit = { schluss: false, satz: null }, echteDinge = null } = {}) {
  const feld = $("sachmoment");
  fuelleSachmoment(feld, leiste.ton && !zeit.satz);
  if (zeit.satz && leiste.ton) sage(zeit.satz);
  const spiel = hinweis ? (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id === hinweis) : null;
  if (spiel) {
    const a = document.createElement("a");
    a.className = "hinweis";
    a.href = spiel.datei;
    a.tabIndex = 0; // WebKit (Safari, macOS-Vorgabe) erreicht Links mit Tab nur mit tabindex
    a.innerHTML = `<img src="${esc(new URL(spiel.symbol, new URL("../../", import.meta.url)).href)}" alt=""><span>${esc(spiel.titel)}</span>`;
    feld.append(a);
  }
  stand.phase = "pause";
  await pause.zeige({ ...zeit, echteDinge }); // „Alle Spiele“ navigiert selbst (speichert vorher), „Weiter“ löst auf
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
    echteDinge: { titel: VORSCHAU.thema },
    einfuehrungGesehen() {},
    beginneZeit() {},
    naechste() {
      const key = keys.shift();
      return key ? { ziel: { key }, auch: [], stufe: "kopf" } : null;
    },
    melde() { return null; },
    async ende() { return { hinweisSpiel: null }; },
  };
}

/** Name eines Themas des Lernplans (für die Leiste, wenn eine Aufgabe eines anderen Themas kommt). @param {string | undefined} id */
const themaName = (id) => (id ? ctx?.plan?.themen?.find((/** @type {any} */ t) => t.id === id)?.name ?? null : null);

/** Die Einführung lief schon (sie kommt bei jedem Start einmal, danach über „Anleitung“). */
let einfuehrungGespielt = false;

// „Anleitung“: die Einführung im Spielbild jederzeit wieder (während einer Aufgabe); danach steht die Aufgabe wieder da.
$("anleitung")?.addEventListener("click", async () => {
  if (stand.phase !== "aufgabe" || E.laeuft || !B.a) return;
  const merke = offeneAufgabe;
  await einfuehrung(B.a.op);
  merke?.zeigeWieder();
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

  // Das Spiel beginnt mit der Einführung im echten Spielbild (bei jedem Start; in der Vorschau nur mit ?einfuehrung).
  const erste = aufgabeAus(aufgabe?.ziel?.key);
  if (!einfuehrungGespielt && erste && (!vorschau || params.has("einfuehrung"))) {
    einfuehrungGespielt = true;
    await einfuehrung(erste.op, r);
    letzteArt = null;
    leereMatte();
  }
  $("anleitung")?.removeAttribute("hidden");

  while (aufgabe) {
    raeumeAuf();
    const a = aufgabeAus(aufgabe.ziel.key);
    if (a) {
      // Die Leiste nennt das Thema der Aufgabe (zehn-plus oder minus-zehner).
      leiste.setAttribute("thema", themaName(aufgabe.ziel.thema) ?? r.thema);
      await bereiteBild(a);
    }
    const e = await spieleAufgabe(aufgabe);
    const ergebnis = { key: e.key, ok: e.versuche === 0, hilfe: e.hilfe, ms: e.ms };
    r.melde(e.key, ergebnis);
    document.dispatchEvent(new CustomEvent("ls-ergebnis", { detail: ergebnis })); // für die Browser-Prüfung
    await warteFolge();
    aufgabe = naechste();
  }

  raeumeAuf();
  await letzterSatz;
  const { hinweisSpiel } = await r.ende();
  await zeigePause({ hinweis: hinweisSpiel, zeit: vorschau ? undefined : await amRundenende(), echteDinge: r.echteDinge });
  letzteArt = null;
  leereMatte();
  return spieleRunde(vorschau);
}

// --- Start ---------------------------------------------------------------------------------------
async function start() {
  await leiste.bereit(); // Ton-Einstellung geladen
  if (params.has("eltern")) return elternansicht();
  const c = await ladeCtx().catch(() => null);
  const nichtEingetragen = c !== null && !eingetragen(c);
  if (nichtEingetragen) protokoll(`${SPIEL_ID}: nicht in spiele.json – Vorschau, schreibt nicht`);
  const vorschau = ["pause", "hinweis", "eltern", "einfuehrung"].some((p) => params.has(p)) || PRUEF_STUFE !== null || !c || nichtEingetragen;
  stand.vorschau = vorschau;
  if (!(await starteSpielzeit({ zaehlen: !vorschau }))) return;
  await new Promise((ok) => requestAnimationFrame(() => ok(undefined)));
  stelleTimo(startX());
  addEventListener("resize", () => stelleTimo(startX()));
  if (params.has("pause") || params.has("hinweis")) {
    const andere = (ctx?.spiele?.spiele ?? []).find((/** @type {any} */ s) => s.id !== SPIEL_ID)?.id ?? null;
    await zeigePause({ hinweis: params.has("hinweis") ? params.get("hinweis") || andere : null, echteDinge: { titel: VORSCHAU.thema } });
  }
  await spieleRunde(vorschau);
}

start().catch((e) => {
  protokoll(`${SPIEL_ID}: ${/** @type {any} */ (e)?.message ?? e}`);
  stand.phase = "fehler";
  erzaehler.gehtNicht();
});
