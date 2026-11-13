// Zugang zur Plattform: Tauri-App oder normaler Browser.
// tauri() ist die einzige Stelle, die window.__TAURI__ liest.

/** @typedef {"browser"|"windows"|"macos"|"linux"|"android"|"ios"} Plattform */

/**
 * Roher Tauri-Zugang, nur für andere Module in kern/.
 * @returns {any | null}
 */
export function tauri() {
  return /** @type {any} */ (globalThis).window?.__TAURI__ ?? null;
}

/** @returns {boolean} */
export function istApp() {
  return !!tauri();
}

/**
 * Ruft einen Befehl der App auf. Wirft (als abgelehntes Promise) außerhalb der App.
 * @param {string} name
 * @param {object} [args]
 * @returns {Promise<any>}
 */
export async function befehl(name, args) {
  const t = tauri();
  if (!t) throw new Error(`befehl ${name}: nur in der App`);
  return t.core.invoke(name, args);
}

/** @type {Promise<Plattform> | null} */
let plattformCache = null;

/**
 * Die Plattform, einmal ermittelt und dann gemerkt.
 * @returns {Promise<Plattform>}
 */
export function plattform() {
  if (!plattformCache) {
    plattformCache = istApp()
      ? befehl("plattform").catch((e) => {
          plattformCache = null;
          throw e;
        })
      : Promise.resolve("browser");
  }
  return plattformCache;
}

/**
 * Der localStorage des Browsers oder null, falls nicht verfügbar. Nur für kern/.
 * @returns {Storage | null}
 */
export function lokalerSpeicher() {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null;
  }
}
