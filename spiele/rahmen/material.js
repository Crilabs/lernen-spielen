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
//   3. Thema, dessen Inhalt ein Buchstabe oder eine Buchstabengruppe ist (Bereich in BUCHSTABEN_BEREICHE) → Karte
//      mit diesem Graphem, wie es im Namen steht („M und m“ → „Mm“, „sch“, „ch wie in ich“ → „ch“, „b, d und p
//      unterscheiden“ → „b d p“). Nur dort ist der Buchstabe der Inhalt.
//   4. alles andere → Karte mit dem Fachsymbol (wert ""; fach = Strang). Ein Buchstabe oder eine Ziffer, die nicht
//      der Inhalt ist (erster Buchstabe des Namens), stünde für nichts.

/** @typedef {{ id: string, name?: string, strang?: string, bereich?: string, art?: string|null, zahl?: number|null }} Material */
/** @typedef {{ baustein: "perlenstab", wert: number } | { baustein: "wortart", wert: "nomen"|"verb"|"adjektiv"|"artikel" } | { baustein: "karte", wert: string, fach?: string }} Baustein */

import { FACH_SYMBOLE, bild } from "./stil.js";

/** Bereiche im Lernplan, deren Themen ein Graphem lehren (Lesen: Laute, Buchstabengruppen; Schreiben: besondere Laute). */
export const BUCHSTABEN_BEREICHE = new Set(["Buchstaben und Laute", "Buchstabengruppen", "Besondere Laute schreiben"]);

const SYMBOLE = new URL("../symbole/", import.meta.url).href;

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
  if (BUCHSTABEN_BEREICHE.has(thema.bereich ?? "")) {
    const graphem = graphemVon(typeof thema.name === "string" ? thema.name : "");
    if (graphem) return { baustein: "karte", wert: graphem };
  }
  return { baustein: "karte", wert: "", fach: thema.strang ?? "" };
}

/**
 * Graphem(e) am Anfang eines Themennamens: ein bis drei Buchstaben, verbunden nur durch „und“ oder Komma
 * („M und m“, „St und st am Anfang“, „b, d und p unterscheiden“, „sch schreiben“, „ß“). Groß- und Kleinform
 * desselben Buchstabens stehen zusammen („Mm“), längere Paare und verschiedene mit Leerzeichen („Pf pf“, „ng nk“).
 * Ein längeres erstes Wort („Groß und klein zusammen“) ist kein Graphem → "".
 * @param {string} name
 * @returns {string}
 */
export function graphemVon(name) {
  const m = name.trim().match(/^\p{L}{1,3}(?:(?:\s*,\s*|\s+und\s+)\p{L}{1,3})*(?=\s|$)/u);
  if (!m) return "";
  const teile = m[0].split(/\s*,\s*|\s+und\s+/);
  if (teile.length === 2 && teile[0].length === 1 && teile[0].toLocaleLowerCase("de") === teile[1].toLocaleLowerCase("de")) return teile.join("");
  return teile.join(" ");
}

const ESC = /** @type {Record<string, string>} */ ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" });

/**
 * HTML eines Bausteins, klein und flach zum Ansehen (Fach-Seite und Regal teilen es; Größe und Form setzt die
 * Seite per CSS). Perlenstab und Wortart über die Rahmen-Bausteine, sonst `<span class="karte">`: mit dem Graphem
 * oder, ohne Wert, mit dem Fachsymbol (`<i>` mit `--bild`, Maske in Tinte wie die Fachkachel; Sprechen ohne Symbol
 * bleibt eine schlichte Karte). Alles aria-hidden: den Namen trägt der Knopf darum.
 * @param {Baustein} b
 * @returns {string}
 */
export function bausteinHtml(b) {
  const wert = String(b.wert).replace(/[&<>"']/g, (z) => ESC[z]);
  if (b.baustein === "perlenstab") return `<ls-perlenstab wert="${wert}" aria-hidden="true"></ls-perlenstab>`;
  if (b.baustein === "wortart") return `<ls-wortart art="${wert}" aria-hidden="true"></ls-wortart>`;
  if (wert) return `<span class="karte" aria-hidden="true">${wert}</span>`;
  const fach = b.baustein === "karte" && b.fach && FACH_SYMBOLE.has(b.fach) ? b.fach : "";
  return fach ? `<span class="karte symbol" aria-hidden="true"><i style="--bild:${bild(SYMBOLE + fach + ".svg")}"></i></span>`
    : `<span class="karte symbol" aria-hidden="true"></span>`;
}

/**
 * Was seit dem letzten Besuch des Regals neu gekonnt ist (Merker `regal.gesehen`, Spec „Regal“).
 * Die Seite speichert danach als gesehen genau die jetzt gekonnten Ids: ein zurückgesetztes Thema fällt so aus
 * dem Merker heraus und ist, wenn es wieder gekonnt wird, noch einmal neu.
 * @param {string[]} gekonnt Ids der gekonnten Themen (Reihenfolge bleibt)
 * @param {unknown} gesehen gespeicherter Merker; kein Array (noch nie besucht, kaputt) → nichts neu
 * @returns {string[]}
 */
export function neuSeit(gekonnt, gesehen) {
  if (!Array.isArray(gesehen)) return []; // erster Besuch (oder kaputter Merker): nichts ist neu, die Seite merkt sich alles
  const alt = new Set(gesehen.filter((id) => typeof id === "string"));
  return gekonnt.filter((id) => !alt.has(id));
}
