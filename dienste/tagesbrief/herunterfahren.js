// Geordnetes Herunterfahren: ein gerade laufender Versand wird abgewartet, damit ein Neustart zur Versandzeit
// (Ausrollen) keinen Brief doppelt schickt.

/**
 * Hält den Zeitgeber an, wartet höchstens `grenzeMs` auf die laufende Prüfung und stoppt dann den Dienst.
 * @param {{ stoppeZeitgeber: () => void, laufend: () => Promise<unknown> | null, stop: () => Promise<void>, grenzeMs?: number }} o
 * @returns {Promise<void>}
 */
export async function fahreHerunter({ stoppeZeitgeber, laufend, stop, grenzeMs = 60_000 }) {
  stoppeZeitgeber();
  const aktuell = laufend();
  if (aktuell) {
    /** @type {ReturnType<typeof setTimeout> | undefined} */
    let uhr;
    const frist = new Promise((ok) => { uhr = setTimeout(ok, grenzeMs); });
    await Promise.race([aktuell.catch(() => {}), frist]);
    clearTimeout(uhr);
  }
  await stop();
}
