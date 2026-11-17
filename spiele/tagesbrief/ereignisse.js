// Tagesbrief (docs/superpowers/specs/2026-11-17-tagesbrief-design.md, „Ereignisse“): baut aus App-Daten die Einträge,
// die in den Topf einer Adresse kommen. Läuft in der App, nicht im Versanddienst.

import { briefFormen } from "./anleitung.js";

/** @param {unknown} x */
const text = (x) => (typeof x === "string" ? x : "");

/**
 * @param {{ plan: any }} ctx
 * @param {string} themaId
 */
const themaVon = (ctx, themaId) => (Array.isArray(ctx.plan?.themen) ? ctx.plan.themen : []).find((/** @type {any} */ t) => t.id === themaId);

/**
 * Ein gekonntes Thema für „Neu gekonnt“.
 * @param {{ plan: any }} ctx
 * @param {string} themaId
 * @returns {import("./brief.js").Gekonnt | null} null bei unbekanntem Thema
 */
export function gekonntEreignis(ctx, themaId) {
  const t = themaVon(ctx, themaId);
  if (!t) return null;
  return { id: t.id, name: text(t.name), zweck: text(t.zweck), fach: text(t.strang) };
}

/**
 * Ein Thema, an dem das Kind dran war, für „Dabei“.
 * @param {{ plan: any }} ctx
 * @param {string} themaId
 * @returns {import("./brief.js").Dabei | null} null bei unbekanntem Thema
 */
export function dabeiEreignis(ctx, themaId) {
  const t = themaVon(ctx, themaId);
  if (!t) return null;
  return { id: t.id, name: text(t.name), fach: text(t.strang) };
}

/**
 * Ein gelesenes Buch mit der Erinnerungsfrage des ersten Kapitels, das eine hat (leer, wenn keins eine hat).
 * @param {string} id Buch-Id
 * @param {any} geschichte Inhalt der geschichte.json
 * @returns {import("./brief.js").Gelesen}
 */
export function gelesenEreignis(id, geschichte) {
  const kapitel = Array.isArray(geschichte?.kapitel) ? geschichte.kapitel : [];
  const e = kapitel.map((/** @type {any} */ k) => k?.erinnern).find((/** @type {any} */ x) => x && text(x.frage));
  const antwort = e && Array.isArray(e.antworten) ? text(e.antworten[e.richtig]) : "";
  return { id, titel: text(geschichte?.titel), frage: e ? text(e.frage) : "", antwort };
}

/**
 * Die Anleitung für „Als Nächstes“. Die Id ist die Anleitungsdatei (eindeutig je Anleitung, auch bei Familien).
 * @param {{ thema: string, datei: string, passendZuGerade: boolean, weitere: string[] }} wahl Rückgabe von waehleAnleitung
 * @param {import("../rahmen/markdown.js").Anleitung} anleitung Rückgabe von liesAnleitung
 * @param {string} fach
 * @param {string} fotoBase64 JPEG als base64 oder ""
 * @returns {import("./brief.js").Naechstes}
 */
export function naechstesEreignis(wahl, anleitung, fach, fotoBase64) {
  return {
    id: wahl.datei, thema: wahl.thema, fach, titel: anleitung.titel, passendZuGerade: wahl.passendZuGerade,
    formen: briefFormen(anleitung), foto: fotoBase64, weitere: wahl.weitere,
  };
}
