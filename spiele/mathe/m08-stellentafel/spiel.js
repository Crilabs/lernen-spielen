// M08 Stellentafel (Idee: docs/spiele/mathe/m08-stellentafel.md). Das Kind tippt das Ergebnis einer Aufgabe wie
// 10 + 4 oder 13 − 10 und bestätigt mit Fertig; dann rollt Timo an der Stellentafel entlang und legt Perlenmaterial
// in ihre Felder (die goldene Stange zu den Zehnern, ein farbiges Stäbchen zu den Einern), und die Stellenwertkarten schieben sich zur Zahl zusammen
// („10“ und „4“ werden „14“). Passt die getippte Zahl nicht, zeigt hohles Material, wie sie wirklich aussieht.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   AUFGABE    Timo, Tafel, Karten; eine Aufgabe darstellen, prüfen (die Tafel urteilt), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): Timo macht es vor, das Kind tippt
//   RAHMEN     aus der Vorlage; die Lernsteuerung bestimmt die Länge der Runde (kein AUFGABEN_JE_RUNDE)
//
// Abweichung von der Idee (§3), aus Platzgründen: Der Streifen der Stellenwertkarten liegt zwischen den Köpfen und den
// Feldern (nicht darunter), damit Timo unter der Tafel rollen kann, ohne die Karten zu verdecken.
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=).

import "../../rahmen/leiste.js";
import { lesezeit } from "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/knopf.js";
import "../../rahmen/tastatur.js";
import "../../rahmen/perlenstab.js";
import "../../rahmen/stellenwertkarte.js";
import * as Runde from "../../runde/runde.js";
import { SCHRITT, LUECKE, laenge } from "../../rahmen/perlen-geometrie.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal, rundenMs } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { aufgabeAus, anzeige, teile, karten, kandidaten, danebenSatz, probeVon, naechsteTaste, tastenZu, tippe, perlenTon, perleHell, perlenAbstand, naechsteFreude, witz, bildWechsel } from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const aufgabeFeld = $("aufgabe");
const rechnung = $("rechnung");
const karteEingabe = $("eingabe");
const tastatur = $("tastatur");
const fertigKnopf = $("fertig");
const hof = $("hof");
const tafelEl = $("tafel");
const kartenZ = $("karten-z");
const kartenE = $("karten-e");
const feldZ = $("feld-z");
const feldE = $("feld-e");
const realZ = $("real-z");
const realE = $("real-e");
const hohlZ = $("hohl-z");
const hohlE = $("hohl-e");
const hohlKarte = $("hohlkarte");
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
/** Eine neue Aufgabe beginnt nur, solange von der Rundenlänge noch so viel übrig ist. */
const LETZTE_AUFGABE_MS = 30000;

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
    const text = s.art === "gross" ? TEXTE?.daneben?.gross : TEXTE?.daneben?.[s.art]?.[s.n];
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
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/**
 * Die Sätze der Einführung (docs/spielbau.md §8, Review Christian 2026-11-16: in Ruhe, als kleine Geschichte; Zehner
 * und Einer werden genannt, nicht abgekürzt). Jeder steht als feste Zeichenkette in blase.sage (für `npm run audio`).
 */
