// Bücher in der Spielzeit auf der Seite (Spec 2026-11-16-buecherzeit): verbindet kern/buecherzeit.js mit Speicher
// und Einstellungen. Die Bibliothek fragt erlaubt(), um nicht erlaubte Bücher nicht drückbar zu zeigen; geschichte.html
// gibt erlaubt() an den Abspieler und merkt das Buch beim Ereignis „liest“. Nicht lesbar heißt frei (nie ohne Grund sperren).

import { lade, speichere, sofortSpeichern } from "../kern/speicher.js";
import { ladeEinstellungen, einstellung } from "../kern/einstellungen.js";
import { regeln, aktuell, darf, merke } from "../kern/buecherzeit.js";

/** Speicher-Schlüssel des Stands (am Profil). */
export const STAND = "buecher-stand";
/** Name der Einstellung (am Profil). */
export const EINSTELLUNG = "buecher";

/**
 * Lädt Regeln und Stand; liefert erlaubt(id) → { vorlesen, selbst } für jetzt.
 * @param {Date} [jetzt]
 */
export async function buecherLage(jetzt = new Date()) {
  try {
    await ladeEinstellungen();
    const r = regeln(einstellung(EINSTELLUNG, null));
    const s = aktuell(await lade(STAND, {}), jetzt);
    return { erlaubt: (/** @type {string} */ id) => ({ vorlesen: darf(r, s, "vorlesen", id, jetzt), selbst: darf(r, s, "selbst", id, jetzt) }) };
  } catch {
    return { erlaubt: () => ({ vorlesen: true, selbst: true }) };
  }
}

/**
 * Merkt das Buch als heute in diesem Modus geöffnet und speichert sofort.
 * @param {"vorlesen" | "selbst"} modus @param {string} id
 */
export async function merkeBuch(modus, id) {
  const jetzt = new Date();
  const s = merke(aktuell(await lade(STAND, {}), jetzt), modus, id, jetzt);
  speichere(STAND, s);
  await sofortSpeichern();
}
