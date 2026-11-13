// Lernstand speichern: in der App als Datei je Profil, im Browser im localStorage.
// Geräte-Schlüssel (GERAET) gehören keinem Profil.

import { befehl, istApp, lokalerSpeicher } from "./dienste.js";
import { protokoll } from "./protokoll.js";

const VERZOEGERUNG_MS = 300;

/** Das (vorerst einzige) Profil. */
export const PROFIL = "kind-1";

/** Schlüssel, die zum Gerät gehören statt zu einem Profil. */
export const GERAET = new Set(["eltern", "geraet"]);

/**
 * @param {string} schluessel
 * @returns {string | null}
 */
function profilVon(schluessel) {
  return GERAET.has(schluessel) ? null : PROFIL;
}

/**
 * @param {string} schluessel
 * @returns {string}
 */
function browserSchluessel(schluessel) {
  const profil = profilVon(schluessel);
  return profil ? `lernstand-${profil}-${schluessel}` : `lernstand-${schluessel}`;
}

/**
 * @param {unknown} e
 * @returns {unknown}
 */
function meldung(e) {
  return /** @type {any} */ (e)?.message ?? e;
}

// Schlüssel, deren Lernstand in der App nicht gelesen werden konnte. Für sie wird
// nichts gespeichert, damit der Standard nicht den echten Lernstand überschreibt.
/** @type {Set<string>} */
const gesperrt = new Set();

/**
 * Lädt den Lernstand und mischt ihn über eine tiefe Kopie des Standards.
 * @template {object} T
 * @param {string} schluessel
 * @param {T} standard
 * @returns {Promise<T>}
 */
export async function lade(schluessel, standard) {
  const kopie = () => structuredClone(standard);
  let roh;
  try {
    if (istApp()) {
      roh = await befehl("lernstand_lesen", { profil: profilVon(schluessel), spiel: schluessel });
    } else {
      roh = lokalerSpeicher()?.getItem(browserSchluessel(schluessel));
    }
  } catch (e) {
    if (istApp() && !gesperrt.has(schluessel)) {
      gesperrt.add(schluessel);
      protokoll(`lade ${schluessel}: ${meldung(e)} – Speichern für dieses Spiel gesperrt`);
    } else if (!istApp()) {
      protokoll(`lade ${schluessel}: ${meldung(e)}`);
    }
    return kopie();
  }
  gesperrt.delete(schluessel);
  try {
    if (roh == null) return kopie();
    const daten = JSON.parse(roh);
    if (daten === null || typeof daten !== "object" || Array.isArray(daten)) return kopie();
    return { ...kopie(), ...daten };
  } catch (e) {
    protokoll(`lade ${schluessel}: ${meldung(e)}`);
    return kopie();
  }
}

/** @type {Map<string, { daten: unknown, timer: ReturnType<typeof setTimeout> }>} */
const ausstehend = new Map();
/** @type {Map<string, Promise<void>>} Promise des letzten Schreibvorgangs je Schlüssel */
const ketten = new Map();

/**
 * @param {string} schluessel
 * @param {string} json
 * @returns {Promise<void>}
 */
async function schreibeJetzt(schluessel, json) {
  try {
    if (istApp()) {
      await befehl("lernstand_schreiben", { profil: profilVon(schluessel), spiel: schluessel, daten: json });
    } else {
      lokalerSpeicher()?.setItem(browserSchluessel(schluessel), json);
    }
  } catch (e) {
    protokoll(`speichern ${schluessel}: ${meldung(e)}`);
  }
}

// Schreibvorgänge je Schlüssel nacheinander, damit ein älterer Stand nie einen neueren überholt.
/**
 * @param {string} schluessel
 * @param {unknown} daten
 * @returns {Promise<void>}
 */
function schreibe(schluessel, daten) {
  if (gesperrt.has(schluessel)) return Promise.resolve();
  const json = JSON.stringify(daten);
  const vorher = ketten.get(schluessel);
  const jetzt = vorher ? vorher.then(() => schreibeJetzt(schluessel, json)) : schreibeJetzt(schluessel, json);
  ketten.set(schluessel, jetzt);
  jetzt.then(() => { if (ketten.get(schluessel) === jetzt) ketten.delete(schluessel); });
  return jetzt;
}

/**
 * @param {string} schluessel
 * @returns {Promise<void>}
 */
function ausfuehren(schluessel) {
  const eintrag = ausstehend.get(schluessel);
  if (!eintrag) return Promise.resolve();
  clearTimeout(eintrag.timer);
  ausstehend.delete(schluessel);
  return schreibe(schluessel, eintrag.daten);
}

/**
 * Merkt den Lernstand vor; geschrieben wird nach kurzer Verzögerung.
 * @param {string} schluessel
 * @param {unknown} daten
 * @returns {void}
 */
export function speichere(schluessel, daten) {
  if (gesperrt.has(schluessel)) return;
  const alt = ausstehend.get(schluessel);
  if (alt) clearTimeout(alt.timer);
  const timer = setTimeout(() => ausfuehren(schluessel), VERZOEGERUNG_MS);
  ausstehend.set(schluessel, { daten, timer });
}

/**
 * Schreibt alles Ausstehende sofort und wartet auf laufende Schreibvorgänge.
 * @returns {Promise<void>}
 */
export async function sofortSpeichern() {
  await Promise.all([...ausstehend.keys()].map(ausfuehren));
  await Promise.all([...ketten.values()]);
}

/** @returns {boolean} */
export function hatUngespeichertes() {
  return ausstehend.size > 0 || ketten.size > 0;
}
