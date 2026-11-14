// Kleiner, sicherer Markdown-Darsteller für die Anleitungen „Mit echten Dingen“ (docs/mit-echten-dingen.md).
// Ohne DOM (in Node testbar, tests/rahmen-markdown.test.mjs). Kann genau, was die Anleitungen brauchen:
//   Kopf (Frontmatter zwischen `---`)  wird abgetrennt und nie gezeigt (Quellen)
//   # / ## / ###                     Überschriften
//   1. …                             nummerierte Liste
//   - … / * …                        einfache Liste
//   **fett**                         fett
//   Leerzeile                        neuer Absatz; Zeilen ohne Leerzeile gehören zum selben Absatz
// Alles andere ist Text: Jedes Zeichen wird escaped, HTML im Markdown erscheint als Text, nie als Element.

/** Situationen der Formen (Reihenfolge = Reihenfolge der Wahl), Wort wie in der Überschrift `## <Wort>: <Name>`. */
export const SITUATIONEN = Object.freeze([
  Object.freeze({ id: "tisch", wort: "Am Tisch", symbol: "tisch.svg" }),
  Object.freeze({ id: "bewegung", wort: "In Bewegung", symbol: "bewegung.svg" }),
  Object.freeze({ id: "unterwegs", wort: "Unterwegs", symbol: "unterwegs.svg" }),
]);

/**
 * @typedef {{ typ: "h", ebene: number, text: string }
 *   | { typ: "p", text: string }
 *   | { typ: "ol" | "ul", punkte: string[] }} Block
 */

