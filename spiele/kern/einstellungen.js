// Einstellungen: Ton je Spiel ("ton.<spielId>", am Profil), Stimme je Gerät ("stimme").
// Alte localStorage-Werte werden bewusst nicht übernommen.

import { lade, speichere } from "./speicher.js";

/** Namen, die am Gerät statt am Profil liegen. */
const GERAETS_NAMEN = new Set(["stimme"]);

/** @type {Record<string, any>} */
let profil = {};
/** @type {Record<string, any>} */
let geraet = {};

/**
 * @param {string} name
 * @returns {boolean}
 */
const amGeraet = (name) => GERAETS_NAMEN.has(name);

/** @type {Promise<void> | null} */
let geladen = null;

/**
 * Lädt die Einstellungen aus dem Speicher (einmal je Seite; weitere Aufrufe teilen sich das Ergebnis).
 * @returns {Promise<void>}
 */
export function ladeEinstellungen() {
  geladen ??= Promise.all([lade("einstellungen", {}), lade("geraet", {})]).then(([p, g]) => {
    profil = p;
    geraet = g;
  });
  return geladen;
}

/**
 * @param {string} name
 * @param {any} standard
 * @returns {any}
 */
export function einstellung(name, standard) {
  const wert = (amGeraet(name) ? geraet : profil)[name];
  return wert === undefined ? standard : wert;
}

/**
 * @param {string} name
 * @param {any} wert
 * @returns {void}
 */
export function setzeEinstellung(name, wert) {
  if (amGeraet(name)) {
    geraet[name] = wert;
    speichere("geraet", geraet);
  } else {
    profil[name] = wert;
    speichere("einstellungen", profil);
  }
}
