// Schlüssel der vorab erzeugten Audiodateien. Dieselben Funktionen nutzen kern/stimme.js (beim Abspielen)
// und werkzeuge/audio/ (beim Erzeugen), damit beide Seiten denselben Text finden.
// Keine Browser- oder Node-Zugriffe: das Modul läuft in beiden.

/**
 * Text in einheitlicher Form: Unicode NFC, Leerraum zusammengefasst, außen gekürzt.
 * @param {unknown} text
 * @returns {string}
 */
export function normalisiere(text) {
  return String(text ?? "")
    .normalize("NFC")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Schlüssel im Audio-Verzeichnis: der normalisierte Text, bei einer Variante (z. B. "diktat") davor mit "|".
 * @param {string} text
 * @param {string} [variante]
 * @returns {string}
 */
export function audioSchluessel(text, variante = "") {
  const t = normalisiere(text);
  return variante ? `${variante}|${t}` : t;
}
