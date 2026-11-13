// Vorlesen: die eine Stimme für alle Spiele. Einzige Stelle mit speechSynthesis.
// Zahlen werden nie gesprochen: Text mit Ziffer bleibt still (die Stimme spräche sie falsch oder verriete Lösungen).
// Die feste Wahl liegt als Geräte-Einstellung "stimme": "" = automatisch (beste Stimme),
// "system" = keine Stimme vorgeben (das System wählt), sonst stimmSchluessel der Stimme.

import { einstellung, ladeEinstellungen, setzeEinstellung } from "./einstellungen.js";
import { protokoll } from "./protokoll.js";

/** @typedef {{ name: string, voiceURI: string, lang: string }} Stimme */
/** @typedef {"gesprochen" | "still" | "abgebrochen"} SprichErgebnis */

// Eloquence- und Spaßstimmen von Apple (Eddy, Flo, Grandma, Reed, Sandy, Shelley, Zarvox …) klingen nach
// 90er-Synthesizer und fallen raus.
const SCHLECHT =
  /eddy|flo\b|grandma|grandpa|oma|opa|reed|rocko|sandy|shelley|eloquence|albert|bad news|bahh|bells|boing|bubbles|cellos|good news|jester|organ|superstar|trinoids|whisper|wobble|zarvox|fred|junior|kathy|ralph|novelty/i;

/**
 * Güte einer Stimme: Premium > Erweitert > kompakt; -1 für alte und Spaßstimmen.
 * @param {Stimme} v
 * @returns {number}
 */
export function stimmWert(v) {
  const n = v.name + " " + v.voiceURI;
  if (SCHLECHT.test(n)) return -1;
  let w = 0;
  if (/premium/i.test(n)) w += 40;
  else if (/enhanced|erweitert|verbessert|natural|neural/i.test(n)) w += 25;
  if (/google/i.test(n)) w += 15;
  if (/de[-_]DE/i.test(v.lang)) w += 5;
  if (/anna|helena|petra|marlene|katja|martin|markus|yannick|viktor/i.test(n)) w += 3;
  return w;
}

/**
 * Position + Name + Kennung: Safari meldet z. B. zwei „Anna“ (kompakt und Premium) mit gleicher Kennung.
 * @param {Stimme} v
 * @param {number} i
 * @returns {string}
 */
export function stimmSchluessel(v, i) {
  return i + "|" + v.name + "|" + v.voiceURI;
}

/**
 * @template {Stimme} T
 * @param {T[]} stimmen deutsche Stimmen in der Reihenfolge des Systems
 * @param {string} fest gespeicherte Wahl ("", "system" oder Schlüssel)
 * @returns {T | null} null = keine Stimme vorgeben
 */
export function waehleStimme(stimmen, fest) {
  if (fest === "system") return null;
  const i = stimmen.findIndex((v, k) => stimmSchluessel(v, k) === fest);
  if (i >= 0) return stimmen[i];
  return (
    stimmen
      .filter((v) => stimmWert(v) >= 0)
      .sort((a, b) => stimmWert(b) - stimmWert(a))[0] ?? null
  );
}

// ---------------------------------------------------------------- Web-Sprache

/** @returns {SpeechSynthesis | null} */
function synth() {
  const g = /** @type {any} */ (globalThis);
  return g.speechSynthesis && typeof g.SpeechSynthesisUtterance === "function" ? g.speechSynthesis : null;
}

/** @returns {SpeechSynthesisVoice[]} */
function deutscheStimmen() {
  try {
    return (synth()?.getVoices() ?? []).filter((v) => /^de/i.test(v.lang));
  } catch {
    return [];
  }
}

/** @type {Promise<void> | null} */
let geladen = null;
let istGeladen = false;
/** In dieser Seite gesetzte Wahl, gilt sofort (auch bevor die Einstellungen geladen sind). */
/** @type {string | null} */
let gesetzt = null;

/** @returns {Promise<void>} */
function bereit() {
  if (!geladen) {
    geladen = ladeEinstellungen()
      .catch((e) => protokoll("Stimme: Einstellungen nicht geladen: " + e))
      .then(() => {
        istGeladen = true;
        if (gesetzt !== null) setzeEinstellung("stimme", gesetzt);
      });
  }
  return geladen;
}

