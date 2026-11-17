// Speicher des Versanddienstes: eine JSON-Datei, atomar geschrieben (Temp-Datei + rename), und die Operationen auf dem
// Topf einer Adresse. Geräteschlüssel liegen nur als SHA-256-Hash darin, Adressen nur als Schlüssel der Tabelle.
import { createHash, randomBytes } from "node:crypto";
import { existsSync, readFileSync, renameSync, writeFileSync } from "node:fs";

/** @typedef {{ id: string, art: string, daten: Record<string, any> }} Ereignis */
/** @typedef {{ ids: string[], gekonnt: any[], dabei: any[], gelesen: any[], naechstes: any | null, naechstesSpaeter?: any, seit: string | null }} GespeicherterTopf */
/** @typedef {{ uhrzeit: string, namen: Record<string, string>, geraete: Record<string, { name: string, angelegt: string }>, topf: GespeicherterTopf, verschickt: { anleitung: string, am: string }[], abmeldeToken: string, letzterTag?: string, fehler?: { tag: string, n: number, bis: number } }} Adresse */
/** @typedef {{ adressen: Record<string, Adresse>, anfragen: Record<string, any>, zaehler: Record<string, number[]>, abgemeldet: Record<string, true> }} Daten */

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
  const leer = { adressen: {}, anfragen: {}, zaehler: {}, abgemeldet: {} };
  if (!existsSync(datei)) return leer;
  return { ...leer, .../** @type {Partial<Daten>} */ (JSON.parse(readFileSync(datei, "utf8"))) };
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

/** Zuletzt verschickte Anleitungen der letzten 14 Tage. @param {Adresse} adresse @param {Date} jetzt */
export function juengsteVerschickte(adresse, jetzt) {
  const grenze = jetzt.getTime() - VERSCHICKT_TAGE * 86400_000;
  return adresse.verschickt.filter((v) => new Date(v.am).getTime() >= grenze);
}

/** Topf in der Form, die `setzeBrief` erwartet; gleiche Namen mehrerer Geräte (ohne Groß-/Kleinschreibung) nur einmal. @param {Adresse} adresse */
export function briefTopf(adresse) {
  const { gekonnt, dabei, gelesen, naechstes } = adresse.topf;
  const namen = [];
  for (const n of Object.values(adresse.namen).map((x) => String(x).trim()).filter(Boolean)) {
    if (!namen.some((v) => v.toLowerCase() === n.toLowerCase())) namen.push(n);
  }
  return { namen, gekonnt, dabei, gelesen, naechstes };
}
