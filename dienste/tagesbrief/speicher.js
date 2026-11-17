// Speicher des Versanddienstes: eine JSON-Datei, atomar geschrieben (Temp-Datei + rename), und die Operationen auf dem
// Topf einer Familie. Geräteschlüssel liegen nur als SHA-256-Hash darin, Adressen nur als Schlüssel der Empfängertabelle.
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";

/** @typedef {{ id: string, art: string, daten: Record<string, any> }} Ereignis */
/** @typedef {{ ids: string[], gekonnt: any[], dabei: any[], gelesen: any[], naechstes: any | null, naechstesSpaeter?: any, seit: string | null }} GespeicherterTopf */
/** @typedef {{ bestaetigt: boolean, abmeldeToken: string, gesendetTag?: string, fehler?: { tag: string, n: number, bis: number } }} Empfaenger */
/** @typedef {{ uhrzeit: string, name: string, geraete: Record<string, { name: string, angelegt: string }>, empfaenger: Record<string, Empfaenger>, topf: GespeicherterTopf, verschickt: { anleitung: string, am: string }[], letzterTag?: string }} Familie */
/** @typedef {{ familien: Record<string, Familie>, anfragen: Record<string, any>, zaehler: Record<string, number[]>, abgemeldet: Record<string, true>, gesperrt?: string[] }} Daten */

/** Höchstens so viele Empfänger (bestätigt und wartend zusammen) je Familie. */
export const MAX_EMPFAENGER = 4;
export const VERSCHICKT_TAGE = 14;
const ARTEN = ["gekonnt", "dabei", "gelesen", "naechstes"];

/** @param {string} text */
export const hash = (text) => createHash("sha256").update(text).digest("hex");

/** Zufälliger Schlüssel oder Token, URL-tauglich. */
export const zufall = () => randomBytes(32).toString("base64url");

/** @returns {GespeicherterTopf} */
export const leererTopf = () => ({ ids: [], gekonnt: [], dabei: [], gelesen: [], naechstes: null, seit: null });

/** @param {string} datei @returns {Daten} */
export function lade(datei) {
  const leer = () => ({ familien: {}, anfragen: {}, zaehler: {}, abgemeldet: {} });
  if (!existsSync(datei)) return leer();
  const gelesen = /** @type {Partial<Daten> & { adressen?: unknown }} */ (JSON.parse(readFileSync(datei, "utf8")));
  // Eine Datei aus der Zeit „eine Adresse je Topf“ (ohne `familien`) wird verworfen; es gab keine echten Anmeldungen.
  if (!gelesen || typeof gelesen.familien !== "object" || !gelesen.familien) return leer();
  return { ...leer(), ...gelesen };
}

/** Schreibt atomar: erst in eine Temp-Datei neben dem Ziel, dann umbenennen. @param {string} datei @param {Daten} daten */
export function sichere(datei, daten) {
  const temp = `${datei}.${process.pid}.tmp`;
  writeFileSync(temp, JSON.stringify(daten), { mode: 0o600 });
  renameSync(temp, datei);
}

/**
 * Legt die Ereignisse in den Topf. Doppelte Ereignis-Ids zählen einmal, gekonnt/dabei/gelesen nach `daten.id`,
 * `naechstes` ersetzt das vorige. Ereignisse ohne bekannte Art oder ohne Objekt in `daten` werden übergangen.
 * Ein `naechstes`, das nach der heutigen Uhrzeit eingeht (`nachUhrzeit`), kommt auf den zweiten Platz
 * `naechstesSpaeter` und verdrängt das für den heutigen Brief nicht; ein früheres räumt diesen Platz.
 * @param {GespeicherterTopf} topf @param {Ereignis[]} ereignisse @param {Date} jetzt @param {boolean} [nachUhrzeit]
 * @returns {number} Anzahl der neu aufgenommenen Ereignisse
 */
export function legeAb(topf, ereignisse, jetzt, nachUhrzeit = false) {
  let neu = 0;
  for (const e of ereignisse) {
    if (!e || typeof e.id !== "string" || !ARTEN.includes(e.art) || !e.daten || typeof e.daten !== "object" || Array.isArray(e.daten)) continue;
    if (topf.ids.includes(e.id)) continue;
    topf.ids.push(e.id);
    const daten = { ...e.daten, eingang: jetzt.toISOString() };
    if (e.art === "naechstes") {
      if (nachUhrzeit && topf.naechstes) topf.naechstesSpaeter = daten;
      else { topf.naechstes = daten; delete topf.naechstesSpaeter; }
    }
    else {
      const liste = /** @type {any[]} */ (topf[/** @type {"gekonnt"|"dabei"|"gelesen"} */ (e.art)]);
      if (e.daten.id !== undefined && liste.some((x) => x.id === e.daten.id)) continue;
      liste.push(daten);
    }
    neu++;
  }
  if (neu > 0 && !topf.seit) topf.seit = jetzt.toISOString();
  return neu;
}

/** Zuletzt verschickte Anleitungen der letzten 14 Tage. @param {Familie} familie @param {Date} jetzt */
export function juengsteVerschickte(familie, jetzt) {
  const grenze = jetzt.getTime() - VERSCHICKT_TAGE * 86400_000;
  return familie.verschickt.filter((v) => new Date(v.am).getTime() >= grenze);
}

/** Topf in der Form, die `setzeBrief` erwartet: der eine Name der Familie (oder keiner) und die Ereignisse. @param {Pick<Familie, "name" | "topf">} familie */
export function briefTopf(familie) {
  const { gekonnt, dabei, gelesen, naechstes } = familie.topf;
  const name = String(familie.name ?? "").trim();
  return { namen: name ? [name] : [], gekonnt, dabei, gelesen, naechstes };
}

/** Bestätigte Empfänger (Adressen) einer Familie. @param {Familie} familie */
export const bestaetigteEmpfaenger = (familie) => Object.keys(familie.empfaenger).filter((a) => familie.empfaenger[a].bestaetigt);
