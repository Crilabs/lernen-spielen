// Druckblatt „Mit echten Dingen“ je Thema (docs/superpowers/specs/2026-11-14-echte-dinge-pdf-je-thema-design.md):
// ein A4-Blatt mit allen Formen des Themas, voll (Ihr braucht, Schritte, Darauf kommt es an, Leichter/Schwerer).
// Nur HTML, kein DOM: echte-dinge-druck.js setzt es in #ls-blatt und druckt. Das Blatt hat keine Flächen; die
// Fachfarbe (Tief-Ton) steht als --fach an der Wurzel und färbt Linien, Schrittkreise und die Randlinie des Kerns.
// Das Fachsymbol kommt als SVG-Text (fachSvg) und wird in der Fachfarbe gezeichnet: Am Bildschirm malt die
// Fachkachel es über eine Maske mit Hintergrundfarbe, und Hintergründe lässt der Druckdialog meist weg.

import { blockHtml, escape, inline } from "./markdown.js";
import { FACH, FARBE } from "./stil.js";

/** @typedef {import("./markdown.js").Form} Form */

const KERN = /^\*\*Darauf kommt es an:?\*\*/;
const STUFE = /^\*\*(Leichter|Schwerer)\b/;

/**
 * Titel des Dokuments während des Drucks; Browser nehmen ihn als Dateinamen des PDFs.
 * @param {string} name Name des Themas
 * @returns {string}
 */
export function blattTitel(name) {
  return `Mit echten Dingen – ${name}`;
}

/** @param {Form} f @returns {string} */
function formHtml(f) {
  const links = f.bloecke.filter((b) => !(b.typ === "p" && (KERN.test(b.text) || STUFE.test(b.text))));
  const absaetze = f.bloecke.flatMap((b) => (b.typ === "p" ? [b.text] : []));
  const kern = absaetze.filter((t) => KERN.test(t))
    .map((t) => `<p class="kern">${inline(t).replace(/^<b>Darauf kommt es an:?<\/b>\s*/, "<b>Darauf kommt es an:</b> ")}</p>`);
  const stufen = absaetze.filter((t) => STUFE.test(t))
    .map((t) => `<p class="stufen">${inline(t).replace(/ <b>Schwerer:/, "<br><b>Schwerer:")}</p>`);
  const linksHtml = blockHtml(links, { ebene: 3 }).replace(/<p>Ihr braucht:/, "<p><b>Ihr braucht:</b>")
    .replace(/<p><b>Zum Verinnerlichen:<\/b>\s*/, '<p class="verinnerlichen"><b>Erst verstehen, dann verinnerlichen:</b> ');
  return `<article class="form"><h2><img src="symbole/${escape(f.symbol)}" alt=""><span>${escape(f.wort)}: ${escape(f.name)}</span></h2>`
    + `<div class="spalten"><div class="links">${linksHtml}</div><div class="rechts">${kern.join("")}${stufen.join("")}</div></div></article>`;
}

/**
 * Das Blatt eines Themas.
 * @param {{ name: string, titel: string, fach: string, formen: Form[], fachSvg?: string }} thema
 *   formen in der Reihenfolge der Situationen (liesAnleitung sortiert schon); fachSvg: Inhalt von symbole/<fach>.svg
 * @returns {string}
 */
export function blattHtml({ name, titel, fach, formen, fachSvg = "" }) {
  const farbe = FACH[/** @type {keyof typeof FACH} */ (fach)]?.tief ?? FARBE.tinte;
  const svg = fachSvg.replace(/stroke="#fff(fff)?"/gi, `stroke="${farbe}"`);
  return `<div class="blatt-wurzel" style="--fach:${farbe}">`
    + `<header><span class="fachkachel" aria-hidden="true">${svg}</span><div><h1>${escape(name)}</h1>`
    + (titel ? `<p>${escape(titel)}</p>` : "") + `</div></header>`
    + formen.map(formHtml).join("") + `</div>`;
}
