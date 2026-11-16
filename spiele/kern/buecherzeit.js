// Bücher in der Spielzeit (Spec 2026-11-16-buecherzeit): wie viele Bücher das Kind am Tag und in der Woche anhört
// („vorlesen“) und selbst liest („selbst“). Ohne DOM und ohne Speicher; die Uhrzeit kommt von außen.
// Einstellung "buecher" (am Profil): { vorlesenTag, vorlesenWoche, selbstTag, selbstWoche }, je null (aus) oder 1–10.
// Stand "buecher-stand" (am Profil): je Tag der laufenden ISO-Woche die heute in jedem Modus geöffneten Bücher und
// die Zugabe der Eltern. Ein Buch zählt beim ersten Öffnen am Tag in diesem Modus; die Woche zählt verschiedene Bücher.

import { tagSchluessel, wochenSchluessel } from "./spielzeit.js";

/** @typedef {"vorlesen" | "selbst"} Modus */
/** @typedef {{ vorlesenTag: number | null, vorlesenWoche: number | null, selbstTag: number | null,
 *   selbstWoche: number | null }} Regeln */
/** @typedef {{ vorlesen: string[], selbst: string[], zugabe: number }} Tag */
/** @typedef {{ woche: string, tage: Record<string, Tag> }} Stand */

export const MODI = /** @type {const} */ (["vorlesen", "selbst"]);
export const HOECHSTENS = 10;

/** @param {unknown} v @returns {number | null} */
const anzahl = (v) => (Number.isInteger(v) && /** @type {number} */ (v) >= 1 && /** @type {number} */ (v) <= HOECHSTENS
  ? /** @type {number} */ (v) : null);

/**
 * Bereinigt die gespeicherte Einstellung; Unbrauchbares heißt „aus“.
 * @param {any} roh
 * @returns {Regeln}
 */
export function regeln(roh) {
  const r = roh && typeof roh === "object" ? roh : {};
  return { vorlesenTag: anzahl(r.vorlesenTag), vorlesenWoche: anzahl(r.vorlesenWoche),
    selbstTag: anzahl(r.selbstTag), selbstWoche: anzahl(r.selbstWoche) };
}

/** @param {any} l @returns {string[]} */
const ids = (l) => (Array.isArray(l) ? [...new Set(l.filter((x) => typeof x === "string" && x))] : []);
/** @param {any} t @returns {Tag} */
const tagAus = (t) => ({ vorlesen: ids(t?.vorlesen), selbst: ids(t?.selbst),
  zugabe: Number.isInteger(t?.zugabe) && t.zugabe > 0 ? t.zugabe : 0 });

/**
 * Der Stand der laufenden Woche als bereinigte Kopie; aus einer anderen Woche oder kaputt wird er leer.
 * @param {any} roh
 * @param {Date} jetzt
 * @returns {Stand}
 */
export function aktuell(roh, jetzt) {
  const woche = wochenSchluessel(jetzt);
  if (!roh || typeof roh !== "object" || roh.woche !== woche || !roh.tage || typeof roh.tage !== "object") {
    return { woche, tage: {} };
  }
  return { woche, tage: Object.fromEntries(Object.entries(roh.tage).map(([k, t]) => [k, tagAus(t)])) };
}

/**
 * Heute und in der Woche geöffnete Bücher eines Modus.
 * @param {Stand} stand @param {Modus} modus @param {Date} jetzt
 */
export function zahlen(stand, modus, jetzt) {
  const s = aktuell(stand, jetzt);
  const t = tagAus(s.tage[tagSchluessel(jetzt)]);
  const woche = new Set(Object.values(s.tage).flatMap((x) => x[modus]));
  return { heute: t[modus].length, woche: woche.size, zugabe: t.zugabe };
}

/**
 * Darf das Kind dieses Buch jetzt in diesem Modus öffnen? Heute schon in diesem Modus geöffnet: immer.
 * Sonst muss unter der Tagesgrenze und unter der Wochengrenze (ein Buch, das diese Woche schon offen war, kostet die
 * Woche nichts) noch Platz sein; die Zugabe von heute erhöht beide.
 * @param {Regeln} r @param {Stand} stand @param {Modus} modus @param {string} id @param {Date} jetzt
 */
export function darf(r, stand, modus, id, jetzt) {
  const s = aktuell(stand, jetzt);
  const t = tagAus(s.tage[tagSchluessel(jetzt)]);
  if (t[modus].includes(id)) return true;
  const tag = r[`${modus}Tag`], woche = r[`${modus}Woche`];
  if (tag !== null && t[modus].length >= tag + t.zugabe) return false;
  const inWoche = new Set(Object.values(s.tage).flatMap((x) => x[modus]));
  if (woche !== null && !inWoche.has(id) && inWoche.size >= woche + t.zugabe) return false;
  return true;
}

/**
 * Merkt, dass das Buch heute in diesem Modus geöffnet wurde. Liefert einen neuen Stand.
 * @param {Stand} stand @param {Modus} modus @param {string} id @param {Date} jetzt
 * @returns {Stand}
 */
export function merke(stand, modus, id, jetzt) {
  const s = aktuell(stand, jetzt);
  const k = tagSchluessel(jetzt);
  const t = tagAus(s.tage[k]);
  if (!t[modus].includes(id)) t[modus] = [...t[modus], id];
  s.tage[k] = t;
  return s;
}

/**
 * „Heute ein Buch mehr“: gilt für beide Modi und nur heute, auch über die Wochengrenze.
 * @param {Stand} stand @param {number} dazu @param {Date} jetzt
 * @returns {Stand}
 */
export function gibZugabe(stand, dazu, jetzt) {
  const s = aktuell(stand, jetzt);
  const k = tagSchluessel(jetzt);
  const t = tagAus(s.tage[k]);
  t.zugabe += Math.max(0, Math.round(dazu));
  s.tage[k] = t;
  return s;
}
