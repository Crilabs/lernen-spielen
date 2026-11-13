// Elternbereich: PIN-Prüfung und Update-Suche (ohne DOM, testbar in Node).

import { updateSuche } from "./kern/geraet.js";

export async function pinHash(pin) {
  const bytes = new TextEncoder().encode("einhorn:" + pin);
  const hash = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function pinPruefen(pin, gespeichert) {
  if (typeof gespeichert !== "string" || !gespeichert) return false;
  return (await pinHash(pin)) === gespeichert;
}

// Liefert immer ein Ergebnis, auch bei Netzfehler oder Hänger (Zeitlimit).
export async function pruefeUpdate(
  check = updateSuche(),
  zeitlimitMs = 15000,
) {
  if (typeof check !== "function") return { status: "kein-app" };
  let timer;
  try {
    const zeit = new Promise((_, nein) => {
      timer = setTimeout(() => nein(new Error("Zeitlimit")), zeitlimitMs);
    });
    const update = await Promise.race([check(), zeit]);
    if (!update) return { status: "aktuell" };
    return { status: "neu", version: update.version, notiz: update.body ?? "", update };
  } catch {
    return { status: "offline" };
  } finally {
    clearTimeout(timer);
  }
}
