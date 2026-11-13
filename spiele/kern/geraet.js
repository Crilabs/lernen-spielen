// Was das Gerät kann (Updates, App beenden, Kiosk) und die Aufrufe dafür.
// Alle Aufrufe werfen nie; Fehler gehen ins Protokoll.
import { tauri, befehl, plattform } from "./dienste.js";
import { protokoll } from "./protokoll.js";

/**
 * @returns {Promise<{ update: boolean, beenden: boolean, kiosk: boolean }>}
 */
export async function faehigkeiten() {
  let p = "browser";
  try {
    p = await plattform();
  } catch {
    /* unbekannt: nichts anbieten */
  }
  const desktop = p === "windows" || p === "macos" || p === "linux";
  return { update: desktop, beenden: desktop, kiosk: desktop };
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

/** @returns {Promise<void>} */
export async function beende() {
  try {
    await tauri()?.process?.exit?.(0);
  } catch (e) {
    protokoll("App beenden: " + (/** @type {any} */ (e)?.message ?? e));
  }
}

/** @returns {Promise<void>} */
export async function neuStart() {
  try {
    await tauri()?.process?.relaunch?.();
  } catch (e) {
    protokoll("Neustart: " + (/** @type {any} */ (e)?.message ?? e));
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
