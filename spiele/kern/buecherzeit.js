// Bücher in der Spielzeit (Spec 2026-11-16-buecherzeit): wie viele Bücher das Kind am Tag oder in der Woche öffnet.
// Ohne DOM und ohne Speicher; die Uhrzeit kommt von außen.
// Einstellung "buecher" (am Profil): { anzahl, je, auchLesen }: höchstens anzahl (null = aus, sonst 1–10) Bücher
// je "tag" oder "woche"; die Grenze gilt fürs Vorlesen, mit auchLesen auch fürs Selbstlesen, dann gemeinsam gezählt.
// Stand "buecher-stand" (am Profil): je Tag der laufenden ISO-Woche die in jedem Modus geöffneten Bücher und die
// Zugabe der Eltern. Gezählt werden verschiedene Bücher; ein Buch, das im Zeitraum schon offen war, kostet nichts.

import { tagSchluessel, wochenSchluessel } from "./spielzeit.js";

/** @typedef {"vorlesen" | "selbst"} Modus */
/** @typedef {{ anzahl: number | null, je: "tag" | "woche", auchLesen: boolean }} Regeln */
/** @typedef {{ vorlesen: string[], selbst: string[], zugabe: number }} Tag */
/** @typedef {{ woche: string, tage: Record<string, Tag> }} Stand */

export const MODI = /** @type {const} */ (["vorlesen", "selbst"]);
export const HOECHSTENS = 10;

/** @param {unknown} v @returns {number | null} */
const zahl = (v) => (Number.isInteger(v) && /** @type {number} */ (v) >= 1 && /** @type {number} */ (v) <= HOECHSTENS
  ? /** @type {number} */ (v) : null);

/**
 * Bereinigt die gespeicherte Einstellung; Unbrauchbares heißt „aus“. Übernimmt die vier Grenzen aus v1.2.1
 * (vorlesenTag, vorlesenWoche, selbstTag, selbstWoche) so gut es geht: die erste gesetzte zählt.
 * @param {any} roh
 * @returns {Regeln}
 */
export function regeln(roh) {
  const r = roh && typeof roh === "object" ? roh : {};
  if (!("anzahl" in r)) {
    const alt = [["vorlesenTag", "tag"], ["vorlesenWoche", "woche"], ["selbstTag", "tag"], ["selbstWoche", "woche"]]
      .find(([k]) => zahl(r[k]) !== null);
    if (alt) return { anzahl: zahl(r[alt[0]]), je: /** @type {"tag" | "woche"} */ (alt[1]), auchLesen: zahl(r.selbstTag) !== null || zahl(r.selbstWoche) !== null };
  }
  return { anzahl: zahl(r.anzahl), je: r.je === "woche" ? "woche" : "tag", auchLesen: r.auchLesen === true };
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

/** Die Modi, die die Grenze zählt. @param {Regeln} r @returns {Modus[]} */
export const gezaehlt = (r) => (r.auchLesen ? ["vorlesen", "selbst"] : ["vorlesen"]);

/**
 * Verschiedene Bücher in den gezählten Modi: heute, im Zeitraum der Grenze (Tag oder Woche), dazu die Zugabe von heute.
 * @param {Regeln} r @param {Stand} stand @param {Date} jetzt
 */
export function zahlen(r, stand, jetzt) {
  const s = aktuell(stand, jetzt);
  const t = tagAus(s.tage[tagSchluessel(jetzt)]);
  const modi = gezaehlt(r);
  const heute = new Set(modi.flatMap((m) => t[m]));
  const woche = new Set(Object.values(s.tage).flatMap((x) => modi.flatMap((m) => x[m])));
  return { heute, woche, offen: r.je === "woche" ? woche : heute, zugabe: t.zugabe };
}

/**
 * Darf das Kind dieses Buch jetzt in diesem Modus öffnen? Ohne Grenze und in einem nicht gezählten Modus immer;
 * ein Buch, das im Zeitraum schon offen war, auch. Sonst muss unter der Grenze plus der Zugabe von heute Platz sein.
 * @param {Regeln} r @param {Stand} stand @param {Modus} modus @param {string} id @param {Date} jetzt
 */
export function darf(r, stand, modus, id, jetzt) {
  if (r.anzahl === null || !gezaehlt(r).includes(modus)) return true;
  const z = zahlen(r, stand, jetzt);
  return z.offen.has(id) || z.offen.size < r.anzahl + z.zugabe;
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
 * „Heute ein Buch mehr“: nur heute, auch über die Grenze der Woche.
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
