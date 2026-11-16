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
 * @typedef {{ sprich?: string, ssml?: string, sprache?: string }} Wort
 *   Eintrag der Wörterliste (aussprache.json › woerter), gilt für jedes ganze Vorkommen in jedem Text.
 *   sprich: andere Schreibweise; ssml: fertiges SSML-Stück (z. B. <phoneme>); sprache: das Wort in dieser
 *   Sprache sprechen (z. B. "en-US" für ein englisches Wort).
 */

const RAND = "(?<![\\p{L}\\p{N}])";
const ENDE = "(?![\\p{L}\\p{N}])";

/**
 * Ersetzt die Wörter der Liste im schon maskierten Text, in einem Durchgang (Eingefügtes wird nicht erneut
 * ersetzt), längere Einträge zuerst.
 * @param {string} maskiert
 * @param {Record<string, Wort>} woerter
 */
export function ersetzeWoerter(maskiert, woerter) {
  const liste = Object.keys(woerter).sort((a, b) => b.length - a.length);
  if (!liste.length) return maskiert;
  const muster = new RegExp(`${RAND}(${liste.map((w) => xml(w).replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})${ENDE}`, "gu");
  /** @type {Record<string, string>} */
  const nach = {};
  for (const w of liste) {
    const e = woerter[w];
    const ersatz =
      e.ssml ?? (e.sprich !== undefined ? xml(e.sprich) : e.sprache ? `<lang xml:lang="${xml(e.sprache)}">${xml(w)}</lang>` : undefined);
    if (ersatz === undefined) throw new Error(`Wörterliste (aussprache.json › woerter): „${w}“ braucht sprich, ssml oder sprache`);
    nach[xml(w)] = ersatz;
  }
  return maskiert.replace(muster, (w) => nach[w]);
}

/**
 * @param {{ text: string, variante?: string }} eintrag
 * @param {{ stimme: string, tempo?: string, varianten?: Record<string, { tempo?: string }> }} einstellungen
 *   tempo: für alle Sätze (z. B. "-10%"); das Tempo einer Variante ersetzt es.
 * @param {Aussprache} [aussprache] Korrektur für genau diesen Text
 * @param {Record<string, Wort>} [woerter] Wörterliste für alle Texte; nicht angewandt auf fertiges ssml je Text
 * @returns {string}
 */
export function ssml(eintrag, einstellungen, aussprache = {}, woerter = {}) {
  const inhalt = aussprache.ssml ?? ersetzeWoerter(xml(aussprache.sprich ?? eintrag.text), woerter);
  if (eintrag.variante && !einstellungen.varianten?.[eintrag.variante])
    throw new Error(`Unbekannte Variante „${eintrag.variante}“ (einstellungen.json › varianten)`);
  const tempo = (eintrag.variante ? einstellungen.varianten?.[eintrag.variante]?.tempo : undefined) ?? einstellungen.tempo;
  const koerper = tempo ? `<prosody rate="${xml(tempo)}">${inhalt}</prosody>` : inhalt;
  return (
    `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="de-DE">` +
    `<voice name="${xml(einstellungen.stimme)}">${koerper}</voice></speak>`
  );
}

/**
 * Klartext für Stimmen ohne SSML (ElevenLabs): `sprich` des Textes und der Wörterliste angewandt.
 * Liefert null, wenn eine Korrektur nur als SSML geht (ssml je Text, Wort mit ssml oder sprache) –
 * dann bleibt dieser Text bei Azure, das SSML versteht.
 * @param {{ text: string }} eintrag
 * @param {Aussprache} [aussprache]
 * @param {Record<string, Wort>} [woerter]
 * @returns {string | null}
 */
export function klartext(eintrag, aussprache = {}, woerter = {}) {
  if (aussprache.ssml) return null;
  const text = aussprache.sprich ?? eintrag.text;
  const liste = Object.keys(woerter).sort((a, b) => b.length - a.length);
  if (!liste.length) return text;
  const muster = new RegExp(`${RAND}(${liste.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("|")})${ENDE}`, "gu");
  let nurSsml = false;
  const ergebnis = text.replace(muster, (w) => {
    const e = woerter[w];
    if (e.sprich !== undefined) return e.sprich;
    nurSsml = true;
    return w;
  });
  return nurSsml ? null : ergebnis;
}
