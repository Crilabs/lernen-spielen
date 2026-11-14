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

/**
 * @param {string} name
 * @returns {void}
 */
export function vergissGesagt(name) {
  imSpeicher.delete(name);
  const liste = lies();
  if (!liste || !liste.includes(name)) return;
  try {
    sitzungsSpeicher()?.setItem(SCHLUESSEL, JSON.stringify(liste.filter((n) => n !== name)));
  } catch {
    // Speicher gesperrt: der Merker im Speicher ist schon zurückgenommen.
  }
}

/**
 * Name beim ersten Tippen (docs/bedienung.md 6): spricht `name` einmal je Sitzung. Er gilt als gesagt, sobald
 * er beginnt (ein zweites Tippen wiederholt ihn nicht, ein Link darf sofort navigieren), aber nur, wenn ihn
 * nichts abbricht: Bricht anderer Inhalt ihn ab (sprich liefert "abgebrochen", z. B. die Probe der Hilfe),
 * hat der Inhalt Vorrang, und der Name kommt bei einem späteren Tippen.
 * Ob der Ton an ist, prüft der Aufrufer vorher.
 * @param {string} name
 * @param {(text: string) => Promise<string>} sprich
 * @returns {Promise<string | null>} Ergebnis von sprich; null, wenn nichts zu sagen war
 */
export async function sageEinmal(name, sprich) {
  if (!name || schonGesagt(name)) return null;
  merkeGesagt(name);
  const ergebnis = await sprich(name);
  if (ergebnis === "abgebrochen") vergissGesagt(name);
  return ergebnis;
}
