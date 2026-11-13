// Fehlerprotokoll: die letzten Einträge im lokalen Speicher.

import { lokalerSpeicher } from "./dienste.js";

const PROTOKOLL_MAX = 30;

/** @returns {string[]} */
export function protokollLesen() {
  try {
    const v = JSON.parse(lokalerSpeicher()?.getItem("protokoll") ?? "[]");
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

/**
 * @param {string} text
 * @returns {void}
 */
export function protokoll(text) {
  try {
    const eintraege = protokollLesen();
    eintraege.push(`${new Date().toISOString()} ${text}`);
    lokalerSpeicher()?.setItem("protokoll", JSON.stringify(eintraege.slice(-PROTOKOLL_MAX)));
  } catch {
    // Protokollieren darf nie selbst einen Fehler auslösen.
  }
}
