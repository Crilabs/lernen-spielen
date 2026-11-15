// Darstellung der Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md) auf der Seite echt.html.
// Gelesen wird mit dem gemeinsamen Leser (spiele/rahmen/markdown.js, liesAnleitung): eine Datei je Thema unter
// spiele/mit-echten-dingen/<fach>/<thema-id>.md mit einer Form je Situation (`## Am Tisch: …`, `## In Bewegung: …`,
// `## Unterwegs: …`). Welche Themen eine (freigegebene) Anleitung haben, sagt das Verzeichnis
// (spiele/rahmen/echte-dinge.js, `npm run echte-dinge`). Hier wird jede Form in den festen Aufbau der Seite gebracht:
// „Erst verstehen, dann verinnerlichen“ (nur bei einer Form zum Festigen), „Ihr braucht“ (auf dem Tablett), nummerierte Schritte, „Darauf kommt es an“ (Sonnenring), „Leichter“/„Schwerer“
// als Umschalter (eine Stufe zur Zeit), „Passt gut“. Der Kopf mit den Quellen erscheint nie. Gibt es mehr als eine
// Form, steht oben die Wahl der Situation. Ohne Datei der Einzeiler aus dem Lernplan (eltern).
// Nur lesen, kein Vorlesen (Christian, 2026-11-14).
import { esc } from "./zeichnen.js";
import { inline, blockHtml } from "../rahmen/markdown.js";

/** @typedef {import("../rahmen/markdown.js").Anleitung} Anleitung */
/** @typedef {import("../rahmen/markdown.js").Form} Form */
/** @typedef {import("../rahmen/markdown.js").Block} Block */

/**
 * @typedef {{ braucht: string, schritte: string[], kern: string, leichter: string, schwerer: string, passt: string,
 *   verinnerlichen: string, weiteres: Block[] }} Teile
 */

// „Zum Verinnerlichen“ steht vor einer Form „In Bewegung“, die das Prinzip nicht selbst zeigt, sondern das Verstandene
// festigt (docs/mit-echten-dingen.md „Immer auch in Bewegung“): erst verstehen, dann verinnerlichen.
const MARKEN = ["Zum Verinnerlichen", "Darauf kommt es an", "Leichter", "Schwerer", "Passt gut"];

/** Wert hinter einer fetten Marke, bis zur nächsten Marke oder zum Ende. @param {string} text @param {string} marke */
function nachMarke(text, marke) {
  const m = text.match(new RegExp(`\\*\\*${marke}:\\*\\*\\s*(.*?)(?=\\s*\\*\\*(?:${MARKEN.join("|")}):\\*\\*|$)`));
  return m ? m[1].trim() : "";
}

/**
 * Bringt die Blöcke einer Form in den Aufbau der Seite; was in keinen Teil passt, steht unter „weiteres“.
 * @param {Form} form
 * @returns {Teile}
 */
export function formTeile(form) {
  /** @type {Teile} */
  const t = { braucht: "", schritte: [], kern: "", leichter: "", schwerer: "", passt: "", verinnerlichen: "", weiteres: [] };
  for (const b of form.bloecke) {
    if (b.typ === "p" && /^Ihr braucht:/.test(b.text) && !t.braucht) { t.braucht = b.text.replace(/^Ihr braucht:\s*/, ""); continue; }
    if (b.typ === "ol" && !t.schritte.length) { t.schritte = b.punkte; continue; }
    if (b.typ === "p" && MARKEN.some((m) => b.text.includes(`**${m}:**`))) {
      t.verinnerlichen ||= nachMarke(b.text, "Zum Verinnerlichen");
      t.kern ||= nachMarke(b.text, "Darauf kommt es an");
      t.leichter ||= nachMarke(b.text, "Leichter");
      t.schwerer ||= nachMarke(b.text, "Schwerer");
      t.passt ||= nachMarke(b.text, "Passt gut");
      continue;
    }
    t.weiteres.push(b);
  }
  return t;
}

/**
 * Eine Form als Abschnitt der Seite.
 * @param {Form} form
 * @param {boolean} sichtbar
 * @returns {string}
 */
export function formHtml(form, sichtbar) {
  const t = formTeile(form);
  const abschnitt = (/** @type {string} */ klasse, /** @type {string} */ ueber, /** @type {string} */ text) =>
    text ? `<section class="${klasse}"><h2>${ueber}</h2><p>${inline(text)}</p></section>` : "";
  const stufen = t.leichter || t.schwerer
    ? `<section class="stufen"><div class="umschalter">`
      + (t.leichter ? `<button class="stufe" type="button" data-stufe="leichter" aria-pressed="false">Leichter</button>` : "")
      + (t.schwerer ? `<button class="stufe" type="button" data-stufe="schwerer" aria-pressed="false">Schwerer</button>` : "")
      + `</div>`
      + (t.leichter ? `<p class="stufen-text" data-stufe="leichter" hidden>${inline(t.leichter)}</p>` : "")
      + (t.schwerer ? `<p class="stufen-text" data-stufe="schwerer" hidden>${inline(t.schwerer)}</p>` : "")
      + `</section>`
    : "";
  return `<div class="form" data-situation="${esc(form.situation)}"${sichtbar ? "" : " hidden"}>`
    + `<p class="form-name">${esc(form.name)}</p>`
    + abschnitt("verinnerlichen", "Erst verstehen, dann verinnerlichen", t.verinnerlichen)
    + abschnitt("braucht", "Ihr braucht", t.braucht)
    + (t.schritte.length ? `<ol class="schritte">${t.schritte.map((s) => `<li>${inline(s)}</li>`).join("")}</ol>` : "")
    + (t.weiteres.length ? `<div class="weiteres">${blockHtml(t.weiteres, { ebene: 2 })}</div>` : "")
    + abschnitt("kern", "Darauf kommt es an", t.kern)
    + stufen
    + abschnitt("passt", "Passt gut", t.passt)
    + `</div>`;
}

/**
 * Die Anleitung als Seiteninhalt: Titel, bei mehr als einer Form die Wahl der Situation, dann die Formen
 * (sichtbar ist die gewählte, sonst die erste).
 * @param {Anleitung} a
 * @param {string} [situation] gewünschte Situation (letzte Wahl)
 * @param {string} [symbole] Ordner der Symbole (mit / am Ende)
 * @returns {string}
 */
export function anleitungHtml(a, situation = "", symbole = "symbole/") {
  const gewaehlt = (a.formen.find((f) => f.situation === situation) ?? a.formen[0])?.situation ?? "";
  const wahl = a.formen.length > 1
    ? `<div class="formwahl" role="group" aria-label="Wo spielt ihr?">`
      + a.formen.map((f) => `<button class="form-knopf" type="button" data-situation="${esc(f.situation)}" aria-pressed="${f.situation === gewaehlt}">`
        + `<img src="${esc(symbole + f.symbol)}" alt=""><span>${esc(f.wort)}</span></button>`).join("")
      + `</div>`
    : "";
  return `<h1>${esc(a.titel)}</h1>`
    + (a.vorspann.length ? `<div class="vorspann">${blockHtml(a.vorspann, { ebene: 2 })}</div>` : "")
    + wahl
    + a.formen.map((f) => formHtml(f, f.situation === gewaehlt)).join("");
}

/**
 * Ersatz ohne Datei: der Einzeiler aus dem Lernplan.
 * @param {string} name Name des Themas @param {string} text
 */
export function einzeilerHtml(name, text) {
  return `<h1>${esc(name)}</h1><p class="einzeiler">${esc(text)}</p>`;
}
