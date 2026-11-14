// Reine Funktionen der Prüfseite (Spec 2026-11-14-schriftvorlagen, 5.7): Freigaben in liste.json und
// Anmerkungen in werkzeuge/schrift/anmerkungen.json. Lesen und Schreiben der Dateien macht ansehen.mjs.

const DATUM = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Setzt `freigegeben` einer Form (Datum oder null zum Zurücknehmen). Gibt eine neue Liste zurück.
 * @param {any} liste
 * @param {string} satz
 * @param {string} zeichen
 * @param {string | null} datum
 */
export function gibFrei(liste, satz, zeichen, datum) {
  if (datum !== null && !DATUM.test(datum)) throw new Error(`Datum muss JJJJ-MM-TT sein: ${datum}`);
  const i = liste.formen.findIndex((/** @type {any} */ f) => f.satz === satz && f.zeichen === zeichen);
  if (i < 0) throw new Error(`Unbekannte Form: ${satz}/${zeichen}`);
  const formen = liste.formen.slice();
  formen[i] = { ...formen[i], freigegeben: datum };
  return { ...liste, formen };
}

/**
 * liste.json im Format der Datei: Sätze eingerückt, eine Zeile je Form und je Sonderverbindung.
 * @param {any} liste
 * @returns {string}
 */
export function schreibeListe(liste) {
  // Ein Objekt auf einer Zeile, mit Leerzeichen wie von Hand geschrieben: { "a": 1, "b": ["x", "y"] }
  const flach = (/** @type {any} */ v) =>
    Array.isArray(v)
      ? `[${v.map(flach).join(", ")}]`
      : v !== null && typeof v === "object"
        ? `{ ${Object.entries(v).map(([k, w]) => `${JSON.stringify(k)}: ${flach(w)}`).join(", ")} }`
        : JSON.stringify(v);
  const zeilen = (/** @type {any[]} */ a) => a.map((e) => `    ${flach(e)}`).join(",\n");
  const saetze = Object.entries(liste.saetze)
    .map(([k, v]) => `    ${JSON.stringify(k)}: ${flach(v)}`)
    .join(",\n");
  const block = (/** @type {any[]} */ a) => (a.length ? `[\n${zeilen(a)}\n  ]` : "[]");
  return `{\n  "saetze": {\n${saetze}\n  },\n  "formen": ${block(liste.formen)},\n  "sonderverbindungen": ${block(liste.sonderverbindungen)}\n}\n`;
}

/**
 * Hängt eine offene Anmerkung an.
 * @param {{eintraege: any[]}} anmerkungen
 * @param {string} satz
 * @param {string} zeichen
 * @param {string} text
 * @param {string} datum
 */
export function merkeAnmerkung(anmerkungen, satz, zeichen, text, datum) {
  const t = String(text ?? "").trim();
  if (!t) throw new Error("Anmerkung ist leer");
  return { ...anmerkungen, eintraege: [...anmerkungen.eintraege, { satz, zeichen, text: t, datum, erledigt: false }] };
}
