// Was das Gerät kann (Updates, App beenden, Kiosk, Drucken) und die Aufrufe dafür.
// Alle Aufrufe werfen nie; Fehler gehen ins Protokoll.
import { tauri, befehl, plattform } from "./dienste.js";
import { protokoll } from "./protokoll.js";

/**
 * drucken: Desktop und Browser ja, Tablet und Telefon nein (dort später über das Teilen-Menü,
 * docs/mit-echten-dingen.md „Küchenzettel“).
 * @returns {Promise<{ update: boolean, beenden: boolean, kiosk: boolean, drucken: boolean }>}
 */
export async function faehigkeiten() {
  let p = "browser";
  try {
    p = await plattform();
  } catch (e) {
    protokoll("Plattform: " + (/** @type {any} */ (e)?.message ?? e));
    // Plattform unbekannt: Die Desktop-Plugins gibt es nur dort, wo sie registriert sind (Windows-Kiosk).
    const beenden = !!tauri()?.process;
    return { update: !!tauri()?.updater, beenden, kiosk: beenden, drucken: beenden };
  }
  const desktop = p === "windows" || p === "macos" || p === "linux";
  return { update: desktop, beenden: desktop, kiosk: desktop, drucken: desktop || p === "browser" };
}

/** @returns {(() => Promise<any>) | undefined} */
export function updateSuche() {
  const check = tauri()?.updater?.check;
  return typeof check === "function" ? check : undefined;
}

/** @returns {Promise<string | null>} */
export async function appVersion() {
  try {
    return (await tauri()?.app?.getVersion?.()) ?? null;
  } catch {
    return null;
  }
}

/** @returns {Promise<boolean>} true, wenn der Aufruf durchging */
export async function beende() {
  try {
    await tauri()?.process?.exit?.(0);
    return true;
  } catch (e) {
    protokoll("App beenden: " + (/** @type {any} */ (e)?.message ?? e));
    return false;
  }
}

/** @returns {Promise<boolean>} true, wenn der Aufruf durchging */
export async function neuStart() {
  try {
    await tauri()?.process?.relaunch?.();
    return true;
  } catch (e) {
    protokoll("Neustart: " + (/** @type {any} */ (e)?.message ?? e));
    return false;
  }
}

/**
 * Hält den Kiosk-Wachhund an (oder lässt ihn weiterlaufen).
 * @param {boolean} pause
 * @returns {Promise<void>}
 */
export async function kioskPause(pause) {
  if (!tauri()) return;
  try {
    await befehl("kiosk_pause", { pause });
  } catch (e) {
    protokoll("Kiosk-Pause: " + (/** @type {any} */ (e)?.message ?? e));
  }
}

/**
 * Öffnet den Druckdialog des Systems (dort auch „Als PDF sichern“). Nur aufrufen, wenn `faehigkeiten().drucken`.
 * @returns {boolean} true, wenn der Aufruf durchging
 */
export function drucke() {
  try {
    const w = /** @type {any} */ (globalThis).window;
    if (typeof w?.print !== "function") return false;
    w.print();
    return true;
  } catch (e) {
    protokoll("Drucken: " + (/** @type {any} */ (e)?.message ?? e));
    return false;
  }
}
