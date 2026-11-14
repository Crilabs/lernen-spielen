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

const ESC = /** @type {Record<string, string>} */ ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" });

/**
 * HTML eines Bausteins, klein und flach zum Ansehen (Fach-Seite und Regal teilen es; Größe und Form setzt die
 * Seite per CSS). Perlenstab und Wortart über die Rahmen-Bausteine, sonst `<span class="karte">` mit dem Wert.
 * Alles aria-hidden: den Namen trägt der Knopf darum.
 * @param {Baustein} b
 * @returns {string}
 */
export function bausteinHtml(b) {
  const wert = String(b.wert).replace(/[&<>"']/g, (z) => ESC[z]);
  if (b.baustein === "perlenstab") return `<ls-perlenstab wert="${wert}" aria-hidden="true"></ls-perlenstab>`;
  if (b.baustein === "wortart") return `<ls-wortart art="${wert}" aria-hidden="true"></ls-wortart>`;
  return `<span class="karte" aria-hidden="true">${wert}</span>`;
}

/**
 * Was seit dem letzten Besuch des Regals neu gekonnt ist (Merker `regal.gesehen`, Spec „Regal“).
 * Die Seite speichert danach als gesehen genau die jetzt gekonnten Ids: ein zurückgesetztes Thema fällt so aus
 * dem Merker heraus und ist, wenn es wieder gekonnt wird, noch einmal neu.
 * @param {string[]} gekonnt Ids der gekonnten Themen (Reihenfolge bleibt)
 * @param {unknown} gesehen gespeicherter Merker; kein Array (noch nie besucht, kaputt) zählt wie leer
 * @returns {string[]}
 */
export function neuSeit(gekonnt, gesehen) {
  const alt = new Set(Array.isArray(gesehen) ? gesehen.filter((id) => typeof id === "string") : []);
  return gekonnt.filter((id) => !alt.has(id));
}
