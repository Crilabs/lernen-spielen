// SSML für Azure Speech: Stimme, Sprache, Tempo je Variante, Korrekturen aus aussprache.json.

/** @param {string} s */
export const xml = (s) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);

/**
 * @typedef {{ sprich?: string, ssml?: string, datei?: string }} Aussprache
 *   sprich: andere Schreibweise für die Stimme (z. B. „Ein-horn“); ssml: fertiges SSML-Stück für den Inhalt
 *   (z. B. mit <phoneme>); datei: von Hand ersetzte Datei, wird nie erzeugt oder überschrieben.
 */

/**
 * @param {{ text: string, variante?: string }} eintrag
 * @param {{ stimme: string, varianten?: Record<string, { tempo?: string }> }} einstellungen
 * @param {Aussprache} [aussprache]
 * @returns {string}
 */
export function ssml(eintrag, einstellungen, aussprache = {}) {
  const inhalt = aussprache.ssml ?? xml(aussprache.sprich ?? eintrag.text);
  const tempo = eintrag.variante ? einstellungen.varianten?.[eintrag.variante]?.tempo : undefined;
  if (eintrag.variante && !einstellungen.varianten?.[eintrag.variante])
    throw new Error(`Unbekannte Variante „${eintrag.variante}“ (einstellungen.json › varianten)`);
  const koerper = tempo ? `<prosody rate="${xml(tempo)}">${inhalt}</prosody>` : inhalt;
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="de-DE">` +
    `<voice name="${xml(einstellungen.stimme)}">${koerper}</voice></speak>`
  );
}
