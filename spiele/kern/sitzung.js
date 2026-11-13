// Sitzungsmerker: was in dieser Sitzung (seit App-Start) schon gesagt wurde.
// Liegt in sessionStorage, mit Rückfall auf den Speicher, wenn es fehlt.

const SCHLUESSEL = "ls-gesagt";

/** @type {Set<string>} */
const imSpeicher = new Set();

/** @returns {Storage | null} */
function sitzungsSpeicher() {
  try {
    return globalThis.sessionStorage ?? null;
  } catch {
    return null;
  }
}

/** @returns {string[] | null} null, wenn kein sessionStorage nutzbar ist */
function lies() {
  const s = sitzungsSpeicher();
  if (!s) return null;
  try {
    const liste = JSON.parse(s.getItem(SCHLUESSEL) ?? "[]");
    return Array.isArray(liste) ? liste : [];
  } catch {
    return null;
  }
}

/**
 * @param {string} name
 * @returns {boolean}
 */
export function schonGesagt(name) {
  if (imSpeicher.has(name)) return true;
  return lies()?.includes(name) ?? false;
}

/**
 * @param {string} name
 * @returns {void}
 */
export function merkeGesagt(name) {
  imSpeicher.add(name);
  const liste = lies();
  if (!liste) return;
  if (!liste.includes(name)) liste.push(name);
  try {
    sitzungsSpeicher()?.setItem(SCHLUESSEL, JSON.stringify(liste));
  } catch {
    // Speicher voll oder gesperrt: der Merker im Speicher genügt.
  }
}