/** @param {string} s @returns {string} */
export function escape(s) {
  return String(s).replace(/[&<>"']/g, (z) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[z] ?? z);
}

/**
 * Trennt den Kopf (Frontmatter) ab. Der Kopf kann `schluessel: wert` und Listen (`  - eintrag`) unter einem
 * Schlüssel ohne Wert; `true`/`false` werden zu Wahrheitswerten. Ohne Kopf ist er leer.
 * @param {string} text
 * @returns {{ kopf: Record<string, string | boolean | string[]>, rumpf: string }}
 */
export function trenneKopf(text) {
  const t = String(text ?? "").replace(/^﻿/, "").replace(/\r\n?/g, "\n");
  const m = /^---\n([\s\S]*?)\n---[ \t]*(?:\n|$)/.exec(t);
  if (!m) return { kopf: {}, rumpf: t };
  /** @type {Record<string, string | boolean | string[]>} */
  const kopf = {};
  /** @type {string | null} */
  let liste = null;
  for (const zeile of m[1].split("\n")) {
    const eintrag = /^\s+-\s+(.*)$/.exec(zeile);
    if (eintrag && liste) {
      /** @type {string[]} */ (kopf[liste]).push(eintrag[1].trim());
      continue;
    }
    const kv = /^([A-Za-z0-9_-]+):\s*(.*)$/.exec(zeile);
    if (!kv) continue;
    const wert = kv[2].trim();
    if (wert === "") {
      kopf[kv[1]] = [];
      liste = kv[1];
    } else {
      kopf[kv[1]] = wert === "true" ? true : wert === "false" ? false : wert;
      liste = null;
    }
  }
  return { kopf, rumpf: t.slice(m[0].length) };
}

/**
 * Zerlegt Markdown (ohne Kopf) in Blöcke.
 * @param {string} md
 * @returns {Block[]}
 */
export function bloecke(md) {
  /** @type {Block[]} */
  const out = [];
  /** @type {any} */
  let offen = null; // Absatz oder Liste (Block), an den die nächste Zeile anschließt
  for (const roh of String(md ?? "").replace(/\r\n?/g, "\n").split("\n")) {
    const zeile = roh.trim();
    if (!zeile) { offen = null; continue; }
    const h = /^(#{1,3})\s+(.*)$/.exec(zeile);
    if (h) { out.push({ typ: "h", ebene: h[1].length, text: h[2].trim() }); offen = null; continue; }
    const ol = /^\d+[.)]\s+(.*)$/.exec(zeile);
    const ul = /^[-*]\s+(.*)$/.exec(zeile);
    const punkt = ol ?? ul;
    if (punkt) {
      /** @type {"ol" | "ul"} */
      const typ = ol ? "ol" : "ul";
      if (offen?.typ === typ) offen.punkte.push(punkt[1]);
      else { offen = { typ, punkte: [punkt[1]] }; out.push(offen); }
      continue;
    }
    if (offen?.typ === "p") offen.text += " " + zeile;
    else if (offen && (offen.typ === "ol" || offen.typ === "ul")) offen.punkte[offen.punkte.length - 1] += " " + zeile;
    else { offen = { typ: "p", text: zeile }; out.push(offen); }
  }
  return out;
}

/**
 * Inline: escapen, dann **fett**. Ein einzelnes ** bleibt als Text stehen.
 * @param {string} s
 * @returns {string}
 */
export function inline(s) {
  return escape(s).replace(/\*\*(?=\S)(.+?)\*\*/g, "<b>$1</b>");
}

/**
 * Blöcke als HTML. `ebene` verschiebt die Überschriften (ebene 3: # → h3, ## → h4), höchstens h6.
 * @param {Block[]} liste
 * @param {{ ebene?: number }} [optionen]
 * @returns {string}
 */
export function blockHtml(liste, { ebene = 1 } = {}) {
  return liste.map((b) => {
    if (b.typ === "h") {
      const n = Math.min(6, Math.max(1, b.ebene + ebene - 1));
      return `<h${n}>${inline(b.text)}</h${n}>`;
    }
    if (b.typ === "p") return `<p>${inline(b.text)}</p>`;
    return `<${b.typ}>${b.punkte.map((p) => `<li>${inline(p)}</li>`).join("")}</${b.typ}>`;
  }).join("\n");
}

/**
 * Markdown als HTML; ein Kopf wird vorher entfernt.
 * @param {string} md
 * @param {{ ebene?: number }} [optionen]
 * @returns {string}
 */
export function alsHtml(md, optionen) {
  return blockHtml(bloecke(trenneKopf(md).rumpf), optionen);
}

/**
 * @typedef {{ situation: string, wort: string, symbol: string, name: string, bloecke: Block[] }} Form
 * @typedef {{ kopf: Record<string, string | boolean | string[]>, titel: string, vorspann: Block[], formen: Form[] }} Anleitung
 */

/**
 * Liest eine Anleitung: Kopf, Titel (die erste `#`), Vorspann (vor der ersten Form) und die Formen
 * (`## Am Tisch: Name`, `## In Bewegung: Name`, `## Unterwegs: Name`). Eine `##` ohne bekannte Situation
 * gehört zum Inhalt der Form davor (bzw. zum Vorspann). Jede Situation zählt nur einmal (die erste).
 * @param {string} text
 * @returns {Anleitung}
 */
export function liesAnleitung(text) {
  const { kopf, rumpf } = trenneKopf(text);
  let titel = "";
  /** @type {Block[]} */
  const vorspann = [];
  /** @type {Form[]} */
  const formen = [];
  /** @type {Block[]} */
  let ziel = vorspann;
  for (const b of bloecke(rumpf)) {
    if (b.typ === "h" && b.ebene === 1 && !titel) { titel = b.text; continue; }
    if (b.typ === "h" && b.ebene === 2) {
      const m = /^([^:]+):\s*(.+)$/.exec(b.text);
      const s = m ? SITUATIONEN.find((x) => x.wort.toLowerCase() === m[1].trim().toLowerCase()) : undefined;
      if (s && m && !formen.some((f) => f.situation === s.id)) {
        const form = { situation: s.id, wort: s.wort, symbol: s.symbol, name: m[2].trim(), bloecke: [] };
        formen.push(form);
        ziel = form.bloecke;
        continue;
      }
    }
    ziel.push(b);
  }
  formen.sort((a, b) => SITUATIONEN.findIndex((s) => s.id === a.situation) - SITUATIONEN.findIndex((s) => s.id === b.situation));
  return { kopf, titel, vorspann, formen };
}

/**
 * Text einer Form ohne Auszeichnung (zum Zählen der Wörter).
 * @param {Form} form
 * @returns {string}
 */
export function formText(form) {
  return [form.name, ...form.bloecke.map((b) => (b.typ === "ol" || b.typ === "ul" ? b.punkte.join(" ") : b.typ === "p" || b.typ === "h" ? b.text : ""))]
    .join(" ").replace(/\*\*/g, "");
}
