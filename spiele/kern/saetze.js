// Sätze, die aus Daten entstehen und vorab aufgenommen werden (werkzeuge/audio/texte.mjs erzeugt alle Belegungen).
// Ohne DOM, in Node und im Browser gleich.

/**
 * Bildschirm „Gekonnt“ (rahmen/gekonnt.js, Christian 2026-11-16): „<Sprechname des Themas> kannst du.“
 * @param {string} sprich Sprechname aus dem Lernplan (z. B. „Ziffern lesen“)
 */
export const gekonntSatz = (sprich) => `${String(sprich ?? "").trim()} kannst du.`;
