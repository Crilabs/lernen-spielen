// Vorlesen: die eine Stimme für alle Spiele. Einzige Stelle mit speechSynthesis und Audio.
// Hauptweg sind vorab erzeugte Audiodateien (spiele/audio/index.json, erzeugt mit werkzeuge/audio/).
// Fehlt zu einem Text die Datei, spricht die Systemstimme.
// Die Systemstimme spricht nie Zahlen: Text mit Ziffer bleibt still (sie spräche sie falsch oder verriete
// Lösungen). Ob eine Datei Zahlen enthalten darf, entscheidet das Sammel-Werkzeug, nicht dieses Modul.
// Die feste Wahl der Systemstimme liegt als Geräte-Einstellung "stimme": "" = automatisch (beste Stimme),
// "system" = keine Stimme vorgeben (das System wählt), sonst stimmSchluessel der Stimme.

import { audioSchluessel } from "./audio.js";
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

// ---------------------------------------------------------------- Audiodateien

const AUDIO_BASIS = new URL("../audio/", import.meta.url);

/** @type {Promise<Map<string, string>> | null} Schlüssel → URL der Datei */
let audioIndex = null;
/** Texte ohne Datei, schon einmal protokolliert. */
const ohneDatei = new Set();

/** @returns {boolean} */
function kannAudio() {
  const g = /** @type {any} */ (globalThis);
  return typeof g.Audio === "function" && typeof g.fetch === "function";
}

/**
 * Lädt einmal das Verzeichnis der erzeugten Dateien. Fehlt es, bleibt es leer (Systemstimme).
 * @returns {Promise<Map<string, string>>}
 */
function ladeAudioIndex() {
  if (!audioIndex) {
    audioIndex = !kannAudio()
      ? Promise.resolve(new Map())
      : globalThis
          .fetch(new URL("index.json", AUDIO_BASIS))
          .then((r) => (r.ok ? r.json() : Promise.reject(new Error("HTTP " + r.status))))
          .then((d) => {
            /** @type {Record<string, { datei: string }>} */
            const texte = d?.texte ?? {};
            return new Map(
              Object.entries(texte).map(([k, v]) => [k, new URL(v.datei, AUDIO_BASIS).href]),
            );
          })
          .catch((e) => {
            protokoll("Audio-Verzeichnis nicht geladen: " + e);
            return new Map();
          });
  }
  return audioIndex;
}

/** @type {HTMLAudioElement | null} */
let audioLaeuft = null;

let nummer = 0;
/** @type {((e: SprichErgebnis | "fehler") => void) | null} */
let laufend = null;

/** Bricht laufende Sprache ab. */
function brichAb() {
  nummer += 1;
  // Erst anhalten, dann melden: fertig() vergisst die laufende Datei.
  try {
    audioLaeuft?.pause();
  } catch {
    // nichts zu stoppen
  }
  audioLaeuft = null;
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
 * Spielt eine Audiodatei ab. "fehler": nicht abspielbar, dann darf die Systemstimme einspringen.
 * @param {string} url
 * @returns {Promise<SprichErgebnis | "fehler">}
 */
function spieleDatei(url) {
  return new Promise((resolve) => {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let notbremse;
    /** @type {HTMLAudioElement | null} */
    let a = null;
    /** @param {SprichErgebnis | "fehler"} e */
    const fertig = (e) => {
      if (laufend !== fertig && e !== "abgebrochen") return;
      if (laufend === fertig) laufend = null;
      if (audioLaeuft === a) audioLaeuft = null;
      clearTimeout(notbremse);
      resolve(e);
    };
    /** @param {unknown} grund */
    const kaputt = (grund) => {
      if (laufend !== fertig) return;
      protokoll("Audiodatei nicht abspielbar (" + grund + "): " + url);
      fertig("fehler");
    };
    laufend = fertig;
    try {
      a = new Audio(url);
      audioLaeuft = a;
      a.onended = () => fertig("gesprochen");
      a.onerror = () => kaputt(a?.error?.code ?? "Fehler");
      // Notbremse, falls das Ende nie gemeldet wird: Dauer der Datei plus Luft, vorher 30 s.
      notbremse = setTimeout(() => fertig("gesprochen"), 30000);
      a.onloadedmetadata = () => {
        const d = a?.duration;
        if (laufend !== fertig || !Number.isFinite(d)) return;
        clearTimeout(notbremse);
        notbremse = setTimeout(() => fertig("gesprochen"), /** @type {number} */ (d) * 1000 + 2000);
      };
      Promise.resolve(a.play()).catch(kaputt);
    } catch (e) {
      kaputt(e);
    }
  });
}

/**
 * Liest einen Text vor: aus der erzeugten Datei, sonst mit der Systemstimme.
 * Löst auf, wenn die Stimme fertig ist, spätestens nach der Notbremse.
 * @param {string} text
 * @param {{ tempo?: number, hoehe?: number, variante?: string }} [optionen]
 *   tempo und hoehe gelten nur für die Systemstimme; variante (z. B. "diktat") wählt eine eigene Datei.
 * @returns {Promise<SprichErgebnis>}
 */
export async function sprich(text, { tempo = 0.85, hoehe = 1, variante = "" } = {}) {
  brichAb();   // auch ein stiller Aufruf beendet, was gerade gesprochen wird
  if (!text) return "still";
  const meine = nummer;
  const index = await ladeAudioIndex();
  if (meine !== nummer) return "abgebrochen";
  const schluessel = audioSchluessel(text, variante);
  const datei = index.get(schluessel);
  if (datei) {
    const e = await spieleDatei(datei);
    if (e !== "fehler") return e;
    if (meine !== nummer) return "abgebrochen";
  } else if (index.size && !ohneDatei.has(schluessel)) {
    ohneDatei.add(schluessel);
    protokoll("Keine Audiodatei: " + schluessel);
  }
  return sprichSystem(text, tempo, hoehe, meine);
}

/**
 * Systemstimme (Web-Sprache), Rückfall ohne Audiodatei.
 * @param {string} text
 * @param {number} tempo
 * @param {number} hoehe
 * @param {number} meine Nummer des Aufrufs; ist sie veraltet, wurde abgebrochen
 * @returns {Promise<SprichErgebnis>}
 */
async function sprichSystem(text, tempo, hoehe, meine) {
  const s = synth();
  if (!s) return "still";
  if (/\d/.test(text)) {
    protokoll("Zahl nicht gesprochen: " + text);
    return "still";
  }
  beobachte();
  await bereit();
  if (meine !== nummer) return "abgebrochen";

  return new Promise((resolve) => {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let notbremse;
    /** @param {SprichErgebnis | "fehler"} e */
    const fertig = (e) => {
      if (laufend !== fertig && e !== "abgebrochen") return;
      if (laufend === fertig) laufend = null;
      clearTimeout(notbremse);
      resolve(e === "fehler" ? "still" : e);
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
