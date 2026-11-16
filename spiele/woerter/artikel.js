// Wortschatz der Aufgabenart „artikel“ (Werkzeug, G09 Werkzeugwand): Nomen mit ihrem Artikel – reine Daten ohne DOM.
// Das grammatische Geschlecht ist willkürlich; hier stehen deshalb nur Dinge, nie Personen (grundsaetze §6.1 Nr. 11).
// schwierigkeit: 0 = die Endung verrät den Artikel (Säge, Schere, Zange, Bürste auf -e), 1 = sonst,
// 2 = Verwechsler gleicher Endung (Leiter und Messer enden wie Hammer und Eimer, Nadel wie Pinsel und Nagel).

/** @typedef {{ id: string, wort: string, artikel: "der" | "die" | "das", schwierigkeit: 0 | 1 | 2 }} Wort */

/** @type {Wort[]} */
export const WERKZEUG = [
  { id: "hammer", wort: "Hammer", artikel: "der", schwierigkeit: 1 },
  { id: "pinsel", wort: "Pinsel", artikel: "der", schwierigkeit: 1 },
  { id: "nagel", wort: "Nagel", artikel: "der", schwierigkeit: 1 },
  { id: "eimer", wort: "Eimer", artikel: "der", schwierigkeit: 1 },
  { id: "besen", wort: "Besen", artikel: "der", schwierigkeit: 1 },
  { id: "schluessel", wort: "Schlüssel", artikel: "der", schwierigkeit: 1 },
  { id: "zange", wort: "Zange", artikel: "die", schwierigkeit: 0 },
  { id: "saege", wort: "Säge", artikel: "die", schwierigkeit: 0 },
  { id: "schere", wort: "Schere", artikel: "die", schwierigkeit: 0 },
  { id: "leiter", wort: "Leiter", artikel: "die", schwierigkeit: 2 },
  { id: "nadel", wort: "Nadel", artikel: "die", schwierigkeit: 2 },
  { id: "buerste", wort: "Bürste", artikel: "die", schwierigkeit: 0 },
  { id: "messer", wort: "Messer", artikel: "das", schwierigkeit: 2 },
  { id: "seil", wort: "Seil", artikel: "das", schwierigkeit: 1 },
  { id: "brett", wort: "Brett", artikel: "das", schwierigkeit: 1 },
  { id: "lineal", wort: "Lineal", artikel: "das", schwierigkeit: 1 },
  { id: "rad", wort: "Rad", artikel: "das", schwierigkeit: 1 },
  { id: "glas", wort: "Glas", artikel: "das", schwierigkeit: 1 },
];

/** Wortschätze nach Name (Feld `wortschatz` der Spezifikation). */
export const WORTSCHAETZE = { werkzeug: WERKZEUG };

/** Wort zu einer Kennung (hammer) oder null. @param {string} id */
export const wortMit = (id) => WERKZEUG.find((w) => w.id === id) ?? null;
