// Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md): eine Markdown-Datei je Thema unter
// spiele/mit-echten-dingen/<fach>/<thema-id>.md, im festen Aufbau: Kopf (thema, quellen), # Titel, „Ihr braucht: …“,
// nummerierte Schritte, **Darauf kommt es an:**, **Leichter:** / **Schwerer:**, **Passt gut:**.
// Angezeigt wird alles außer dem Kopf (die Quellen gehören in die Datei, nicht auf den Bildschirm). Fehlt die Datei
// oder passt sie nicht in den Aufbau, zeigt die Seite den Einzeiler aus dem Lernplan (eltern).
// Nur lesen, kein Vorlesen (Christian, 2026-11-14).
import { esc } from "./zeichnen.js";

/**
 * @typedef {{kopf: Record<string, string>, titel: string, braucht: string, schritte: string[], kern: string,
 *   leichter: string, schwerer: string, passt: string}} Anleitung
 */

/** Verzeichnis der vorhandenen Anleitungen ({ fach: themaId[] }), damit nur vorhandene Dateien angefragt werden. */
export const VERZEICHNIS = "mit-echten-dingen/index.json";

/**
 * Gibt es zu diesem Thema eine Anleitung?
 * @param {Record<string, string[]>|null|undefined} index Inhalt von VERZEICHNIS
 * @param {string} fach @param {string} themaId
 */
export function hatAnleitung(index, fach, themaId) {
  return Array.isArray(index?.[fach]) && /** @type {string[]} */ (index?.[fach]).includes(themaId);
}

/** Pfad der Anleitung zu einem Thema; null bei unsicheren Ids. @param {string} fach @param {string} themaId */
export function anleitungPfad(fach, themaId) {
  const sicher = /^[a-z0-9-]+$/;
  return sicher.test(fach) && sicher.test(themaId) ? `mit-echten-dingen/${fach}/${themaId}.md` : null;
}

/** Wert hinter einer fetten Marke, bis zur nächsten fetten Marke oder zum Zeilenende. @param {string} text @param {string} marke */
function nachMarke(text, marke) {
  const m = text.match(new RegExp(`\\*\\*${marke}:\\*\\*\\s*(.*?)(?=\\s*\\*\\*[^*]+:\\*\\*|$)`, "m"));
  return m ? m[1].trim() : "";
}

/**
 * @param {string} md
 * @returns {Anleitung|null}
 */
export function leseAnleitung(md) {
  let rest = String(md ?? "");
  /** @type {Record<string, string>} */
  const kopf = {};
  const k = rest.match(/^---\n([\s\S]*?)\n---\n?/);
  if (k) {
    for (const zeile of k[1].split("\n")) {
      const m = zeile.match(/^([a-z]+):\s*(.*)$/);
      if (m) kopf[m[1]] = m[2].trim();
    }
    rest = rest.slice(k[0].length);
  }
  const titel = rest.match(/^#\s+(.+)$/m)?.[1].trim() ?? "";
  const schritte = [...rest.matchAll(/^\d+\.\s+(.+)$/gm)].map((m) => m[1].trim());
  if (!titel || !schritte.length) return null;
  return {
    kopf,
    titel,
    braucht: rest.match(/^Ihr braucht:\s*(.+)$/m)?.[1].trim() ?? "",
    schritte,
    kern: nachMarke(rest, "Darauf kommt es an"),
    leichter: nachMarke(rest, "Leichter"),
    schwerer: nachMarke(rest, "Schwerer"),
    passt: nachMarke(rest, "Passt gut"),
  };
}

/**
 * Die Anleitung als Seiteninhalt.
 * @param {Anleitung} a
 * @returns {string}
 */
export function anleitungHtml(a) {
  const abschnitt = (/** @type {string} */ klasse, /** @type {string} */ ueber, /** @type {string} */ text) =>
    text ? `<section class="${klasse}"><h2>${ueber}</h2><p>${esc(text)}</p></section>` : "";
  const stufen = a.leichter || a.schwerer
    ? `<section class="stufen"><div class="umschalter">`
      + (a.leichter ? `<button class="stufe" type="button" data-stufe="leichter" aria-pressed="false">Leichter</button>` : "")
      + (a.schwerer ? `<button class="stufe" type="button" data-stufe="schwerer" aria-pressed="false">Schwerer</button>` : "")
      + `</div>`
      + (a.leichter ? `<p class="stufen-text" data-stufe="leichter" hidden>${esc(a.leichter)}</p>` : "")
      + (a.schwerer ? `<p class="stufen-text" data-stufe="schwerer" hidden>${esc(a.schwerer)}</p>` : "")
      + `</section>`
    : "";
  return `<h1>${esc(a.titel)}</h1>`
    + abschnitt("braucht", "Ihr braucht", a.braucht)
    + `<ol class="schritte">${a.schritte.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>`
    + abschnitt("kern", "Darauf kommt es an", a.kern)
    + stufen
    + abschnitt("passt", "Passt gut", a.passt);
}

/**
 * Ersatz ohne Datei: der Einzeiler aus dem Lernplan.
 * @param {string} name Name des Themas @param {string} text
 */
export function einzeilerHtml(name, text) {
  return `<h1>${esc(name)}</h1><p class="einzeiler">${esc(text)}</p>`;
}