const einleitung = {
  raeumt: (/** @type {any} */ o) => blase.sage("Timo räumt heute das Perlenmaterial ein.", o),
  zehner: (/** @type {any} */ o) => blase.sage("Die Zehnerstangen kommen in dieses Feld.", o),
  einer: (/** @type {any} */ o) => blase.sage("Die kleinen Stäbchen kommen zu den Einern.", o),
  aufgabe: (/** @type {any} */ o) => blase.sage("Oben steht eine Aufgabe.", o),
  ergebnis: (/** @type {any} */ o) => blase.sage("Du tippst das Ergebnis.", o),
  beispielPlus: (/** @type {any} */ o) => blase.sage("Zum Beispiel zehn plus drei.", o),
  beispielMinus: (/** @type {any} */ o) => blase.sage("Zum Beispiel dreizehn minus zehn.", o),
  tippeDreizehn: (/** @type {any} */ o) => blase.sage("Tippe die Eins und die Drei.", o),
  tippeDrei: (/** @type {any} */ o) => blase.sage("Tippe die Drei.", o),
  haken: (/** @type {any} */ o) => blase.sage("Dann tippe auf den Knopf mit dem Haken.", o),
  legt: (/** @type {any} */ o) => blase.sage("Timo legt eine Stange und drei Perlen.", o),
  nimmt: (/** @type {any} */ o) => blase.sage("Timo nimmt die Stange mit.", o),
  andere: (/** @type {any} */ o) => blase.sage("Tippst du eine andere Zahl, zeigt Timo sie.", o),
  nochmal: (/** @type {any} */ o) => blase.sage("Dann probierst du es einfach noch einmal.", o),
  vertippt: (/** @type {any} */ o) => blase.sage("Vertippt? Dann tippe auf den Knopf neben der Null.", o),
  lernen: (/** @type {any} */ o) => blase.sage("So lernst du Zehner und Einer.", o),
  los: (/** @type {any} */ o) => blase.sage("Jetzt geht es los.", o),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Timo legt Montessori-Perlenmaterial in eine Stellentafel: die goldene Zehnerstange in die Spalte
    Zehner, ein farbiges Perlenstäbchen in die Spalte Einer. Ihr Kind tippt vorher, welche Zahl dabei entsteht. Dazu schieben sich Stellenwertkarten
    zusammen: Die Einerkarte „4“ deckt die Null der Zehnerkarte „10“, und es steht „14“. Passt die getippte Zahl nicht,
    zeigt hohles Material, wie sie wirklich aussieht.</p>
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
  plopp: () => ton(740, { dauer: 0.1, typ: "sine", laut: 0.1, gleiten: 0.55 }),
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
/** Startplatz links neben Z und die Plätze vor den beiden Spalten. */
const startX = () => hof.getBoundingClientRect().left + 20 * remPx();
const spalteX = (/** @type {"z" | "e"} */ s) => mitte((s === "z" ? feldZ : feldE).getBoundingClientRect()).x - 12 * remPx();

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
/** Timo senkt sich kurz (Ablegen, Nachfedern). */
const feder = () => bewege(timoKoerper, [{ transform: "scale(1, 1)" }, { transform: "scale(1.03, 0.96)", offset: 0.35 }, { transform: "scale(0.99, 1.01)", offset: 0.7 }, { transform: "scale(1, 1)" }], 220);
/** Der Punkt auf Timos Schoß (px), von dem das Material fliegt. */
const schossPunkt = () => {
  const r = schoss.getBoundingClientRect();
  return { x: r.left + 6 * remPx(), y: r.top + 1.5 * remPx() };
};

// --- Das Brett: Karten, Material, hohles Bild ----------------------------------------------------------
/** Was gerade auf der Tafel liegt. lage: leer, start (Aufgabe steht, Brett wie zu Beginn), material (Probe), fertig (Wirkung gezeigt). */
const B = {
  /** @type {any} */ a: null,
  lage: "leer",
  /** @type {HTMLElement | null} */ kz: null,
  /** @type {HTMLElement | null} */ ke: null,
  /** Verschiebung der Einerkarte auf die Zehnerkarte (px), 0 = an ihrem Platz. */
  dx: 0,
  /** @type {HTMLElement | null} */ stange: null,
  /** @type {HTMLElement | null} */ perlen: null,
  /** @type {HTMLElement | null} */ lapStange: null,
  /** @type {HTMLElement | null} */ lapPerlen: null,
};

/** @param {string} tag @param {Record<string, string>} [attr] */
function neu(tag, attr = {}) {
  const el = document.createElement(tag);
  for (const [k, v] of Object.entries(attr)) el.setAttribute(k, v);
  return el;
}
/** @param {string} zahl @param {"z" | "e" | "h"} stelle @param {boolean} [hohl] */
const karteVon = (zahl, stelle, hohl = false) => {
  const k = neu("ls-stellenwertkarte", { zahl, stelle });
  if (hohl) k.setAttribute("hohl", "");
  return k;
};
/** Stelle der Karte einer getippten Zahl ohne Spalte (eine Karte für die ganze Zahl). @param {number} w */
const stelleVon = (w) => (w >= 100 ? "h" : w >= 10 ? "z" : "e");

/** Das Brett ist leer, Timo steht am Start, nichts liegt auf seinem Schoß. */
function leereBrett() {
  for (const el of [realZ, realE, hohlZ, hohlE, hohlKarte, kartenZ, kartenE]) el.replaceChildren();
  schoss.replaceChildren();
  Object.assign(B, { a: null, lage: "leer", kz: null, ke: null, dx: 0, stange: null, perlen: null, lapStange: null, lapPerlen: null });
  timo.haltung("tragen", { ms: 0 });
}

/** Material der Aufgabe (unsichtbar) in beide Felder legen. @param {any} a */
function baueMaterial(a) {
  B.stange = neu("ls-perlenstab", { wert: "10", ausrichtung: "waagrecht" });
  B.perlen = neu("ls-perlenstab", { wert: String(a.e) });
  for (const el of [B.stange, B.perlen]) el.style.visibility = "hidden";
  realZ.replaceChildren(B.stange);
  realE.replaceChildren(B.perlen);
}
/** Anteil der Einerstange, der nach k Perlen zu sehen ist. @param {number} k @param {number} e */
const sichtbar = (k, e) => (k === 0 ? 0 : (k * SCHRITT + (k > 5 ? LUECKE : 0)) / laenge(e));
/** Zeigt die Perlen bis k (0 bis e). @param {number} k */
function zeigePerlenBis(k) {
  if (!B.perlen) return;
  const e = B.a.e;
  B.perlen.style.visibility = k === 0 ? "hidden" : "visible";
  B.perlen.style.clipPath = k >= e ? "none" : `inset(-1rem ${(100 * (1 - sichtbar(k, e))).toFixed(2)}% -1rem 0)`;
}
/** Beide Teile sichtbar, ganz. */
function zeigeMaterialGanz() {
  if (!B.stange || !B.perlen) return;
  B.stange.style.visibility = "visible";
  zeigePerlenBis(B.a.e);
}
/** Das Material auf dem Schoß: eine kleine Stange und die Perlen (vor dem Legen). @param {any} a */
function fuelleSchoss(a) {
  B.lapStange = neu("ls-perlenstab", { wert: "10" });
  B.lapPerlen = neu("ls-perlenstab", { wert: String(a.e) });
  schoss.replaceChildren(B.lapStange, B.lapPerlen);
}
/** Die Karten der Zahl c liegen gestapelt im Kartenstreifen (Minus: die Startzahl). @param {number} c */
function legeKarten(c) {
  const k = karten(c);
  B.kz = k.z ? karteVon(k.z, "z") : null;
  B.ke = k.e ? karteVon(k.e, "e") : null;
  kartenZ.replaceChildren(...(B.kz ? [B.kz] : []));
  kartenE.replaceChildren(...(B.ke ? [B.ke] : []));
  B.dx = 0;
}
/** Die Verschiebung der Einerkarte, die sie rechtsbündig auf die Zehnerkarte legt (px). */
function stapelDx() {
  if (!B.kz || !B.ke) return 0;
  const z = B.kz.getBoundingClientRect();
  const e = B.ke.getBoundingClientRect();
  return z.right - (e.right - B.dx);
}
const setzeDx = (/** @type {number} */ dx) => {
  B.dx = dx;
  if (B.ke) B.ke.style.transform = dx ? `translateX(${dx.toFixed(1)}px)` : "";
};
/** Die Einerkarte gleitet zur Zehnerkarte (oder zurück); mit `hebt` hebt sie sich vorher kurz (der Witz: Timo linst). @param {boolean} hin @param {{ hebt?: boolean, ms?: number }} [o] */
async function schiebeKarte(hin, { hebt = false, ms = 260 } = {}) {
  const ke = B.ke;
  if (!ke || !B.kz) return;
  const von = B.dx;
  const nach = hin ? stapelDx() : 0;
  if (Math.abs(nach - von) < 1) return;
  const rem = remPx();
  const frames = hebt
    ? [{ transform: `translate(${von}px, 0)` }, { transform: `translate(${von}px, ${-1.8 * rem}px) rotate(-4deg)`, offset: 0.3 }, { transform: `translate(${von}px, ${-1.8 * rem}px) rotate(-4deg)`, offset: 0.55 }, { transform: `translate(${nach}px, 0)` }]
    : [{ transform: `translate(${von}px, 0)` }, { transform: `translate(${nach - (hin ? 0.8 * rem : -0.8 * rem)}px, -0.4rem)`, offset: 0.8 }, { transform: `translate(${nach}px, 0)` }];
  await bewege(ke, frames, hebt ? ms + 330 : ms, {}, { easing: "ease-out" });
  setzeDx(nach);
  if (hin) {
    klang.plopp();
    bewege(ke, [{ transform: `translate(${nach}px, 0) scale(1)` }, { transform: `translate(${nach}px, 0) scale(1.08)`, offset: 0.4 }, { transform: `translate(${nach}px, 0) scale(1)` }], 160);
  }
}
/** Eine Karte landet im Streifen (fällt von oben auf ihren Platz). @param {HTMLElement | null} k */
async function landeKarte(k) {
  if (!k) return;
  k.style.visibility = "visible";
  await bewege(k, [{ opacity: 0, transform: "translateY(-3rem) scale(0.9)" }, { opacity: 1, transform: "translateY(0.5rem) scale(1.03)", offset: 0.7 }, { opacity: 1, transform: "translateY(0) scale(1)" }], 200, {}, { easing: "ease-out" });
}

/** Zeigt die Aufgabe: Aufgabentafel, Brett wie zu Beginn. @param {any} a @param {{ start?: boolean }} [o] */
function zeigeStart(a, { start = true } = {}) {
  leereBrett();
  B.a = a;
  B.lage = "start";
  stelleTimo(startX());
  baueMaterial(a);
  if (start) {
    if (a.op === "plus") fuelleSchoss(a);
    else legeKarten(a.c);
    if (a.op === "minus") setzeDx(stapelDx());
  }
}
/** Das Material liegt still in der Tafel, ohne Karten (Hilfe 1, die Probe). @param {any} a */
function zeigeProbe(a) {
  if (B.lage !== "start") return;
  B.lage = "material";
  schoss.replaceChildren();
  B.lapStange = B.lapPerlen = null;
  zeigeMaterialGanz();
  const p = probeVon(a);
  B.stange?.classList.toggle("markiert", p.ring === "stange");
  B.perlen?.classList.toggle("markiert", p.ring === "perlen");
  if (a.op === "minus" && B.kz) {
    // Die Karten sind noch gestapelt; die Probe zeigt nur das Material.
    kartenZ.replaceChildren();
    kartenE.replaceChildren();
    B.kz = B.ke = null;
    B.dx = 0;
  }
}

// --- Aufgabentafel und Zahl im Flug --------------------------------------------------------------------
/** @param {string} text */
function setzeEingabe(text) {
  karteEingabe.textContent = text || "0";
  karteEingabe.classList.toggle("leer", !text);
}
/** @param {any} a */
function zeigeAufgabe(a) {
  aufgabeFeld.classList.remove("still");
  rechnung.textContent = anzeige(a);
  setzeEingabe("");
}

/**
 * Die getippte Zahl fliegt aus dem Kästchen der Aufgabe auf ihre Karte (Mitte `ziel`) und wird dabei so groß wie
 * die Zahl auf der Karte.
 * @param {string} text @param {{ x: number, y: number, hoehe: number } | null} ziel @param {{ hohl?: boolean }} [o]
 */
async function fliege(text, ziel, { hohl = false } = {}) {
  const start = karteEingabe.getBoundingClientRect();
  setzeEingabe("");
  if (!ziel || !lauf || lauf.skip) return;
  const rem = remPx();
  const el = document.createElement("div");
  el.className = `flug${hohl ? " hohl" : ""}`;
  el.textContent = text;
  const schrift = 6 * rem;
  el.style.fontSize = `${schrift}px`;
  figuren.append(el);
  const b = el.offsetWidth;
  const h = el.offsetHeight;
  const f1 = (ziel.hoehe * 0.62) / schrift;
  const x0 = start.left + start.width / 2 - b / 2;
  const y0 = start.top + start.height / 2 - h / 2;
  const x1 = ziel.x - b / 2;
  const y1 = ziel.y - h / 2;
  const ende = { transform: `translate(${x1}px, ${y1}px) scale(${f1})` };
  await bewege(el, [
    { transform: `translate(${x0}px, ${y0}px) scale(1)` },
    { transform: `translate(${(x0 + x1) / 2}px, ${Math.min(y0, y1) - 3 * rem}px) scale(${(1 + f1) / 2}) rotate(-6deg)`, offset: 0.45 },
    ende,
  ], 320, ende, { easing: "ease-in-out" });
  el.remove();
}
/** Mitte und Höhe einer Karte. @param {HTMLElement | null} k */
const kartenZiel = (k) => {
  if (!k) return null;
  const r = k.getBoundingClientRect();
  return { ...mitte(r), hoehe: r.height };
};

// --- Wirkungen -----------------------------------------------------------------------------------------
/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();
/** Die Einführung läuft: die Aufgabe nimmt keine Tasten an. */
let einfuehrungLaeuft = false;
let vorigeFreude = /** @type {string | null} */ (null);
let seitWitz = 0;

/** Ein Teil fliegt vom Schoß an seinen Platz (Bogen) und landet mit Klack. @param {HTMLElement} el @param {HTMLElement | null} lap */
async function fliegeVomSchoss(el, lap) {
  el.style.visibility = "visible";
  if (lap) lap.style.visibility = "hidden";
  const ziel = mitte(el.getBoundingClientRect());
  const von = schossPunkt();
  const dx = von.x - ziel.x;
  const dy = von.y - ziel.y;
  const rem = remPx();
  await bewege(el, [
    { transform: `translate(${dx}px, ${dy}px) scale(0.45)`, opacity: 0.9 },
    { transform: `translate(${dx * 0.35}px, ${dy * 0.35 - 4 * rem}px) scale(0.85)`, offset: 0.5, opacity: 1 },
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
  ], 220, { transform: "" }, { easing: "ease-out" });
}
/** Ein Teil fliegt von seinem Platz auf den Schoß und ist dann weg. @param {HTMLElement} el */
async function fliegeZumSchoss(el) {
  const ziel = mitte(el.getBoundingClientRect());
  const von = schossPunkt();
  const dx = von.x - ziel.x;
  const dy = von.y - ziel.y;
  const rem = remPx();
  await bewege(el, [
    { transform: "translate(0, 0) scale(1)", opacity: 1 },
    { transform: `translate(${dx * 0.6}px, ${dy * 0.6 - 4 * rem}px) scale(0.7)`, offset: 0.55, opacity: 1 },
    { transform: `translate(${dx}px, ${dy}px) scale(0.4)`, opacity: 0 },
  ], 260, { visibility: "hidden", transform: "" }, { easing: "ease-in" });
}

/**
 * Das Material der Aufgabe wird gelegt (Plus) bis die Karten liegen, aber noch nicht gestapelt sind: Timo rollt an Z und
 * legt die Stange (Klack), rollt an E und legt die Perlen einzeln (je ein Ton höher); unter jeder Spalte landet ihre Karte.
 * @param {any} a @param {() => void} [freudeStart] wird gerufen, sobald Timo bei E ist (seine Freude beginnt mit den Perlen)
 */
async function legePlus(a, freudeStart = () => {}) {
  legeKarten(a.c);
  if (B.kz) B.kz.style.visibility = "hidden";
  if (B.ke) B.ke.style.visibility = "hidden";
  await rolle(spalteX("z"), 200);
  await fliegeVomSchoss(/** @type {HTMLElement} */ (B.stange), B.lapStange);
  klang.klack();
  // Die Zehnerkarte fällt, während Timo schon zu E rollt (das Wippen der Fahrt ist sein Nachfedern).
  await Promise.all([landeKarte(B.kz), rolle(spalteX("e"), 220)]);
  if (B.lapPerlen) B.lapPerlen.style.visibility = "hidden";
  const k2 = landeKarte(B.ke);
  const abstand = perlenAbstand(a.e);
  freudeStart();
  for (let k = 1; k <= a.e; k++) {
    zeigePerlenBis(k);
    klang.perle(k);
    await warte(abstand);
  }
  await k2;
}

/**
 * Das Material der Aufgabe wird genommen (Minus): Das Material zu c erscheint, Timo nimmt die Stange (weg = 10) oder die
 * Perlen (weg = Einer) auf den Schoß; die Karte des Weggenommenen zieht unter der anderen heraus und fährt mit.
 * @param {any} a @param {string} war Lage vor der Wirkung @param {() => void} [freudeStart]
 */
async function nimmMinus(a, war, freudeStart = () => {}) {
  if (war === "start") {
    // Das Material zu c erscheint (0,3 s).
    for (const el of [B.stange, B.perlen]) if (el) el.style.visibility = "visible";
    zeigePerlenBis(a.e);
    await Promise.all([B.stange, B.perlen].map((el) => el && bewege(el, [{ opacity: 0, transform: "scale(0.85)" }, { opacity: 1, transform: "scale(1)" }], 280, { transform: "" }, { easing: "ease-out" })));
  }
  const nimmStange = a.weg === 10;
  const gehtMit = nimmStange ? B.kz : B.ke;
  // Die Karte des Weggenommenen zieht heraus: die Einerkarte gleitet an ihren Platz zurück, bei weg = e fährt sie mit.
  await rolle(spalteX(nimmStange ? "z" : "e"), 280);
  freudeStart();
  if (nimmStange) {
    const zug = fliegeZumSchoss(/** @type {HTMLElement} */ (B.stange));
    const zurueck = schiebeKarte(false);
    await Promise.all([zug, zurueck]);
    klang.klack();
    if (gehtMit) await karteMit(gehtMit);
  } else {
    const zurueck = schiebeKarte(false);
    const abstand = perlenAbstand(a.e);
    const nehmen = (async () => {
      for (let k = a.e - 1; k >= 0; k--) {
        zeigePerlenBis(k);
        klang.perleWeg(k + 1);
        await warte(abstand);
      }
    })();
    await Promise.all([zurueck, nehmen]);
    if (gehtMit) await karteMit(gehtMit);
  }
  await feder();
}
/** Die Karte des Weggenommenen fährt mit Timo: sie gleitet zu seinem Schoß und blendet aus. @param {HTMLElement} k */
async function karteMit(k) {
  const von = mitte(k.getBoundingClientRect());
  const nach = schossPunkt();
  const base = k === B.ke ? B.dx : 0;
  await bewege(k, [
    { transform: `translate(${base}px, 0)`, opacity: 1 },
    { transform: `translate(${base + (nach.x - von.x)}px, ${nach.y - von.y}px) scale(0.4)`, opacity: 0 },
  ], 300, { visibility: "hidden", transform: "" }, { easing: "ease-in" });
}

/**
 * Das Brett zeigt die Aufgabe (Plus: die Zahl liegt als Stange und Perlen, die Karten liegen noch getrennt; Minus: das
 * Weggenommene ist weg). `ziel` ist die Karte, die das Ergebnis trägt; `abschluss()` schiebt bei Plus die Karten
 * zusammen (der Aufrufer lässt es zugleich mit der Zahl im Flug laufen).
 * @param {any} a @param {{ witz?: string | null, freudeStart?: () => void }} [o]
 * @returns {Promise<{ ziel: HTMLElement | null, abschluss: () => Promise<void> }>}
 */
async function zeigeAufgabeFertig(a, { witz: w = null, freudeStart = () => {} } = {}) {
  const nichts = async () => {};
  if (B.lage === "fertig") return { ziel: a.op === "plus" ? B.kz : a.weg === 10 ? B.ke : B.kz, abschluss: nichts };
  const war = B.lage;
  B.lage = "fertig";
  if (a.op === "plus") {
    if (war === "start") await legePlus(a, freudeStart);
    else {
      // Nach der Probe: das Material liegt schon; die Karten kommen.
      legeKarten(a.c);
      await Promise.all([landeKarte(B.kz), landeKarte(B.ke)]);
    }
    return { ziel: B.kz, abschluss: () => schiebeKarte(true, { hebt: w === "linsen" }) };
  }
  if (war === "material") {
    // Nach der Probe sind die Karten weg: die Startzahl liegt wieder gestapelt, Timo nimmt weg.
    legeKarten(a.c);
    setzeDx(stapelDx());
  }
  await nimmMinus(a, war, freudeStart);
  return { ziel: a.weg === 10 ? B.ke : B.kz, abschluss: nichts };
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
  if (w === "perle") {
    const fertig = rolltDavon();
    return { fertig, art: w };
  }
  const name = w ? "nicken" : bewegung;
  const fertig = timo.bewegung(name);
  return { fertig, art: w };
}
/** Eine Perle rollt davon, Timo fängt sie mit der Hand (10 + 9). */
async function rolltDavon() {
  const rem = remPx();
  const r = feldE.getBoundingClientRect();
  const el = document.createElement("div");
  Object.assign(el.style, { position: "absolute", left: "0", top: "0", width: `${3.4 * rem}px`, height: `${3.4 * rem}px`, borderRadius: "50%", background: "#D9A520", border: `${0.35 * rem}px solid #3B2A6B`, zIndex: "9" });
  figuren.append(el);
  const x0 = r.right - 5 * rem;
  const y0 = bodenY() - 4 * rem;
  const t = (/** @type {number} */ x, /** @type {number} */ w) => `translate(${x}px, ${y0}px) rotate(${w}deg)`;
  await bewege(el, [{ transform: t(x0, 0) }, { transform: t(x0 + 14 * rem, 260), offset: 0.5 }, { transform: t(x0 + 3 * rem, 0) }], 700, {}, { easing: "ease-in-out" });
  el.remove();
}

/**
 * Richtig: Timo legt oder nimmt, die Karten schieben sich zusammen, und die getippte Zahl fliegt auf die Karte, die sie
 * trägt; Timo freut sich zugleich (oder ein Witz) – die Folge bleibt so unter etwa 2,8 s (Regeln §1).
 * @param {any} a @param {{ satz?: boolean, freude?: boolean, getippt?: string }} [o]
 */
async function wirkungRichtig(a, { satz = false, freude = true, getippt = String(a.antwort) } = {}) {
  const lage = B.lage;
  const w = freude && lage === "start" ? witz(a, seitWitz + 1) : null;
  // Timos Freude beginnt schon mit dem Legen der Perlen (bzw. dem Wegnehmen), nicht erst danach: so bleibt die Folge kurz.
  /** @type {Promise<any> | null} */
  let gefreut = null;
  const freudeStart = () => { if (freude && !gefreut) gefreut = freue(a).fertig; };
  const { ziel, abschluss } = await zeigeAufgabeFertig(a, { witz: w === "linsen" ? "linsen" : null, freudeStart });
  freudeStart();
  const f = Promise.all([fliege(getippt, kartenZiel(ziel)), abschluss()]);
  await f;
  if (satz) letzterSatz = erzaehler.gleichung(a).catch(() => undefined);
  await (gefreut ?? Promise.resolve());
}

/**
 * Daneben ohne Lösung: nur das hohle Material der getippten Zahl liegt über den Feldern, die hohle Karte der Zahl im
 * Kartenstreifen, das Kästchen zeigt „?“. Das richtige Material und die richtige Karte erscheinen erst mit Hilfe 1 (G6).
 * Timo schaut verdutzt hin; nie reizvoller als richtig (N7).
 * @param {any} a @param {number} w
 */
async function wirkungDaneben(a, w) {
  timo.haltung("staunen", { ms: 200 });
  const kar = zeigeHohl(w);
  await fliege(String(w), kartenZiel(kar), { hohl: true });
  setzeEingabe("?");
  karteEingabe.classList.remove("leer");
  klang.boing();
  if (kar) bewege(kar, [{ transform: "rotate(0deg)" }, { transform: "rotate(-4deg)", offset: 0.3 }, { transform: "rotate(3deg)", offset: 0.6 }, { transform: "rotate(0deg)" }], 420);
  await erzaehler.daneben(w, a.antwort);
}
/** Die getippte Zahl als hohles Bild: Stangen über Z, Perlen über E, daneben die hohle Karte. @param {number} w @returns {HTMLElement | null} */
function zeigeHohl(w) {
  for (const el of [hohlZ, hohlE, hohlKarte]) el.replaceChildren();
  const k = karteVon(String(w), stelleVon(w), true);
  hohlKarte.replaceChildren(k);
  if (w <= 99) {
    const { z, e } = teile(w);
    hohlZ.classList.toggle("wenig", z <= 3);
    hohlE.classList.add("wenig");
    for (let i = 0; i < z; i++) hohlZ.append(hohlStab(10));
    if (e) hohlE.append(hohlStab(e));
  }
  for (const el of [...hohlZ.children, ...hohlE.children, k]) {
    bewege(/** @type {HTMLElement} */ (el), [{ opacity: 0, transform: "scale(0.85)" }, { opacity: 1, transform: "scale(1.04)", offset: 0.7 }, { opacity: 1, transform: "scale(1)" }], 240, { transform: "" }, { easing: "ease-out" });
  }
  return k;
}
/** @param {number} wert */
function hohlStab(wert) {
  const rahmen = document.createElement("span");
  rahmen.className = "hohlstab";
  rahmen.append(neu("ls-perlenstab", { wert: String(wert) }));
  return rahmen;
}
/** Räumt das hohle Bild weg (das nächste Tippen). */
function raeumeHohl() {
  for (const el of [hohlZ, hohlE, hohlKarte]) el.replaceChildren();
  setzeEingabe("");
  timo.haltung("tragen", { ms: 160 });
}

/**
 * @param {{ ziel: { key: string, thema?: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const a = aufgabeAus(aufgabe.ziel.key);
  if (!a) throw new Error(`Stellentafel: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  neuerLauf();

  let eingabe = "";
  let fertig = false;
  let loesungGezeigt = false;
  let hilfeGezeigt = false;
  /** Zahlen, die bei dieser Aufgabe schon getippt wurden und nicht passten (nur für die Züge des Prüfstands). */
  const versucht = new Set();
  let versuche = 0;
  /** Das hohle Bild eines Fehlversuchs; das nächste Tippen räumt es weg. */
  let hohlDa = false;

  const zeige = () => {
    zeigeStart(a);
    zeigeAufgabe(a);
    erzaehler.aufgabe(a);
    eingabe = "";
  };
  zeige();

  const markiereNaechste = () => {
    const t = naechsteTaste(eingabe, a.antwort);
    tastatur.markiere(t === "fertig" ? null : t);
    fertigKnopf.classList.toggle("markiert", t === "fertig");
  };
  const ohneMarkierung = () => {
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  };
  const raeumeFehlerBild = () => {
    if (!hohlDa) return;
    hohlDa = false;
    ueberspringeAlles();
    raeumeHohl();
  };

  /** @param {string} taste */
  const beiTaste = (taste) => {
    if (fertig || einfuehrungLaeuft) return;
    raeumeFehlerBild();
    eingabe = tippe(eingabe, taste);
    setzeEingabe(eingabe);
    if (loesungGezeigt) markiereNaechste();
  };

  const pruefe = () => {
    if (fertig || einfuehrungLaeuft || !eingabe) return;
    raeumeFehlerBild();
    const zahl = Number(eingabe);
    eingabe = "";
    if (zahl === a.antwort) {
      fertig = true;
      abmelden();
      ohneMarkierung();
      B.stange?.classList.remove("markiert");
      B.perlen?.classList.remove("markiert");
      // Gemeldet wird sofort (die Zeit der Aufgabe endet mit Fertig); die Wirkung läuft in der Zeit der Folge.
      melde.geloest(aufgabe.ziel.key);
      neuerLauf();
      wirkungFertig = wirkungRichtig(a, { satz: versuche > 0 || hilfeGezeigt, getippt: String(zahl) });
      return;
    }
    // Passt nicht: das hohle Bild zeigt, wie die getippte Zahl aussieht (N7, nichts setzt zurück).
    versuche++;
    melde.passtNicht();
    versucht.add(zahl);
    hohlDa = true;
    B.stange?.classList.remove("markiert");
    B.perlen?.classList.remove("markiert");
    neuerLauf();
    wirkungDaneben(a, zahl);
    if (loesungGezeigt) markiereNaechste();
  };

  const tasteEreignis = (/** @type {any} */ e) => beiTaste(e.detail.zeichen);
  const fertigEreignis = () => pruefe();
  tastatur.addEventListener("taste", tasteEreignis);
  fertigKnopf.addEventListener("click", fertigEreignis);
  const abmelden = () => {
    tastatur.removeEventListener("taste", tasteEreignis);
    fertigKnopf.removeEventListener("click", fertigEreignis);
  };
  aufraeumen = () => {
    abmelden();
    hohlDa = false;
    ohneMarkierung();
  };

  return {
    // Prüfstand: Tasten zu den Zahlen, die ein ratendes Kind hier am ehesten tippt (Ergebnis, Zahlendreher, Nachbarn);
    // eine Zahl, die die Tafel eben als „passt nicht“ gezeigt hat, tippt es nicht noch einmal.
    zuege() {
      if (fertig) return [];
      return tastenZu(eingabe, kandidaten(a.antwort).filter((x) => !versucht.has(x))).map(zug).filter(Boolean);
    },
    richtigerZug() {
      return fertig ? null : zug(naechsteTaste(eingabe, a.antwort));
    },
    /** Nach der Einführung über „Anleitung“: die Aufgabe steht wieder da. */
    zeigeWieder() {
      neuerLauf();
      zeige();
      if (hilfeGezeigt || loesungGezeigt) this.hilfe(loesungGezeigt ? 2 : 1);
    },
    /** @param {1 | 2} hilfeStufe */
    hilfe(hilfeStufe) {
      if (fertig) return;
      raeumeFehlerBild();
      hilfeGezeigt = true;
      ueberspringeAlles();
      zeigeProbe(a);
      if (hilfeStufe === 1) return erzaehler.probe(a);
      // Lösung: die nächste Taste im Sonnenring; das Kind tippt selbst (L12).
      loesungGezeigt = true;
      markiereNaechste();
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
  rechnung.textContent = "";
  setzeEingabe("");
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
/** Das Brett wird leer geräumt; bei einem Wechsel rollt Timo dabei einmal über die Tafel. @param {boolean} ueberDieTafel */
async function raeumeBrett(ueberDieTafel) {
  const teile = [realZ, realE, kartenZ, kartenE, hohlZ, hohlE, hohlKarte].flatMap((el) => [...el.children]);
  const weg = Promise.all(teile.map((el) => bewege(/** @type {HTMLElement} */ (el), [{ opacity: 1 }, { opacity: 0 }], ueberDieTafel ? 500 : 110, {}, { easing: "ease-in" })));
  if (ueberDieTafel) {
    await rolle(spalteX("e"), 450);
    await weg;
    await rolle(startX(), 450);
  } else {
    await Promise.all([weg, rolle(startX(), 200)]);
  }
  leereBrett();
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// Schritt 1: Timo macht es vor – die Tasten sinken von selbst ein, Fertig, er legt (oder nimmt), die Karten schieben sich
// zur Zahl. Schritt 2: der Sonnenring liegt auf der Taste, die das Kind tippt (erst die Ziffern, dann Fertig). Weiter
// geht es nur mit dem Tipp des Kindes, nie nach einer Zeit. Nicht gebucht.

/** Taste, auf der in der Einführung der Sonnenring liegt (für richtigerZug). @type {string | null} */
let einfuehrungTaste = null;

/** Das Kind tippt die Folge von Tasten, je eine im Sonnenring; andere Tasten tun nichts. @param {string[]} folge */
function kindTippt(folge) {
  return new Promise((ok) => {
    let i = 0;
    let eingabe = "";
    const ring = () => {
      const t = folge[i];
      einfuehrungTaste = t;
      tastatur.markiere(t === "fertig" ? null : t);
      fertigKnopf.classList.toggle("markiert", t === "fertig");
    };
    const weiter = (/** @type {string} */ t) => {
      if (t !== folge[i]) return;
      if (t !== "fertig") {
        eingabe += t;
        setzeEingabe(eingabe);
      }
      i++;
      if (i < folge.length) return ring();
      tastatur.removeEventListener("taste", taste);
      fertigKnopf.removeEventListener("click", fertig);
      einfuehrungTaste = null;
      tastatur.markiere(null);
      fertigKnopf.classList.remove("markiert");
      ok(undefined);
    };
    const taste = (/** @type {any} */ e) => weiter(e.detail.zeichen);
    const fertig = () => weiter("fertig");
    tastatur.addEventListener("taste", taste);
    fertigKnopf.addEventListener("click", fertig);
    ring();
  });
}

/** Was die Hilfe in der Einführung tut: den Satz des Schritts noch einmal sagen. @type {(() => any) | null} */
let einfuehrungHilfe = null;

/** Sonnenring auf einem Ding der Einführung (Kopf Zehner/Einer, Aufgabe), höchstens einem. @type {Element | null} */
let ringAuf = null;
/** @param {Element | null} el */
function ring(el) {
  ringAuf?.classList.remove("markiert");
  ringAuf = el;
  el?.classList.add("markiert");
}

/**
 * Ein Satz der Einführung: wartet, bis er gesprochen ist; ohne Ton steht er als Blase da und bleibt eine Lesezeit lang.
 * @param {(o: { zeigen: boolean }) => Promise<any>} sag
 */
async function satz(sag) {
  const zeigen = !leiste.ton;
  await sag({ zeigen });
  if (zeigen) await warte(lesezeit(blase.text));
}

/**
 * Die Einführung im echten Spielbild (docs/spielbau.md §8; Review Christian 2026-11-16): eine kleine Geschichte. Timo
 * räumt das Perlenmaterial ein; der Sonnenring zeigt die Köpfe Zehner und Einer und die Aufgabe. Das Beispiel (10 + 3,
 * in einer Minus-Runde 13 − 10) tippt das Kind selbst, Taste für Taste im Sonnenring, dann den Knopf mit dem Haken;
 * Timo legt bzw. nimmt. Danach: was bei einer anderen Zahl passiert, wie man korrigiert, was man lernt, und der
 * Übergang zur ersten Aufgabe. Weiter geht es bei den Tasten nur mit dem Tipp des Kindes. Die Hilfe sagt den Schritt
 * noch einmal. Nicht gebucht.
 * @param {"plus" | "minus"} art
 */
async function einfuehrung(art) {
  einfuehrungLaeuft = true;
  const e = einleitung;
  const minus = art === "minus";
  try {
    stand.phase = "einfuehrung";
    const vor = /** @type {any} */ (aufgabeAus(minus ? "minus:13-10" : "plus:3+10"));
    neuerLauf();
    // Timo steht mit dem Material am Rand der Matte; die Aufgabe kommt erst, wenn von ihr die Rede ist.
    zeigeStart(vor);
    aufgabeFeld.classList.add("still");
    einfuehrungHilfe = () => satz(e.raeumt);
    await satz(e.raeumt);
    ring(document.querySelector(".kopf.z"));
    einfuehrungHilfe = () => satz(e.zehner);
    await satz(e.zehner);
    ring(document.querySelector(".kopf.e"));
    einfuehrungHilfe = () => satz(e.einer);
    await satz(e.einer);
    zeigeAufgabe(vor);
    ring(aufgabeFeld);
    einfuehrungHilfe = () => satz(e.aufgabe).then(() => satz(e.ergebnis));
    await satz(e.aufgabe);
    ring(null);
    await satz(e.ergebnis);
    // Das Beispiel: das Kind tippt selbst.
    await satz(minus ? e.beispielMinus : e.beispielPlus);
    const tippSatz = minus ? e.tippeDrei : e.tippeDreizehn;
    einfuehrungHilfe = () => satz(tippSatz);
    const ziffern = kindTippt([...String(vor.antwort)]);
    await satz(tippSatz);
    await ziffern;
    einfuehrungHilfe = () => satz(e.haken);
    const haken = kindTippt(["fertig"]);
    await satz(e.haken);
    await haken;
    einfuehrungHilfe = null;
    neuerLauf();
    await Promise.all([wirkungRichtig(vor, { freude: false }), satz(minus ? e.nimmt : e.legt)]);
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
    einfuehrungLaeuft = false;
    einfuehrungTaste = null;
    einfuehrungHilfe = null;
    ring(null);
    aufgabeFeld.classList.remove("still");
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  }
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
const einfuehrungsZug = () => (einfuehrungTaste ? zug(einfuehrungTaste) : null);
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
hilfe.addEventListener("hilfe", () => { if (einfuehrungLaeuft) einfuehrungHilfe?.(); else hilfeTippen?.(); });

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
  if (stand.phase !== "aufgabe" || einfuehrungLaeuft || !B.a) return;
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

  const beginn = Date.now();
  const zeitDa = () => Date.now() - beginn < rundenMs() - Math.min(LETZTE_AUFGABE_MS, rundenMs() / 4);
  const naechste = () => (zeitDa() ? aufStufe(r.naechste()) : null);
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
    await einfuehrung(erste.op);
    r.einfuehrungGesehen();
    letzteArt = null;
    leereBrett();
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
  leereBrett();
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
