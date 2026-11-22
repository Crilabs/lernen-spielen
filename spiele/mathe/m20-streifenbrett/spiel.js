// M20 Streifenbrett (Idee: docs/spiele/mathe/m20-streifenbrett.md). Auf dem Holzschild steht eine Plus- oder Minusaufgabe bis 20,
// das Kind tippt das Ergebnis und bestätigt mit dem Haken. Dann legen sich die Perlenstäbe der Aufgabe als Steg aufs Wasser, und
// Kofi rennt so viele Perlen weit, wie das Kind getippt hat. Stimmt die Zahl, endet der Steg genau dort: der Nebel reißt auf, Kofi
// springt auf die Insel. Sonst bremst er mitten auf dem Steg oder an seiner Kante, und ein hohles Schild zeigt, wo die getippte
// Zahl liegt. Bei Minus gehen die letzten Perlen unter. Das Material kommt erst nach der Antwort: auf der Stufe material liegt es
// schon da, auf vorstellung unter Tüchern, auf kopf ist nur Wasser.
//
// Aufbau wie die Spielvorlage (spiele/vorlage/spiel.js, dort die Schritte zum eigenen Spiel):
//   SPIELWELT  Kennung, Aufgabenarten, Sätze des Erzählers, Klänge
//   TEICH      Maße, Steg, Kofi, Wirkungen (richtig, daneben, Rückweg)
//   AUFGABE    eine Aufgabe darstellen, prüfen (der Steg urteilt), Hilfe-Stufen
//   EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8): Kofi macht vor, dann tippt das Kind
//   RAHMEN     aus der Vorlage; die Lernsteuerung bestimmt die Länge der Runde
//
// Vorschau-Parameter wie in der Vorlage (?pause, ?hinweis, ?eltern, ?einfuehrung, ?thema=, ?pruefen, ?stufe=).

import "../../rahmen/leiste.js";
import "../../rahmen/blase.js";
import "../../rahmen/hilfe.js";
import "../../rahmen/pause.js";
import "../../rahmen/gekonnt.js";
import "../../rahmen/knopf.js";
import "../../rahmen/tastatur.js";
import "../../rahmen/perlenstab.js";
import * as Runde from "../../runde/runde.js";
import { paketAus, paketKniff } from "../../aufgabenarten.js";
import { meldePruefSchnittstelle, selektor, testbetrieb } from "../../rahmen/pruefen.js";
import { einfuehrungsLauf } from "../../rahmen/einfuehrung-lauf.js";
import { sperreTouch, protokoll, esc } from "../../lernspiel.js";
import { sprich } from "../../kern/stimme.js";
import { runde, einmal } from "../../lernsteuerung.js";
import { starteSpielzeit, amRundenende, sage } from "../../rahmen/spielzeit.js";
import { SCHRITT } from "../../rahmen/perlen-geometrie.js";
import {
  tippe, bereit, naechsteTaste, kandidaten, tastenZu, stegVon, platzX, laufPerlen, laufMs, pfahlX, tonHoehe, naechsteFreude, witz,
  aufgabeTeile, gleichungTeile, hilfeTeile, hilfeVon, staebe, PLAETZE,
} from "./logik.js";

sperreTouch();

const $ = (/** @type {string} */ id) => /** @type {any} */ (document.getElementById(id));
const leiste = $("leiste");
const blase = $("blase");
const hilfe = $("hilfe");
const pause = $("pause");
const gekonntEl = $("gekonnt");
const tastatur = $("tastatur");
const fertigKnopf = $("fertig");
const stegEl = $("steg");
const kofiEl = $("kofi");
const kofiKoerper = $("kofi-koerper");
const schattenEl = $("schatten");
const schildEl = $("schild");
const eingabeEl = $("eingabe");
const inselEl = $("insel");
const reiherEl = $("reiher");
const nebelEl = $("nebel");
const pfaehleEl = $("pfaehle");
const figurenEl = $("figuren");

// =====================================================================================================
// SPIELWELT
// =====================================================================================================

/** Kennung des Spiels: steht einmal in der HTML-Datei an <ls-leiste spiel>. */
const SPIEL_ID = leiste.getAttribute("spiel");

/** Aufgabenarten (gilt nur, solange das Spiel nicht in spiele.json steht; dort steht dasselbe). */
const ARTEN = [{ art: "paket", max: 20, stufen: ["material", "vorstellung", "kopf"] }];

/** Längstens so lange wartet die Folge auf das Ende der Wirkung (Regeln §1: etwa 2,5 s, höchstens 3 s). */
const FOLGE_MAX_MS = 3000;
const NACH_WIRKUNG_MS = 150;
/** So lange wartet die Pause längstens auf die letzten Sätze (eine Notbremse, falls die Stimme hängt). */
const SATZ_WARTE_MS = 5000;

/** Nur Vorschau: Aufgaben, falls die Lernsteuerung nichts liefert. */
const VORSCHAU = { thema: "Plus und Minus bis 20", aufgaben: ["paket:plus-bis-10-gemischt:6+3", "paket:minus-bis-10-gemischt:9-4", "paket:plus-bis-10-gemischt:5+2", "paket:minus-bis-10-gemischt:8-3"] };

/** Sätze aus Daten (Zahlen ausgeschrieben, texte.json). */
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
/** Ruhe zwischen zwei Sätzen (ohne Abstand wirkte die Stimme gehetzt, Christian 2026-11-16). */
const SATZ_PAUSE_MS = 600;
/** Ruhe zwischen den Stücken eines Satzes („Sechs“ – „Plus“ – „Drei.“). */
const STUECK_PAUSE_MS = 60;
/** Wann der letzte Satz zu Ende war (performance.now()). */
let satzEnde = -Infinity;
/** Die Stücke des zuletzt gesagten Satzes, wenn er aus Stücken besteht („Noch mal hören“ spricht sie wieder). @type {string[] | null} */
let letzteFolge = null;
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
const sagt = (text, { zeigen = false, verwerfbar = false } = {}) =>
  text ? spricht(() => { letzteFolge = null; return blase.sage(text, { zeigen }); }, verwerfbar) : Promise.resolve("still");

/**
 * Ein Satz aus Stücken: jedes Stück ist eine feste Aufnahme aus texte.json, die Stücke folgen dicht aufeinander. Der Satz
 * steht ganz in der Blase (Vorleser, ohne Ton als Blase), „Noch mal hören“ spricht ihn wieder.
 * @param {(string | undefined)[]} teile @param {{ zeigen?: boolean, verwerfbar?: boolean }} [o]
 */
function sagtTeile(teile, { zeigen = false, verwerfbar = false } = {}) {
  const l = teile.filter((t) => typeof t === "string" && t);
  if (!l.length) return Promise.resolve("still");
  return spricht(async () => {
    letzteFolge = l;
    blase.sage(anzeige(l), { sprechen: false, zeigen });
    return spricheFolge(l);
  }, verwerfbar);
}
/** Die Stücke als Text zum Lesen: nach einem Satzzeichen groß, sonst klein („Sechs plus drei gleich neun.“). @param {string[]} l */
const anzeige = (l) => l.map((t, i) => (i > 0 && !/[.?!]$/.test(l[i - 1]) ? t.charAt(0).toLowerCase() + t.slice(1) : t)).join(" ");
/** @param {string[]} l */
async function spricheFolge(l) {
  let ergebnis = "still";
  for (const t of l) {
    const e = await blase.spricht(t, undefined);
    if (e === "still" && ergebnis === "still") return "still";
    ergebnis = e;
    await new Promise((ok) => setTimeout(ok, STUECK_PAUSE_MS));
  }
  return ergebnis;
}
// „Noch mal hören“ spricht bei einem Satz aus Stücken alle Stücke (die Blase kennt nur einen Text).
blase.shadowRoot?.addEventListener("click", (/** @type {Event} */ e) => {
  if (!letzteFolge || !e.composedPath().includes(blase.knopf)) return;
  e.stopPropagation();
  const l = letzteFolge;
  spricht(() => spricheFolge(l));
}, true);

