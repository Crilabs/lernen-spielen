// Welche Tasten die Bildschirm-Tastatur zeigt und wie sie sich auf Reihen verteilen (ohne DOM).

const ZIFFERN = "1234567890";

/** Gruppe: 0 Buchstaben, 1 Ziffern, 2 alles andere (Satzzeichen).
 * @param {string} z
 * @returns {number} */
function gruppe(z) {
  if (ZIFFERN.includes(z)) return 1;
  return z.toLowerCase() !== z.toUpperCase() ? 0 : 2;
}

/**
 * @param {string} a
 * @param {string} b
 * @returns {number}
 */
function vergleiche(a, b) {
  const ga = gruppe(a);
  const gb = gruppe(b);
  if (ga !== gb) return ga - gb;
  if (ga === 1) return ZIFFERN.indexOf(a) - ZIFFERN.indexOf(b);
  if (ga === 2) return a.localeCompare(b, "de");
  const grund = a.localeCompare(b, "de", { sensitivity: "base" });
  if (grund !== 0) return grund;
  const aGross = a === a.toUpperCase();
  const bGross = b === b.toUpperCase();
  if (aGross !== bGross) return aGross ? -1 : 1; // Groß vor Klein
  return a.localeCompare(b, "de");
}

/**
 * Die Tasten für eine Aufgabe: jedes Zeichen genau einmal, ohne Leerzeichen. Buchstaben deutsch sortiert
 * (Groß vor Klein), dann Ziffern 1–9 und 0, dann Satzzeichen.
 * @param {string} zeichen
 * @returns {string[]}
 */
export function tastenFuer(zeichen) {
  return [...new Set([...String(zeichen ?? "")].filter((z) => !/\s/.test(z)))].sort(vergleiche);
}

/**
 * Verteilt Tasten in Reihen zu höchstens `maxJeReihe` Tasten.
 * @param {string[]} tasten
 * @param {number} [maxJeReihe]
 * @returns {string[][]}
 */
export function reihen(tasten, maxJeReihe = 10) {
  const r = [];
  for (let i = 0; i < tasten.length; i += maxJeReihe) r.push(tasten.slice(i, i + maxJeReihe));
  return r;
}
