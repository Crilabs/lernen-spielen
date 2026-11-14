// Welche Karten die Startseite zeigt (Spec 2026-11-14-startseite-karten-design.md §3.1).
// Je Fach höchstens 5 Spiele, still geordnet: ein Thema dran (zuletzt geübt zuerst) → ein Thema in Sicht
// (Planreihenfolge) → nur Gekonntes (zuletzt gekonnt zuerst, höchstens 14 Tage, dann fällt das Spiel heraus).
// Jedes Spiel erscheint einmal, mit dem Thema seiner wichtigsten Stufe. Dazu je Fach höchstens 2 Karten
// „Mit echten Dingen“ für Themen dran mit Anleitung (eltern-Text im Lernplan). Liest den Lernstand nur.
// Die Übersicht der Themen kommt vom Aufrufer (uebersicht() aus lernsteuerung.js); ein Import zöge lernsteuerung.js
// in die Typprüfung, die es nicht besteht.

/** Tage zwischen zwei Daten (wie tage() in lernsteuerung.js). @param {string} a @param {string} b */
const tage = (a, b) => (!a || !b ? Infinity : Math.round((Date.parse(b + "T12:00:00Z") - Date.parse(a + "T12:00:00Z")) / 86400000));

export const MAX_SPIELE = 5;
export const MAX_ECHT = 2;
export const GEKONNT_TAGE = 14;

/**
 * @typedef {{id: string, titel: string, datei: string, symbol: string, kategorie?: string, welt?: string}} Spiel
 * @typedef {{fach: string, spiele: {spiel: Spiel, thema: {id: string, name: string}}[], echt: {thema: {id: string, name: string, eltern: string}}[]}} FachKarten
 */

/**
 * @param {{strang: string, stationen: {id: string, name: string, zustand: string, spiele: string[]}[]}[]} ue uebersicht(ctx, stand)
 * @param {{plan: any, spiele: {kategorien?: {id: string}[], spiele?: Spiel[]}}} ctx
 * @param {any} stand Lernstand (wird nicht verändert)
 * @param {string} heute Datum JJJJ-MM-TT
 * @returns {FachKarten[]}
 */
export function startKarten(ue, ctx, stand, heute) {
  const spielNach = new Map((ctx.spiele?.spiele ?? []).map((s) => [s.id, s]));
  const themaNach = new Map((ctx.plan?.themen ?? []).map((/** @type {any} */ t) => [t.id, t]));
  const eintrag = (/** @type {string} */ id) => stand?.themen?.[id] ?? {};
  const reihe = new Map((ctx.spiele?.kategorien ?? []).map((k, i) => [k.id, i]));

  /** @type {FachKarten[]} */
  const out = [];
  for (const { strang, stationen } of ue) {
    /** @type {{spiel: Spiel, thema: {id: string, name: string}, rang: number, schluessel: string|number}[]} */
    const kandidaten = [];
    stationen.forEach((/** @type {any} */ st, /** @type {number} */ planNr) => {
      let rang, schluessel;
      if (st.zustand === "dran") { rang = 0; schluessel = eintrag(st.id).u || eintrag(st.id).seit || ""; }
      else if (st.zustand === "in-sicht") { rang = 1; schluessel = planNr; }
      else if (st.zustand === "kann-ich") {
        const k = eintrag(st.id).k || "";
        if (tage(k, heute) > GEKONNT_TAGE) return;
        rang = 2; schluessel = k;
      } else return;
      for (const id of st.spiele) {
        const spiel = spielNach.get(id);
        if (spiel) kandidaten.push({ spiel, thema: { id: st.id, name: st.name }, rang, schluessel });
      }
    });
    // dran und gekonnt: jüngstes zuerst (absteigend), in Sicht: Planreihenfolge (aufsteigend)
    kandidaten.sort((a, b) => a.rang - b.rang
      || (a.rang === 1 ? Number(a.schluessel) - Number(b.schluessel) : String(b.schluessel).localeCompare(String(a.schluessel))));
    const gesehen = new Set();
    const spiele = [];
    for (const k of kandidaten) {
      if (gesehen.has(k.spiel.id)) continue;
      gesehen.add(k.spiel.id);
      spiele.push({ spiel: k.spiel, thema: k.thema });
      if (spiele.length === MAX_SPIELE) break;
    }
    const echt = stationen
      .filter((/** @type {any} */ st) => st.zustand === "dran" && typeof themaNach.get(st.id)?.eltern === "string" && themaNach.get(st.id).eltern.trim())
      .slice(0, MAX_ECHT)
      .map((/** @type {any} */ st) => ({ thema: { id: st.id, name: st.name, eltern: themaNach.get(st.id).eltern } }));
    if (spiele.length || echt.length) out.push({ fach: strang, spiele, echt });
  }
  return out.sort((a, b) => (reihe.get(a.fach) ?? 99) - (reihe.get(b.fach) ?? 99));
}