/** @returns {string} */
function wahl() {
  return gesetzt ?? String(einstellung("stimme", "") ?? "");
}

let beobachtet = false;
/** Meldet geänderte Stimmenlisten als Ereignis "stimmen" am window. */
function beobachte() {
  const s = synth();
  if (beobachtet || !s) return;
  beobachtet = true;
  try {
    s.addEventListener?.("voiceschanged", melde);
  } catch {
    // ohne Ereignis bleibt die Liste, wie sie beim ersten Aufruf war
  }
}

function melde() {
  try {
    /** @type {any} */ (globalThis).window?.dispatchEvent(new Event("stimmen"));
  } catch {
    // ohne window kein Ereignis
  }
}

let nummer = 0;
/** @type {((e: SprichErgebnis) => void) | null} */
let laufend = null;

/** Bricht laufende Sprache ab. */
function brichAb() {
  nummer += 1;
  const l = laufend;
  laufend = null;
  l?.("abgebrochen");
  try {
    synth()?.cancel();
  } catch {
    // nichts zu stoppen
  }
}

/**
 * Liest einen Text vor. Löst auf, wenn die Stimme fertig ist, spätestens nach der Notbremse.
 * @param {string} text
 * @param {{ tempo?: number, hoehe?: number }} [optionen]
 * @returns {Promise<SprichErgebnis>}
 */
export async function sprich(text, { tempo = 0.85, hoehe = 1 } = {}) {
  const s = synth();
  if (!s) return "still";
  brichAb();   // auch ein stiller Aufruf beendet, was gerade gesprochen wird
  if (!text) return "still";
  if (/\d/.test(text)) {
    protokoll("Zahl nicht gesprochen: " + text);
    return "still";
  }
  beobachte();
  const meine = nummer;
  await bereit();
  if (meine !== nummer) return "abgebrochen";

  return new Promise((resolve) => {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let notbremse;
    /** @param {SprichErgebnis} e */
    const fertig = (e) => {
      if (laufend !== fertig && e !== "abgebrochen") return;
      if (laufend === fertig) laufend = null;
      clearTimeout(notbremse);
      resolve(e);
    };
    laufend = fertig;
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "de-DE";
      u.rate = tempo;
      u.pitch = hoehe;
      const v = waehleStimme(deutscheStimmen(), wahl());
      if (v) u.voice = v;
      u.onend = () => fertig("gesprochen");
      u.onerror = (ev) => {
        if (ev?.error === "interrupted" || ev?.error === "canceled") return fertig("abgebrochen");
        protokoll("Vorlesen fehlgeschlagen: " + (ev?.error ?? ev));
        fertig("still");
      };
      // Notbremse, falls die Stimme nie „fertig“ meldet
      notbremse = setTimeout(() => fertig("gesprochen"), 8000 + 150 * text.length);
      s.speak(u);
    } catch (e) {
      protokoll("Vorlesen fehlgeschlagen: " + e);
      fertig("still");
    }
  });
}

/** Bricht laufende Sprache ab; ein wartendes sprich löst mit "abgebrochen" auf. */
export function stille() {
  brichAb();
}

/**
 * Deutsche Stimmen ohne alte und Spaßstimmen, mit der gerade gewählten markiert.
 * Bei "system" ist keine gewählt.
 * @returns {{ schluessel: string, name: string, gewaehlt: boolean }[]}
 */
export function stimmen() {
  beobachte();
  if (!istGeladen) bereit().then(melde);
  const alle = deutscheStimmen();
  const aktiv = waehleStimme(alle, wahl());
  return alle
    .map((v, i) => ({ v, schluessel: stimmSchluessel(v, i) }))
    .filter(({ v }) => stimmWert(v) >= 0)
    .map(({ v, schluessel }) => ({ schluessel, name: v.name, gewaehlt: v === aktiv }));
}

/**
 * Die gespeicherte Wahl: "" (automatisch), "system" oder ein Schlüssel aus stimmen().
 * @returns {string}
 */
export function stimmWahl() {
  return wahl();
}

/**
 * Speichert die Wahl am Gerät: Schlüssel aus stimmen(), "system" oder "" (automatisch).
 * @param {string} schluessel
 * @returns {void}
 */
export function setzeStimme(schluessel) {
  gesetzt = schluessel;
  if (istGeladen) setzeEinstellung("stimme", schluessel);
  else bereit();
  melde();
}
