// Geometrie des goldenen Perlenmaterials ohne DOM (in Node testbar: tests/rahmen-gold.test.mjs).
// Grundsätze M4: proportionales Material zuerst – Zehnerstangen und einzelne Perlen. Maßeinheit ist der Durchmesser
// einer Perle (1), die Stangen sind die Zehnerstäbchen aus perlen-geometrie.js (senkrecht, erste Perle oben).
//
// Eine Zahl von 0 bis 99 besteht aus `zehner` Stangen nebeneinander (links) und `einer` einzelnen Perlen
// (rechts) in Fünfergliederung: eine Säule mit fünf Perlen, daneben die übrigen. Die Perlen einer Säule stehen
// wie auf einer Stange (gleicher Abstand, nach der fünften die Lücke gibt es dort nicht: eine Säule hat höchstens
// fünf), damit man die Fünf ohne Zählen sieht.

import { perlenstab, SCHRITT, HOEHE } from "./perlen-geometrie.js";

/** Abstand der Stangen-Mitten (Stangenbreite plus Zwischenraum). */
export const STANGEN_ABSTAND = HOEHE + 0.3;
/** Abstand der Perlen-Säulen (Perle plus Zwischenraum). */
export const SAEULEN_ABSTAND = 1 + 0.45;
/** Lücke zwischen den Stangen und den einzelnen Perlen. */
export const GRUPPEN_LUECKE = 1.1;
/** Höhe des Materials: eine Zehnerstange (auch wenn nur Perlen da sind, damit alle gleich hoch stehen). */
export const MATERIAL_HOEHE = perlenstab(10)?.laenge ?? 0;

/**
 * Zahl aus einem Attribut oder einer Zahl: ganze Zahl 0 bis 99, sonst null.
 * @param {unknown} roh
 * @returns {number | null}
 */
export function zahlAus(roh) {
  const text = typeof roh === "number" ? String(roh) : typeof roh === "string" ? roh.trim() : "";
  return /^\d{1,2}$/.test(text) ? Number(text) : null;
}

/**
 * @typedef {{ zahl: number, zehner: number, einer: number, breite: number, hoehe: number,
 *   stangen: { x: number, perlen: number[], marke: number }[], einzel: { x: number, y: number }[] }} Gold
 * x: Lage der Mitte quer; perlen/y: Lage der Perlenmitten von oben; marke: Fünfermarke der Stange.
 */

/**
 * Geometrie von `zahl` als Goldmaterial.
 * @param {unknown} zahl ganze Zahl 0 bis 99
 * @returns {Gold | null} null bei ungültiger Zahl
 */
export function gold(zahl) {
  const n = zahlAus(zahl);
  if (n === null) return null;
  const zehner = Math.floor(n / 10);
  const einer = n % 10;
  const stab = /** @type {NonNullable<ReturnType<typeof perlenstab>>} */ (perlenstab(10));
  const stangen = Array.from({ length: zehner }, (_, i) => ({ x: HOEHE / 2 + i * STANGEN_ABSTAND, perlen: stab.perlen, marke: /** @type {number} */ (stab.marke) }));
  const stangenEnde = zehner ? HOEHE / 2 + (zehner - 1) * STANGEN_ABSTAND + HOEHE / 2 : 0;
  const start = zehner ? stangenEnde + GRUPPEN_LUECKE : 0;
  /** @type {{ x: number, y: number }[]} */
  const einzel = [];
  for (let i = 0; i < einer; i++) {
    const saeule = Math.floor(i / 5);
    einzel.push({ x: start + 0.5 + saeule * SAEULEN_ABSTAND, y: (i % 5 + 0.5) * SCHRITT });
  }
  const saeulen = Math.ceil(einer / 5);
  const ende = einer ? start + 0.5 + (saeulen - 1) * SAEULEN_ABSTAND + 0.5 : stangenEnde;
  return { zahl: n, zehner, einer, breite: ende, hoehe: MATERIAL_HOEHE, stangen, einzel };
}
