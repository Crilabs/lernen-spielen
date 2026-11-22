// Test-Protokoll des Spielfortschritts (docs/testprotokoll.md): jeder Schritt einer Runde, Bücher und Eingriffe der
// Eltern gehen als Eintrag an die App (Datei je Profil) und von dort gebündelt an den Dienst. Nur in der App;
// nichts hier wartet, nichts wirft nach außen.

import { befehl as echterBefehl, istApp as echtesIstApp } from "./dienste.js";
import { PROFIL } from "./speicher.js";

/** Kennung dieser Seite (ein Seitenaufruf), damit sich Einträge mehrerer Seiten auseinanderhalten lassen. */
const SEITE = Math.random().toString(36).slice(2, 8);

let befehl = echterBefehl;
let istApp = echtesIstApp;
let nummer = 0;
let seiteGemeldet = false;
/** Zuletzt notierter Lernstand dieser Seite (als Text), damit gleiche Stände nicht doppelt gehen. */
let letzterStand = "";

/** Ersatz für Befehl und istApp in Tests; setzt den Zustand zurück. */
export const testHaken = {
  /** @param {((name: string, args?: object) => Promise<any>) | null} fn @param {boolean} [app] */
  setze(fn, app = true) {
    befehl = fn ?? echterBefehl;
    istApp = fn ? () => app : echtesIstApp;
    nummer = 0;
    seiteGemeldet = false;
    letzterStand = "";
  },
};

/** @returns {string} */
function pfad() {
  try {
    return String(globalThis.location?.pathname ?? "").split("/").filter(Boolean).slice(-2).join("/");
  } catch {
    return "";
  }
}

/**
 * @param {string} art
 * @param {object} daten
 */
function schreibe(art, daten) {
  nummer++;
  const eintrag = { t: new Date().toISOString(), art, s: SEITE, n: nummer, ...daten };
  befehl("testprotokoll_notieren", { profil: PROFIL, eintrag }).catch(() => {});
}

/**
 * Notiert einen Eintrag. Der erste Eintrag einer Seite kommt mit einem Eintrag „seite“ (welche Seite).
 * @param {string} art klein mit Bindestrich, z. B. "runde-start"
 * @param {object} [daten]
 */
export function notiere(art, daten = {}) {
  try {
    if (!istApp()) return;
    if (!seiteGemeldet) {
      seiteGemeldet = true;
      schreibe("seite", { pfad: pfad() });
    }
    schreibe(art, daten);
  } catch {
    // Das Protokoll darf nie ein Spiel stören.
  }
}

/**
 * Notiert den ganzen Lernstand, wenn er sich seit dem letzten Mal auf dieser Seite geändert hat.
 * @param {any} stand
 * @param {string} anlass
 */
export function notiereStand(stand, anlass) {
  try {
    if (!istApp()) return;
    const text = JSON.stringify(stand);
    if (text === letzterStand) return;
    letzterStand = text;
    notiere("stand", { anlass, stand: JSON.parse(text) });
  } catch {
    // wie oben
  }
}

/** Lässt die App das Notierte gleich senden (am Rundenende). */
export function sendeProtokoll() {
  try {
    if (!istApp()) return;
    befehl("testprotokoll_senden", { profil: PROFIL }).catch(() => {});
  } catch {
    // wie oben
  }
}
