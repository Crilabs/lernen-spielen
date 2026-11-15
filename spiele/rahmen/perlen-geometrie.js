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

// --- Perlenkette (Einmaleins, <ls-perlenkette>) -------------------------------------------------------------
// Eine Kette von n sind gleiche Stäbchen zu je n Perlen hintereinander (Montessori-Kurzkette, hier zehn Stäbchen),
// in Reihen zu fünf, beide Reihen von links nach rechts (wie gelesen). Zwischen zwei Stäbchen liegt ein GLIED. Am
// Ende jedes Stäbchens ist der Ort seines Pfeilchens (Zahl k · n).

/** Abstand zwischen zwei Stäbchen der Kette (das Glied), in Perlendurchmessern. */
export const GLIED = 0.9;

/**
 * @typedef {{ nr: number, reihe: number, x0: number, x1: number, perlen: number[], marke: number | null }} KettenStab
 *   nr 1 … staebchen; x0/x1 Anfang und Ende entlang der Reihe; perlen: Lage der Perlenmitten; marke: Fünfermarke
 * @typedef {{ n: number, staebchen: KettenStab[], reihen: number, breite: number, hoehe: number,
 *   ort: (zahl: number) => { reihe: number, x: number, ueber: boolean } }} Kette
 */

/**
 * Geometrie der Kette von n.
 * @param {unknown} wert n, ganze Zahl 1 bis 10
 * @param {{ staebchen?: number, jeReihe?: number }} [o] Anzahl der Stäbchen (Vorgabe 10) und je Reihe (Vorgabe 5)
 * @returns {Kette | null}
 */
export function perlenkette(wert, { staebchen = 10, jeReihe = 5 } = {}) {
  const n = wertAus(wert);
  if (n === null || !Number.isInteger(staebchen) || staebchen < 1 || staebchen > 10 || !Number.isInteger(jeReihe) || jeReihe < 1) return null;
  const stab = /** @type {Stab} */ (perlenstab(n));
  /** @type {KettenStab[]} */
  const liste = [];
  for (let i = 0; i < staebchen; i++) {
    const x0 = (i % jeReihe) * (stab.laenge + GLIED);
    liste.push({ nr: i + 1, reihe: Math.floor(i / jeReihe), x0, x1: x0 + stab.laenge, perlen: stab.perlen.map((p) => x0 + p), marke: stab.marke === null ? null : x0 + stab.marke });
  }
  const proReihe = Math.min(jeReihe, staebchen);
  const breite = proReihe * stab.laenge + (proReihe - 1) * GLIED;
  return {
    n,
    staebchen: liste,
    reihen: Math.ceil(staebchen / jeReihe),
    breite,
    hoehe: HOEHE,
    /**
     * Stelle nach `zahl` Perlen: am Ende eines Stäbchens (Mitte des folgenden Glieds) oder zwischen zwei Perlen;
     * hinter der letzten Perle (ueber) ein Glied hinter dem Ende der Kette.
     * @param {number} zahl
     */
    ort(zahl) {
      const z = Math.max(0, Math.round(zahl));
      if (z === 0) return { reihe: 0, x: -GLIED / 2, ueber: false };
      if (z > staebchen * n) {
        const letzter = liste[liste.length - 1];
        return { reihe: letzter.reihe, x: letzter.x1 + GLIED * 1.5, ueber: true };
      }
      const k = Math.floor(z / n);
      const r = z % n;
      if (r === 0) {
        const s = liste[k - 1];
        return { reihe: s.reihe, x: s.x1 + GLIED / 2, ueber: false };
      }
      const s = liste[k];
      return { reihe: s.reihe, x: (s.perlen[r - 1] + s.perlen[r]) / 2, ueber: false };
    },
  };
}
