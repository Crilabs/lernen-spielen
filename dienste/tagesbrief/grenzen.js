// Grenzen des Versanddienstes (Spec „Versanddienst“): Zähler mit gleitendem Fenster. Die Zähler liegen im Speicher
// des Dienstes (`zaehler`), damit ein Neustart sie nicht zurücksetzt; Schlüssel sind Hashes, nie Adressen oder IPs.

export const STUNDE = 3600_000;
export const TAG = 24 * STUNDE;

export const GRENZEN = {
  anmeldenJeIp: { max: 5, fenster: STUNDE },
  anmeldenJeAdresse: { max: 3, fenster: TAG },
  pushesJeGeraet: { max: 50, fenster: TAG },
  einladungenJeFamilie: { max: 5, fenster: TAG },
  probebriefeJeGeraet: { max: 3, fenster: TAG },
  ereignisseJePush: 200,
  bytesJePush: 300 * 1024,
  // Test-Protokoll (docs/testprotokoll.md): die App sendet alle paar Minuten und am Rundenende.
  protokollJeGeraet: { max: 2000, fenster: TAG },
  protokollEintraegeJePush: 2000,
  protokollBytesJePush: 900 * 1024,
};

/**
 * Zählt einen Aufruf und sagt, ob er noch erlaubt ist.
 * @param {Record<string, number[]>} zaehler @param {string} schluessel
 * @param {{ max: number, fenster: number }} grenze @param {number} jetzt ms
 */
export function erlaubt(zaehler, schluessel, grenze, jetzt) {
  const frisch = (zaehler[schluessel] ?? []).filter((t) => t > jetzt - grenze.fenster);
  if (frisch.length >= grenze.max) {
    zaehler[schluessel] = frisch;
    return false;
  }
  frisch.push(jetzt);
  zaehler[schluessel] = frisch;
  return true;
}

/** Entfernt abgelaufene Zähler. @param {Record<string, number[]>} zaehler @param {number} jetzt ms */
export function raeumeAuf(zaehler, jetzt) {
  for (const k of Object.keys(zaehler)) {
    zaehler[k] = zaehler[k].filter((t) => t > jetzt - TAG);
    if (!zaehler[k].length) delete zaehler[k];
  }
}