/** Der Erzähler (docs/stimme.md): beschreibt, was zu sehen ist, nie ein Urteil (grundsaetze.md 3.2). */
const erzaehler = {
  /** Die Aufgabe zum Anhören („Sechs plus drei.“); nur auf Wunsch gesprochen, der Text steht für „Noch mal hören“ bereit. */
  aufgabe: (/** @type {any} */ d) => {
    if (!TEXTE) return;
    const l = aufgabeTeile(TEXTE, d);
    blase.sage(anzeige(l), { sprechen: false });
    letzteFolge = l;
  },
  /** Nach Fehlversuch oder Hilfe gelöst: die Gleichung. */
  gleichung: (/** @type {any} */ d) => (TEXTE ? sagtTeile(gleichungTeile(TEXTE, d), { verwerfbar: true }) : Promise.resolve("still")),
  /** Nach einem Fehlversuch ein klarer Auftrag; fällt nach einem Tipp weg. */
  nochmal: () => spricht(() => { letzteFolge = null; return blase.sage("Versuch es noch einmal."); }, true),
  /** Hilfe 1: die Probe als Satz. */
  probe: (/** @type {any} */ d) => (TEXTE ? sagtTeile(hilfeTeile(TEXTE, d), { zeigen: true }) : Promise.resolve("still")),
  /** Hilfe 2: wo die Insel liegt. */
  insel: (/** @type {number} */ e) => sagt(TEXTE?.insel?.[e], { zeigen: true }),
  gehtNicht: () => blase.sage("Das Spiel geht gerade nicht."),
};

/**
 * Die Sätze der Einführung (docs/spielbau.md §8): in Ruhe, als kleine Geschichte. Jeder steht als feste Zeichenkette in
 * blase.sage (für `npm run audio`); jeder Schritt wartet, bis der Satz zu Ende ist.
 */
const einleitung = {
  insel: (/** @type {any} */ o) => spricht(() => blase.sage("Kofi will zur Insel im Nebel.", o)),
  schild: (/** @type {any} */ o) => spricht(() => blase.sage("Auf dem Schild steht vier plus zwei.", o)),
  tippt: (/** @type {any} */ o) => spricht(() => blase.sage("Kofi tippt die Sechs.", o)),
  haken: (/** @type {any} */ o) => spricht(() => blase.sage("Dann tippt er auf den Haken.", o)),
  perlen: (/** @type {any} */ o) => spricht(() => blase.sage("Die Perlen legen sich aufs Wasser.", o)),
  rennt: (/** @type {any} */ o) => spricht(() => blase.sage("Kofi rennt sechs Perlen weit und springt.", o)),
  dujetzt: (/** @type {any} */ o) => spricht(() => blase.sage("Jetzt du: fünf plus eins.", o)),
  bremst: (/** @type {any} */ o) => spricht(() => blase.sage("Bei einer anderen Zahl bremst Kofi.", o)),
  nochmal: (/** @type {any} */ o) => spricht(() => blase.sage("Dann probierst du es einfach noch einmal.", o)),
  pfeil: (/** @type {any} */ o) => spricht(() => blase.sage("Der Pfeilknopf löscht eine Ziffer.", o)),
  lernen: (/** @type {any} */ o) => spricht(() => blase.sage("So rechnest du bald ohne Zählen.", o)),
  los: (/** @type {any} */ o) => spricht(() => blase.sage("Jetzt geht es los.", o)),
};

/** Elternansicht (?eltern): beschreibend, von Stärken aus, kein Vergleich (3.3). @param {HTMLElement} feld */
function fuelleEltern(feld) {
  feld.innerHTML = `<p>Ihr Kind sieht eine Plus- oder Minusaufgabe bis 20 und tippt das Ergebnis aus dem Gedächtnis. Danach legen sich
    zwei Perlenstäbe als Steg aufs Wasser, und Kofi rennt so viele Perlen weit, wie Ihr Kind getippt hat. Stimmt die Zahl, endet der Steg
    genau dort, und Kofi springt auf die Insel. Sonst bremst er mitten auf dem Steg oder an seiner Kante, und man sieht, wo die getippte
    Zahl wirklich liegt. Bei Minus gehen die letzten Perlen unter.</p>
    <p>Die Perlen liegen erst nach dem Tippen auf dem Wasser (in der leichtesten Fassung schon davor, in der mittleren unter Tüchern); wer
    sie abzählen müsste, ist langsam. Welche Aufgaben dran sind und was Ihr Kind schon kann, steht bei den Themen im Elternbereich.</p>`;
}

/**
 * Sachmoment der Pause (K1, K8, L13): ein Mach-mit-Satz, ruhig, nie Bedingung.
 * @param {HTMLElement} karte @param {boolean} ton
 */
function fuelleSachmoment(karte, ton) {
  karte.replaceChildren();
  const satz = document.createElement("p");
  satz.textContent = "Stellt euch beim Gehen Aufgaben, wie Kofi.";
  karte.append(satz);
  // Derselbe Satz steht als feste Zeichenkette im Aufruf sprich, damit `npm run audio` ihn findet.
  // Nach den Sätzen der Folge, damit keiner abgeschnitten wird.
  if (ton) spricht(() => sprich("Stellt euch beim Gehen Aufgaben, wie Kofi."));
}

