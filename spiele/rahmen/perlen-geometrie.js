// Geometrie der Perlenstäbchen ohne DOM (in Node testbar: tests/rahmen-perlen.test.mjs).
// Maßeinheit ist der Durchmesser einer Perle (1). Gezeichnet wird in ls-perlenstab (perlenstab.js).
//
// Jede Perle hat ein Feld der Breite SCHRITT, die Perle steht mittig darin; zwischen zwei Perlen bleibt so
// ein schmaler Spalt (jede Perle einzeln sichtbar, M2). Nach der fünften Perle kommt die LUECKE dazu, in
// ihrer Mitte steht die Marke. Die Länge ist proportional zur Zahl:
//   laenge(n) = n · SCHRITT (+ LUECKE ab 6),  also laenge(10) = 2 · laenge(5) + LUECKE.
// Die Höhe ist für alle Werte gleich (Perle plus Überstand der Marke oben und unten), damit Stäbchen mit
// derselben Host-Höhe gleich große Perlen haben.
//
// Ungültige Werte (keine ganze Zahl von 1 bis 10) werden abgewiesen, nicht auf 1 oder 10 gesetzt: ein
// Lernzeichen mit einer anderen Menge als gemeint wäre schlimmer als keins. wertAus gibt dann null.

/** Abstand der Perlenmitten (Perle 1 plus Spalt). */
export const SCHRITT = 1.12;
/** Zusätzlicher Abstand nach der fünften Perle. */
export const LUECKE = 0.6;
/** So weit ragt die Marke über und unter die Perlen. */
export const UEBERSTAND = 0.2;
/** Dicke des Drahts hinter den Perlen. */
export const DRAHT = 0.2;
/** Höhe jedes Stäbchens. */
export const HOEHE = 1 + 2 * UEBERSTAND;
/** Größter Wert (Zehnerstab). */
export const MAX = 10;

/**
 * Wert aus einem Attribut oder einer Zahl: ganze Zahl 1 bis 10, sonst null.
 * @param {unknown} roh
 * @returns {number | null}
 */
export function wertAus(roh) {
  const text = typeof roh === "number" ? String(roh) : typeof roh === "string" ? roh.trim() : "";
  if (!/^\d{1,2}$/.test(text)) return null;
  const n = Number(text);
  return n >= 1 && n <= MAX ? n : null;
}

/**
 * Länge eines Stäbchens mit n Perlen.
 * @param {number} n
 * @returns {number}
 */
export function laenge(n) {
  return n * SCHRITT + (n > 5 ? LUECKE : 0);
}

/**
 * @typedef {{ wert: number, laenge: number, hoehe: number, mitte: number, perlen: number[], marke: number | null }} Stab
 * perlen: Lage der Perlenmitten entlang des Stäbchens (von 0 bis laenge); mitte: Lage der Perlenmitten quer
 * dazu; marke: Lage der Fünfermarke (Mitte der Lücke) oder null bis 5.
 */

/**
 * Geometrie eines Stäbchens.
 * @param {unknown} wert ganze Zahl 1 bis 10 (auch als Text)
 * @returns {Stab | null} null bei ungültigem Wert
 */
export function perlenstab(wert) {
  const n = wertAus(wert);
  if (n === null) return null;
  const perlen = Array.from({ length: n }, (_, i) => (i + 0.5) * SCHRITT + (i >= 5 ? LUECKE : 0));
  return {
    wert: n,
    laenge: laenge(n),
    hoehe: HOEHE,
    mitte: HOEHE / 2,
    perlen,
    marke: n > 5 ? 5 * SCHRITT + LUECKE / 2 : null,
  };
}
