// Lernmaterial eines gekonnten Themas fürs Regal (Spec 2026-11-14-ansichten, Abschnitt „Regal“).
// Rein und DOM-frei: sagt nur, welcher Baustein das Ding zeigt; die Ansicht baut ihn.
//
// Regeln in dieser Reihenfolge:
//   1. Aufgabenart zerlegung / rechnen / zwillinge / menge mit ganzer Zahl 1 bis 10 → Perlenstab dieser Zahl
//      (ls-perlenstab zeichnet nur 1 bis 10).
//   2. Thema, dessen Lernziel die Wortart selbst ist → Wortart-Zeichen. Nur über die ausdrückliche Liste WORTART
//      (Themen-Id → Wortart, aus dem Fach grammatik von lernplan.json; ein Test prüft, dass jede Id dort existiert).
//      Keine Erkennung über Namen oder Bereich: Pronomen, Rechtschreibung über Nomen, Formenbildung usw. bekommen
//      kein Wortart-Zeichen (in Kl. 1–2 gibt es nur Nomen, Artikel, Adjektiv, Verb).
//   3. alles andere → Karte mit der Ziffer (letzte Zahl im Namen) oder dem ersten Buchstaben des Namens.

/** @typedef {{ id: string, name?: string, strang?: string, bereich?: string, art?: string|null, zahl?: number|null }} Material */
/** @typedef {{ baustein: "perlenstab", wert: number } | { baustein: "wortart", wert: "nomen"|"verb"|"adjektiv"|"artikel" } | { baustein: "karte", wert: string }} Baustein */

const MIT_ZAHL = new Set(["zerlegung", "rechnen", "zwillinge", "menge"]);

/**
 * Themen-Id → Wortart (nur Themen, deren Lernziel die Wortart selbst ist).
 * @type {Record<string, "nomen"|"verb"|"adjektiv"|"artikel">}
 */
export const WORTART = {
  namenwoerter: "nomen",                        // Nomen erkennen
  "nomen-proben": "nomen",                      // Prüfen, ob ein Wort ein Nomen ist
  tunwoerter: "verb",                           // Verben erkennen
  wiewoerter: "adjektiv",                       // Adjektive erkennen
  "der-die-das": "artikel",                     // Artikel zum Nomen
  "bestimmter-unbestimmter-begleiter": "artikel", // bestimmter und unbestimmter Artikel
};

/**
 * Wortart eines Themas oder null.
 * @param {Material} thema
 */
export function wortartVon(thema) {
  return Object.hasOwn(WORTART, thema.id) ? WORTART[thema.id] : null;
}

/**
 * Baustein, der ein gekonntes Thema im Regal zeigt.
 * @param {Material} thema
 * @returns {Baustein}
 */
export function materialFuer(thema) {
  const zahl = thema.zahl;
  if (thema.art && MIT_ZAHL.has(thema.art) && Number.isInteger(zahl) && /** @type {number} */ (zahl) >= 1 && /** @type {number} */ (zahl) <= 10) {
    return { baustein: "perlenstab", wert: /** @type {number} */ (zahl) };
  }
  const wortart = wortartVon(thema);
  if (wortart) return { baustein: "wortart", wert: wortart };
  const name = typeof thema.name === "string" ? thema.name : "";
  const ziffer = name.match(/\d+/g)?.at(-1);
  if (ziffer) return { baustein: "karte", wert: ziffer };
  const buchstabe = name.match(/[\p{L}\p{N}]/u)?.[0];
  return { baustein: "karte", wert: buchstabe ? buchstabe.toLocaleUpperCase("de") : "?" };
}