// --- Klänge (Web Audio, leise; Ton aus gilt) ---------------------------------------------------------
/** @type {AudioContext | null} */
let audio = null;
/** Der Audio-Kontext, erst nach der ersten Eingabe des Kindes (davor erlaubt der Browser keinen Ton). */
function kontext() {
  try {
    if (!audio && navigator.userActivation && !navigator.userActivation.hasBeenActive) return null;
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
/** Rauschen durch einen Filter, das abklingt. @param {number} dauer @param {BiquadFilterType} typ @param {number} hz @param {number} laut @param {number} [spaeter] */
function rauschen(dauer, typ, hz, laut, spaeter = 0) {
  if (!leiste.ton) return;
  const a = kontext();
  if (!a) return;
  try {
    const n = Math.max(1, Math.floor(a.sampleRate * dauer));
    const puffer = a.createBuffer(1, n, a.sampleRate);
    const d = puffer.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const quelle = a.createBufferSource();
    quelle.buffer = puffer;
    const filter = a.createBiquadFilter();
    filter.type = typ;
    filter.frequency.value = hz;
    const g = a.createGain();
    g.gain.value = laut;
    quelle.connect(filter).connect(g).connect(a.destination);
    quelle.start(a.currentTime + spaeter);
  } catch {
    // still
  }
}
const klang = {
  /** Ein Stab klappt aufs Wasser: hohles Holz. */
  tock: () => { ton(240, { dauer: 0.09, typ: "sine", laut: 0.11, gleiten: 0.5 }); rauschen(0.04, "bandpass", 900, 0.05); },
  /** Eine Perle beim Laufen, je eine Stufe höher; an der fünften ein Doppelton. @param {number} i */
  perle: (i) => {
    ton(tonHoehe(i), { dauer: 0.08, typ: "triangle", laut: 0.05 });
    if (i % 5 === 0) ton(tonHoehe(i) * 1.5, { dauer: 0.09, typ: "sine", laut: 0.04, spaeter: 0.03 });
  },
  /** Landung auf der Insel: weiches Holz-Plopp. */
  plopp: () => { ton(300, { dauer: 0.12, typ: "sine", laut: 0.1, gleiten: 0.55 }); rauschen(0.06, "lowpass", 600, 0.05); },
  fluegel: () => rauschen(0.5, "bandpass", 1800, 0.04),
  schurren: () => rauschen(0.22, "lowpass", 700, 0.07),
  tropf: () => ton(980, { dauer: 0.07, typ: "sine", laut: 0.05, gleiten: 0.6 }),
  glug: () => ton(220, { dauer: 0.22, typ: "sine", laut: 0.06, gleiten: 0.5 }),
  tuch: () => rauschen(0.12, "highpass", 1200, 0.04),
  boing: () => ton(196, { dauer: 0.38, typ: "sine", laut: 0.06, gleiten: 1.5 }),
};

// =====================================================================================================
// TEICH
// =====================================================================================================

const wenigBewegung = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const remPx = () => parseFloat(getComputedStyle(document.documentElement).fontSize) || 10;

/** Beginn der ersten Perle (rem, wie --x0 in index.html), Durchmesser einer Perle (--d), Höhe der Stäbe, Oberkante der Stäbe. */
const X0 = 24;
const D = 4.2;
const STAB_H = D * 1.4;
const STEG_Y = 70;
/** Hier steht Kofi am Ufer (Mitte, rem). */
const UFER_X = 9;
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

/**
 * Bewegt ein Element mit transform und lässt es am Ende dort stehen (ohne eine haltende Animation: die Endlage wird ins Style
 * geschrieben). Ohne Animation (wenig Bewegung) springt es sofort.
 * @param {HTMLElement} el @param {Keyframe[]} keyframes @param {number} ms @param {string} [easing]
 */
async function gleite(el, keyframes, ms, easing = "ease-in-out") {
  const letzte = keyframes[keyframes.length - 1];
  const ende = String(letzte.transform ?? "none");
  if (typeof el.animate !== "function" || wenigBewegung() || ms <= 0) {
    el.style.transform = ende;
    return;
  }
  const a = el.animate(keyframes, { duration: ms, easing, fill: "forwards" });
  laufend.push(() => {
    try {
      a.finish();
    } catch {
      // schon fertig
    }
  });
  await a.finished.then(() => undefined, () => undefined);
  el.style.transform = ende;
  a.cancel();
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

// --- Pfähle am Brett (fest, ohne Ziffern: bei 5, 10, 15, 20; höher bei 10 und 20) --------------------------------
for (let k = 1; k <= 4; k++) {
  const p = document.createElement("div");
  p.className = "pfahl";
  p.dataset.k = String(k);
  const hoch = k % 2 === 0 ? 8 : 5;
  p.style.left = `${X0 + pfahlX(k) * D - 0.75}rem`;
  p.style.top = `${STEG_Y + STAB_H - hoch - 3}rem`;
  p.style.height = `${hoch + 3}rem`;
  pfaehleEl.append(p);
}

// --- Kofi ----------------------------------------------------------------------------------------------------
kofiKoerper.innerHTML = Runde.zeichne("kofi", { haltung: "stehen", ansicht: "profil", blick: "rechts" });
const kofi = Runde.steuere(kofiKoerper.querySelector("svg"), { tempo: 0.28 });
/** Wo Kofi steht (Mitte, rem), ob er nach links schaut. */
let kofiX = UFER_X;
/** Zähler der Läufe: ein neuer Lauf beendet das Beinewerfen des alten. */
let laufNr = 0;
const T = (/** @type {number} */ x, /** @type {number} */ y = 0, /** @type {string} */ extra = "") => `translate3d(${(x * remPx()).toFixed(1)}px, ${(y * remPx()).toFixed(1)}px, 0)${extra ? ` ${extra}` : ""}`;

/** Stellt Kofi ohne Bewegung hin. @param {number} x @param {boolean} [links] */
function stelleKofi(x, links = false) {
  kofiEl.getAnimations().forEach((a) => a.cancel());
  kofiEl.style.transform = T(x);
  schattenEl.style.transform = T(x);
  kofiKoerper.style.transform = links ? "scaleX(-1)" : "";
  kofiX = x;
}
addEventListener("resize", () => stelleKofi(kofiX));

/** Kofi setzt schnelle Schritte, solange der Lauf dauert (die Bewegung selbst trägt die Hülle). @param {number} nr @param {number} ms */
async function setzeSchritte(nr, ms) {
  const bis = performance.now() + ms - 100;
  while (nr === laufNr && performance.now() < bis) await kofi.bewegung("gehen");
}

/**
 * Kofi rennt von seiner Stelle nach x (rem), n Perlen weit: je Perle ein Ton, an der fünften ein Doppelton.
 * @param {number} nach @param {number} perlen Anzahl Perlen auf dem Weg (für die Töne) @param {number} ms
 */
async function renne(nach, perlen, ms) {
  const von = kofiX;
  if (Math.abs(nach - von) < 0.05) return;
  const nr = ++laufNr;
  kofiKoerper.style.transform = nach < von ? "scaleX(-1)" : "";
  kofiX = nach;
  if (wenigBewegung()) {
    stelleKofi(nach, nach < von);
    return;
  }
  setzeSchritte(nr, ms);
  // Die Töne: eine Perle alle (ms - Anlauf) / perlen.
  const anlauf = Math.min(220, ms * 0.25);
  const takt = perlen > 0 ? (ms - anlauf) / perlen : 0;
  /** @type {ReturnType<typeof setTimeout>[]} */
  const uhren = [];
  for (let i = 1; i <= perlen; i++) uhren.push(setTimeout(() => klang.perle(i), anlauf + (i - 1) * takt));
  laufend.push(() => uhren.forEach(clearTimeout));
  schattenEl.animate([{ transform: T(von) }, { transform: T(nach) }], { duration: ms, easing: "cubic-bezier(0.35, 0, 0.7, 1)", fill: "forwards" }).finished
    .then(() => { schattenEl.style.transform = T(nach); }, () => undefined);
  await gleite(kofiEl, [{ transform: T(von) }, { transform: T(nach) }], ms, "cubic-bezier(0.35, 0, 0.7, 1)");
  laufNr++;
}

// --- Der Steg ------------------------------------------------------------------------------------------------
/** Was gerade auf dem Teich liegt. @type {{ d: any, steg: ReturnType<typeof stegVon>, stufe: string, aufgedeckt: boolean, sinker: HTMLElement | null, inselX: number } | null} */
let szene = null;
/** Stäbe als Elemente (für das Aufdecken); jeder gehört zur Gruppe 0 (erster Stab bzw. Stab c) oder 1 (zweiter Stab). @type {{ el: HTMLElement, gruppe: number, x: number, wert: number }[]} */
let staebeEl = [];
/** Das Tuch bei Minus. @type {HTMLElement | null} */
let deckelEl = null;
/** Schilder und Boje, die zur Wirkung gehören. @type {HTMLElement[]} */
let schilder = [];

/** X-Lage (rem im Feld) von Platz i. @param {number} i */
const platzRem = (i) => X0 + platzX(szene?.steg ?? { perlen: [] }, i) * D;
/** Kante rechts hinter der letzten Perle des Ergebnisses (rem im Feld): hier beginnt die Insel. @param {ReturnType<typeof stegVon>} steg */
const inselRem = (steg) => X0 + (steg.ergebnis > 0 ? platzX(steg, steg.ergebnis) + SCHRITT / 2 : 0) * D + 0.5;

/** Räumt Steg, Tuch, Sinker und Schilder weg (sofort). */
function leereTeich() {
  stegEl.getAnimations().forEach((a) => a.cancel());
  stegEl.replaceChildren();
  stegEl.style.transform = "";
  stegEl.style.clipPath = "";
  stegEl.style.opacity = "";
  szene?.sinker?.remove();
  for (const s of schilder) {
    s.getAnimations().forEach((a) => a.cancel());
    s.remove();
  }
  schilder = [];
  staebeEl = [];
  deckelEl = null;
  document.querySelectorAll(".markiert-pfahl").forEach((e) => e.classList.remove("markiert-pfahl"));
  szene = null;
}

/** Baut die Stäbe und bei Minus das Tuch in den Steg. @param {HTMLElement} ziel @param {ReturnType<typeof stegVon>} steg @param {any} d @param {{ verdeckt: boolean, deckel: boolean }} o */
function baueStaebe(ziel, steg, d, { verdeckt, deckel }) {
  const plus = d.op === "plus";
  const nA = plus ? staebe(d.a).length : staebe(d.c).length;
  /** @type {typeof staebeEl} */
  const neu = [];
  steg.staebe.forEach((s, i) => {
    const el = document.createElement("ls-perlenstab");
    el.setAttribute("wert", String(s.wert));
    el.setAttribute("aria-label", `Perlenstab ${s.wert}`);
    if (verdeckt) el.setAttribute("verdeckt", "");
    el.style.left = `${s.x * D}rem`;
    ziel.append(el);
    neu.push({ el, gruppe: i < nA ? 0 : 1, x: s.x, wert: s.wert });
  });
  /** @type {HTMLElement | null} */
  let tuch = null;
  if (deckel && steg.tuch) {
    tuch = document.createElement("div");
    tuch.className = "deckel";
    tuch.style.left = `${steg.tuch.von * D}rem`;
    tuch.style.width = `${(steg.tuch.bis - steg.tuch.von) * D}rem`;
    ziel.append(tuch);
  }
  return { neu, tuch };
}

/**
 * Legt den Teich für eine Aufgabe in den Zustand vor der Antwort: material die Stäbe (bei Minus mit Tuch), vorstellung die Stäbe
 * unter Tüchern, kopf nichts. Kofi steht am Ufer, der Nebel liegt, die Insel ist nicht zu sehen.
 * @param {any} d @param {string} stufe @param {{ ausrollen?: boolean }} [o]
 */
async function legeTeich(d, stufe, { ausrollen = true } = {}) {
  leereTeich();
  const steg = stegVon(d);
  szene = { d, steg, stufe, aufgedeckt: false, sinker: null, inselX: inselRem(steg) };
  inselEl.style.left = `${szene.inselX}rem`;
  inselEl.style.visibility = "hidden";
  reiherEl.getAnimations().forEach((a) => a.cancel());
  reiherEl.style.transform = "";
  reiherEl.style.opacity = "";
  nebelEl.getAnimations().forEach((a) => a.cancel());
  nebelEl.style.opacity = "1";
  if (stufe === "kopf") return;
  const { neu, tuch } = baueStaebe(stegEl, steg, d, { verdeckt: stufe === "vorstellung", deckel: stufe === "material" });
  staebeEl = neu;
  deckelEl = tuch;
  if (ausrollen && !wenigBewegung()) {
    klang.tock();
    await anim(stegEl, [{ transform: "scaleX(0.02)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 240, easing: "ease-out" });
    stegEl.getAnimations().forEach((a) => a.cancel());
  }
}

/**
 * Das Material kommt zum Vorschein (nach dem Haken): kopf klappen die Stäbe nacheinander aufs Wasser (je 0,25 s, tock), vorstellung
 * fliegen die Tücher weg, material liegt es schon. Bei Minus legt sich dann das Tuch über die letzten Perlen, und sie sinken.
 * @param {{ sinken?: boolean }} [o]
 */
async function deckeAuf({ sinken = true } = {}) {
  const s = szene;
  if (!s) return;
  const { d, steg, stufe } = s;
  if (s.aufgedeckt) {
    // Schon aufgedeckt (Probe der Hilfe): bei Minus fehlt noch das Untergehen.
    if (sinken && steg.tuch) await sinkeTuch();
    return;
  }
  s.aufgedeckt = true;
  if (stufe === "kopf") {
    const { neu } = baueStaebe(stegEl, steg, d, { verdeckt: false, deckel: false });
    staebeEl = neu;
    const gruppen = [...new Set(neu.map((n) => n.gruppe))];
    await Promise.all(gruppen.map(async (g, gi) => {
      const teile = neu.filter((n) => n.gruppe === g);
      for (const t of teile) t.el.style.opacity = "0";
      await warte(100 + gi * 250);
      klang.tock();
      await Promise.all(teile.map((t) => anim(t.el, [
        { transform: `translateY(${(-5).toFixed(1)}rem) rotate(-10deg)`, opacity: 0 },
        { transform: "translateY(0.6rem)", opacity: 1, offset: 0.7 },
        { transform: "none", opacity: 1 },
      ], { duration: 260, easing: "ease-in" }).then(() => { t.el.style.opacity = ""; t.el.getAnimations().forEach((a) => a.cancel()); })));
    }));
  } else if (stufe === "vorstellung") {
    klang.tuch();
    await Promise.all(staebeEl.map((t) => {
      const geist = /** @type {HTMLElement} */ (t.el.cloneNode(true));
      geist.style.zIndex = "2";
      stegEl.append(geist);
      t.el.removeAttribute("verdeckt");
      return anim(geist, [{ transform: "none", opacity: 1 }, { transform: "translateY(-7rem) rotate(-8deg)", opacity: 0 }], { duration: 320, easing: "ease-in" })
        .then(() => geist.remove());
    }));
  }
  if (sinken && steg.tuch) await sinkeTuch();
}

/** Bei Minus: das Tuch legt sich über die letzten b Perlen, sie sinken unter Wasser (bleiben gedämpft sichtbar). */
async function sinkeTuch() {
  const s = szene;
  if (!s?.steg.tuch || s.sinker) return;
  const { steg } = s;
  const von = steg.tuch.von * D;
  if (!deckelEl) {
    const { tuch } = baueStaebe(document.createElement("div"), steg, s.d, { verdeckt: false, deckel: true });
    deckelEl = tuch;
    if (tuch) {
      stegEl.append(tuch);
      await anim(tuch, [{ transform: "translateY(-5rem)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 220, easing: "ease-in" });
      tuch.getAnimations().forEach((a) => a.cancel());
    }
  }
  // Der Teil ab dem Tuch wird eine eigene Schicht: der Steg behält nur die Perlen davor.
  const sinker = /** @type {HTMLElement} */ (stegEl.cloneNode(true));
  sinker.removeAttribute("id");
  sinker.classList.add("sinkt");
  sinker.style.clipPath = `inset(-3rem 0 -3rem ${von}rem)`;
  stegEl.style.clipPath = `inset(-3rem calc(120rem - ${von}rem) -3rem 0)`;
  stegEl.after(sinker);
  s.sinker = sinker;
  klang.glug();
  await anim(sinker, [{ transform: "none", opacity: 1 }, { transform: "translateY(7.5rem)", opacity: 0.4 }], { duration: 440, easing: "ease-in" });
}

/** Der Steg rollt zum Ufer zurück (scaleX von rechts nach links). @param {number} [ms] */
async function rolleZurueck(ms = 280) {
  const s = szene;
  if (!s) return;
  const teile = [stegEl, ...(s.sinker ? [s.sinker] : [])];
  if (stegEl.childElementCount || s.sinker) await Promise.all(teile.map((t) => anim(t, [{ transform: "none", opacity: 1 }, { transform: "scaleX(0.02)", opacity: 0 }], { duration: ms, easing: "ease-in" })));
}

// --- Schilder, Insel, Nebel -----------------------------------------------------------------------------------

/**
 * Ein Schild mit einer Zahl im Feld der Figuren. @param {number} zahl @param {number} x Mitte (rem) @param {number} unten Unterkante der Tafel (rem)
 * @param {{ hohl?: boolean, boje?: boolean, markiert?: boolean }} [o]
 */
function zahlSchild(zahl, x, unten, { hohl = false, boje = false, markiert = false } = {}) {
  const s = document.createElement("div");
  s.className = `zahlschild${hohl ? " hohl" : ""}${boje ? " boje" : ""}${markiert ? " markiert" : ""}`;
  s.textContent = String(zahl);
  s.style.left = `${x}rem`;
  s.style.top = `${unten - 9}rem`;
  figurenEl.append(s);
  schilder.push(s);
  return s;
}

/** Das Schild mit dem Ergebnis rastet auf der Insel ein (kleines Überschwingen). @param {number} e @param {number} x */
async function zielSchild(e, x) {
  const s = zahlSchild(e, x, STEG_Y - 0.6);
  klang.plopp();
  await anim(s, [{ transform: "scale(0.2)", opacity: 0 }, { transform: "scale(1.14)", opacity: 1, offset: 0.6 }, { transform: "none", opacity: 1 }], { duration: 300, easing: "ease-out" });
}

/** Die Boje schaukelt im Wasser (läuft, bis sie weggeräumt wird). @param {HTMLElement} s */
function schaukle(s) {
  if (wenigBewegung() || typeof s.animate !== "function") return;
  s.animate([{ transform: "translateY(-0.4rem) rotate(-3.5deg)" }, { transform: "translateY(0.5rem) rotate(3.5deg)" }], { duration: 1500, direction: "alternate", iterations: Infinity, easing: "ease-in-out" });
}

/** Der Nebel reißt auf (der Teich dahinter, die Insel, wird sichtbar). @param {number} [ms] */
async function reisseNebelAuf(ms = 520) {
  inselEl.style.visibility = "visible";
  const von = Number(getComputedStyle(nebelEl).opacity);
  await anim(nebelEl, [{ opacity: Number.isFinite(von) ? von : 1 }, { opacity: 0 }], { duration: ms, easing: "ease-out" });
}

/** Der Reiher flattert auf und fliegt davon. */
async function reiherFliegt() {
  klang.fluegel();
  await anim(reiherEl, [
    { transform: "none", opacity: 1 },
    { transform: "translate(1rem, -4rem) rotate(-8deg)", opacity: 1, offset: 0.3 },
    { transform: "translate(14rem, -22rem) rotate(-14deg) scale(0.8)", opacity: 0 },
  ], { duration: 1100, easing: "ease-in" });
}

// --- Wirkungen -------------------------------------------------------------------------------------------------

/** Wie Kofi nach der Landung freut (nie zweimal gleich) und ob ein Witz dazukommt. */
let vorigeFreude = /** @type {string | null} */ (null);
let seitWitz = 0;
/** Die Wirkung der letzten Lösung (die Folge wartet darauf). @type {Promise<any>} */
let wirkungFertig = Promise.resolve();

/**
 * Der Sprung von der letzten Perle auf die Insel: im Bogen, die Landung leicht gestaucht, dann zurück.
 * @param {number} nach Mitte der Landung (rem)
 */
async function springe(nach) {
  const von = kofiX;
  kofiX = nach;
  klang.boing();
  const mitte = (von + nach) / 2;
  await Promise.all([
    gleite(kofiEl, [
      { transform: T(von), offset: 0, easing: "cubic-bezier(0.2, 0.7, 0.4, 1)" },
      { transform: T(mitte, -5), offset: 0.5, easing: "cubic-bezier(0.6, 0, 0.9, 0.5)" },
      { transform: T(nach, 0, "scale(1.1, 0.86)"), offset: 0.82, easing: "ease-out" },
      { transform: T(nach), offset: 1 },
    ], 440, "linear"),
    anim(schattenEl, [{ transform: T(von) }, { transform: T(nach) }], { duration: 440, easing: "linear" }).then(() => { schattenEl.style.transform = T(nach); schattenEl.getAnimations().forEach((a) => a.cancel()); }),
  ]);
}

/**
 * Die Wirkung einer richtigen Antwort (etwa 2,3 s): die Stäbe liegen, Kofi rennt so weit, wie das Ergebnis sagt, springt, der Nebel
 * reißt auf, er landet auf der Insel, das Schild mit der Zahl rastet ein, Freude.
 * @param {any} d @param {{ freude?: boolean, witzArt?: string | null }} [o]
 */
async function wirkungRichtig(d, { freude = true, witzArt = null } = {}) {
  const s = szene;
  if (!s) return;
  const art = freude ? naechsteFreude(vorigeFreude) : null;
  if (art) vorigeFreude = art;
  const e = s.steg.ergebnis;
  const aufdecken = deckeAuf();
  await warte(200);
  const ziel = e > 0 ? X0 + platzX(s.steg, e) * D : UFER_X;
  const ms = e > 0 ? 220 + laufMs(e) : 0;
  await renne(e > 0 ? ziel : UFER_X, e, ms);
  await aufdecken;
  if (!s.aufgedeckt) return;
  const inselMitte = s.inselX + 6;
  const nebel = reisseNebelAuf();
  if (witzArt === "alles") await warte(120);
  await springe(inselMitte);
  await nebel;
  zielSchild(e, s.inselX + 18);
  if (witzArt === "tropfen") {
    const tropfen = document.createElement("div");
    tropfen.className = "tropfen";
    tropfen.style.left = `${inselMitte + 1}rem`;
    tropfen.style.top = `${STEG_Y - 31}rem`;
    figurenEl.append(tropfen);
    schilder.push(tropfen);
    klang.tropf();
    await anim(tropfen, [{ transform: "translateY(0)", opacity: 1 }, { transform: "translateY(11rem)", opacity: 1, offset: 0.8 }, { transform: "translateY(12rem)", opacity: 0 }], { duration: 460, easing: "ease-in" });
    kofi.haltung("staunen", { ms: 200 });
  }
  if (art === "hocke") {
    kofi.haltung("freuen-klein", { ms: 220 });
  } else if (art === "reiher") {
    kofi.haltung("staunen", { ms: 200 });
    reiherFliegt();
    await warte(500);
  } else if (art === "gross") {
    kofi.haltung("freuen-gross", { ms: 160 });
    klang.plopp();
    await gleite(kofiEl, [{ transform: T(kofiX) }, { transform: T(kofiX, -8, "rotate(180deg)"), offset: 0.5 }, { transform: T(kofiX, 0, "rotate(360deg)") }], 560, "ease-in-out");
    stelleKofi(kofiX);
  }
  if (witzArt === "null") {
    kofi.haltung("staunen", { ms: 200 });
  }
  await warte(art === "hocke" || !art ? 360 : 120);
}

/**
 * Die Wirkung einer Zahl, die nicht passt: Kofi rennt trotzdem so viele Perlen, wie getippt wurde, höchstens bis ans Ende des
 * Stegs. Ist die Zahl kleiner, bremst er mitten auf dem Steg und schaut weiter in den Nebel; ist sie größer, bremst er knapp an der
 * Kante und rudert kurz. Ein hohles Schild zeigt, wo die getippte Zahl liegt; die Insel bleibt im Nebel.
 * @param {number} w die getippte Zahl @param {{ weg: boolean }} abbruch
 */
async function wirkungDaneben(w, abbruch) {
  const s = szene;
  if (!s) return;
  const aufdecken = deckeAuf();
  await warte(200);
  const e = s.steg.ergebnis;
  const n = laufPerlen({ perlen: s.steg.perlen.slice(0, e) }, w);
  const zielX = n > 0 ? X0 + platzX(s.steg, n) * D : UFER_X + 4;
  const kleiner = w < e;
  await renne(zielX, n, n > 0 ? 220 + laufMs(n) : 160);
  await aufdecken;
  if (abbruch.weg || szene !== s) return;
  klang.schurren();
  if (kleiner) {
    // Kofi bremst mitten auf dem Steg und schaut nach vorn in den Nebel.
    await gleite(kofiEl, [{ transform: T(kofiX) }, { transform: T(kofiX + 1.2) }], 200, "ease-out");
    kofiX += 1.2;
    schattenEl.style.transform = T(kofiX);
    if (abbruch.weg) return;
    const platz = Math.min(w, PLAETZE);
    zahlSchild(w, X0 + (platzX(s.steg, platz) + 3.1) * D, STEG_Y - 0.4, { hohl: true });
    kofi.haltung("staunen", { ms: 220 });
    await warte(300);
  } else {
    // Kofi bremst knapp an der Kante und rudert kurz; die Boje liegt dort im Wasser, wo die Zahl liegt.
    kofi.bewegung("fast-umfallen");
    const platz = Math.min(w, PLAETZE + 1);
    const boje = zahlSchild(w, X0 + platzX(s.steg, platz) * D, STEG_Y + STAB_H + 8.5, { hohl: true, boje: true });
    klang.tropf();
    await anim(boje, [{ transform: "translateY(-3rem)", opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 240, easing: "ease-out" });
    boje.getAnimations().forEach((a) => a.cancel());
    schaukle(boje);
    await warte(260);
  }
  if (abbruch.weg) return;
  erzaehler.nochmal();
}

/** Kofi trabt zum Ufer zurück, der Steg rollt hinterher auf, die Schilder gehen, der Nebel kommt wieder (etwa 0,6 s). */
async function rueckweg() {
  const s = szene;
  const bleibt = kofiX === UFER_X && !s;
  if (bleibt) return;
  const rolle = rolleZurueck(300);
  const zurueck = kofiX > UFER_X + 0.5 && !wenigBewegung() ? renne(UFER_X, 0, 560) : Promise.resolve();
  for (const sch of schilder) anim(sch, [{ opacity: 1 }, { opacity: 0 }], { duration: 240 });
  if (nebelEl.style.opacity !== "1") anim(nebelEl, [{ opacity: Number(getComputedStyle(nebelEl).opacity) || 0 }, { opacity: 1 }], { duration: 420 });
  await Promise.all([rolle, zurueck]);
  leereTeich();
  inselEl.style.visibility = "hidden";
  nebelEl.getAnimations().forEach((a) => a.cancel());
  nebelEl.style.opacity = "1";
  stelleKofi(UFER_X);
  kofi.haltung("stehen", { ms: 160 });
}

/** Das Bild vor der Antwort kommt zurück (nach einem Fehlversuch, vor der nächsten Taste): Kofi am Ufer, der Steg wie vorher. */
async function zurueckZurAufgabe() {
  const s = szene;
  if (!s) return;
  const { d, stufe } = s;
  ueberspringeAlles();
  const zurueck = kofiX > UFER_X + 0.5 && !wenigBewegung() ? renne(UFER_X, 0, 380) : Promise.resolve();
  for (const sch of schilder) sch.remove();
  schilder = [];
  await zurueck;
  stelleKofi(UFER_X);
  kofi.haltung("stehen", { ms: 140 });
  await legeTeich(d, stufe, { ausrollen: false });
}

// --- Stufenwechsel ------------------------------------------------------------------------------------------------

/**
 * Wechselt die Lernstufe mitten im Spiel, sieht man es (Regeln §8): zu vorstellung legt Kofi Tücher über die Perlen, zu kopf zieht
 * dichterer Nebel auf, zu material nimmt er die Tücher weg. Ein Tipp kürzt ab. @param {string} von @param {string} nach @param {any} d
 */
function wechsleStufe(von, nach, d) {
  void von;
  const satz = nach === "kopf" ? "nebel-dicht" : nach === "vorstellung" ? "tuecher-hin" : "tuecher-weg";
  const abmelden = beimTippen(ueberspringeAlles);
  return (async () => {
    try {
      // Der Wechsel beginnt in der alten Fassung: zu vorstellung sind die Stäbe noch zu sehen, sonst liegen sie unter Tüchern.
      await legeTeich(d, nach === "vorstellung" ? "material" : "vorstellung", { ausrollen: true });
      // Der Satz läuft neben der Szene (ohne Ton steht er als Blase da); die Szene wartet nicht auf ihn.
      const sage = sagt(TEXTE?.wechsel?.[satz], { zeigen: !leiste.ton });
      if (nach === "vorstellung") {
        // Tücher fallen über die Stäbe.
        await warte(240);
        klang.tuch();
        for (const t of staebeEl) {
          t.el.setAttribute("verdeckt", "");
          anim(t.el, [{ transform: "translateY(-5rem)", opacity: 0.4 }, { transform: "none", opacity: 1 }], { duration: 300, easing: "ease-in" });
        }
        await warte(360);
      } else if (nach === "material") {
        await warte(240);
        klang.tuch();
        await Promise.all(staebeEl.map((t) => {
          const geist = /** @type {HTMLElement} */ (t.el.cloneNode(true));
          stegEl.append(geist);
          t.el.removeAttribute("verdeckt");
          return anim(geist, [{ transform: "none", opacity: 1 }, { transform: "translateY(-7rem) rotate(-8deg)", opacity: 0 }], { duration: 320, easing: "ease-in" }).then(() => geist.remove());
        }));
        await warte(300);
      } else {
        // kopf: der Nebel wird dichter, die Stäbe verschwinden darin.
        await warte(200);
        await anim(stegEl, [{ opacity: 1 }, { opacity: 0 }], { duration: 700, easing: "ease-in" });
      }
      void sage;
      await warte(500);
      await rolleZurueck(220);
    } finally {
      abmelden();
      ueberspringeAlles();
      leereTeich();
    }
  })();
}

// =====================================================================================================
// AUFGABE
// =====================================================================================================

/** Das Schild am Ufer zeigt die Aufgabe. @param {any} d */
function zeigeSchild(d) {
  $("op-a").textContent = String(d.op === "plus" ? d.a : d.c);
  $("op-zeichen").textContent = d.op === "plus" ? "+" : "−";
  $("op-b").textContent = String(d.b);
  setzeEingabe("");
}
/** Die getippten Ziffern in das Kästchen. @param {string} text */
function setzeEingabe(text) {
  const vorher = eingabeEl.textContent ?? "";
  eingabeEl.replaceChildren();
  [...text].forEach((z, i) => {
    const el = document.createElement("span");
    el.className = "z";
    el.textContent = z;
    if (i === text.length - 1 && text.length > vorher.length && !wenigBewegung()) el.classList.add("sinkt");
    eingabeEl.append(el);
  });
}

/** Ob Kofi und der Steg gerade ruhen (die Taste darf wirken). */
let vorigeAufgabe = /** @type {any} */ (null);

/**
 * @param {{ ziel: { key: string, thema?: string }, stufe?: string }} aufgabe
 * @param {{ passtNicht: () => void, geloest: (key: string) => void }} melde
 */
function stelleAufgabe(aufgabe, melde) {
  const ziel = paketAus(aufgabe.ziel.key);
  if (!ziel) throw new Error(`Streifenbrett: unbekannte Aufgabe ${aufgabe.ziel.key}`);
  ueberspringeAlles();
  const d = { ...ziel, kniff: kniffVon(ziel) };
  const stufe = aufgabe.stufe ?? "material";
  const ergebnis = d.op === "plus" ? d.c : d.a;
  vorigeAufgabe = d;

  let eingabe = "";
  let fertig = false;
  let loesungGezeigt = false;
  let hilfeGezeigt = false;
  let versuche = 0;
  /** Zahlen, die bei dieser Aufgabe schon getippt wurden und nicht passten (nur für die Züge des Prüfstands). */
  const versucht = new Set();
  /** Das Bild eines Fehlversuchs oder der Probe; das nächste Tippen räumt es weg. @type {(() => void) | null} */
  let fehlerBild = null;

  zeigeSchild(d);
  legeTeich(d, stufe);
  erzaehler.aufgabe(d);

  const naechste = (/** @type {string} */ e) => naechsteTaste(e, ergebnis);
  const markiereNaechste = () => {
    const t = naechste(eingabe);
    tastatur.markiere(t === "fertig" ? null : t);
    fertigKnopf.classList.toggle("markiert", t === "fertig");
  };
  const ohneMarkierung = () => {
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  };
  const raeumeFehlerBild = () => {
    const f = fehlerBild;
    fehlerBild = null;
    f?.();
  };
  /** Die Probe der Hilfe 1 (Schild, Ring, Tausch) wegräumen. */
  const raeumeProbe = () => {
    document.querySelectorAll(".markiert-pfahl").forEach((e) => e.classList.remove("markiert-pfahl"));
    for (const s of schilder.filter((x) => x.classList.contains("markiert"))) {
      s.remove();
      schilder = schilder.filter((x) => x !== s);
    }
  };

  /** @param {string} taste */
  const beiTaste = (taste) => {
    if (fertig || E.laeuft) return;
    // Die Eingabe des Fehlversuchs steht noch im Kästchen; die erste neue Taste beginnt von vorn.
    const nachFehler = fehlerBild !== null;
    raeumeFehlerBild();
    if (nachFehler) eingabe = "";
    eingabe = tippe(eingabe, taste);
    setzeEingabe(eingabe);
    if (loesungGezeigt) markiereNaechste();
  };

  const pruefe = () => {
    if (fertig || E.laeuft || !bereit(eingabe)) return;
    const getippt = eingabe;
    const zahl = Number(getippt);
    eingabe = "";
    raeumeProbe();
    if (zahl === ergebnis) {
      fertig = true;
      abmelden();
      ohneMarkierung();
      // Gemeldet wird sofort (die Zeit der Aufgabe endet mit dem Haken); die Wirkung läuft in der Zeit der Folge.
      melde.geloest(aufgabe.ziel.key);
      seitWitz++;
      const w = witz(seitWitz, d);
      if (w) seitWitz = 0;
      wirkungFertig = wirkungRichtig(d, { witzArt: w });
      if (versuche > 0 || hilfeGezeigt) wirkungFertig.then(() => erzaehler.gleichung(d));
      return;
    }
    // Passt nicht: der Steg zeigt, wo die getippte Zahl liegt (N7, nichts setzt zurück).
    versuche++;
    melde.passtNicht();
    versucht.add(zahl);
    ohneMarkierung();
    const abbruch = { weg: false };
    const lauf = wirkungDaneben(zahl, abbruch);
    fehlerBild = () => {
      abbruch.weg = true;
      ueberspringeAlles();
      void lauf;
      setzeEingabe("");
      zurueckZurAufgabe();
    };
    // Die getippten Ziffern bleiben im Kästchen stehen; die Eingabe beginnt beim nächsten Tippen neu.
    if (loesungGezeigt) lauf.then(markiereNaechste);
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
    fehlerBild = null;
    ohneMarkierung();
  };

  return {
    // Prüfstand: Tasten zu den Zahlen, die ein ratendes Kind hier am ehesten tippt (Ergebnis, Nachbarn, Rechenzeichen verwechselt);
    // eine Zahl, die der Steg eben als „passt nicht“ gezeigt hat, tippt es nicht noch einmal.
    zuege() {
      if (fertig) return [];
      const start = fehlerBild ? "" : eingabe;
      const ziele = kandidaten(d).filter((x) => !versucht.has(x));
      return tastenZu(start, ziele).map(zug).filter(Boolean);
    },
    richtigerZug() {
      if (fertig) return null;
      return zug(naechste(fehlerBild ? "" : eingabe));
    },
    /** Nach der Einführung über „Anleitung“: die Aufgabe liegt wieder da, die Hilfe steht wieder. */
    async zeigeWieder() {
      zeigeSchild(d);
      await legeTeich(d, stufe);
      eingabe = "";
      if (hilfeGezeigt || loesungGezeigt) this.hilfe(loesungGezeigt ? 2 : 1);
    },
    /** @param {1 | 2} hilfeStufe */
    hilfe(hilfeStufe) {
      if (fertig) return;
      raeumeFehlerBild();
      hilfeGezeigt = true;
      if (hilfeStufe === 1) {
        // Probe: das Material liegt, die bekannte Nachbaraufgabe leuchtet; das Kind rechnet selbst.
        zeigeProbe(d);
        return erzaehler.probe(d);
      }
      // Lösung: die Insel taucht auf, die nächste Taste im Sonnenring; das Kind tippt selbst (L12).
      loesungGezeigt = true;
      zeigeInsel();
      markiereNaechste();
      return erzaehler.insel(ergebnis);
    },
  };
}

/** Der Kniff einer Aufgabe (aufgabenarten.js, daten.kniff), für das Bild und den Satz der Hilfe. @param {{ thema: string, op: string, a: number, b: number, c: number }} p */
const kniffVon = (p) => paketKniff(p.thema, p.op, p.a, p.b, p.c);

/** Das Material der Aufgabe liegt vor der Antwort und die bekannte Nachbaraufgabe leuchtet (Hilfe Stufe 1). @param {any} d */
async function zeigeProbe(d) {
  const s = szene;
  if (!s) return;
  const h = hilfeVon(d);
  // Das Material kommt zum Vorschein, ohne dass Kofi läuft (bei Minus bleibt das Tuch noch aus).
  await deckeAuf({ sinken: false });
  if (szene !== s) return;
  if (h.marke !== null) {
    const platz = Math.min(h.marke, PLAETZE);
    zahlSchild(h.marke, X0 + platzX(s.steg, platz) * D, STEG_Y - 0.4, { markiert: true });
  } else if (h.art === "fuenf") {
    pfaehleEl.querySelector('.pfahl[data-k="1"]')?.classList.add("markiert-pfahl");
  } else if (h.art === "tausch") {
    await tauscheStaebe();
  } else if (h.art === "alles" || h.art === "null") {
    if (h.art === "alles") await sinkeTuch();
    else staebeEl[0]?.el.classList.add("markiert");
  }
}

/** Die Stäbe tauschen den Platz (Tauschaufgabe): der kleine springt hinter den großen. */
async function tauscheStaebe() {
  if (staebeEl.length < 2) return;
  const aStaebe = staebeEl.filter((t) => t.gruppe === 0);
  const bStaebe = staebeEl.filter((t) => t.gruppe === 1);
  const neuOrdnung = [...bStaebe, ...aStaebe];
  let x = 0;
  /** @type {Promise<any>[]} */
  const laeufe = [];
  for (const t of neuOrdnung) {
    const alt = t.x;
    t.el.style.left = `${x * D}rem`;
    const laenge = t.el.getBoundingClientRect().width / remPx() / D;
    laeufe.push(anim(t.el, [{ transform: `translateX(${((alt - x) * D).toFixed(2)}rem)` }, { transform: "none" }], { duration: 520, easing: "cubic-bezier(0.3, 1.3, 0.5, 1)" })
      .then(() => t.el.getAnimations().forEach((a) => a.cancel())));
    t.x = x;
    x += laenge + 0.3;
  }
  klang.tock();
  await Promise.all(laeufe);
}

/** Hilfe Stufe 2: die Insel taucht aus dem Nebel auf, der Steg reicht sichtbar bis zu ihr (Zählt nicht als gekonnt). */
async function zeigeInsel() {
  const s = szene;
  if (!s) return;
  await deckeAuf({ sinken: true });
  if (szene !== s) return;
  inselEl.style.visibility = "visible";
  await anim(nebelEl, [{ opacity: 1 }, { opacity: 0.12 }], { duration: 500, easing: "ease-out" });
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

/** Räumt die Bedienung der letzten Aufgabe ab (Kofi und der Teich bleiben stehen, wo sie sind). @type {() => void} */
let aufraeumen = () => {};
function raeumeAuf() {
  ueberspringeAlles();
  aufraeumen();
  aufraeumen = () => {};
}

/** Die Fassung des Spielbilds, die zuletzt gezeigt wurde (material, vorstellung, kopf; null: noch keine). @type {string | null} */
let bildStufe = null;
/**
 * Vor einer Aufgabe: Kofi trabt zum Ufer zurück und der Steg rollt auf (Rückweg). Wechselt die Fassung (Stufe), geschieht es
 * sichtbar in einer kurzen Szene (Regeln §8), erst danach erscheint die Aufgabe. Ein Tipp irgendwo kürzt ab.
 * @param {string} stufe @param {any} d die kommende Aufgabe (für die Szene des Wechsels)
 */
async function bereiteBild(stufe, d) {
  stand.phase = "folge";
  ueberspringeAlles();
  const abmelden = beimTippen(ueberspringeAlles);
  try {
    await rueckweg();
    if (bildStufe !== null && bildStufe !== stufe && d) await wechsleStufe(bildStufe, stufe, d);
  } finally {
    abmelden();
  }
  bildStufe = stufe;
}

// =====================================================================================================
// EINFÜHRUNG im echten Spielbild (docs/spielbau.md §8, Idee §6)
// =====================================================================================================
// In Ruhe, als kleine Geschichte: Kofi will zur Insel im Nebel. Er macht vor (4 + 2: Kofi tippt die 6 und den Haken, der Steg legt sich,
// er rennt sechs Perlen weit und springt), dann tippt das Kind selbst (5 + 1). Danach: was bei einer anderen Zahl passiert, wie
// man korrigiert, was man lernt. Weiter geht es bei den Tasten nur mit dem Tipp des Kindes, nie nach einer Zeit. Die Hilfe sagt
// den Schritt noch einmal. Nicht gebucht.

/** Das Kind tippt die Folge von Tasten, je eine im Sonnenring; andere Tasten tun nichts. Jede Taste ist ein Zug der Einführung. @param {string[]} folge */
async function kindTippt(folge) {
  let eingabe = "";
  try {
    for (const t of folge) {
      tastatur.markiere(t === "fertig" ? null : t);
      fertigKnopf.classList.toggle("markiert", t === "fertig");
      await E.kind(zug(t), eineTaste(t));
      if (t !== "fertig") {
        eingabe = tippe(eingabe, t);
        setzeEingabe(eingabe);
      }
    }
  } finally {
    tastatur.markiere(null);
    fertigKnopf.classList.remove("markiert");
  }
}

/** Wartet, bis das Kind die Taste t tippt (oder den Haken, wenn t „fertig“ ist). @param {string} t */
function eineTaste(t) {
  return new Promise((ok) => {
    const getippt = (/** @type {string} */ z) => {
      if (z !== t) return;
      tastatur.removeEventListener("taste", taste);
      fertigKnopf.removeEventListener("click", fertig);
      ok(undefined);
    };
    const taste = (/** @type {any} */ e) => getippt(e.detail.zeichen);
    const fertig = () => getippt("fertig");
    tastatur.addEventListener("taste", taste);
    fertigKnopf.addEventListener("click", fertig);
  });
}

/** Die Aufgabe als Daten für die Einführung. @param {number} a @param {number} b */
const plusDaten = (a, b) => ({ op: "plus", a, b, c: a + b, kniff: "gemischt" });

/**
 * Spielt die Einführung in der Fassung der ersten Aufgabe (rahmen/einfuehrung-lauf.js: Sätze, Lesezeit ohne Ton, Hilfe,
 * Prüfstand). Mit `r` gilt sie danach als gesehen, und die Rundenzeit beginnt.
 * @param {string} [stufe] @param {{ einfuehrungGesehen(): void, beginneZeit(): void }} [r]
 */
function einfuehrung(stufe = "material", r) {
  const e = einleitung;
  const satz = E.satz;
  return E.spiele(async () => {
    try {
      ueberspringeAlles();
      await rueckweg();
      bildStufe = stufe;
      // Die Geschichte: Kofi will zur Insel.
      const vier = plusDaten(4, 2);
      zeigeSchild(vier);
      await legeTeich(vier, stufe);
      await satz(e.insel);
      schildEl.classList.add("markiert");
      await satz(e.schild);
      schildEl.classList.remove("markiert");
      // Kofi macht vor: tippt die Sechs und den Haken.
      tastatur.markiere("6");
      setzeEingabe("6");
      await satz(e.tippt);
      tastatur.markiere(null);
      fertigKnopf.classList.add("markiert");
      await satz(e.haken);
      fertigKnopf.classList.remove("markiert");
      const lauf = wirkungRichtig(vier, { freude: false });
      await satz(e.perlen);
      await satz(e.rennt);
      await lauf;
      // Jetzt das Kind: fünf plus eins.
      await rueckweg();
      const fuenf = plusDaten(5, 1);
      zeigeSchild(fuenf);
      await legeTeich(fuenf, stufe);
      const sechs = kindTippt(["6"]);
      // Die Hilfe gilt schon während der Sätze des Schritts, bis das Kind getippt hat.
      E.hilfe(() => satz(e.dujetzt), { bis: sechs });
      await satz(e.dujetzt);
      await sechs;
      const haken = kindTippt(["fertig"]);
      E.hilfe(() => satz(e.dujetzt), { bis: haken });
      await haken;
      await wirkungRichtig(fuenf, { freude: false });
      // Was bei einer anderen Zahl passiert, wie man korrigiert, was man lernt.
      await satz(e.bremst);
      await satz(e.nochmal);
      tastatur.markiere("loeschen");
      await satz(e.pfeil);
      tastatur.markiere(null);
      await satz(e.lernen);
      // Übergang zur ersten Aufgabe.
      await satz(e.los);
    } finally {
      ueberspringeAlles();
      tastatur.markiere(null);
      fertigKnopf.classList.remove("markiert");
      schildEl.classList.remove("markiert");
      await rueckweg();
      setzeEingabe("");
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
/** ?aufgaben=<Schlüssel,Schlüssel> nur im Testbetrieb: genau diese Aufgaben nacheinander (Vorschau, schreibt nicht). */
const PRUEF_AUFGABEN = testbetrieb() && params.get("aufgaben") ? String(params.get("aufgaben")).split(",") : null;
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
// Der Mach-mit-Satz (L13) steht als Sachmoment in der Pause; sonst nur „Weiter“ und „Alle Spiele“. Der Satz der Spielzeit bleibt.
/** @param {{ zeit?: { schluss: boolean, satz: string | null } }} [optionen] */
async function zeigePause({ zeit = { schluss: false, satz: null } } = {}) {
  fuelleSachmoment($("sachmoment"), leiste.ton && !zeit.satz);
  if (zeit.satz && leiste.ton) sage(zeit.satz);
  stand.phase = "pause";
  weiterOrt = ORTE.weiter;
  await pause.zeige({ ...zeit, echteDinge: null }); // „Alle Spiele“ navigiert selbst (speichert vorher), „Weiter“ löst auf
  stand.phase = "laden";
}

/**
 * Ein Thema ist gekonnt: statt der Pause der Bildschirm „Gekonnt“, Kofi feiert mit dem Kind.
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
    themaId: plan?.id ?? null,
    /** Sprechname des Themas (aufgenommen über lernplan.json). */
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
  const keys = [...(PRUEF_AUFGABEN ?? VORSCHAU.aufgaben)];
  return {
    thema: VORSCHAU.thema,
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
/** Thema der letzten Runde (für den Satz am Rundenanfang). */
let letztesThema = /** @type {string | null} */ (null);

// „Anleitung“: die Einführung im Spielbild jederzeit wieder (während einer Aufgabe); danach steht die Aufgabe wieder da.
$("anleitung")?.addEventListener("click", async () => {
  if (stand.phase !== "aufgabe" || E.laeuft) return;
  const merke = { aufgabe: offeneAufgabe, stufe: bildStufe ?? "material" };
  await einfuehrung(stand.lernstufe === "kopf" ? "kopf" : "material");
  bildStufe = stand.lernstufe ?? merke.stufe;
  await merke.aufgabe?.zeigeWieder();
  stand.phase = "aufgabe";
});

/** @param {boolean} vorschau */
async function spieleRunde(vorschau) {
  /** @type {any} */
  let r;
  try {
    r = PRUEF_AUFGABEN ? vorschauRunde() : await starteRunde(vorschau);
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
  const stufeJetzt = aufgabe?.stufe === "kopf" ? "kopf" : "material";

  // Das Spiel beginnt mit der Einführung im echten Spielbild (bei jedem Start; in der Vorschau nur mit ?einfuehrung).
  if (!einfuehrungGespielt && aufgabe && (!vorschau || params.has("einfuehrung"))) {
    einfuehrungGespielt = true;
    await einfuehrung(stufeJetzt, r);
  } else if (aufgabe) {
    // Später: hat sich das Thema geändert, sagt die Stimme es (ein Satz).
    if (r.themaId && letztesThema && r.themaId !== letztesThema && r.sprich) await E.satz((o) => spricht(() => blase.sage(r.sprich, o)));
  }
  if (r.themaId) letztesThema = r.themaId;
  $("anleitung")?.removeAttribute("hidden");

  while (aufgabe) {
    raeumeAuf();
    const p = paketAus(aufgabe.ziel.key);
    if (p) {
      leiste.setAttribute("thema", themaName(aufgabe.ziel.thema) ?? r.thema);
      await bereiteBild(aufgabe.stufe ?? "material", { ...p, kniff: kniffVon(p) });
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
  const vorschau = ["pause", "hinweis", "eltern", "einfuehrung", "gekonnt"].some((p) => params.has(p)) || PRUEF_STUFE !== null || PRUEF_AUFGABEN !== null || !c || nichtEingetragen;
  stand.vorschau = vorschau;
  if (!(await starteSpielzeit({ zaehlen: !vorschau }))) return;
  await new Promise((ok) => requestAnimationFrame(() => ok(undefined)));
  stelleKofi(UFER_X);
  // ?gekonnt: der Bildschirm „Gekonnt“ mit einem Beispielthema (Vorschau)
  if (params.has("gekonnt")) await zeigeGekonnt({ name: "Plus und Minus bis 10", sprich: "Plus gemischt" });
  if (params.has("pause") || params.has("hinweis")) await zeigePause();
  await spieleRunde(vorschau);
}

start().catch((e) => {
  protokoll(`${SPIEL_ID}: ${/** @type {any} */ (e)?.message ?? e}`);
  stand.phase = "fehler";
  erzaehler.gehtNicht();
});
