// Test-Protokoll des Spielfortschritts (docs/testprotokoll.md): Einträge der App als JSON-Zeilen je Gerät und Tag.
// Getrennt vom Topf des Tagesbriefs: eigener Ordner neben der Speicherdatei, eigene Löschfrist, nie im Brief.
import { appendFileSync, mkdirSync, readdirSync, rmSync, rmdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { berlinZeit } from "./versand.js";

/** So lange bleiben Protokolltage liegen. */
export const PROTOKOLL_TAGE = 90;
const ART = /^[a-z][a-z0-9-]{0,39}$/;
const DATEI = /^(\d{4}-\d{2}-\d{2})\.jsonl$/;

/** Ordner der Protokolle neben der Speicherdatei des Dienstes. @param {string} datei */
export const protokollOrdner = (datei) => join(dirname(datei), "protokoll");

/** Ein Eintrag braucht `art` (klein, mit Bindestrich) und die Zeit der App `t`; der Rest ist frei. @param {unknown} x */
export function gueltigerEintrag(x) {
  if (!x || typeof x !== "object" || Array.isArray(x)) return false;
  const e = /** @type {any} */ (x);
  return typeof e.art === "string" && ART.test(e.art) && typeof e.t === "string" && e.t.length <= 40;
}

/**
 * Hängt die Einträge an die Tagesdatei des Geräts an (Tag nach Eingang in Europe/Berlin); `e` ist die Eingangszeit.
 * @param {string} ordner @param {string} geraet gekürzter Geräte-Hash @param {object[]} liste @param {Date} jetzt
 */
export function legeAb(ordner, geraet, liste, jetzt) {
  if (!liste.length) return;
  const ziel = join(ordner, geraet);
  mkdirSync(ziel, { recursive: true, mode: 0o700 });
  const eingang = jetzt.toISOString();
  const zeilen = liste.map((x) => JSON.stringify({ ...x, e: eingang })).join("\n") + "\n";
  appendFileSync(join(ziel, `${berlinZeit(jetzt).tag}.jsonl`), zeilen, { mode: 0o600 });
}

/**
 * Löscht Tagesdateien, die mehr als `tage` Kalendertage vor heute (Berlin) liegen, und danach leere Geräteordner.
 * @param {string} ordner @param {Date} jetzt @param {number} [tage]
 * @returns {number} gelöschte Dateien
 */
export function raeumeAuf(ordner, jetzt, tage = PROTOKOLL_TAGE) {
  // Rechnen mit dem Berliner Kalendertag, damit die Zeitumstellung die Grenze nicht verschiebt.
  const grenze = new Date(Date.parse(`${berlinZeit(jetzt).tag}T00:00:00Z`) - tage * 86_400_000).toISOString().slice(0, 10);
  let geloescht = 0;
  /** @type {string[]} */
  let geraete;
  try { geraete = readdirSync(ordner); } catch { return 0; }
  for (const g of geraete) {
    const pfad = join(ordner, g);
    /** @type {string[]} */
    let dateien;
    try { dateien = readdirSync(pfad); } catch { continue; }
    for (const d of dateien) {
      const m = DATEI.exec(d);
      if (m && m[1] < grenze) { rmSync(join(pfad, d), { force: true }); geloescht++; }
    }
    try { if (!readdirSync(pfad).length) rmdirSync(pfad); } catch { /* bleibt */ }
  }
  return geloescht;
}
